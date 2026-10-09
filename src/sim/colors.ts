const v = (name: string) => `var(--color-${name})`

/**
 * Runtime palette for inline styles. Every entry points at a token in src/styles/tokens.css,
 * so there are no color values in TypeScript. Use `alpha()` for translucent variants.
 */
export const C = {
  bg: v('bg'),
  panel: v('panel'),
  surface: v('surface'),
  raised: v('raised'),
  raisedHover: v('raised-hover'),
  codeBg: v('code-bg'),
  codeHighlight: v('code-highlight'),
  skeleton: v('skeleton'),
  line: v('line'),
  lineSoft: v('line-soft'),
  lineStrong: v('line-strong'),
  track: v('track'),
  text: v('text'),
  bright: v('text-bright'),
  prose: v('text-prose'),
  muted: v('text-muted'),
  dim: v('text-dim'),
  faint: v('text-faint'),
  ghost: v('text-ghost'),
  gutter: v('text-gutter'),
  brand: v('brand'),
  primary: v('primary'),
  /** reactnative.dev home button color: Play and other controls in both modes */
  button: v('button'),
  logo: v('logo'),
  old: v('old'),
  oldInk: v('old-ink'),
  oldTint: v('old-tint'),
  new: v('new'),
  newInk: v('new-ink'),
  newTint: v('new-tint'),
  load: v('load'),
  loadTint: v('load-tint'),
  ok: v('ok'),
  okText: v('ok-text'),
  okFrame: v('ok-frame'),
  badText: v('bad-text'),
  js: v('js'),
  shadow: v('shadow'),
  ui: v('ui'),
  native: v('native'),
  synKeyword: v('syn-keyword'),
  synString: v('syn-string'),
  synComment: v('syn-comment'),
  synTag: v('syn-tag'),
  synNumber: v('syn-number'),
  synDefault: v('syn-default'),
} as const

/** `color` at `percent` opacity; works with the var() entries in `C`. */
export const alpha = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`

/** Striped fill for render work that was interrupted and thrown away. */
export const HATCH = `repeating-linear-gradient(135deg, ${alpha(C.load, 75)} 0 3px, ${alpha(C.load, 25)} 3px 6px)`

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
      return { label: errorLabel, fg: C.load, bg: alpha(C.load, 12) }
    case 'overloaded':
      return { label: 'Overloaded', fg: C.load, bg: alpha(C.load, 12) }
    case 'running':
      return { label: 'Running', fg: acc, bg: alpha(acc, 12) }
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
