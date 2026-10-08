import { C, type SimStatus } from './colors'

/** Eager vs lazy startup plan, ported from the course page (REQUIREMENTS §5.2). */

/** [name, ms, usedByFirstScreen] */
export const MODS: [string, number, boolean][] = [
  ['Storage', 40, true],
  ['Analytics', 35, true],
  ['Camera', 120, false],
  ['Maps', 160, false],
  ['Bluetooth', 90, false],
  ['Payments', 110, false],
  ['Contacts', 60, false],
  ['Location', 70, false],
  ['Biometrics', 50, false],
  ['Haptics', 15, false],
]

export const AXIS_MS = 1000
/** sim ms per real ms at 1× */
export const RATE = 0.36
/** reduced motion: one boundary per this many real ms */
export const REDUCED_STEP_MS = 500

export interface Seg {
  name: string
  s: number
  d: number
  c: string
}

export interface Plan {
  old: Seg[]
  nw: Seg[]
  oldEnd: number
  newEnd: number
  lazy: [string, number][]
  bounds: number[]
}

export function plan(mods = MODS): Plan {
  const old: Seg[] = []
  const nw: Seg[] = []
  let t = 0
  mods.forEach(([n, d]) => {
    old.push({ name: n + ' init', s: t, d, c: C.native })
    t += d
  })
  old.push({ name: 'JS bundle', s: t, d: 180, c: C.js })
  t += 180
  old.push({ name: 'First render', s: t, d: 40, c: C.ui })
  t += 40
  const oldEnd = t
  nw.push({ name: 'JS bundle', s: 0, d: 180, c: C.js })
  t = 180
  mods
    .filter((m) => m[2])
    .forEach(([n, d]) => {
      nw.push({ name: n + ' (first use)', s: t, d, c: C.new })
      t += d
    })
  nw.push({ name: 'First render', s: t, d: 40, c: C.ui })
  t += 40
  const lazy = mods.filter((m) => !m[2]).map(([n, d]) => [n, d] as [string, number])
  const bounds = [...new Set([...old, ...nw].map((x) => x.s + x.d))].sort((a, b) => a - b)
  return { old, nw, oldEnd, newEnd: t, lazy, bounds }
}

export const PLAN = plan()

export interface StartupState {
  t: number
  /** reduced-motion accumulator */
  acc: number
}

export const STARTUP_IDLE: StartupState = { t: 0, acc: 0 }

export function advanceStartup(s: StartupState, dt: number, reduced: boolean, P: Plan = PLAN): { state: StartupState; stop?: boolean } {
  let t: number
  let acc = s.acc
  if (reduced) {
    acc += dt
    if (acc < REDUCED_STEP_MS) return { state: { t: s.t, acc } }
    acc = 0
    t = P.bounds.find((b) => b > s.t + 0.01) ?? Math.max(P.oldEnd, AXIS_MS)
  } else {
    t = s.t + dt * RATE
  }
  if (t >= P.oldEnd) return { state: { t: P.oldEnd, acc: 0 }, stop: true }
  return { state: { t, acc } }
}

export const nextBoundary = (t: number, P: Plan = PLAN) => P.bounds.find((b) => b > t + 0.01) ?? null

export function startupStatus(t: number, running: boolean, P: Plan = PLAN): SimStatus {
  if (running) return 'running'
  if (t >= P.oldEnd) return 'complete'
  if (t === 0) return 'idle'
  return 'paused'
}

export function startupCaption(t: number, P: Plan = PLAN): string {
  if (t === 0) return 'Press Play. Both apps link the same ten native modules. Watch when each one can show its first screen.'
  if (t < P.newEnd)
    return 'The old app is creating native modules one after another. None of your JS has run yet. The new app is already loading its JS bundle.'
  if (t < P.oldEnd)
    return (
      'The new app is ready to use at ' +
      P.newEnd +
      ' ms. It only created Storage and Analytics, because the first screen used them. The old app is still setting up modules like Maps and Camera that nobody asked for.'
    )
  return (
    'Old: ' +
    P.oldEnd +
    ' ms. New: ' +
    P.newEnd +
    ' ms. The other eight Turbo Modules haven’t loaded at all. Tap one below: it loads the moment JS first uses it, and only once.'
  )
}

/** Segment geometry on the 0–1000 ms axis. */
export function segGeom(x: Seg, t: number) {
  return {
    l: (x.s / AXIS_MS) * 100,
    w: Math.max(0.6, (x.d / AXIS_MS) * 100 - 0.25),
    f: Math.max(0, Math.min(1, (t - x.s) / x.d)) * 100,
  }
}
