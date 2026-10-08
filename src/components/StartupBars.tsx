import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSettings } from '../app/SettingsProvider'
import { useSimClock } from '../sim/clock'
import { accentOf, C, type Mode } from '../sim/colors'
import {
  advanceStartup,
  AXIS_MS,
  nextBoundary,
  PLAN,
  segGeom,
  startupCaption,
  startupStatus,
  STARTUP_IDLE,
  type Seg,
  type StartupState,
} from '../sim/startup'
import { MentorCaption } from './MentorCaption'
import { SimControls } from './SimControls'
import { StateChip } from './StateChip'

type LazyState = Record<string, 'loading' | 'ready'>

/** Chapter 5: eager vs lazy startup bars. */
export function StartupBars() {
  const { mode } = useSettings()
  return <StartupBarsInner key={mode} mode={mode} />
}

function StartupBarsInner({ mode }: { mode: Mode }) {
  const { reduced } = useSettings()
  const P = PLAN
  const isNew = mode === 'new'
  const acc = accentOf(mode)
  const [lazy, setLazy] = useState<LazyState>({})
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const clock = useSimClock<StartupState>(STARTUP_IDLE, {
    advance: (s, dt) => advanceStartup(s, dt, reduced),
  })
  const { t } = clock.state
  const status = startupStatus(t, clock.running)
  const doneOld = t >= P.oldEnd
  const doneNew = t >= P.newEnd

  const onPlay = () => {
    if (clock.running) return clock.pause()
    if (doneOld) setLazy({})
    clock.play((s) => (s.t >= P.oldEnd ? STARTUP_IDLE : s))
  }
  const onStep = () => {
    const nb = nextBoundary(t)
    if (nb != null) {
      clock.pause()
      clock.set({ t: nb, acc: 0 })
    }
  }
  const onReset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setLazy({})
    clock.reset()
  }
  const load = (n: string, d: number) => {
    if (lazy[n]) return
    setLazy((l) => ({ ...l, [n]: 'loading' }))
    const id = window.setTimeout(() => setLazy((l) => ({ ...l, [n]: 'ready' })), reduced ? 0 : d * 4)
    timers.current.push(id)
  }

  const rows = [
    {
      key: 'old',
      name: 'Old · every module created at launch',
      c: C.old,
      bd: isNew ? C.line : C.old + '88',
      segs: P.old,
      end: P.oldEnd,
      done: doneOld,
      legend: [
        [C.native, 'native module init'],
        [C.js, 'JS bundle'],
        [C.ui, 'first render'],
      ],
      hasLazy: false,
    },
    {
      key: 'new',
      name: 'New · Turbo Modules load when first used',
      c: C.new,
      bd: isNew ? C.new + '88' : C.line,
      segs: P.nw,
      end: P.newEnd,
      done: doneNew,
      legend: [
        [C.js, 'JS bundle'],
        [C.new, 'module, on first use'],
        [C.ui, 'first render'],
      ],
      hasLazy: doneNew,
    },
  ]
  const cx = Math.min(100, (t / AXIS_MS) * 100)

  return (
    <section
      aria-label="Simulation: app startup · 10 native modules"
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <StateChip status={status} accent={acc} />
          <span className="font-mono text-xs leading-[1.2] font-medium text-text-dim">app startup · 10 native modules</span>
        </div>
        <span className="font-mono text-xs leading-none text-text-faint tabular-nums">t = {Math.round(t)} ms</span>
      </div>

      <div className="flex flex-col gap-[22px] px-4 pt-[22px] pb-[18px]">
        <div className="relative mx-0.5 h-3.5" aria-hidden="true">
          {[0, 250, 500, 750, 1000].map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2 font-mono text-[11px] leading-none whitespace-nowrap text-text-faint"
              style={{ left: `${v / 10}%` }}
            >
              {v}
              {v === 1000 ? ' ms' : ''}
            </span>
          ))}
        </div>

        {rows.map((r) => (
          <div
            key={r.key}
            className="flex flex-col gap-2.5 rounded-[10px] border bg-surface p-3.5 transition-[border-color] duration-250"
            style={{ borderColor: r.bd }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="flex items-center gap-2 text-sm leading-[1.2] font-semibold" style={{ color: r.c }}>
                <span className="size-2 rounded-[2px]" style={{ background: r.c }} />
                {r.name}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={r.done ? 'done' : 'go'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="font-mono text-[13px] leading-none font-medium"
                  style={{ color: r.done ? r.c : C.faint }}
                >
                  {r.done ? `interactive at ${r.end} ms` : 'starting…'}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="relative h-[30px] rounded-[5px] bg-bg" role="img" aria-label={`${r.name}: ready to use at ${r.end} ms`}>
              {r.segs.map((x) => (
                <Bar key={x.name} x={x} t={t} />
              ))}
              {r.done && (
                <motion.div
                  className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-text-bright"
                  style={{ left: `${(r.end / AXIS_MS) * 100}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                />
              )}
              <div className="absolute -top-1 -bottom-1 w-px bg-text-dim opacity-70" style={{ left: `${cx}%` }} />
            </div>
            <div className="flex flex-wrap gap-3.5 font-mono text-xs leading-[1.4] text-text-dim">
              {r.legend.map(([c, txt]) => (
                <span key={txt} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-[2px]" style={{ background: c }} />
                  {txt}
                </span>
              ))}
            </div>
            <AnimatePresence>
              {r.hasLazy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2 overflow-hidden pt-1"
                >
                  <span className="text-[13px] leading-[1.4] text-text-dim">Not loaded yet. Tap one to use it from JS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {P.lazy.map(([n, d], i) => {
                      const ls = lazy[n]
                      return (
                        <motion.button
                          key={n}
                          type="button"
                          onClick={() => load(n, d)}
                          aria-disabled={!!ls}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          whileTap={ls ? undefined : { scale: 0.95 }}
                          className="relative h-[30px] overflow-hidden rounded-[6px] border px-2.5 font-mono text-xs leading-none font-medium"
                          style={{
                            borderColor: ls ? C.new : C.lineStrong,
                            background: ls === 'ready' ? C.new + '1f' : 'transparent',
                            color: ls ? C.new : C.muted,
                          }}
                        >
                          {ls === 'loading' && !reduced && (
                            <motion.span
                              aria-hidden="true"
                              className="absolute inset-y-0 left-0 bg-[#5fd3e61f]"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: (d * 4) / 1000, ease: 'linear' }}
                            />
                          )}
                          <span className="relative">
                            {ls === 'ready' ? n + ' · ready' : ls === 'loading' ? n + ' · loading ' + d + ' ms' : n}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <SimControls
        label="App startup"
        accent={acc}
        playLabel={clock.running ? 'Pause' : doneOld ? 'Replay' : t === 0 ? 'Play' : 'Resume'}
        onPlay={onPlay}
        onStep={onStep}
        stepDisabled={doneOld}
        speed={clock.speed}
        onSpeed={clock.setSpeed}
        onReset={onReset}
      />
      <MentorCaption accent={acc} text={startupCaption(t)} />
    </section>
  )
}

function Bar({ x, t }: { x: Seg; t: number }) {
  const g = segGeom(x, t)
  return (
    <div
      title={x.name}
      className="absolute top-1 bottom-1 overflow-hidden rounded-[3px] bg-line-soft shadow-[inset_0_0_0_1px_#2d3642]"
      style={{ left: `${g.l}%`, width: `${g.w}%` }}
    >
      <div className="h-full" style={{ width: `${g.f}%`, background: x.c }} />
    </div>
  )
}
