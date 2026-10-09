import { useSettings } from '../app/SettingsProvider'
import { useScrollRace } from '../hooks/useScrollRace'
import { accentOf, C, type Mode } from '../sim/colors'
import { simTime } from '../sim/scrollRace'
import { MentorCaption } from './MentorCaption'
import { JsLoadSlider } from './scrollrace/JsLoadSlider'
import { PhoneColumn } from './scrollrace/PhoneColumn'
import { SimControls } from './SimControls'
import { SimFrame, SimHeader } from './ui/SimFrame'

/**
 * Chapter 3: the same list scrolled on two phones (REQUIREMENTS §5.1).
 * Switching mode remounts the inner sim, which resets it to idle.
 */
export function ScrollRace() {
  const { mode } = useSettings()
  return <ScrollRaceInner key={mode} mode={mode} />
}

function ScrollRaceInner({ mode }: { mode: Mode }) {
  const race = useScrollRace()
  const acc = accentOf(mode)
  const isNew = mode === 'new'
  const { state: s, caption: cap } = race
  // chipFor('error') uses the same red as 'overloaded'; only the label differs.
  const chip =
    race.status === 'overloaded-paused'
      ? { status: 'overloaded' as const, label: 'Overloaded · paused' }
      : { status: race.status, label: undefined }

  return (
    <SimFrame label="same list, same scroll, two architectures">
      <SimHeader
        status={chip.status}
        chipLabel={chip.label}
        accent={acc}
        title="same list, same scroll, two architectures"
        right={
          <span className="font-mono text-xs leading-none whitespace-nowrap text-text-faint tabular-nums">
            t = {simTime(s)} s
          </span>
        }
      />

      <div className="flex justify-center gap-10 px-6 py-5">
        {race.phones.map((ph) => (
          <PhoneColumn key={ph.key} ph={ph} frames={s.f} selected={ph.old !== isNew} reduced={race.reduced} />
        ))}
      </div>

      <MentorCaption accent={cap.warn ? C.load : acc} text={cap.text} id={cap.kind} />
      <SimControls
        label="ScrollRace"
        stepLabel="Step 1 frame"
        playLabel={race.playLabel}
        onPlay={race.onPlay}
        onStep={race.onStep}
        stepDisabled={race.complete}
        speed={race.speed}
        onSpeed={race.setSpeed}
        onReset={race.onReset}
        started={race.status !== 'idle'}
      >
        <JsLoadSlider value={s.load} work={race.work} color={race.loadColor} onChange={race.onLoad} />
      </SimControls>
    </SimFrame>
  )
}
