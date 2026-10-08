import type { Mode } from '../colors'
import { createBuilder, type PresetGen } from './builder'
import { genAnim } from './anim'
import { genHeavy } from './heavy'
import { genMeasure } from './measure'
import { genPayload } from './payload'
import { presetById } from './presets'
import { genScroll } from './scroll'
import { genStartup } from './startup'
import { genTap } from './tap'
import { FRAME_MS, type Frame, type Params, type PresetId, type TimelineEvent, type Trace } from './types'

export * from './types'
export * from './presets'
export * from './derive'
export * from './url'

const GENERATORS: Record<PresetId, PresetGen> = {
  tap: genTap,
  startup: genStartup,
  scroll: genScroll,
  anim: genAnim,
  measure: genMeasure,
  heavy: genHeavy,
  payload: genPayload,
}

/** Preset defaults merged with the user's edits. */
export function paramsFor(id: PresetId, edits?: Params): Params {
  return { ...presetById(id).p, ...(edits ?? {}) }
}

/**
 * Deterministic trace for one preset in one architecture
 * (port of Playground.dc.html `gen()`).
 */
export function gen(id: PresetId, mode: Mode, params: Params, rate: number): Trace {
  const b = createBuilder(mode)
  const { metric, mods } = GENERATORS[id](b, params, rate)
  const { tasks, messages, stalls, queue } = b

  const ends = [...tasks.map((e) => e.t + e.d), ...messages.map((m) => m.t + m.d)]
  const end = Math.max(...ends, 10)
  const total = Math.ceil((end + 12) / 10) * 10

  const frames: Frame[] = []
  for (let f = 0; f * FRAME_MS < total; f++) {
    const a = f * FRAME_MS
    const z = a + FRAME_MS
    let used = 0
    for (const e of tasks) if (e.lane === 'ui') used += Math.max(0, Math.min(z, e.t + e.d) - Math.max(a, e.t))
    const stalled = stalls.some((s) => s.from < z - 1 && s.to > a + 1)
    frames.push({ a, b: z, used, dropped: used > FRAME_MS || stalled })
  }

  let qMax = 0
  for (let x = 0; x < total; x += 1) {
    const q =
      messages.filter((m) => m.kind === 'msg' && m.t <= x && x < m.t + m.d).length +
      queue.filter((q2) => q2.t <= x && x < q2.u).length
    if (q > qMax) qMax = q
  }

  const events: TimelineEvent[] = [...tasks, ...messages].sort((x, y) => x.t - y.t)
  const points = [...new Set(events.map((e) => Math.round(e.t * 100) / 100))].sort((x, y) => x - y)

  return {
    mode,
    tasks,
    messages,
    uiPatches: b.uiPatches,
    modules: b.modules,
    trees: b.trees,
    stalls,
    queue,
    frames,
    events,
    qMax,
    points,
    end,
    total,
    metric,
    mods: mods ?? null,
  }
}
