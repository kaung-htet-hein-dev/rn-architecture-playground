import { C } from '../../sim/colors'
import type { Params, PhoneState, PresetId, Task } from '../../sim/playground'

interface Props {
  preset: PresetId
  ui: PhoneState
  P: Params
  accent: string
  started: boolean
  running: boolean
  live: Task[]
  /** restart and play */
  onRun: () => void
}

const HOME_ROWS = ['Recent orders', 'Messages', 'Saved places', 'Settings', 'Help']
const FEED_ROWS = Array.from({ length: 14 }, (_, i) => 'Post #' + (210 - i))

/** 220×400 phone that mirrors the trace's UI patches and accepts taps (and scrolls). */
export function PhonePreview({ preset, ui, P, accent, started, running, live, onRun }: Props) {
  const isScroll = preset === 'scroll'
  const onWheel = () => {
    if (isScroll && !running) onRun()
  }
  return (
    <div className="flex flex-col items-center gap-2 pt-1 pb-2">
      <div className="box-border h-[400px] w-[220px] rounded-[30px] border-2 border-line-strong bg-phone-body p-[9px]">
        <div
          onWheel={onWheel}
          onTouchMove={onWheel}
          className="relative h-full overflow-hidden rounded-[22px] bg-panel"
        >
          <Screen preset={preset} ui={ui} P={P} accent={accent} started={started} live={live} onRun={onRun} />
        </div>
      </div>
      <span className="text-center text-xs leading-[1.4] text-text-dim">
        {isScroll ? 'Scroll on the phone to start' : 'Tap the phone to run it again'}
      </span>
    </div>
  )
}

const mono11 = 'font-mono text-xs leading-none font-medium'

function Screen({ preset, ui, P, accent, started, live, onRun }: Omit<Props, 'running'>) {
  switch (preset) {
    case 'tap': {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className={`${mono11} text-text-faint`}>Count</span>
          <span className="text-[56px] leading-none font-semibold text-text-bright" aria-live="off">
            {ui.count || 0}
          </span>
          <button
            type="button"
            onClick={onRun}
            className="h-11 rounded-[22px] border-0 px-5 text-sm leading-none font-semibold text-bg transition-colors duration-150"
            style={{ background: ui.pressed ? C.dim : C.bright }}
          >
            Vibrate · +{String(P.step)}
          </button>
          <span className={mono11} style={{ color: accent }}>
            {ui.buzz ? 'bzz · ' + String(P.style) : ' '}
          </span>
        </div>
      )
    }
    case 'startup':
      return ui.screen === 'home' ? (
        <div className="box-border flex h-full flex-col gap-2 px-2.5 py-3.5">
          <span className="px-1 pt-2 pb-1.5 text-base leading-none font-semibold text-text-bright">Home</span>
          {HOME_ROWS.map((r) => (
            <div key={r} className="flex h-[42px] items-center rounded-lg bg-raised px-2.5 text-xs leading-none font-medium text-text-muted">
              {r}
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onRun}
          aria-label="Launch the app"
          className="flex h-full w-full flex-col items-center justify-center gap-3.5 border-0 bg-transparent"
        >
          <span className="size-11 rounded-xl bg-track" />
          <span className={`${mono11} text-text-faint`}>{started ? 'starting…' : 'tap to launch'}</span>
        </button>
      )
    case 'scroll': {
      const scroll = ui.scroll || 0
      const shown = ui.shown || 0
      return (
        <>
          <div className="absolute top-0 right-0 left-0 z-[2] flex h-[50px] flex-col justify-center gap-[5px] border-b border-track bg-raised px-3.5">
            <span className="text-[13px] leading-none font-semibold text-text-bright">Feed</span>
            <span
              className="font-mono text-xs leading-none"
              style={{ color: scroll - shown > 24 ? C.load : C.dim }}
            >
              header y = {shown} · list y = {scroll}
            </span>
          </div>
          <div
            className="absolute top-[58px] right-2.5 left-2.5 flex flex-col gap-2"
            style={{ transform: `translateY(-${scroll}px)` }}
          >
            {FEED_ROWS.map((r) => (
              <div key={r} className="flex h-11 flex-none items-center rounded-lg bg-raised px-2.5 text-xs leading-none font-medium text-text-muted">
                {r}
              </div>
            ))}
          </div>
        </>
      )
    }
    case 'anim': {
      const nat = String(P.native).trim() === 'true'
      const jsb = live.some((e) => e.lane === 'js' && e.label.indexOf('JSON') === 0)
      return (
        <button
          type="button"
          onClick={onRun}
          aria-label="Run the animation"
          className="flex h-full w-full flex-col justify-center gap-[18px] border-0 bg-transparent px-4 text-left"
        >
          <span className={`${mono11} text-text-faint`}>useNativeDriver: {String(P.native)}</span>
          <span className="relative block h-11 w-full rounded-[22px] bg-raised">
            <span
              className="absolute top-1 size-9 rounded-full bg-text-bright"
              style={{ left: `calc(4px + ${ui.x || 0} * (100% - 44px))` }}
            />
          </span>
          <span className="font-mono text-xs leading-[1.4]" style={{ color: jsb && !nat ? C.load : accent }}>
            {jsb ? (nat ? 'JS busy · still smooth' : 'JS busy · frozen') : ' '}
          </span>
        </button>
      )
    }
    case 'measure': {
      const wrong = !!ui.tip && ui.tipY === 0
      return (
        <button
          type="button"
          onClick={onRun}
          aria-label="Show the tooltip"
          className="absolute inset-0 border-0 bg-transparent p-0"
        >
          <span className="absolute top-[150px] right-5 left-5 flex h-11 items-center justify-center rounded-[10px] bg-track text-[13px] leading-none font-semibold text-text-bright">
            Save
          </span>
          {ui.tip && (
            <span
              className="absolute right-9 left-9 flex h-[30px] items-center justify-center rounded-[7px] text-xs leading-none font-semibold text-bg"
              style={{ top: ui.tipY || 0, background: wrong ? C.load : C.bright }}
            >
              Saved
            </span>
          )}
          <span
            className="absolute right-0 bottom-3.5 left-0 text-center font-mono text-xs leading-none"
            style={{ color: wrong ? C.load : C.dim }}
          >
            {ui.tip ? (wrong ? 'wrong place' : 'positioned') : 'tap to show tooltip'}
          </span>
        </button>
      )
    }
    case 'heavy': {
      const sent = ui.sent || 0
      const done = ui.done || 0
      return (
        <div className="flex h-full flex-col justify-center gap-3 px-4">
          <button
            type="button"
            onClick={onRun}
            className="h-11 rounded-[10px] border-0 bg-track text-[13px] leading-none font-semibold text-text-bright"
          >
            {ui.building ? 'Building…' : 'Build report'}
          </button>
          <button
            type="button"
            className="h-11 rounded-[10px] border border-line-strong bg-transparent text-[13px] leading-none font-semibold text-text-bright"
          >
            Tap me
          </button>
          <span className="text-center font-mono text-xs leading-normal" style={{ color: sent > done ? C.load : C.dim }}>
            taps sent {sent} · handled {done}
          </span>
        </div>
      )
    }
    case 'payload':
      return (
        <div className="flex h-full flex-col justify-center gap-3.5 px-4">
          <button
            type="button"
            onClick={onRun}
            className="h-11 rounded-[10px] border-0 bg-track text-[13px] leading-none font-semibold text-text-bright"
          >
            Save {String(P.rows)} rows
          </button>
          <span
            className="text-center font-mono text-xs leading-normal"
            style={{ color: ui.status === 'Saved ✓' ? accent : C.dim }}
          >
            {ui.status || 'Ready'}
          </span>
        </div>
      )
  }
}
