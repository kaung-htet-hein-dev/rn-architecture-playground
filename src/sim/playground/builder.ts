import type { Mode } from '../colors'
import type {
  BridgeMessage,
  Endpoint,
  Lane,
  Message,
  Metric,
  ModuleStatus,
  ParamValue,
  QueueEntry,
  Stall,
  Task,
  TreeUpdate,
  UIPatch,
} from './types'

export interface TaskOpts {
  ln?: Task['ln']
  stack?: string[]
  cap?: string
}

export interface SendOpts {
  /** old: override byte count (else payload length) */
  bytes?: number
  /** old: override time in flight (else 3 + bytes / 8000) */
  d?: number
  /** new: call signature (else label) */
  sig?: string
  sched?: boolean
  cap?: string
}

/** Mutable collector shared by every preset generator (prototype `gen()` locals). */
export interface Builder {
  old: boolean
  tasks: Task[]
  messages: Message[]
  uiPatches: UIPatch[]
  modules: ModuleStatus[]
  trees: TreeUpdate[]
  stalls: Stall[]
  queue: QueueEntry[]
  /** add a task; returns its end time */
  task: (lane: Lane, t: number, d: number, label: string, o?: TaskOpts) => number
  /**
   * Old: JSON message through the bridge, costing 3 + bytes/8000 ms.
   * New: JSI call or scheduled event, 0.4 ms. Returns arrival time.
   */
  send: (t: number, from: Endpoint, to: Endpoint, label: string, payload: string | null, o?: SendOpts) => number
  /** push a raw bridge message with an explicit queue time */
  pushMsg: (m: Omit<BridgeMessage, 'kind'>) => void
}

export interface PresetResult {
  metric: Metric
  mods?: string[]
}

export type PresetGen = (b: Builder, P: Record<string, ParamValue>, rate: number) => PresetResult

/** Copy only defined keys so traces deep-equal regardless of `undefined` fields. */
function defined<T extends object>(o: T): T {
  const out = {} as T
  for (const k of Object.keys(o) as (keyof T)[]) if (o[k] !== undefined) out[k] = o[k]
  return out
}

export function createBuilder(mode: Mode): Builder {
  const old = mode === 'old'
  const b: Builder = {
    old,
    tasks: [],
    messages: [],
    uiPatches: [],
    modules: [],
    trees: [],
    stalls: [],
    queue: [],
    task(lane, t, d, label, o) {
      b.tasks.push(defined({ lane, t, d, label, ...o }))
      return t + d
    },
    send(t, from, to, label, payload, o = {}) {
      if (old) {
        const bytes = o.bytes || (payload ? payload.length : 40)
        const d = o.d != null ? o.d : 3 + bytes / 8000
        b.messages.push(defined({ kind: 'msg', t, d, from, to, label, payload: payload ?? '', bytes, cap: o.cap }))
        return t + d
      }
      b.messages.push(
        defined({ kind: 'call', t, d: 0.4, from, to, label, sig: o.sig || label, sched: o.sched, cap: o.cap }),
      )
      return t + 0.4
    },
    pushMsg(m) {
      b.messages.push(defined({ kind: 'msg', ...m }))
    },
  }
  return b
}

/** Parse a user-edited number (allows `_`, `,` and spaces), clamp, else default. */
export function cl(v: ParamValue | undefined, a: number, z: number, d: number): number {
  const n = parseFloat(String(v).replace(/[_,\s]/g, ''))
  return isNaN(n) ? d : Math.max(a, Math.min(z, n))
}
