/** Fixed palette (PROMPT rule 5). Used where colors are computed at runtime (alpha suffixes, per-lane tints). */
export const C = {
  bg: '#0f1216',
  panel: '#13181e',
  surface: '#171d24',
  raised: '#1f262f',
  codeBg: '#12171c',
  line: '#2d3642',
  lineSoft: '#232b35',
  lineStrong: '#3d4856',
  track: '#303944',
  text: '#e7eaee',
  bright: '#eef1f4',
  prose: '#d5dae0',
  muted: '#cbd1d8',
  dim: '#b1b9c3',
  faint: '#9aa4b0',
  ghost: '#808a96',
  gutter: '#626b77',
  old: '#f2b35b',
  oldInk: '#1a1408',
  oldTint: '#2a2216',
  new: '#5fd3e6',
  newInk: '#071a1e',
  newTint: '#11262b',
  load: '#f0694f',
  loadTint: '#2c1714',
  js: '#b39dff',
  shadow: '#79d49c',
  ui: '#f291c4',
  native: '#9fb0c3',
} as const

export type Mode = 'old' | 'new'

export const isMode = (v: unknown): v is Mode => v === 'old' || v === 'new'

export const accentOf = (mode: Mode) => (mode === 'new' ? C.new : C.old)

export type SimStatus = 'idle' | 'running' | 'paused' | 'complete' | 'overloaded' | 'error'

export interface ChipStyle {
  label: string
  fg: string
  bg: string
}

/** Status chip colors shared by every simulation header. */
export function chipFor(status: SimStatus, acc: string, errorLabel = 'runtime error'): ChipStyle {
  switch (status) {
    case 'error':
      return { label: errorLabel, fg: C.load, bg: C.load + '1f' }
    case 'overloaded':
      return { label: 'overloaded', fg: C.load, bg: C.load + '1f' }
    case 'running':
      return { label: 'running', fg: acc, bg: acc + '1f' }
    case 'idle':
      return { label: 'idle', fg: C.dim, bg: C.raised }
    case 'complete':
      return { label: 'complete', fg: C.bright, bg: C.track }
    default:
      return { label: 'paused', fg: C.muted, bg: C.raised }
  }
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Ease-in-out quad, used for bridge packets. */
export const easeInOutQuad = (x: number) => {
  const t = clamp01(x)
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
