import { useSettings } from '../app/SettingsProvider'
import { useStartupSim } from '../hooks/useStartupSim'
import { accentOf, C, type Mode } from '../sim/colors'
import { PLAN } from '../sim/startup'
import { MentorCaption } from './MentorCaption'
import { SimControls } from './SimControls'
import { LazyModules } from './startup/LazyModules'
import { StartupRow, type StartupRowData } from './startup/StartupRow'
import { TimeAxis } from './startup/TimeAxis'
import { SimFrame, SimHeader } from './ui/SimFrame'

const TITLE = 'app startup · 10 native modules'

function startupRows(isNew: boolean, doneOld: boolean, doneNew: boolean): StartupRowData[] {
  return [
    {
      key: 'old',
      name: 'Old · every module created at launch',
      c: C.old,
      bd: isNew ? C.line : C.old + '88',
      segs: PLAN.old,
      end: PLAN.oldEnd,
      done: doneOld,
      legend: [
        [C.native, 'native module init'],
        [C.js, 'JS bundle'],
        [C.ui, 'first render'],
      ],
    },
    {
      key: 'new',
      name: 'New · Turbo Modules load when first used',
      c: C.new,
      bd: isNew ? C.new + '88' : C.line,
      segs: PLAN.nw,
      end: PLAN.newEnd,
      done: doneNew,
      legend: [
        [C.js, 'JS bundle'],
        [C.new, 'module, on first use'],
        [C.ui, 'first render'],
      ],
    },
  ]
}

/** Chapter 5: eager vs lazy startup bars. */
export function StartupBars() {
  const { mode } = useSettings()
  return <StartupBarsInner key={mode} mode={mode} />
}

function StartupBarsInner({ mode }: { mode: Mode }) {
  const sim = useStartupSim()
  const acc = accentOf(mode)
  const rows = startupRows(mode === 'new', sim.doneOld, sim.doneNew)

  return (
    <SimFrame label={TITLE}>
      <SimHeader
        status={sim.status}
        accent={acc}
        title={TITLE}
        right={
          <span className="font-mono text-xs leading-none text-text-faint tabular-nums">
            t = {Math.round(sim.t)} ms
          </span>
        }
      />

      <div className="flex flex-col gap-[22px] px-4 pt-[22px] pb-[18px]">
        <TimeAxis />
        {rows.map((r) => (
          <StartupRow key={r.key} row={r} t={sim.t}>
            {r.key === 'new' && (
              <LazyModules show={r.done} lazy={sim.lazy} reduced={sim.reduced} onLoad={sim.loadModule} />
            )}
          </StartupRow>
        ))}
      </div>

      <SimControls
        label="App startup"
        accent={acc}
        playLabel={sim.playLabel}
        onPlay={sim.onPlay}
        onStep={sim.onStep}
        stepDisabled={sim.doneOld}
        speed={sim.speed}
        onSpeed={sim.setSpeed}
        onReset={sim.onReset}
      />
      <MentorCaption accent={acc} text={sim.caption} />
    </SimFrame>
  )
}
