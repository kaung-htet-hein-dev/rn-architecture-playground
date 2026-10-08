import { accentOf, C } from '../../sim/colors'
import {
  axisTicks,
  laneGeometry,
  laneReadouts,
  LANE_H,
  TRACK_H,
  type Snapshot,
  type Trace,
} from '../../sim/playground'

interface Props {
  traces: Trace[]
  snaps: Snapshot[]
  c: number
  T: number
  /** selected message: group + index */
  sel: { g: number; i: number } | null
  onPick: (g: number, i: number) => void
}

const SEPS = [1, 2, 3, 4, 5].map((i) => i * LANE_H)

/** Center column: time axis, one lane group per trace on a shared scale, legend. */
export function LaneTracks({ traces, snaps, c, T, sel, onPick }: Props) {
  const ticks = axisTicks(T)
  return (
    <div className="flex min-w-[600px] flex-col gap-8 px-6 pt-5 pb-8">
      <div className="grid grid-cols-[164px_minmax(0,1fr)] gap-x-4">
        <span className="text-[13px] leading-none font-semibold text-text-muted">Threads over time</span>
        <div className="relative h-3.5" aria-hidden="true">
          {ticks.map((tk) => (
            <span
              key={tk.t}
              className="absolute -translate-x-1/2 font-mono text-[11px] leading-none whitespace-nowrap text-text-faint"
              style={{ left: tk.l + '%' }}
            >
              {tk.t}
            </span>
          ))}
        </div>
      </div>
      {traces.map((tr, g) => (
        <LaneGroup
          key={tr.mode}
          tr={tr}
          snap={snaps[g]}
          c={c}
          T={T}
          selected={sel && sel.g === g ? sel.i : null}
          onPick={(i) => onPick(g, i)}
        />
      ))}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pl-[180px] text-[13px] leading-[1.4] text-text-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-[2px] bg-old" />
          bridge message (click to inspect)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-new" />
          JSI call or event (no JSON)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2.5 bg-load" />
          dropped frame
        </span>
      </div>
    </div>
  )
}

function LaneGroup({
  tr,
  snap,
  c,
  T,
  selected,
  onPick,
}: {
  tr: Trace
  snap: Snapshot
  c: number
  T: number
  selected: number | null
  onPick: (i: number) => void
}) {
  const o = tr.mode === 'old'
  const col = accentOf(tr.mode)
  const lanes = laneReadouts(tr, snap, c)
  const { blocks, packets, arrows, frames } = laneGeometry(tr, c, T, selected)
  const name = o ? 'Old architecture' : 'New Architecture'
  return (
    <section aria-label={name} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm leading-none font-semibold" style={{ color: col }}>
          <span className="size-2 rounded-[2px]" style={{ background: col }} />
          {name}
        </span>
        <span className="text-[13px] leading-none text-text-dim">
          {o ? 'bridge: async JSON queue' : 'JSI: direct calls'}
        </span>
      </div>
      <div className="grid grid-cols-[164px_minmax(0,1fr)] gap-x-4">
        <div className="flex flex-col">
          {lanes.map((ln) => (
            <div
              key={ln.name}
              className="box-border flex min-w-0 flex-col justify-center gap-1.5 border-b border-line-soft"
              style={{ height: LANE_H }}
            >
              <span className="flex items-center gap-2 text-[13px] leading-none font-semibold text-text-bright">
                <span className="size-2 rounded-[2px]" style={{ background: ln.color }} />
                {ln.name}
              </span>
              {ln.bar != null ? (
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-line"
                    role="meter"
                    aria-label="UI frame budget"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(ln.bar)}
                    aria-valuetext={ln.text}
                  >
                    <div className="h-full" style={{ width: ln.bar + '%', background: ln.textColor }} />
                  </div>
                  <span className="font-mono text-[11px] leading-none font-medium whitespace-nowrap" style={{ color: ln.textColor }}>
                    {ln.text}
                  </span>
                </div>
              ) : (
                <span
                  className="truncate font-mono text-[11.5px] leading-[1.1] whitespace-nowrap"
                  style={{ color: ln.textColor }}
                >
                  {ln.text}
                </span>
              )}
            </div>
          ))}
          <div className="flex h-[22px] items-center font-mono text-[11px] leading-none text-text-faint">frames · 16.6 ms</div>
        </div>
        <div className="relative border-l border-line" style={{ height: TRACK_H }}>
          {SEPS.map((sp) => (
            <div key={sp} className="absolute right-0 left-0 h-px bg-line-soft" style={{ top: sp }} />
          ))}
          {blocks.map((b) => (
            <div
              key={b.key}
              title={b.label}
              className="absolute box-border flex h-[26px] min-w-[3px] items-center overflow-hidden rounded-[4px] border px-1.5 font-mono text-[11.5px] leading-none font-medium whitespace-nowrap"
              style={{ top: b.top, left: b.l + '%', width: b.w + '%', borderColor: b.bd, background: b.bg, color: b.fg }}
            >
              {b.label}
            </div>
          ))}
          {packets.map((pk) => (
            <button
              key={pk.i}
              type="button"
              title={pk.label}
              aria-label={`Inspect bridge message ${pk.label}`}
              aria-pressed={selected === pk.i}
              onClick={() => onPick(pk.i)}
              className="absolute box-border h-[9px] min-w-1.5 rounded-[3px] border p-0"
              style={{ top: pk.top, left: pk.l + '%', width: pk.w + '%', background: pk.bg, borderColor: pk.bd }}
            />
          ))}
          {arrows.map((ar) => (
            <button
              key={ar.i}
              type="button"
              title={ar.label}
              aria-label={`Inspect JSI call ${ar.label}`}
              aria-pressed={selected === ar.i}
              onClick={() => onPick(ar.i)}
              className="absolute -ml-1 flex w-[9px] justify-center border-0 bg-transparent p-0"
              style={{ left: ar.l + '%', top: ar.top, height: ar.h }}
            >
              <span className="h-full w-0.5" style={{ background: ar.c }} />
            </button>
          ))}
          {arrows.map((ar) => (
            <div
              key={'d' + ar.i}
              aria-hidden="true"
              className="pointer-events-none absolute -ml-1 size-2 rounded-full"
              style={{ left: ar.l + '%', top: ar.dot, background: ar.c }}
            />
          ))}
          {frames.map((fr) => (
            <div
              key={fr.key}
              aria-hidden="true"
              className="absolute box-border h-3 border-r border-bg"
              style={{
                top: LANE_H * 5 + 4,
                left: fr.l + '%',
                width: fr.w + '%',
                background: fr.dropped ? C.load : '#3a4a3f',
              }}
            />
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1.5 bottom-0 -ml-px w-0.5 bg-text-bright"
            style={{ left: (c / T) * 100 + '%' }}
          />
        </div>
      </div>
    </section>
  )
}
