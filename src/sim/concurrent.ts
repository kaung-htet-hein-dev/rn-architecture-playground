/**
 * Chapter 7: two phones get the same two taps, Photos (a slow screen) then Map.
 * Each phone has one JS thread. The left one updates with setState, the right one with
 * startTransition. The model runs in 1 ms steps, is computed once, and is played back slowly.
 *
 * Blocking (old architecture, or plain setState): each tap renders the tab bar and the whole
 * screen in one go, and a tap that arrives meanwhile waits.
 * Transition (New Architecture + startTransition): the tab bar renders as an urgent update,
 * the screen renders in 5 ms slices, and a tap between slices throws the partial work away.
 */

export type TabId = 'feed' | 'photos' | 'map'
export type Strategy = 'setState' | 'transition'

export const TABS: { id: TabId; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'photos', label: 'Photos' },
  { id: 'map', label: 'Map' },
]

export const tabLabel = (id: TabId) => TABS.find((t) => t.id === id)!.label

/** Event handler plus rendering the tab bar. */
const BAR_MS = 3
const COMMIT_MS = 2
/** React's scheduler yields to the host about every 5 ms. */
const SLICE_MS = 5
const costOf = (tab: TabId) => (tab === 'photos' ? 200 : tab === 'map' ? 24 : 16)

/** The two taps both phones receive. */
export const SCRIPT: { tab: TabId; at: number }[] = [
  { tab: 'photos', at: 20 },
  { tab: 'map', at: 80 },
]
/** Quiet time drawn after the last phone settles. */
const TAIL_MS = 20
/** Real milliseconds per simulated millisecond at 1× speed. */
export const SLOWDOWN = 15

export type BlockKind = 'bar' | 'urgent' | 'slice' | 'commit'

export interface Block {
  id: number
  kind: BlockKind
  tab: TabId
  start: number
  end: number
  /** transition render that was interrupted and discarded */
  dropped?: boolean
  /** groups the slices of one transition render */
  work?: number
}

export interface Tap {
  id: number
  tab: TabId
  at: number
  /** when JS started handling it */
  start?: number
  /** when the tab bar showed it */
  shown?: number
}

interface Busy {
  kind: BlockKind
  tab: TabId
  end: number
  block: number
  tap?: number
  /** what a commit puts on screen */
  commits?: 'bar' | 'all' | 'content'
}

interface Transition {
  tab: TabId
  done: number
  total: number
  work: number
}

export interface Phone {
  t: number
  sliced: boolean
  inbox: number[]
  taps: Tap[]
  busy: Busy | null
  transition: Transition | null
  shown: { bar: TabId; content: TabId }
  blocks: Block[]
  nextId: number
}

const initialPhone = (sliced: boolean): Phone => ({
  t: 0,
  sliced,
  inbox: [],
  taps: [],
  busy: null,
  transition: null,
  shown: { bar: 'feed', content: 'feed' },
  blocks: [],
  nextId: 1,
})

function tap(s: Phone, tab: TabId): Phone {
  const id = s.nextId
  return { ...s, nextId: id + 1, taps: [...s.taps, { id, tab, at: s.t }], inbox: [...s.inbox, id] }
}

function addBlock(s: Phone, b: Omit<Block, 'id' | 'start'>): { s: Phone; id: number } {
  const id = s.nextId
  return { s: { ...s, nextId: id + 1, blocks: [...s.blocks, { ...b, id, start: s.t }] }, id }
}

const markTap = (s: Phone, id: number, patch: Partial<Tap>): Phone => ({
  ...s,
  taps: s.taps.map((tp) => (tp.id === id ? { ...tp, ...patch } : tp)),
})

/** Finish the current unit of work and apply what it did. */
function finish(s: Phone): Phone {
  const b = s.busy!
  s = { ...s, busy: null }

  if (b.kind === 'commit') {
    if (b.commits === 'bar' || b.commits === 'all') {
      s = { ...s, shown: { ...s.shown, bar: b.tab } }
      if (b.tap != null) s = markTap(s, b.tap, { shown: s.t })
    }
    if (b.commits === 'all' || b.commits === 'content') s = { ...s, shown: { ...s.shown, content: b.tab } }
    return s
  }

  if (b.kind === 'urgent' || b.kind === 'bar') {
    if (b.kind === 'bar') {
      // the handler ran: startTransition(() => setContent(tab))
      const tr = b.tab === s.shown.content ? null : { tab: b.tab, done: 0, total: costOf(b.tab), work: s.nextId }
      s = { ...s, transition: tr, nextId: s.nextId + 1 }
    }
    const c = addBlock(s, { kind: 'commit', tab: b.tab, end: s.t + COMMIT_MS })
    return {
      ...c.s,
      busy: { kind: 'commit', tab: b.tab, end: s.t + COMMIT_MS, block: c.id, tap: b.tap, commits: b.kind === 'bar' ? 'bar' : 'all' },
    }
  }

  // a transition slice
  const tr = s.transition!
  const done = tr.done + (b.end - s.blocks.find((x) => x.id === b.block)!.start)
  if (done < tr.total) return { ...s, transition: { ...tr, done } }
  const c = addBlock({ ...s, transition: null }, { kind: 'commit', tab: tr.tab, end: s.t + COMMIT_MS })
  return { ...c.s, busy: { kind: 'commit', tab: tr.tab, end: s.t + COMMIT_MS, block: c.id, commits: 'content' } }
}

/** Pick the next unit of work: input first, then the transition. */
function startNext(s: Phone): Phone {
  if (s.inbox.length) {
    const [id, ...rest] = s.inbox
    const tp = s.taps.find((x) => x.id === id)!
    s = markTap({ ...s, inbox: rest }, id, { start: s.t })
    if (!s.sliced) {
      const end = s.t + BAR_MS + costOf(tp.tab)
      const c = addBlock(s, { kind: 'urgent', tab: tp.tab, end })
      return { ...c.s, busy: { kind: 'urgent', tab: tp.tab, end, block: c.id, tap: id } }
    }
    // an urgent update interrupts the transition: its partial tree is thrown away
    const tr = s.transition
    if (tr && tr.done > 0) {
      s = {
        ...s,
        blocks: s.blocks.map((x) => (x.work === tr.work ? { ...x, dropped: true } : x)),
        transition: { ...tr, done: 0 },
      }
    }
    const end = s.t + BAR_MS
    const c = addBlock(s, { kind: 'bar', tab: tp.tab, end })
    return { ...c.s, busy: { kind: 'bar', tab: tp.tab, end, block: c.id, tap: id } }
  }
  if (s.transition) {
    const tr = s.transition
    const end = s.t + Math.min(SLICE_MS, tr.total - tr.done)
    const c = addBlock(s, { kind: 'slice', tab: tr.tab, end, work: tr.work })
    return { ...c.s, busy: { kind: 'slice', tab: tr.tab, end, block: c.id } }
  }
  return s
}

/** Advance one millisecond. */
function step(s: Phone): Phone {
  s = { ...s, t: s.t + 1 }
  for (const d of SCRIPT) if (d.at === s.t) s = tap(s, d.tab)
  if (s.busy && s.t >= s.busy.end) s = finish(s)
  if (!s.busy) s = startNext(s)
  return s
}

const settled = (s: Phone) => s.t > SCRIPT[SCRIPT.length - 1].at && !s.busy && !s.inbox.length && !s.transition

/** Every millisecond of one phone's run, until it settles. */
function run(sliced: boolean): Phone[] {
  const frames = [initialPhone(sliced)]
  while (!settled(frames[frames.length - 1])) frames.push(step(frames[frames.length - 1]))
  return frames
}

const mapTap = (p: Phone) => p.taps.find((tp) => tp.tab === 'map')!

export interface Race {
  /** the old architecture renders everything synchronously, startTransition included */
  concurrent: boolean
  left: Phone[]
  right: Phone[]
  end: number
  /** times the Next step button stops at: mid-Photos, just after the Map tap, the end */
  stops: number[]
  leftMapShown: number
  rightMapShown: number
}

export function buildRace(concurrent: boolean): Race {
  const left = run(false)
  const right = run(concurrent)
  const last = (f: Phone[]) => f[f.length - 1]
  const end = Math.max(last(left).t, last(right).t) + TAIL_MS
  const lm = mapTap(last(left))
  const rm = mapTap(last(right))
  const [photosAt, mapAt] = SCRIPT.map((d) => d.at)
  // stop once the right phone has lit Map (new), or while both still wait (old)
  const mapStop = concurrent ? rm.shown! + 5 : mapAt + 10
  const stops = [Math.round((photosAt + mapAt) / 2), mapStop, end]
  return { concurrent, left, right, end, stops, leftMapShown: lm.shown!, rightMapShown: rm.shown! }
}

/** A phone at time t (it stays at its last frame once settled). */
export const phoneAt = (f: Phone[], t: number) => f[Math.min(f.length - 1, Math.max(0, Math.floor(t)))]

/**
 * Live readout: how long the Map tap has waited so far, whether the tab has lit up,
 * and whether JS has started handling the tap yet.
 */
export function mapWait(p: Phone): { ms: number; done: boolean; handling: boolean } | null {
  const tp = p.taps.find((x) => x.tab === 'map')
  if (!tp) return null
  const handling = tp.start != null
  return tp.shown != null ? { ms: tp.shown - tp.at, done: true, handling } : { ms: p.t - tp.at, done: false, handling }
}

export type CaptionKind = 'intro' | 'photos' | 'map' | 'done'

export function caption(r: Race, t: number): { kind: CaptionKind; text: string; warn?: boolean } {
  const [photosAt, mapAt] = SCRIPT.map((d) => d.at)
  const lWait = r.leftMapShown - mapAt
  const rWait = r.rightMapShown - mapAt
  if (t < photosAt)
    return {
      kind: 'intro',
      text: 'Two phones, same app, one line of code different. You’ll tap Photos, a slow screen, then change your mind and tap Map. Press Play.',
    }
  if (t < mapAt)
    return r.concurrent
      ? {
          kind: 'photos',
          text: 'You tapped Photos. Look at the tab bars: the right phone lights up Photos at once. The left one stays on Feed until the whole screen is built.',
        }
      : {
          kind: 'photos',
          text: 'You tapped Photos. On the old architecture both phones build the whole screen in one go. startTransition does nothing here.',
        }
  if (t < r.leftMapShown)
    return r.concurrent
      ? {
          kind: 'map',
          text: 'You tapped Map. Right: React drops the half-built Photos screen and shows Map. Left: React can’t stop halfway, so Map waits.',
          warn: true,
        }
      : {
          kind: 'map',
          text: 'You tapped Map. Neither phone can stop halfway through Photos, so Map waits on both.',
          warn: true,
        }
  return r.concurrent
    ? {
        kind: 'done',
        text: `Map lit up after ${lWait} ms on the left and ${rWait} ms on the right. One line of code made the difference.`,
      }
    : {
        kind: 'done',
        text: `Map lit up after ${lWait} ms on both phones. Switch to New at the top of the page and play it again.`,
        warn: true,
      }
}

export const CODE: Record<Strategy, string[]> = {
  setState: ['setSelected(next);', 'setContent(next);'],
  transition: ['setSelected(next);', 'startTransition(() => setContent(next));'],
}

/** The line that differs between the two phones. */
export const DIFF_LINE = 1
