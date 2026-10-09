import { accentOf, C, type SimStatus } from '../colors'
import { FRAME_MS, type LineRef, type Message, type PhoneState, type Preset, type Task, type Trace } from './types'

/* ───────────── playback ───────────── */

export interface Playback {
  /** cursor, ms */
  c: number
  /** has the user started this run (play, step, scrub, ?at>0) */
  started: boolean
  /** reduced motion: ms accumulated toward the next 900 ms jump */
  racc: number
}

export const PLAYBACK_IDLE: Playback = { c: 0, started: false, racc: 0 }
/** A full trace plays in ~9 s at 1×. */
export const PLAY_MS = 9000
/** Reduced motion: jump to the next step point every 900 ms. */
export const REDUCED_STEP_MS = 900

/** Union of every trace's step points, sorted. */
export function stepPoints(traces: Trace[]): number[] {
  const s = new Set<number>()
  for (const t of traces) for (const p of t.points) s.add(p)
  return [...s].sort((a, b) => a - b)
}

/** Cursor position just past the next point, or the end. */
export function nextPoint(points: number[], c: number, total: number): number {
  const nx = points.find((p) => p > c + 0.05)
  return nx == null ? total : nx + 0.05
}

/** Cursor position just past the previous point, or 0. */
export function prevPoint(points: number[], c: number): number {
  const ps = points.filter((p) => p < c - 0.1)
  return ps.length ? ps[ps.length - 1] + 0.05 : 0
}

/** One clock tick. `dt` is real ms already multiplied by speed. */
export function advancePlayback(
  s: Playback,
  dt: number,
  o: { total: number; points: number[]; reduced: boolean },
): { state: Playback; stop?: boolean } {
  let c = s.c
  let racc = s.racc
  if (o.reduced) {
    racc += dt
    if (racc < REDUCED_STEP_MS) return { state: { ...s, racc } }
    racc = 0
    c = nextPoint(o.points, c, o.total)
  } else c += (dt * o.total) / PLAY_MS
  if (c >= o.total) return { state: { c: o.total, started: true, racc: 0 }, stop: true }
  return { state: { c, started: true, racc } }
}

/* ───────────── state at time c ───────────── */

export interface Snapshot {
  live: Task[]
  cap: string | null
  ln: LineRef | null
  ui: PhoneState
  /** dropped frames so far */
  dropped: number
  /** a dropped frame ended within the last 34 ms */
  recentDrop: boolean
  /** bridge messages in flight + JS-side pending events */
  qNow: number
  /** JSON bytes sent so far */
  ser: number
}

/** Prototype `at(tr, c)`. */
export function stateAt(tr: Trace, c: number): Snapshot {
  const live = tr.tasks.filter((e) => e.t <= c && c < e.t + e.d)
  const past = tr.events.filter((e) => e.t <= c)
  let cap: string | null = null
  for (let i = past.length - 1; i >= 0; i--) {
    const pc = past[i].cap
    if (pc) {
      cap = pc
      break
    }
  }
  let ln: LineRef | null = null
  const lj = live.find((e) => e.ln !== undefined)
  if (lj) ln = lj.ln ?? null
  else
    for (let i = past.length - 1; i >= 0; i--) {
      const e = past[i]
      if ('lane' in e && e.ln !== undefined) {
        ln = e.ln
        break
      }
    }
  const ui: PhoneState = {}
  for (const u of tr.uiPatches) if (u.t <= c) Object.assign(ui, u)
  delete (ui as { t?: number }).t
  const dropped = tr.frames.filter((f) => f.b <= c + 0.01 && f.dropped).length
  const recentDrop = tr.frames.some((f) => f.dropped && f.b <= c + 0.01 && f.b > c - 34)
  const qNow =
    tr.messages.filter((m) => m.kind === 'msg' && m.t <= c && c < m.t + m.d).length +
    tr.queue.filter((q) => q.t <= c && c < q.u).length
  let ser = 0
  for (const m of tr.messages) if (m.kind === 'msg' && m.t <= c) ser += m.bytes
  return { live, cap, ln, ui, dropped, recentDrop, qNow, ser }
}

export const isOverloaded = (s: Snapshot) => s.qNow >= 4 || s.recentDrop

export function statusOf(o: { snap: Snapshot; started: boolean; running: boolean; c: number; total: number }): SimStatus {
  const complete = o.c >= o.total - 0.01
  if (isOverloaded(o.snap) && o.started && !complete) return 'overloaded'
  if (o.running) return 'running'
  if (complete) return 'complete'
  if (!o.started && o.c === 0) return 'idle'
  return 'paused'
}

export function captionOf(pr: Preset, snap: Snapshot, started: boolean, c: number): string {
  if (!started && c === 0) return 'Press Play, step with the arrow keys, or tap the phone.'
  return snap.cap || pr.desc
}

/** Code lines to highlight as an inclusive range. */
export const activeRange = (ln: LineRef | null): [number, number] | null =>
  ln == null ? null : Array.isArray(ln) ? ln : [ln, ln]

export function fmtMetric(v: number, u: 'ms' | 'frames'): string {
  return u === 'frames' ? Math.round(v) + '' : (v < 10 ? v.toFixed(1) : Math.round(v)) + ' ms'
}

export const fmtBytes = (b: number) => (b > 2048 ? Math.round(b / 1024) + ' KB' : b + ' B')

/* ───────────── lanes ───────────── */

export const LANE_H = 52
export const TRACK_H = LANE_H * 5 + 22
export const LANE_COLOR = { js: C.js, br: C.old, shadow: C.shadow, ui: C.ui, native: C.native } as const
const LANE_INDEX = { js: 0, br: 1, shadow: 2, ui: 3, native: 4 } as const

export interface LaneReadout {
  name: string
  color: string
  text: string
  textColor: string
  /** UI thread frame budget bar, 0..100 */
  bar?: number
}

/** Live readouts for the 150px label column. */
export function laneReadouts(tr: Trace, snap: Snapshot, c: number): LaneReadout[] {
  const o = tr.mode === 'old'
  const jsLive = snap.live.find((e) => e.lane === 'js')
  const stack = jsLive ? (jsLive.stack || [jsLive.label]).join(' › ') : 'idle'
  const busy = (lane: Task['lane']) => snap.live.find((x) => x.lane === lane)?.label ?? 'idle'
  const fr = tr.frames.find((f) => f.a <= c && c < f.b) ?? tr.frames[tr.frames.length - 1]
  let used = 0
  if (fr)
    for (const e of tr.tasks)
      if (e.lane === 'ui') used += Math.max(0, Math.min(Math.min(fr.b, c), e.t + e.d) - Math.max(fr.a, e.t))
  const frameBad = !!fr && fr.dropped && fr.a <= c
  const sh = busy('shadow')
  const nat = busy('native')
  return [
    {
      name: 'JS thread',
      color: C.js,
      text: stack + (snap.qNow && !o ? ' · queue ' + snap.qNow : ''),
      textColor: jsLive ? C.js : C.faint,
    },
    o
      ? {
          name: 'Bridge',
          color: C.old,
          text: snap.qNow + ' in queue',
          textColor: snap.qNow >= 4 ? C.load : snap.qNow ? C.old : C.faint,
        }
      : { name: 'JSI', color: C.new, text: 'no JSON · values via JSI', textColor: C.faint },
    { name: o ? 'Shadow thread' : 'Shadow / C++', color: C.shadow, text: sh, textColor: sh === 'idle' ? C.faint : C.shadow },
    {
      name: 'UI thread',
      color: C.ui,
      text: frameBad ? 'dropped' : used.toFixed(1) + ' / 16.6',
      textColor: frameBad ? C.load : C.ui,
      bar: Math.min(100, (used / FRAME_MS) * 100),
    },
    { name: 'Native modules', color: C.native, text: nat, textColor: nat === 'idle' ? C.faint : C.native },
  ]
}

export interface BlockView {
  key: number
  l: number
  w: number
  top: number
  label: string
  bg: string
  bd: string
  fg: string
}
export interface PacketView {
  i: number
  l: number
  w: number
  top: number
  label: string
  bg: string
  bd: string
}
export interface ArrowView {
  i: number
  l: number
  top: number
  h: number
  dot: number
  c: string
  label: string
}
export interface FrameView {
  key: number
  l: number
  w: number
  dropped: boolean
}

/** Geometry for one lane group, in % of the shared time scale T. */
export function laneGeometry(tr: Trace, c: number, T: number, selected: number | null) {
  const X = (t: number) => (t / T) * 100
  const blocks: BlockView[] = tr.tasks.map((e, key) => {
    const col = LANE_COLOR[e.lane]
    const past = e.t <= c
    const act = past && c < e.t + e.d
    return {
      key,
      l: X(e.t),
      w: Math.max(0.3, X(e.d)),
      top: LANE_INDEX[e.lane] * LANE_H + 13,
      label: e.label,
      bg: act ? col : past ? col + '40' : 'transparent',
      bd: past ? col : col + '40',
      fg: act ? C.bg : past ? C.bright : C.faint,
    }
  })
  const rowsEnd: number[] = []
  const packets: PacketView[] = []
  const arrows: ArrowView[] = []
  tr.messages.forEach((m, i) => {
    const past = m.t <= c
    const isSel = selected === i
    if (m.kind === 'msg') {
      let r = rowsEnd.findIndex((e) => e <= m.t)
      if (r < 0) r = rowsEnd.length < 3 ? rowsEnd.length : rowsEnd.indexOf(Math.min(...rowsEnd))
      rowsEnd[r] = m.t + m.d
      const live = past && c < m.t + m.d
      packets.push({
        i,
        l: X(m.t),
        w: Math.max(0.5, X(m.d)),
        top: LANE_H + 9 + r * 12,
        label: m.label + ' · ' + m.bytes + ' B',
        bg: live ? C.old : past ? C.old + '66' : 'transparent',
        bd: isSel ? C.bright : past ? C.old : C.old + '44',
      })
    } else {
      const a = LANE_INDEX[m.from]
      const b = LANE_INDEX[m.to]
      arrows.push({
        i,
        l: X(m.t),
        top: Math.min(a, b) * LANE_H + LANE_H / 2,
        h: Math.abs(a - b) * LANE_H,
        dot: b * LANE_H + LANE_H / 2 - 4,
        c: isSel ? C.bright : past ? C.new : C.new + '40',
        label: m.sig,
      })
    }
  })
  const frames: FrameView[] = tr.frames
    .filter((f) => f.a <= c)
    .map((f, key) => ({ key, l: X(f.a), w: X(Math.min(f.b, c) - f.a), dropped: f.dropped }))
  return { blocks, packets, arrows, frames }
}

/** Axis ticks for the shared time scale. */
export function axisTicks(T: number): { l: number; t: string }[] {
  const nice = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]
  const stp = nice.find((n) => T / n <= 7) || 1000
  const ticks: { l: number; t: string }[] = []
  for (let v = 0; v <= T; v += stp) ticks.push({ l: (v / T) * 100, t: String(v) })
  if (ticks.length) ticks[ticks.length - 1].t += ' ms'
  return ticks
}

/* ───────────── inspector ───────────── */

export interface MetricRow {
  l: string
  vals: { t: string; c: string }[]
}

export function metricRows(entries: { tr: Trace; snap: Snapshot }[], primary: Trace, c: number): MetricRow[] {
  const vals = (fn: (tr: Trace, a: Snapshot) => { t: string; c: string }) => entries.map(({ tr, snap }) => fn(tr, snap))
  return [
    { l: 'Dropped frames', vals: vals((_, a) => ({ t: a.dropped + '', c: a.dropped ? C.load : C.bright })) },
    {
      l: 'Queue depth (now / max)',
      vals: vals((tr, a) => ({ t: a.qNow + ' / ' + tr.qMax, c: a.qNow >= 4 ? C.load : C.bright })),
    },
    {
      l: primary.metric.l,
      vals: vals((tr) => ({ t: c >= tr.end - 0.01 ? fmtMetric(tr.metric.v, tr.metric.u) : '…', c: accentOf(tr.mode) })),
    },
    { l: 'Bytes serialized', vals: vals((_, a) => ({ t: fmtBytes(a.ser), c: C.bright })) },
  ]
}

export interface InspectorView {
  kind: string
  c: string
  bd: string
  rows: { k: string; v: string }[]
  payload: string | null
}

const NM = { ui: 'UI', js: 'JS', native: 'Native', shadow: 'Shadow' } as const

/** Selected message, else the latest message of the primary trace. */
export function pickMessage(primary: Trace, c: number, selected: Message | null): Message | null {
  if (selected) return selected
  const ms = primary.messages.filter((m) => m.t <= c)
  return ms[ms.length - 1] ?? null
}

export function inspectorFor(msg: Message): InspectorView {
  if (msg.kind === 'msg')
    return {
      kind: 'Bridge message · async',
      c: C.old,
      bd: C.old + '55',
      payload: msg.payload,
      rows: [
        { k: 'route', v: NM[msg.from] + ' → bridge → ' + NM[msg.to] },
        { k: 'sent at', v: msg.t.toFixed(1) + ' ms' },
        { k: 'in flight', v: msg.d.toFixed(1) + ' ms' },
        { k: 'size', v: msg.bytes > 2048 ? Math.round(msg.bytes / 1024) + ' KB' : msg.bytes + ' bytes' },
        { k: 'format', v: 'JSON text' },
      ],
    }
  return {
    kind: msg.sched ? 'JSI event · scheduled on JS thread' : 'JSI call · direct',
    c: C.new,
    bd: C.new + '55',
    payload: null,
    rows: [
      { k: 'call', v: msg.sig },
      { k: 'route', v: NM[msg.from] + ' → ' + NM[msg.to] + (msg.sched ? ' (queued for JS thread)' : '') },
      { k: 'at', v: msg.t.toFixed(1) + ' ms' },
      { k: 'bytes copied', v: msg.ref ? '0 (buffer shared)' : '0' },
      { k: 'format', v: 'C++ values' },
    ],
  }
}

export interface ModuleRow {
  n: string
  s: string
  c: string
}

export function moduleRows(pr: Preset, primary: Trace, c: number): ModuleRow[] {
  const names = primary.mods || pr.mods || []
  const old = primary.mode === 'old'
  const rows: ModuleRow[] = names.slice(0, 20).map((n) => {
    let s = old && pr.id !== 'startup' ? 'ready' : 'not loaded'
    for (const m of primary.modules) if (m.n === n && m.t <= c) s = m.s
    return { n, s, c: s === 'ready' ? accentOf(primary.mode) : s === 'loading' ? C.bright : C.ghost }
  })
  if (names.length > 20) rows.push({ n: '+' + (names.length - 20) + ' more', s: '', c: C.ghost })
  return rows
}

export interface TreeView {
  key: string
  title: string
  built: boolean
  updated: boolean
  nodes: { depth: number; label: string }[]
}

export function treeViews(pr: Preset, primary: Trace, c: number, T: number): TreeView[] {
  const hasTR = primary.trees.length > 0
  const built = (k: string) => !hasTR || primary.trees.some((x) => x.k === k && x.t <= c)
  const lastTR = primary.trees.filter((x) => x.t <= c).slice(-1)[0]
  const upd = (k: string) => !!lastTR && lastTR.k === k && c - lastTR.t < T * 0.08
  const o = primary.mode === 'old'
  const defs: [string, string, { depth: number; label: string }[]][] = [
    ['e', 'Element tree · JS', pr.tree.map((n) => ({ depth: n[0], label: '<' + n[1] + '>' }))],
    [
      's',
      o ? 'Shadow tree · Shadow thread' : 'Shadow tree · C++',
      pr.tree.filter((n) => n[2]).map((n) => ({ depth: n[0], label: o ? 'RCT' + n[2] + ' #' + n[3] : n[2] + 'ShadowNode' })),
    ],
    ['h', 'Host views · UI', pr.tree.filter((n) => n[2]).map((n) => ({ depth: n[0], label: n[2] + ' #' + n[3] }))],
  ]
  return defs.map(([k, title, nodes]) => ({ key: k, title, built: built(k), updated: upd(k), nodes }))
}
