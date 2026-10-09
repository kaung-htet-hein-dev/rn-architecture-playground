import { isPresetId } from './presets'
import type { PresetId } from './types'

export const DEFAULT_RATE = 60
export const RATE_MIN = 10
export const RATE_MAX = 120

export interface PlaygroundUrlState {
  preset?: PresetId
  compare?: boolean
  rate?: number
  /** 0..1 of total */
  at?: number
}

/** Strict number parse: the whole string must be numeric. */
function num(v: string | null): number | null {
  if (v == null || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Validate `?preset=&compare=1&rate=&at=0..1`. Invalid values are ignored.
 * (`?mode=` and `?motion=` are owned by SettingsProvider.)
 */
export function parsePlaygroundSearch(search: string): PlaygroundUrlState {
  const q = new URLSearchParams(search)
  const out: PlaygroundUrlState = {}
  const pr = q.get('preset')
  if (isPresetId(pr)) out.preset = pr
  if (q.get('compare') === '1') out.compare = true
  const rate = num(q.get('rate'))
  if (rate != null && rate >= RATE_MIN && rate <= RATE_MAX) out.rate = Math.round(rate)
  const at = num(q.get('at'))
  if (at != null && at >= 0 && at <= 1) out.at = at
  return out
}

/** Write the playground params into `search`, keeping every other param. */
export function writePlaygroundSearch(search: string, s: Required<Omit<PlaygroundUrlState, 'at'>> & { at: number | null }): string {
  const q = new URLSearchParams(search)
  q.set('preset', s.preset)
  if (s.compare) q.set('compare', '1')
  else q.delete('compare')
  if (s.rate !== DEFAULT_RATE) q.set('rate', String(s.rate))
  else q.delete('rate')
  if (s.at != null) q.set('at', String(Math.round(s.at * 1000) / 1000))
  else q.delete('at')
  q.delete('tab')
  return q.toString()
}
