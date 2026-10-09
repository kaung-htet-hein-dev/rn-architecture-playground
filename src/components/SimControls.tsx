import type { ReactNode } from 'react'
import { SPEEDS, type Speed } from '../sim/clock'
import { PrimaryButton } from './ui/PrimaryButton'
import { C } from "../sim/colors"

interface Props {
  playLabel: string
  onPlay: () => void
  onStep: () => void
  stepDisabled?: boolean
  speed: Speed
  onSpeed: (s: Speed) => void
  onReset: () => void
  /** right-aligned meta, e.g. "step 3 / 8" */
  meta?: ReactNode
  /** extra controls inserted before the meta */
  children?: ReactNode
  label?: string
  /** Step button text (default "Step") */
  stepLabel?: string
  /** false while idle: speed and reset stay hidden (space kept, so nothing shifts) */
  started?: boolean
}

export function SimControls({ playLabel, onPlay, onStep, stepDisabled, speed, onSpeed, onReset, meta, children, label, stepLabel = 'Step', started = true }: Props) {
  return (
    <div
      role="group"
      aria-label={label ? `${label} controls` : 'Simulation controls'}
      className="flex flex-wrap items-center gap-2.5 border-t border-line-soft px-5 py-3.5"
    >
      <PrimaryButton onClick={onPlay} className="h-[34px] min-w-[84px] px-3.5">
        {playLabel}
      </PrimaryButton>
      <button type="button" className="btn" onClick={onStep} disabled={stepDisabled}>
        {stepLabel}
      </button>
      <div className={`flex items-center gap-2.5 transition-opacity duration-200 ${started ? '' : 'invisible opacity-0'}`} inert={!started}>
        <SpeedToggle speed={speed} onSpeed={onSpeed} />
        <button type="button" className="btn" onClick={onReset}>
          Reset
        </button>
      </div>
      {children}
      <span className="flex-1" />
      {meta != null && <span className="text-[13px] leading-none text-text-faint tabular-nums">{meta}</span>}
    </div>
  )
}

export function SpeedToggle({ speed, onSpeed }: { speed: Speed; onSpeed: (s: Speed) => void }) {
  return (
    <div role="group" aria-label="Speed" className="flex overflow-hidden rounded-[6px] border border-line-strong">
      {SPEEDS.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={v === speed}
          aria-label={`Speed ${v}×`}
          onClick={() => onSpeed(v)}
          className="h-8 px-2.5 font-mono text-xs leading-none font-medium transition-colors"
          style={{ background: v === speed ? C.track : 'transparent', color: v === speed ? C.bright : C.dim }}
        >
          {v}×
        </button>
      ))}
    </div>
  )
}
