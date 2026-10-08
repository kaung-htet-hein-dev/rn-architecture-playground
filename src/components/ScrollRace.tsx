import { useId } from 'react'
import { motion } from 'motion/react'
import { useSettings } from '../app/SettingsProvider'
import { useSimClock } from '../sim/clock'
import { accentOf, C, type Mode } from '../sim/colors'
import {
  advance,
  caption as captionOf,
  initialRace,
  isComplete,
  loadColor,
  playFrom,
  playLabel,
  raceStatus,
  sideView,
  simTime,
  tick,
  withLoad,
  workOf,
  type RaceState,
  type SideView,
} from '../sim/scrollRace'
import { MentorCaption } from './MentorCaption'
import { PhoneFrame } from './PhoneFrame'
import { SimControls } from './SimControls'
import { StateChip } from './StateChip'

/**
 * Chapter 3: the same list scrolled on two phones (REQUIREMENTS §5.1).
 * Switching mode remounts the inner sim, which resets it to idle.
 */
export function ScrollRace() {
  const { mode } = useSettings()
  return <ScrollRaceInner key={mode} mode={mode} />
}

function ScrollRaceInner({ mode }: { mode: Mode }) {
  const { reduced } = useSettings()
  const acc = accentOf(mode)
  const isNew = mode === 'new'
  const sliderId = useId()

  const clock = useSimClock<RaceState>(() => initialRace(), { advance: tick })
  const { state: s, running } = clock
  const complete = isComplete(s)
  const status = raceStatus(s, running)
  const cap = captionOf(s)
  const opts = { reduced, running }
  const phones = [sideView(s, 'o', opts), sideView(s, 'n', opts)]
  const work = workOf(s.load)
  const loadC = loadColor(s.load)

  const onPlay = () => {
    if (running) return clock.pause()
    clock.play(playFrom)
  }
  const onStep = () => {
    clock.pause()
    clock.set(advance)
  }

  return (
    <section
      aria-label="Simulation: same list, same scroll, two architectures"
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel font-sans text-text"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {status === 'overloaded-paused' ? (
            // chipFor('error') uses the same red as 'overloaded'; only the label differs.
            <StateChip status="overloaded" accent={acc} label="overloaded · paused" />
          ) : (
            <StateChip status={status} accent={acc} />
          )}
          <span className="font-mono text-xs leading-[1.2] font-medium text-text-dim">
            same list, same scroll, two architectures
          </span>
        </div>
        <span className="font-mono text-xs leading-none whitespace-nowrap text-text-faint tabular-nums">
          t = {simTime(s)} s
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-6 px-4 py-6">
        {phones.map((ph) => (
          <PhoneColumn
            key={ph.key}
            ph={ph}
            frames={s.f}
            selected={ph.old !== isNew}
            reduced={reduced}
          />
        ))}
      </div>

      <SimControls
        label="ScrollRace"
        stepLabel="Step 1 frame"
        accent={acc}
        playLabel={playLabel(s, running)}
        onPlay={onPlay}
        onStep={onStep}
        stepDisabled={complete}
        speed={clock.speed}
        onSpeed={clock.setSpeed}
        onReset={() => clock.reset(initialRace(s.load))}
      >
        <label
          htmlFor={sliderId}
          className="flex min-w-[220px] flex-[1_1_260px] items-center gap-3 sm:ml-2"
        >
          <span className="font-mono text-xs leading-none font-medium whitespace-nowrap text-text-dim">JS load</span>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            value={s.load}
            aria-valuetext={`${work.toFixed(1)} ms work per event`}
            onChange={(e) => clock.set((st) => withLoad(st, +e.target.value))}
            className="min-w-0 flex-1"
            style={{ accentColor: loadC }}
          />
          <span
            className="w-24 text-right font-mono text-xs leading-none font-semibold tabular-nums"
            style={{ color: loadC }}
          >
            {work.toFixed(1)} ms work
          </span>
        </label>
      </SimControls>
      <MentorCaption accent={cap.warn ? C.load : acc} text={cap.text} id={cap.kind} />
    </section>
  )
}

function PhoneColumn({ ph, frames, selected, reduced }: { ph: SideView; frames: number; selected: boolean; reduced: boolean }) {
  return (
    <div className="flex max-w-[440px] flex-[1_1_300px] flex-wrap items-start justify-center gap-4">
      <div className="flex w-[212px] flex-none flex-col items-center gap-2.5">
        <div className="flex items-center gap-2 text-[13px] leading-none font-semibold" style={{ color: ph.color }}>
          <span className="size-2 rounded-[2px]" style={{ background: ph.color }} />
          {ph.name}
        </div>
        <PhoneFrame
          label={ph.name}
          frame={selected ? ph.color : C.lineStrong}
          flash={ph.flash}
          over={ph.over}
          ry={ph.ry}
          rows={ph.rows}
          reduced={reduced}
        />
      </div>
      <dl className="m-0 flex min-w-[160px] flex-[1_1_160px] flex-col gap-3.5 pt-7 tabular-nums">
        <div className="flex flex-col gap-1">
          <dt className="font-mono text-[11px] leading-none font-medium tracking-[.08em] text-text-faint">DROPPED FRAMES</dt>
          <dd className="m-0 flex flex-col gap-1">
            <span
              className="font-mono text-[28px] leading-none font-semibold"
              style={{ color: ph.dropped > 0 ? C.load : C.bright }}
            >
              {ph.dropped}
            </span>
            <span className="text-xs leading-[1.4] text-text-dim">
              {ph.dropPct} of {frames} frames
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <dt className="font-mono text-[11px] leading-none font-medium tracking-[.08em] text-text-faint">{ph.qLabel}</dt>
          <dd className="m-0 flex flex-col gap-1.5">
            <span aria-hidden className="flex min-h-2.5 max-w-[170px] flex-wrap gap-[3px]">
              {ph.qbox.map((c, i) => (
                <motion.span
                  key={i}
                  className="size-2 rounded-[2px]"
                  style={{ background: c }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.14 }}
                />
              ))}
            </span>
            <span
              className="font-mono text-[13px] leading-[1.3] font-medium"
              style={{ color: ph.qWarn ? C.load : C.muted }}
            >
              {ph.qText}
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-mono text-[11px] leading-none font-medium tracking-[.08em] text-text-faint">JS IS BEHIND BY</dt>
          <dd className="m-0 font-mono text-lg leading-none font-semibold" style={{ color: ph.lagWarn ? C.load : C.bright }}>
            {ph.lag} ms
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-mono text-[11px] leading-none font-medium tracking-[.08em] text-text-faint">COST PER EVENT</dt>
          <dd className="m-0 font-mono text-[12.5px] leading-[1.45] text-text-muted">{ph.cost}</dd>
        </div>
      </dl>
    </div>
  )
}
