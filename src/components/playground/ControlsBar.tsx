import { AnimatePresence, motion } from 'motion/react'
import type { Speed } from '../../sim/clock'
import { C, type SimStatus } from '../../sim/colors'
import { RATE_MAX, RATE_MIN } from '../../sim/playground'
import { SpeedToggle } from '../SimControls'
import { AccentButton } from '../ui/AccentButton'
import { StateChip } from '../StateChip'

interface Props {
  accent: string
  playLabel: string
  onPlay: () => void
  onBack: () => void
  onFwd: () => void
  c: number
  T: number
  onScrub: (v: number) => void
  speed: Speed
  onSpeed: (s: Speed) => void
  rate: number
  rateUsed: boolean
  onRate: (r: number) => void
  status: SimStatus
  caption: string
  captionColor: string
}

const stepBtn =
  'h-10 rounded-[7px] border border-line-strong bg-raised px-3.5 text-[13px] leading-none font-medium text-text transition-colors hover:bg-raised-hover'

/** Bottom bar: back / play / step, scrubber, time, speed, event rate, status, caption. */
export function ControlsBar(p: Props) {
  const scrub = Math.round((p.c / p.T) * 1000)
  const time = p.c.toFixed(1) + ' / ' + p.T + ' ms'
  return (
    <div className="flex flex-none flex-col gap-3.5 border-t border-line bg-panel px-6 pt-3.5 pb-4">
      <div role="group" aria-label="Playback controls" className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex gap-2">
          <button type="button" aria-label="Step back" onClick={p.onBack} className={stepBtn}>
            ‹ Back
          </button>
          <AccentButton accent={p.accent} onClick={p.onPlay} className="h-10 min-w-[92px] rounded-[7px] px-4">
            {p.playLabel}
          </AccentButton>
          <button type="button" aria-label="Step forward" onClick={p.onFwd} className={stepBtn}>
            Step ›
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          value={scrub}
          onChange={(e) => p.onScrub(+e.target.value)}
          aria-label="Scrubber"
          aria-valuetext={time}
          className="min-w-[140px] flex-[1_1_200px]"
          style={{ accentColor: p.accent }}
        />
        <span className="min-w-[120px] text-right font-mono text-xs leading-none font-medium text-text-muted tabular-nums">
          {time}
        </span>
        <SpeedToggle speed={p.speed} onSpeed={p.onSpeed} />
        <label
          className="flex items-center gap-2"
          style={{ opacity: p.rateUsed ? 1 : 0.45 }}
          title={p.rateUsed ? 'Events per second' : 'Used by the scroll and heavy-loop presets'}
        >
          <span className="text-[13px] leading-none font-medium whitespace-nowrap text-text-dim">Event rate</span>
          <input
            type="range"
            min={RATE_MIN}
            max={RATE_MAX}
            step={5}
            value={p.rate}
            onChange={(e) => p.onRate(+e.target.value)}
            aria-valuetext={p.rate + ' events per second'}
            className="w-[110px]"
            style={{ accentColor: C.dim }}
          />
          <span className="w-11 font-mono text-xs leading-none font-medium text-text">{p.rate}/s</span>
        </label>
        <StateChip status={p.status} accent={p.accent} />
      </div>
      <div className="flex items-stretch gap-3.5">
        <span className="w-[3px] flex-none rounded-[2px] transition-colors duration-250" style={{ background: p.captionColor }} />
        <div aria-live="polite" aria-atomic="true" className="relative min-h-[48px] max-w-[880px] flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={p.caption}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="m-0 text-[15px] leading-[1.6] text-text-bright"
            >
              {p.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
