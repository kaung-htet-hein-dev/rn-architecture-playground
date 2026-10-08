import { C, easeInOutQuad, type SimStatus } from './colors'
import { LN, type LaneId, type Scenario, type TreeNode } from './scenarios'

/** Step-playback state for SimPanel (REQUIREMENTS §3 Playback model). */
export interface StepState {
  /** −1 = idle */
  step: number
  /** 0..1 progress within the step */
  p: number
  /** play exactly one step then pause */
  once: boolean
}

export const STEP_IDLE: StepState = { step: -1, p: 0, once: false }
export const STEP_MS = 2400

export const stepDuration = (sc: Scenario, step: number) => (sc.steps[step]?.d ?? 2.4) * 1000

export function isComplete(sc: Scenario, s: StepState) {
  return s.step >= sc.steps.length - 1 && s.p >= 1
}

/** Advance by dt ms (speed already applied). */
export function advanceStep(sc: Scenario, s: StepState, dt: number): { state: StepState; stop?: boolean } {
  if (s.step < 0) return { state: s, stop: true }
  let { step, p } = s
  p += dt / stepDuration(sc, step)
  if (p >= 1) {
    if (s.once || step >= sc.steps.length - 1) return { state: { step, p: 1, once: false }, stop: true }
    step += 1
    p = 0
  }
  return { state: { step, p, once: s.once } }
}

/** Play: from idle or complete restarts at step 0; otherwise resumes. */
export function playFrom(sc: Scenario, s: StepState): StepState {
  const restart = isComplete(sc, s) || s.step < 0
  return {
    step: restart ? 0 : s.p >= 1 ? s.step + 1 : s.step,
    p: restart || s.p >= 1 ? 0 : s.p,
    once: false,
  }
}

/** Step: plays exactly one step. Returns null when already complete. */
export function stepFrom(sc: Scenario, s: StepState): StepState | null {
  if (isComplete(sc, s)) return null
  const next = s.step < 0 ? 0 : s.p >= 1 ? s.step + 1 : s.step
  return { step: next, p: next !== s.step ? 0 : s.p, once: true }
}

export const jumpTo = (i: number): StepState => ({ step: i, p: 0, once: true })

export function stepStatus(sc: Scenario, s: StepState, running: boolean, reduced: boolean): SimStatus {
  const cur = s.step >= 0 ? sc.steps[s.step] : null
  if (cur?.err && (s.p > 0.5 || reduced)) return 'error'
  if (running) return 'running'
  if (s.step < 0) return 'idle'
  if (isComplete(sc, s)) return 'complete'
  return 'paused'
}

// ─── View derivation ────────────────────────────────────────────────────────

export interface LaneView {
  id: LaneId
  name: string
  sub: string
  color: string
  active: boolean
  /** lane color, or load color on error */
  tone: string
  acts: { text: string; live: boolean; key: string }[]
  isJsi: boolean
  queue: string[]
  screen: string | null
}

export interface PacketView {
  kind: 'json' | 'ref'
  label: string
  /** json: current x% ; ref: head x% */
  x: number
  from: number
  to: number
  /** ref: label midpoint */
  mid: number
}

export interface TreeView {
  title: string
  updated: boolean
  nodes: { depth: number; label: string; hot: boolean }[] | null
}

export interface PanelView {
  lanes: LaneView[]
  gridCols: string
  centers: number[]
  packet: PacketView | null
  phases: { n: string; t: string; on: boolean; past: boolean }[]
  trees: TreeView[]
  activeLines: [number, number] | null
  caption: string
  stepKey: string
}

export function derivePanel(sc: Scenario, s: StepState, opts: { reduced: boolean; compact: boolean; error: boolean }): PanelView {
  const { step, p } = s
  const cur = step >= 0 ? sc.steps[step] : null
  const fr = sc.lanes.map((id) => (LN[id].narrow ? 0.78 : 1))
  const tot = fr.reduce((a, b) => a + b, 0)
  const centers: number[] = []
  let run = 0
  fr.forEach((f) => {
    centers.push(((run + f / 2) / tot) * 100)
    run += f
  })
  const done = sc.steps.slice(0, step + 1)
  const last = <K extends 'q' | 'ui'>(key: K) => {
    for (let i = done.length - 1; i >= 0; i--) if (done[i][key] !== undefined) return done[i][key]
    return undefined
  }
  const queue = (last('q') as string[] | undefined) ?? []
  const screen = (last('ui') as string | undefined) ?? sc.ui0 ?? ''

  const lanes: LaneView[] = sc.lanes.map((id) => {
    const L = LN[id]
    const active = !!cur && cur.l === id
    const tone = active && opts.error ? C.load : L.c
    const hist = done
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x.l === id && x.a)
      .slice(opts.compact ? -1 : -2)
    return {
      id,
      name: L.name,
      sub: L.sub,
      color: L.c,
      active,
      tone,
      acts: hist.map(({ x, i }) => ({ text: x.a, live: active && x === cur, key: id + i })),
      isJsi: L.k === 'jsi',
      queue: L.k === 'bridge' ? queue.slice(0, opts.compact ? 2 : 4) : [],
      screen: sc.screen && id === 'ui' ? screen : null,
    }
  })

  let packet: PacketView | null = null
  if (cur?.p) {
    const [from, to, label, kind0] = cur.p
    const kind = kind0 ?? 'json'
    const cf = centers[sc.lanes.indexOf(from)]
    const ct = centers[sc.lanes.indexOf(to)]
    if (kind !== 'ref') {
      const e = opts.reduced ? 1 : easeInOutQuad((p - 0.06) / 0.7)
      packet = { kind: 'json', label, x: cf + (ct - cf) * e, from: cf, to: ct, mid: (cf + ct) / 2 }
    } else {
      const g = opts.reduced ? 1 : easeInOutQuad(p / 0.28)
      packet = { kind: 'ref', label, x: cf + (ct - cf) * g, from: cf, to: ct, mid: (cf + ct) / 2 }
    }
  }

  const phases = (sc.phases ?? []).map((t, i) => ({
    t,
    n: '0' + (i + 1),
    on: !!cur && cur.ph === i,
    past: !!cur && cur.ph !== undefined && cur.ph > i,
  }))

  const trees: TreeView[] = sc.trees
    ? (['e', 's', 'h'] as const).map((k, i) => {
        let nodes: TreeNode[] | null = null
        for (let j = done.length - 1; j >= 0; j--) {
          const t = done[j].tr?.[k]
          if (t) {
            nodes = t
            break
          }
        }
        const updated = !!cur?.tr?.[k]
        return {
          title: sc.treeNames?.[i] ?? '',
          updated,
          nodes: nodes ? nodes.map((nd) => ({ depth: nd[0], label: (nd[0] ? '└ ' : '') + nd[1], hot: updated && !!nd[2] })) : null,
        }
      })
    : []

  const activeLines: [number, number] | null =
    cur && cur.ln !== undefined ? (Array.isArray(cur.ln) ? cur.ln : [cur.ln, cur.ln]) : null

  return {
    lanes,
    gridCols: fr.map((f) => f + 'fr').join(' '),
    centers,
    packet,
    phases,
    trees,
    activeLines,
    caption: cur ? cur.c : sc.intro,
    stepKey: String(step),
  }
}

/** progress segment fill for step i */
export function segFill(i: number, s: StepState, acc: string) {
  return i < s.step || (i === s.step && s.p >= 1) ? acc : i === s.step ? acc + '88' : C.track
}
