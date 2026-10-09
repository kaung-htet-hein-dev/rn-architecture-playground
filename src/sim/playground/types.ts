import type { Mode } from '../colors'

/** One frame of the display, in ms (prototype `Component.FR`). */
export const FRAME_MS = 16.6

export type Lane = 'js' | 'shadow' | 'ui' | 'native'
/** Endpoints of a message or call. */
export type Endpoint = Lane

/** Code line(s) to highlight, 0-based. A pair is an inclusive range. */
export type LineRef = number | [number, number]

/** A block of work on one thread (prototype `E`). */
export interface Task {
  lane: Lane
  t: number
  d: number
  label: string
  ln?: LineRef
  stack?: string[]
  cap?: string
}

/** Old architecture: a JSON message through the async bridge (prototype `M`, kind 'msg'). */
export interface BridgeMessage {
  kind: 'msg'
  t: number
  /** time in queue + transit */
  d: number
  from: Endpoint
  to: Endpoint
  label: string
  payload: string
  bytes: number
  cap?: string
}

/** New Architecture: a JSI call or a C++ event (prototype `M`, kind 'call'). */
export interface JsiCall {
  kind: 'call'
  t: number
  d: number
  from: Endpoint
  to: Endpoint
  label: string
  sig: string
  /** event scheduled onto the JS thread */
  sched?: boolean
  cap?: string
}

export type Message = BridgeMessage | JsiCall

/** Phone preview state patch (prototype `UI`). Later patches override earlier ones. */
export interface UIPatch {
  t: number
  pressed?: boolean
  buzz?: boolean
  count?: number
  screen?: 'splash' | 'home'
  scroll?: number
  shown?: number
  x?: number
  tip?: boolean
  tipY?: number
  building?: boolean
  sent?: number
  done?: number
  status?: string
}
export type PhoneState = Omit<UIPatch, 't'>

export type ModuleLoad = 'loading' | 'ready'
/** Native module status change (prototype `MOD`). */
export interface ModuleStatus {
  t: number
  n: string
  s: ModuleLoad
}

export type TreeKind = 'e' | 's' | 'h'
/** Tree update (prototype `TR`): element, shadow or host. */
export interface TreeUpdate {
  t: number
  k: TreeKind
}

/** Interval where the UI waits for JS (prototype `ST`). */
export interface Stall {
  from: number
  to: number
}

/** JS-side pending event (prototype `Q`). */
export interface QueueEntry {
  t: number
  /** until */
  u: number
  label: string
}

export interface Frame {
  a: number
  b: number
  used: number
  dropped: boolean
}

export type MetricUnit = 'ms' | 'frames'
export interface Metric {
  l: string
  v: number
  u: MetricUnit
}

/** Timeline entries that can carry a caption or a code line. */
export type TimelineEvent = Task | Message

export interface Trace {
  mode: Mode
  tasks: Task[]
  messages: Message[]
  uiPatches: UIPatch[]
  modules: ModuleStatus[]
  trees: TreeUpdate[]
  stalls: Stall[]
  queue: QueueEntry[]
  frames: Frame[]
  /** tasks + messages sorted by start time */
  events: TimelineEvent[]
  qMax: number
  /** unique start times (step points), rounded to 0.01 ms */
  points: number[]
  /** last end time */
  end: number
  /** end + 12, rounded up to 10 */
  total: number
  metric: Metric
  /** module names shown in the status list (startup only) */
  mods: string[] | null
}

export type PresetId = 'tap' | 'startup' | 'scroll' | 'anim' | 'measure' | 'heavy' | 'payload'

/** Raw editable values. Inputs give strings; defaults may be numbers. */
export type ParamValue = string | number
export type Params = Record<string, ParamValue>

/** [depth, element name, host view type?, tag?] */
export type TreeNodeDef = [number, string, string?, number?]

export interface Preset {
  id: PresetId
  name: string
  file: string
  p: Params
  /** module names for the status list; null = derived from the trace; [] = none */
  mods: string[] | null
  /** preset uses the event rate */
  rate?: boolean
  desc: string
  tree: TreeNodeDef[]
  /** code lines with §param§ tokens */
  code: string[]
}
