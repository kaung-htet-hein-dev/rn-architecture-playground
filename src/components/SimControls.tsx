import type { ReactNode } from 'react'
import { SPEEDS, type Speed } from '../sim/clock'
import { AccentButton } from './ui/AccentButton'

interface Props {
  accent: string
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
}

export function SimControls({ accent, playLabel, onPlay, onStep, stepDisabled, speed, onSpeed, onReset, meta, children, label, stepLabel = 'Step' }: Props) {
  return (
    <div
      role="group"
      aria-label={label ? `${label} controls` : 'Simulation controls'}
      className="flex flex-wrap items-center gap-2.5 border-t border-line px-5 py-3.5"
    >
      <AccentButton accent={accent} onClick={onPlay} className="h-[34px] min-w-[84px] rounded-[6px] px-3.5">
        {playLabel}
      </AccentButton>
      <button type="button" className="btn" onClick={onStep} disabled={stepDisabled}>
        {stepLabel}
      </button>
      <SpeedToggle speed={speed} onSpeed={onSpeed} />
      <button type="button" className="btn" onClick={onReset}>
        Reset
      </button>
      {children}
      <span className="flex-1" />
      {meta != null && <span className="font-mono text-xs leading-none text-text-faint">{meta}</span>}
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
          style={{ background: v === speed ? '#303944' : 'transparent', color: v === speed ? '#eef1f4' : '#b1b9c3' }}
        >
          {v}×
        </button>
      ))}
    </div>
  )
}
