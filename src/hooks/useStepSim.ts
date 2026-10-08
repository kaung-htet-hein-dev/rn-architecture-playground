import { useState } from "react";
import { useSettings } from "../app/SettingsProvider";
import { useSimClock } from "../sim/clock";
import { accentOf, type Mode } from "../sim/colors";
import {
  advanceStep,
  derivePanel,
  isComplete,
  jumpTo,
  playFrom,
  STEP_IDLE,
  stepFrom,
  stepStatus,
  type StepState
} from "../sim/panel";
import { scenarioFor, type ScenarioId } from "../sim/scenarios";
import { useIsMobile } from "./useMediaQuery";

/** Clock, status and derived view for one step-through scenario. */
export function useStepSim(scenario: ScenarioId, mode: Mode) {
  const { reduced } = useSettings();
  const compact = useIsMobile();
  const sc = scenarioFor(scenario, mode);
  const [codeOpen, setCodeOpen] = useState<boolean | null>(null);

  const clock = useSimClock<StepState>(STEP_IDLE, {
    advance: (s, dt) => advanceStep(sc, s, dt)
  });
  const { state: s, running } = clock;
  const status = stepStatus(sc, s, running, reduced);
  const view = derivePanel(sc, s, {
    reduced,
    compact,
    error: status === "error"
  });
  const complete = isComplete(sc, s);
  const open = codeOpen ?? !compact;

  const onPlay = () => {
    if (running) return clock.pause();
    clock.play((st) => playFrom(sc, st));
  };
  const onStep = () => {
    const next = stepFrom(sc, s);
    if (!next) return;
    clock.pause();
    clock.set(next);
  };

  return {
    sc,
    accent: accentOf(mode),
    compact,
    state: s,
    status,
    view,
    complete,
    stepCount: sc.steps.length,
    playLabel: running
      ? "Pause"
      : complete
        ? "Replay"
        : s.step < 0
          ? "Play"
          : "Resume",
    codeOpen: open,
    toggleCode: () => setCodeOpen(!open),
    speed: clock.speed,
    setSpeed: clock.setSpeed,
    onPlay,
    onStep,
    onReset: () => clock.reset(),
    jump: (i: number) => clock.play(() => jumpTo(i))
  };
}
