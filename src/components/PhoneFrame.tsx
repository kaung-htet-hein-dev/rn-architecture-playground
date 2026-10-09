import { C } from '../sim/colors'
import type { PhoneRow } from '../sim/scrollRace'

interface Props {
  /** frame border color (accent when this phone is the selected mode) */
  frame: string
  /** red flash for a dropped frame (callers pass false under reduced motion) */
  flash: boolean
  /** soft red ring while JS is more than 80 ms behind */
  over: boolean
  /** "JS rendered to y = …" */
  ry: number
  rows: PhoneRow[]
  reduced: boolean
  label: string
}

/** 212×400 phone, radius 30, with a skeleton list (REQUIREMENTS §5.1 Phone display). */
export function PhoneFrame({ frame, flash, over, ry, rows, reduced, label }: Props) {
  const glow = flash ? `0 0 0 3px ${C.load}, 0 0 24px ${C.load}66` : over ? `0 0 0 2px ${C.load}66` : 'none'
  return (
    <div
      role="img"
      aria-label={`${label} phone: JS rendered to y = ${ry}`}
      className={`relative box-border h-[400px] w-[212px] rounded-[30px] border-2 bg-phone-body p-2.5 ${
        reduced ? '' : 'transition-[box-shadow,border-color] duration-[120ms,250ms]'
      }`}
      style={{ borderColor: frame, boxShadow: glow }}
    >
      <div className="relative h-full overflow-hidden rounded-[22px] bg-panel">
        <div className="absolute inset-x-0 top-0 z-[2] flex h-[52px] flex-col justify-center gap-[5px] border-b border-track bg-raised px-3.5">
          <span className="text-[13px] leading-none font-semibold text-text-bright">Orders</span>
          <span className="font-mono text-xs leading-none text-text-dim">JS rendered to y = {ry}</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.i}
            aria-hidden
            className={`absolute inset-x-2.5 box-border flex h-11 flex-col justify-center gap-[5px] rounded-lg px-2.5 ${
              reduced ? '' : 'transition-colors duration-200'
            }`}
            style={{ top: r.top, background: r.filled ? C.raised : C.skeleton }}
          >
            <span className="text-xs leading-none font-medium" style={{ color: r.filled ? C.text : C.skeleton }}>
              {r.t1}
            </span>
            <span className="font-mono text-xs leading-none" style={{ color: r.filled ? C.dim : C.skeleton }}>
              {r.t2}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
