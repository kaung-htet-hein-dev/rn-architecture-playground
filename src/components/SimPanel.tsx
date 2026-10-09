import { useSettings } from "../app/SettingsProvider";
import type { ScenarioId } from "../sim/scenarios";
import type { Mode } from "../sim/colors";
import { useStepSim } from "../hooks/useStepSim";
import { CodePanel } from "./CodePanel";
import { MentorCaption } from "./MentorCaption";
import { PhaseChips } from "./simpanel/PhaseChips";
import { StepJumper } from "./simpanel/StepJumper";
import { SimControls } from "./SimControls";
import { ThreadLanes } from "./ThreadLanes";
import { TreeViews } from "./TreeViews";
import { SimFrame, SimHeader } from "./ui/SimFrame";
import { C, alpha } from "../sim/colors";

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
  const sim = useStepSim(scenario, mode);
  const { sc, view, state, accent } = sim;
  const started = state.step >= 0;

  return (
    <SimFrame label={sc.title} fadeIn>
      <SimHeader
        status={sim.status}
        accent={accent}
        title={sc.title}
        titleClassName="truncate font-mono text-[13px] leading-[1.2] font-medium text-text-muted"
        right={
          started && (
            <StepJumper
              count={sim.stepCount}
              state={state}
              accent={accent}
              onJump={sim.jump}
            />
          )
        }
      />

      <div className="flex">
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
          {view.phases.length > 0 && (
            <PhaseChips phases={view.phases} accent={accent} />
          )}
          <ThreadLanes
            lanes={view.lanes}
            gridCols={view.gridCols}
            height={270}
            packet={view.packet}
            wire={mode === "new" ? alpha(C.new, 33) : alpha(C.old, 33)}
          />
          {sc.trees && <TreeViews trees={view.trees} accent={accent} />}
        </div>
        <CodePanel
          className="w-[400px] flex-none border-l border-line"
          file={sc.file}
          lines={sc.code}
          active={view.activeLines}
          accent={accent}
          open={sim.codeOpen}
          muted={!started}
          wrap
          onToggle={sim.toggleCode}
        />
      </div>

      <MentorCaption accent={accent} text={view.caption} id={view.stepKey} />
      <SimControls
        label={sc.title}
        playLabel={sim.playLabel}
        onPlay={sim.onPlay}
        onStep={sim.onStep}
        stepDisabled={sim.complete}
        speed={sim.speed}
        onSpeed={sim.setSpeed}
        onReset={sim.onReset}
        started={started}
        meta={
          started
            ? `Step ${state.step + 1} of ${sim.stepCount}`
            : `${sim.stepCount} steps`
        }
      />
    </SimFrame>
  );
}
