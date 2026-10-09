import { C } from './colors'

/**
 * ScrollRace (REQUIREMENTS §5.1): the same list scrolled on two phones, one per
 * architecture. Pure, frame-stepped model; no React, no DOM.
 */

/** One sim frame, ms. */
export const FRAME = 16.6
/** Scroll distance per frame, px. */
export const PX = 4
/** The run ends after this many frames. */
export const END = 600
/** Row pitch, px. */
export const ROW = 52
/** Real time runs at half speed: one sim frame per 33.2 ms at 1×. */
export const REAL_FRAME_MS = FRAME * 2
/** JS lag above which a side counts as overloaded, ms. */
export const OVERLOAD_MS = 80
export const DEFAULT_LOAD = 25

export type SideKey = 'o' | 'n'

export interface Side {
  /** JS time budget carried over, ms. */
  avail: number
  /** y the JS thread has rendered up to. */
  ry: number
  dropped: number
  /** frames of red flash left */
  flash: number
  /** messages / rows in the next batch */
  batch: number
  /** JSON serialization cost of the next event, ms (0 on New) */
  ser: number
}

export interface RaceState {
  /** frame index */
  f: number
  /** slider 0–100 */
  load: number
  /** real-time ms owed to the model but not yet stepped */
  acc: number
  o: Side
  n: Side
}

const freshSide = (): Side => ({ avail: 0, ry: 0, dropped: 0, flash: 0, batch: 1, ser: 0 })

export const initialRace = (load = DEFAULT_LOAD): RaceState => ({ f: 0, load, acc: 0, o: freshSide(), n: freshSide() })

/** Work per event, ms. */
export const workOf = (load: number) => 1 + load * 0.2

const rowsFor = (y: number, ry: number) => Math.min(10, Math.max(1, Math.ceil((y - ry) / ROW)))

function stepSide(d: Side, y: number, w: number, old: boolean): Side {
  const o = { ...d }
  const rows = rowsFor(y, o.ry)
  o.ser = old ? 1 + rows * 1.2 : 0
  o.batch = 1 + rows
  const cost = w + o.ser
  o.avail += FRAME
  if (o.avail >= cost) {
    // JS clears the merged event: render up to the latest y.
    o.avail = Math.min(o.avail - cost, FRAME)
    o.ry = y
    o.flash = Math.max(0, o.flash - 1)
  } else {
    // JS still busy: this frame is dropped and the event merges into the next one.
    o.dropped++
    o.flash = 3
  }
  return o
}

export const isComplete = (s: RaceState) => s.f >= END

/** Advance exactly one 16.6 ms frame. */
export function advance(s: RaceState): RaceState {
  if (isComplete(s)) return s
  const f = s.f + 1
  const y = f * PX
  const w = workOf(s.load)
  return { ...s, f, o: stepSide(s.o, y, w, true), n: stepSide(s.n, y, w, false) }
}

/** Clock adapter: accumulate real dt (speed applied) and step as many frames as owed. */
export function tick(s: RaceState, dt: number): { state: RaceState; stop?: boolean } {
  let st: RaceState = { ...s, acc: s.acc + dt }
  while (st.acc >= REAL_FRAME_MS && st.f < END) st = { ...advance(st), acc: st.acc - REAL_FRAME_MS }
  return isComplete(st) ? { state: { ...st, acc: 0 }, stop: true } : { state: st }
}

/** Play: restart from frame 0 when complete (keeping the load), otherwise resume. */
export const playFrom = (s: RaceState): RaceState => (isComplete(s) ? initialRace(s.load) : { ...s, acc: 0 })

export const withLoad = (s: RaceState, load: number): RaceState => ({ ...s, load })

// ---------------------------------------------------------------- derived

/** How far JS is behind the scroll, ms. */
export const lagOf = (s: RaceState, d: Side) => ((s.f * PX - d.ry) / PX) * FRAME

export const isOver = (s: RaceState, k: SideKey) => s.f > 0 && lagOf(s, s[k]) > OVERLOAD_MS

export type RaceStatus = 'idle' | 'running' | 'overloaded' | 'paused' | 'overloaded-paused' | 'complete'

export function raceStatus(s: RaceState, running: boolean): RaceStatus {
  const over = isOver(s, 'o') || isOver(s, 'n')
  if (running) return over ? 'overloaded' : 'running'
  if (isComplete(s)) return 'complete'
  if (s.f === 0) return 'idle'
  return over ? 'overloaded-paused' : 'paused'
}

export const playLabel = (s: RaceState, running: boolean) =>
  running ? 'Pause' : isComplete(s) ? 'Replay' : s.f === 0 ? 'Play' : 'Resume'

export type CaptionKind = 'idle' | 'complete' | 'both' | 'old' | 'ok'

export function caption(s: RaceState): { kind: CaptionKind; text: string; warn: boolean } {
  const oOver = isOver(s, 'o')
  const nOver = isOver(s, 'n')
  if (s.f === 0)
    return {
      kind: 'idle',
      warn: false,
      text: 'Press Play to start scrolling both lists, then drag the JS load slider to the right. Each frame, both phones get a scroll event and JS renders the rows that came into view. Events that arrive while JS is busy are merged into the latest one, on both phones.',
    }
  if (isComplete(s))
    return {
      kind: 'complete',
      warn: false,
      text: 'Done. Old dropped ' + s.o.dropped + ' frames, New dropped ' + s.n.dropped + '. Drag the slider and press Replay to compare at a different load.',
    }
  if (oOver && nOver)
    return {
      kind: 'both',
      warn: true,
      text: 'At this load both phones fall behind. The New Architecture removes the JSON, but your own JS work still has to fit in 16.6 ms.',
    }
  if (oOver)
    return {
      kind: 'old',
      warn: true,
      text:
        'The old phone is falling behind. Every event pays for JSON both ways: the scroll event in, and the row updates out. The further behind JS gets, the more rows each batch carries (' +
        s.o.batch +
        ' messages, ' +
        s.o.ser.toFixed(1) +
        ' ms of JSON), so it costs even more. Blank rows appear.',
    }
  return {
    kind: 'ok',
    warn: false,
    text: 'Both phones keep up. Each event’s cost fits inside one 16.6 ms frame, so JS clears it before the next one arrives.',
  }
}

/** Scroll position shown on the phones. Reduced motion jumps every 15 frames. */
export const scrollYFor = (s: RaceState, reduced: boolean) =>
  reduced ? Math.floor(s.f / 15) * 15 * PX : s.f * PX

export interface PhoneRow {
  i: number
  top: number
  filled: boolean
  t1: string
  t2: string
}

const VIEW = 340
const TOP0 = 60

/** Visible rows for a phone. A row is filled if index × 52 < renderedY + 340 + 52. */
export function phoneRows(scrollY: number, ry: number): PhoneRow[] {
  const out: PhoneRow[] = []
  const first = Math.max(0, Math.floor(scrollY / ROW) - 1)
  for (let i = first; i < first + 9; i++) {
    const top = TOP0 + i * ROW - scrollY
    if (top > VIEW + 10 || top < -ROW) continue
    const filled = i * ROW < ry + VIEW + ROW
    out.push(
      filled
        ? { i, top, filled, t1: 'Order #' + (1040 + i), t2: ((i % 4) + 1) + ' items · $' + (12 + ((i * 7) % 40)) + '.00' }
        : { i, top, filled, t1: '·', t2: '·' },
    )
  }
  return out
}

export interface SideView {
  key: SideKey
  name: string
  color: string
  old: boolean
  over: boolean
  /** red flash this frame (never in reduced motion) */
  flash: boolean
  ry: number
  rows: PhoneRow[]
  dropped: number
  dropPct: string
  qLabel: string
  /** batch squares, colored; red past 5 on Old */
  qbox: string[]
  qText: string
  qWarn: boolean
  lag: number
  lagWarn: boolean
  cost: string
}

export function sideView(s: RaceState, key: SideKey, opts: { reduced: boolean; running: boolean }): SideView {
  const d = s[key]
  const old = key === 'o'
  const color = old ? C.old : C.new
  const q = s.f ? d.batch : 0
  const lagMs = Math.round(lagOf(s, d))
  const w = workOf(s.load)
  const scrollY = scrollYFor(s, opts.reduced)
  return {
    key,
    name: old ? 'Old architecture' : 'New Architecture',
    color,
    old,
    over: isOver(s, key),
    flash: !opts.reduced && d.flash > 0 && opts.running,
    ry: d.ry,
    rows: phoneRows(scrollY, opts.reduced ? Math.floor(d.ry / 60) * 60 : d.ry),
    dropped: d.dropped,
    dropPct: s.f ? Math.round((d.dropped / s.f) * 100) + '%' : '0%',
    qLabel: old ? 'Next bridge batch' : 'Next update',
    qbox: Array.from({ length: q }, (_, i) => (old && i >= 5 ? C.load : color)),
    qText: old ? q + ' JSON messages · ' + d.ser.toFixed(1) + ' ms' : q + ' rows · no JSON',
    qWarn: old && q > 5,
    lag: Math.max(0, lagMs),
    lagWarn: lagMs > 100,
    cost: (old ? d.ser.toFixed(1) : '0') + ' ms JSON + ' + w.toFixed(1) + ' ms work',
  }
}

/** Seconds of sim time, 2 decimals. */
export const simTime = (s: RaceState) => ((s.f * FRAME) / 1000).toFixed(2)

/** Slider value color: amber when work nearly fills a frame, red when it overflows. */
export function loadColor(load: number) {
  const w = workOf(load)
  return w + 2.2 > FRAME ? (w > FRAME ? C.load : C.old) : C.muted
}
