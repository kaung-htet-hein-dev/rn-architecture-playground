import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { useSettings } from '../app/SettingsProvider'
import { BrandMark, ModeToggle, MotionToggle } from '../components/ModeToggle'
import { ControlsBar } from '../components/playground/ControlsBar'
import { InspectorPanel } from '../components/playground/InspectorPanel'
import { LaneTracks } from '../components/playground/LaneTracks'
import { ParamCode } from '../components/playground/ParamCode'
import { PhonePreview } from '../components/playground/PhonePreview'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSimClock } from '../sim/clock'
import { C, type Mode } from '../sim/colors'
import {
  activeRange,
  advancePlayback,
  captionOf,
  DEFAULT_RATE,
  gen,
  inspectorFor,
  isOverloaded,
  metricRows,
  moduleRows,
  nextPoint,
  paramsFor,
  parsePlaygroundSearch,
  pickMessage,
  PLAYBACK_IDLE,
  PRESETS,
  presetById,
  prevPoint,
  stateAt,
  statusOf,
  stepPoints,
  treeViews,
  writePlaygroundSearch,
  type Params,
  type Playback,
  type PlaygroundTab,
  type PresetId,
  type Trace,
} from '../sim/playground'

const TAB_LIST: [PlaygroundTab, string][] = [
  ['code', 'Code'],
  ['threads', 'Threads'],
  ['inspect', 'Inspect'],
]

function buildTraces(preset: PresetId, edits: Params | undefined, mode: Mode, compare: boolean, rate: number): Trace[] {
  const P = paramsFor(preset, edits)
  return compare ? [gen(preset, 'old', P, rate), gen(preset, 'new', P, rate)] : [gen(preset, mode, P, rate)]
}

const maxTotal = (ts: Trace[]) => Math.max(...ts.map((t) => t.total))

export default function Playground() {
  const { mode, reduced, accent } = useSettings()
  const mobile = useMediaQuery('(max-width: 1279.98px)')

  const [boot] = useState(() => parsePlaygroundSearch(window.location.search))
  const [preset, setPreset] = useState<PresetId>(boot.preset ?? 'tap')
  const [compare, setCompare] = useState(!!boot.compare)
  const [rate, setRate] = useState(boot.rate ?? DEFAULT_RATE)
  const [tab, setTab] = useState<PlaygroundTab>(boot.tab ?? 'threads')
  const [edits, setEdits] = useState<Partial<Record<PresetId, Params>>>({})
  const [sel, setSel] = useState<{ g: number; i: number } | null>(null)

  const pr = presetById(preset)
  const P = paramsFor(preset, edits[preset])
  const presetEdits = edits[preset]
  const traces = useMemo(
    () => buildTraces(preset, presetEdits, mode, compare, rate),
    [preset, presetEdits, mode, compare, rate],
  )
  const T = maxTotal(traces)
  const points = useMemo(() => stepPoints(traces), [traces])

  const clock = useSimClock<Playback>(
    () => {
      if (boot.at == null) return PLAYBACK_IDLE
      const t0 = maxTotal(buildTraces(boot.preset ?? 'tap', undefined, mode, !!boot.compare, boot.rate ?? DEFAULT_RATE))
      return { c: t0 * boot.at, started: boot.at > 0, racc: 0 }
    },
    { advance: (s, dt) => advancePlayback(s, dt, { total: T, points, reduced }) },
  )
  const { running } = clock
  const c = Math.min(clock.state.c, T)
  const started = clock.state.started

  const primary = compare ? traces[mode === 'new' ? 1 : 0] : traces[0]
  const snaps = traces.map((tr) => stateAt(tr, c))
  const A = snaps[traces.indexOf(primary)]
  const complete = c >= T - 0.01
  const status = statusOf({ snap: A, started, running, c, total: T })
  const caption = captionOf(pr, A, started, c)
  const captionColor = isOverloaded(A) && started ? C.load : accent

  /* ── actions ── */
  const resetIdle = () => {
    clock.reset(PLAYBACK_IDLE)
    setSel(null)
  }
  const play = () => {
    if (running) return clock.pause()
    setSel(null)
    clock.play((s) => ({ c: s.c >= T ? 0 : Math.min(s.c, T), started: true, racc: 0 }))
  }
  const restart = () => {
    setSel(null)
    clock.play(() => ({ c: 0, started: true, racc: 0 }))
  }
  const seek = (to: (s: Playback) => Playback) => {
    clock.pause()
    setSel(null)
    clock.set(to)
  }
  const stepFwd = () => seek((s) => ({ c: nextPoint(points, Math.min(s.c, T), T), started: true, racc: 0 }))
  const stepBack = () => seek((s) => ({ ...s, c: prevPoint(points, Math.min(s.c, T)), racc: 0 }))
  const onParam = (k: string, v: string) => {
    setEdits((e) => ({ ...e, [preset]: { ...(e[preset] ?? {}), [k]: v } }))
    setSel(null)
  }

  /* ── keyboard: ←/→ step, Space play/pause ── */
  const keys = useRef({ play, stepFwd, stepBack })
  useEffect(() => {
    keys.current = { play, stepFwd, stepBack }
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(el.tagName)) {
        // Space/Enter belong to the focused control; arrows to inputs and selects.
        if (e.key === ' ' || el.tagName !== 'BUTTON') return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        keys.current.stepFwd()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        keys.current.stepBack()
      } else if (e.key === ' ') {
        e.preventDefault()
        keys.current.play()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── URL: keep preset / compare / rate / at / tab in sync ── */
  const at = !running && started && c > 0 ? c / T : null
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const url = new URL(window.location.href)
        url.search = writePlaygroundSearch(url.search, { preset, compare, rate, at, tab })
        window.history.replaceState(window.history.state, '', url)
      } catch {
        /* replaceState can be rate-limited */
      }
    }, 200)
    return () => window.clearTimeout(id)
  }, [preset, compare, rate, at, tab])

  /* ── right column data ── */
  const entries = traces.map((tr, i) => ({ tr, snap: snaps[i] }))
  const metrics = metricRows(entries, primary, c)
  const heads = compare
    ? [
        { t: 'OLD', c: C.old },
        { t: 'NEW', c: C.new },
      ]
    : [{ t: mode === 'new' ? 'NEW' : 'OLD', c: accent }]
  const selMsg = sel ? (traces[sel.g]?.messages[sel.i] ?? null) : null
  const msg = pickMessage(primary, c, selMsg)
  const inspKey = !msg ? 'none' : sel && selMsg ? `s${sel.g}-${sel.i}` : `${primary.mode}-${primary.messages.indexOf(msg)}`

  const showLeft = !mobile || tab === 'code'
  const showCenter = !mobile || tab === 'threads'
  const showRight = !mobile || tab === 'inspect'

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg font-sans text-text">
      <header className="flex min-h-[60px] flex-none flex-wrap items-center gap-4 border-b border-line bg-bg px-6 py-2">
        <Link to={'/?mode=' + mode} className="flex items-center gap-2.5 text-text-bright no-underline hover:text-white">
          <BrandMark />
          <span className="text-sm leading-none font-semibold">Across the Bridge</span>
        </Link>
        <span aria-hidden="true" className="h-4 w-px bg-line-strong" />
        <h1 className="m-0 text-sm leading-none font-medium text-text-dim">Playground</h1>
        <span className="flex-1" />
        <ModeToggle layoutId="pg-mode-pill" onChange={resetIdle} />
        <button
          type="button"
          aria-pressed={compare}
          onClick={() => {
            setCompare(!compare)
            setSel(null)
          }}
          className="h-9 rounded-[7px] border px-3.5 text-[13px] leading-none font-semibold transition-colors duration-200"
          style={{
            borderColor: compare ? C.bright : C.lineStrong,
            background: compare ? C.bright : 'transparent',
            color: compare ? C.bg : C.text,
          }}
        >
          {compare ? 'Comparing' : 'Compare'}
        </button>
        <MotionToggle />
      </header>

      {mobile && (
        <div role="tablist" aria-label="Panels" className="flex flex-none border-b border-line">
          {TAB_LIST.map(([k, t]) => {
            const on = tab === k
            return (
              <button
                key={k}
                type="button"
                role="tab"
                id={'pg-tab-' + k}
                aria-selected={on}
                aria-controls={'pg-panel-' + k}
                onClick={() => setTab(k)}
                className="relative h-11 flex-1 border-0 bg-transparent text-[13px] leading-none font-semibold transition-colors"
                style={{ color: on ? C.bright : C.dim }}
              >
                {t}
                {on && (
                  <motion.span
                    layoutId="pg-tab-underline"
                    className="absolute right-0 bottom-0 left-0 h-0.5"
                    style={{ background: accent }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <main
        className="grid min-h-0 flex-1"
        style={{ gridTemplateColumns: mobile ? 'minmax(0,1fr)' : '380px minmax(0,1fr) 340px' }}
      >
        {showLeft && (
          <aside
            id="pg-panel-code"
            role={mobile ? 'tabpanel' : undefined}
            aria-labelledby={mobile ? 'pg-tab-code' : undefined}
            aria-label={mobile ? undefined : 'Code and phone'}
            className={`flex min-h-0 flex-col overflow-auto ${mobile ? '' : 'border-r border-line'}`}
          >
            <div className="flex flex-col gap-5 p-6">
              <label className="flex flex-col gap-2.5">
                <span className="text-[13px] leading-none font-semibold text-text-muted">Scenario</span>
                <select
                  value={preset}
                  onChange={(e) => {
                    clock.reset(PLAYBACK_IDLE)
                    setSel(null)
                    setPreset(e.target.value as PresetId)
                  }}
                  className="h-10 rounded-[7px] border border-line-strong bg-surface px-2.5 text-[13.5px] leading-none font-medium text-text-bright outline-none focus-visible:border-text-dim"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-surface text-text-bright">
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="m-0 text-[15px] leading-[1.6] text-text-muted">{pr.desc}</p>
              <ParamCode
                file={pr.file}
                lines={pr.code}
                active={activeRange(A.ln)}
                accent={accent}
                P={P}
                onParam={onParam}
              />
              <PhonePreview
                preset={preset}
                ui={A.ui}
                P={P}
                accent={accent}
                started={started}
                running={running}
                live={A.live}
                onRun={restart}
              />
            </div>
          </aside>
        )}

        {showCenter && (
          <section
            id="pg-panel-threads"
            role={mobile ? 'tabpanel' : undefined}
            aria-labelledby={mobile ? 'pg-tab-threads' : undefined}
            aria-label={mobile ? undefined : 'Threads over time'}
            className="flex min-h-0 min-w-0 flex-col overflow-auto"
          >
            <LaneTracks
              traces={traces}
              snaps={snaps}
              c={c}
              T={T}
              sel={sel}
              onPick={(g, i) => setSel({ g, i })}
            />
          </section>
        )}

        {showRight && (
          <aside
            id="pg-panel-inspect"
            role={mobile ? 'tabpanel' : undefined}
            aria-labelledby={mobile ? 'pg-tab-inspect' : undefined}
            aria-label={mobile ? undefined : 'Inspector'}
            className={`flex min-h-0 flex-col overflow-auto ${mobile ? '' : 'border-l border-line'}`}
          >
            <InspectorPanel
              accent={accent}
              heads={heads}
              metrics={metrics}
              insp={msg ? inspectorFor(msg) : null}
              inspKey={inspKey}
              mods={moduleRows(pr, primary, c)}
              trees={treeViews(pr, primary, c, T)}
            />
          </aside>
        )}
      </main>

      <ControlsBar
        accent={accent}
        playLabel={running ? 'Pause' : complete ? 'Replay' : started ? 'Resume' : 'Play'}
        onPlay={play}
        onBack={stepBack}
        onFwd={stepFwd}
        c={c}
        T={T}
        onScrub={(v) => seek(() => ({ c: (v / 1000) * T, started: true, racc: 0 }))}
        speed={clock.speed}
        onSpeed={clock.setSpeed}
        rate={rate}
        rateUsed={!!pr.rate}
        onRate={(r) => {
          setRate(r)
          setSel(null)
        }}
        status={status}
        caption={caption}
        captionColor={captionColor}
      />
    </div>
  )
}
