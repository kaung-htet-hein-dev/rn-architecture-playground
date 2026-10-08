import { useState } from "react";
import { motion } from "motion/react";
import { useSettings } from "../app/SettingsProvider";
import { useIsMobile } from "../hooks/useMediaQuery";
import { useSimClock } from "../sim/clock";
import { accentOf, C } from "../sim/colors";
import {
  advanceStep,
  derivePanel,
  isComplete,
  jumpTo,
  playFrom,
  segFill,
  STEP_IDLE,
  stepFrom,
  stepStatus,
  type StepState
} from "../sim/panel";
import { scenarioFor, type ScenarioId } from "../sim/scenarios";
import type { Mode } from "../sim/colors";
import { CodePanel } from "./CodePanel";
import { MentorCaption } from "./MentorCaption";
import { SimControls } from "./SimControls";
import { StateChip } from "./StateChip";
import { ThreadLanes } from "./ThreadLanes";
import { TreeViews } from "./TreeViews";

/**
 * Reusable thread-lanes + code panel. Switching mode remounts the inner panel,
 * which resets it to idle with the other scenario (PROMPT rule 3).
 */
export function SimPanel({ scenario }: { scenario: ScenarioId }) {
  const { mode } = useSettings();
  return <SimPanelInner key={mode} scenario={scenario} mode={mode} />;
}

function SimPanelInner({
  scenario,
  mode
}: {
  scenario: ScenarioId;
  mode: Mode;
}) {
  const { reduced } = useSettings();
  const compact = useIsMobile();
  const sc = scenarioFor(scenario, mode);
  const acc = accentOf(mode);
  const [codeOpen, setCodeOpen] = useState<boolean | null>(null);

  const clock = useSimClock<StepState>(STEP_IDLE, {
    advance: (s, dt) => advanceStep(sc, s, dt)
  });
  const { state: s, running } = clock;
  const status = stepStatus(sc, s, running, reduced);
  const error = status === "error";
  const view = derivePanel(sc, s, { reduced, compact, error });
  const complete = isComplete(sc, s);
  const n = sc.steps.length;
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
  const label = `${sc.title}`;

  return (
    <motion.section
      aria-label={`Simulation: ${label}`}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel font-sans text-text"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <StateChip status={status} accent={acc} />
          <span className="truncate font-mono text-[13px] leading-[1.2] font-medium text-text-muted">
            {sc.title}
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Jump to step"
        >
          {sc.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              title={`Step ${i + 1}`}
              aria-label={`Play step ${i + 1}`}
              aria-current={i === s.step ? "step" : undefined}
              onClick={() => clock.play(() => jumpTo(i))}
              className="h-2 w-5 rounded-[3px] border-0 p-0 transition-[background,transform] duration-200 hover:scale-y-150"
              style={{ background: segFill(i, s, acc) }}
            />
          ))}
        </div>
      </div>

      <div className={`flex flex-wrap ${compact ? "flex-col" : ""}`}>
        <div
          className={`flex min-w-0 flex-col gap-4 p-5 ${compact ? "flex-none" : "flex-[1_1_520px]"}`}
        >
          {view.phases.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {view.phases.map((ph) => (
                <div
                  key={ph.t}
                  className="flex items-center gap-2 rounded-[6px] border px-3 py-[7px] text-[13px] leading-none font-medium transition-colors duration-250"
                  style={{
                    borderColor: ph.on ? acc : C.lineStrong,
                    background: ph.on ? acc + "1f" : "transparent",
                    color: ph.on ? acc : ph.past ? C.muted : C.faint
                  }}
                >
                  <span className="font-mono text-[11px] leading-none">
                    {ph.n}
                  </span>
                  {ph.t}
                </div>
              ))}
            </div>
          )}
          <ThreadLanes
            lanes={view.lanes}
            gridCols={view.gridCols}
            height={compact ? 240 : 270}
            packet={view.packet}
            wire={mode === "new" ? "#5fd3e655" : "#f2b35b55"}
            compact={compact}
          />
          {sc.trees && <TreeViews trees={view.trees} accent={acc} />}
        </div>
        <CodePanel
          className={`shadow-[-1px_0_0_#2d3642,0_-1px_0_#2d3642] ${compact ? "flex-none" : "flex-[1_1_340px]"}`}
          file={sc.file}
          lines={sc.code}
          active={view.activeLines}
          accent={acc}
          open={open}
          onToggle={() => setCodeOpen(!open)}
        />
      </div>

      <SimControls
        label={sc.title}
        accent={acc}
        playLabel={
          running
            ? "Pause"
            : complete
              ? "Replay"
              : s.step < 0
                ? "Play"
                : "Resume"
        }
        onPlay={onPlay}
        onStep={onStep}
        stepDisabled={complete}
        speed={clock.speed}
        onSpeed={clock.setSpeed}
        onReset={() => clock.reset()}
        meta={s.step < 0 ? `${n} steps` : `step ${s.step + 1} / ${n}`}
      />
      <MentorCaption accent={acc} text={view.caption} id={view.stepKey} />
    </motion.section>
  );
}
