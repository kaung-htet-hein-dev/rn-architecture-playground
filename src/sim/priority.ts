/**
 * Chapter 7 diagram: React's two lanes of work while you tap Photos, then Map.
 * Positions are abstract units, not milliseconds, so short work like a commit stays visible.
 */

export type LaneId = 'top' | 'bottom'
export type DKind = 'slice' | 'urgent' | 'commit' | 'wait'

export interface DBlock {
  id: string
  lane: LaneId
  kind: DKind
  start: number
  end: number
  /** blocks that share a group get one label across them */
  group?: string
  /** turns into thrown-away work once the playhead reaches this point */
  droppedAt?: number
}

export interface DGroup {
  id: string
  label: string
  droppedLabel?: string
}

export interface Phase {
  from: number
  text: string
  warn?: boolean
}

export interface Screen {
  bar: string
  content: string
  dim: boolean
}

export interface Script {
  lanes: Record<LaneId, string>
  blocks: DBlock[]
  groups: DGroup[]
  tap: number
  /** small checkpoint dots between slices */
  checks: number[]
  notes: { at: number; text: string }[]
  phases: Phase[]
  end: number
  screenAt: (x: number) => Screen
}

const slices = (group: string, from: number, n: number, droppedAt?: number): DBlock[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${group}${i}`,
    lane: 'top' as const,
    kind: 'slice' as const,
    start: from + i * 1.25,
    end: from + i * 1.25 + 1,
    group,
    droppedAt,
  }))

const gaps = (from: number, n: number) => Array.from({ length: n - 1 }, (_, i) => from + i * 1.25 + 1.125)

const NEW_TAP = 7.9
const DROP = 8.6

const NEW: Script = {
  lanes: { top: 'Can wait (startTransition)', bottom: 'Urgent' },
  tap: NEW_TAP,
  blocks: [
    ...slices('photos', 0, 7, DROP),
    { id: 'bar', lane: 'bottom', kind: 'urgent', start: DROP, end: 11, group: 'bar' },
    { id: 'barCommit', lane: 'bottom', kind: 'commit', start: 11, end: 11.8 },
    ...slices('map', 12.2, 5),
    { id: 'mapCommit', lane: 'top', kind: 'commit', start: 18.4, end: 19.4 },
  ],
  groups: [
    { id: 'photos', label: 'Photos screen', droppedLabel: 'Photos, thrown away' },
    { id: 'bar', label: 'tab bar' },
    { id: 'map', label: 'Map screen, from scratch' },
  ],
  checks: [...gaps(0, 7), ...gaps(12.2, 5)],
  notes: [{ at: 1.1, text: 'checks for input between slices' }],
  phases: [
    {
      from: 0,
      text: 'You tapped Photos and its tab already lit up. Now React renders the Photos screen as a transition: small slices of about 5 ms, with a check for new input between each one.',
    },
    {
      from: NEW_TAP,
      text: 'You tap Map. React doesn’t stop in the middle of a slice. It finishes the one it’s on, then checks.',
      warn: true,
    },
    {
      from: DROP,
      text: 'The check finds urgent work. React drops the unfinished Photos tree and renders the tab bar on the urgent lane.',
      warn: true,
    },
    { from: 11, text: 'Commit: the tab bar with Map selected goes to the screen. The tap is answered right away.' },
    {
      from: 11.8,
      text: 'Back on the transition lane, React starts over with the newest state: the Map screen. It doesn’t resume Photos, because nobody needs it any more.',
    },
    { from: 18.4, text: 'Map is finished. React commits the whole screen in one go, so you never see half of it.' },
    {
      from: 19.4,
      text: 'Urgent work cuts in between slices. Transition work can be paused, thrown away and restarted. A commit is never split.',
    },
  ],
  end: 20,
  screenAt: (x) => ({
    bar: x >= 11.8 ? 'Map' : 'Photos',
    content: x >= 19.4 ? 'Map' : 'Feed',
    dim: x < 19.4,
  }),
}

const OLD_TAP = 5.2

const OLD: Script = {
  lanes: { top: 'Waiting taps', bottom: 'Render (always urgent)' },
  tap: OLD_TAP,
  blocks: [
    { id: 'wait', lane: 'top', kind: 'wait', start: OLD_TAP, end: 14, group: 'wait' },
    { id: 'photos', lane: 'bottom', kind: 'urgent', start: 0, end: 13, group: 'photos' },
    { id: 'photosCommit', lane: 'bottom', kind: 'commit', start: 13, end: 13.8 },
    { id: 'map', lane: 'bottom', kind: 'urgent', start: 14, end: 16.6, group: 'map' },
    { id: 'mapCommit', lane: 'bottom', kind: 'commit', start: 16.6, end: 17.4 },
  ],
  groups: [
    { id: 'wait', label: 'Map tap waiting for JS' },
    { id: 'photos', label: 'Photos: tab bar and whole screen' },
    { id: 'map', label: 'Map' },
  ],
  checks: [],
  notes: [],
  phases: [
    {
      from: 0,
      text: 'Old architecture: you tapped Photos. React renders the tab bar and the whole Photos screen as one job. Once it starts, it runs to the end.',
    },
    {
      from: OLD_TAP,
      text: 'You tap Map. There are no slices, so React never checks for input during this render. The tap waits.',
      warn: true,
    },
    {
      from: 13,
      text: 'Photos is done and committed. Only now does the Photos tab light up, even though you already wanted Map.',
    },
    { from: 14, text: 'Now React handles the waiting tap and renders Map, again as one job.' },
    {
      from: 17.4,
      text: 'Every update was urgent, so nothing could be paused or thrown away. Switch to New at the top to see the same taps on two lanes.',
    },
  ],
  end: 18.4,
  screenAt: (x) => ({
    bar: x >= 17.4 ? 'Map' : x >= 13.8 ? 'Photos' : 'Feed',
    content: x >= 17.4 ? 'Map' : x >= 13.8 ? 'Photos' : 'Feed',
    dim: false,
  }),
}

export const scriptFor = (concurrent: boolean) => (concurrent ? NEW : OLD)

/** Playback: units per real millisecond at 1×, and the pause at each new phase while playing. */
export const UNITS_PER_MS = 1 / 450
export const HOLD_MS = 1400

export interface Playhead {
  x: number
  /** real ms left to hold at the current phase */
  hold: number
  /** Next step: play one phase, then stop */
  once?: boolean
}

export const stopsOf = (s: Script) => [...s.phases.map((p) => p.from).filter((f) => f > 0), s.end]

/** Move the playhead; hold for a moment at each phase start so the caption can be read. */
export function advance(s: Script, p: Playhead, dt: number): { state: Playhead; stop?: boolean } {
  if (p.hold > 0) return { state: { ...p, hold: Math.max(0, p.hold - dt) } }
  const next = p.x + dt * UNITS_PER_MS
  const stop = stopsOf(s).find((f) => f > p.x && f <= next)
  if (stop == null) return { state: { ...p, x: next, hold: 0 } }
  if (stop >= s.end || p.once) return { state: { x: stop, hold: 0 }, stop: true }
  return { state: { x: stop, hold: HOLD_MS } }
}

/** The phase the playhead has just moved through, so a stop describes what was just drawn. */
export const phaseAt = (s: Script, x: number) => s.phases.filter((p) => p.from < x).pop()!
