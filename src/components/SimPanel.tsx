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
  const { sc, view, state, accent, compact } = sim;

  return (
    <SimFrame label={sc.title} fadeIn>
      <SimHeader
        status={sim.status}
        accent={accent}
        title={sc.title}
        titleClassName="truncate font-mono text-[13px] leading-[1.2] font-medium text-text-muted"
        right={
          <StepJumper
            count={sim.stepCount}
            state={state}
            accent={accent}
            onJump={sim.jump}
          />
        }
      />

      <div className={`flex flex-wrap ${compact ? "flex-col" : ""}`}>
        <div
          className={`flex min-w-0 flex-col gap-4 p-5 ${compact ? "flex-none" : "flex-[1_1_520px]"}`}
        >
          {view.phases.length > 0 && (
            <PhaseChips phases={view.phases} accent={accent} />
          )}
          <ThreadLanes
            lanes={view.lanes}
            gridCols={view.gridCols}
            height={compact ? 240 : 270}
            packet={view.packet}
            wire={mode === "new" ? "#5fd3e655" : "#f2b35b55"}
            compact={compact}
          />
          {sc.trees && <TreeViews trees={view.trees} accent={accent} />}
        </div>
        <CodePanel
          className={`shadow-[-1px_0_0_#2d3642,0_-1px_0_#2d3642] ${compact ? "flex-none" : "flex-[1_1_340px]"}`}
          file={sc.file}
          lines={sc.code}
          active={view.activeLines}
          accent={accent}
          open={sim.codeOpen}
          onToggle={sim.toggleCode}
        />
      </div>

      <SimControls
        label={sc.title}
        accent={accent}
        playLabel={sim.playLabel}
        onPlay={sim.onPlay}
        onStep={sim.onStep}
        stepDisabled={sim.complete}
        speed={sim.speed}
        onSpeed={sim.setSpeed}
        onReset={sim.onReset}
        meta={
          state.step < 0
            ? `${sim.stepCount} steps`
            : `step ${state.step + 1} / ${sim.stepCount}`
        }
      />
      <MentorCaption accent={accent} text={view.caption} id={view.stepKey} />
    </SimFrame>
  );
}
