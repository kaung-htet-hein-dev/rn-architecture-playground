/** Fixed palette (PROMPT rule 5). Used where colors are computed at runtime (alpha suffixes, per-lane tints). */
export const C = {
  bg: '#1b1b1d',
  panel: '#20232a',
  surface: '#242526',
  raised: '#282c34',
  codeBg: '#1e2025',
  line: '#30363d',
  lineSoft: '#282c36',
  lineStrong: '#404756',
  track: '#373940',
  text: '#e3e3e3',
  bright: '#f6f7f9',
  prose: '#dadde1',
  muted: '#ccd0d5',
  dim: '#bec3c9',
  faint: '#969faf',
  ghost: '#858993',
  gutter: '#606770',
  old: '#f2b35b',
  oldInk: '#1a1408',
  oldTint: '#302a23',
  new: '#58c4dc',
  /** reactnative.dev primary: controls in both modes */
  primary: '#58c4dc',
  newInk: '#1b1b1d',
  newTint: '#222f34',
  load: '#f0694f',
  loadTint: '#33201f',
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
export function chipFor(status: SimStatus, acc: string, errorLabel = 'Runtime error'): ChipStyle {
  switch (status) {
    case 'error':
      return { label: errorLabel, fg: C.load, bg: C.load + '1f' }
    case 'overloaded':
      return { label: 'Overloaded', fg: C.load, bg: C.load + '1f' }
    case 'running':
      return { label: 'Running', fg: acc, bg: acc + '1f' }
    case 'idle':
      return { label: 'Idle', fg: C.dim, bg: C.raised }
    case 'complete':
      return { label: 'Complete', fg: C.bright, bg: C.track }
    default:
      return { label: 'Paused', fg: C.muted, bg: C.raised }
  }
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Ease-in-out quad, used for bridge packets. */
export const easeInOutQuad = (x: number) => {
  const t = clamp01(x)
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
