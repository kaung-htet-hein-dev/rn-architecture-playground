import { InspectorPanel } from "../components/playground/InspectorPanel";
import { ControlsBar } from "../components/playground/ControlsBar";
import { LaneTracks } from "../components/playground/LaneTracks";
import { ParamCode } from "../components/playground/ParamCode";
import { PhonePreview } from "../components/playground/PhonePreview";
import { Select } from "../components/ui/Select";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { activeRange, PRESETS } from "../sim/playground";
import { PanelTabs } from "./playground/PanelTabs";
import { PlaygroundHeader } from "./playground/PlaygroundHeader";
import { PlaygroundPanel } from "./playground/PlaygroundPanel";
import { usePlayground } from "./playground/usePlayground";

const PRESET_OPTIONS = PRESETS.map((p) => ({ value: p.id, label: p.name }));

export default function Playground() {
  const pg = usePlayground();
  const { actions } = pg;
  const mobile = useMediaQuery("(max-width: 1279.98px)");

  const showLeft = !mobile || pg.tab === "code";
  const showCenter = !mobile || pg.tab === "threads";
  const showRight = !mobile || pg.tab === "inspect";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg font-sans text-text">
      <PlaygroundHeader
        mode={pg.mode}
        compare={pg.compare}
        onCompare={actions.toggleCompare}
        onModeChange={actions.resetIdle}
      />

      {mobile && (
        <PanelTabs tab={pg.tab} accent={pg.accent} onTab={pg.setTab} />
      )}

      <main
        className="grid min-h-0 flex-1"
        style={{
          gridTemplateColumns: mobile
            ? "minmax(0,1fr)"
            : "380px minmax(0,1fr) 340px"
        }}
      >
        {showLeft && (
          <PlaygroundPanel
            name="code"
            label="Code and phone"
            mobile={mobile}
            edge="right"
          >
            <div className="flex flex-col gap-5 p-6">
              <Select
                label="Scenario"
                value={pg.preset}
                options={PRESET_OPTIONS}
                onChange={actions.changePreset}
              />
              <p className="m-0 text-[15px] leading-[1.6] text-text-muted">
                {pg.pr.desc}
              </p>
              <ParamCode
                file={pg.pr.file}
                lines={pg.pr.code}
                active={activeRange(pg.activeLine)}
                accent={pg.accent}
                P={pg.P}
                onParam={actions.changeParam}
              />
              <PhonePreview
                preset={pg.preset}
                ui={pg.ui}
                P={pg.P}
                accent={pg.accent}
                started={pg.started}
                running={pg.running}
                live={pg.live}
                onRun={actions.restart}
              />
            </div>
          </PlaygroundPanel>
        )}

        {showCenter && (
          <PlaygroundPanel
            name="threads"
            label="Threads over time"
            mobile={mobile}
            as="section"
          >
            <LaneTracks
              traces={pg.traces}
              snaps={pg.snaps}
              c={pg.c}
              T={pg.T}
              sel={pg.sel}
              onPick={actions.pickMessage}
            />
          </PlaygroundPanel>
        )}

        {showRight && (
          <PlaygroundPanel
            name="inspect"
            label="Inspector"
            mobile={mobile}
            edge="left"
          >
            <InspectorPanel
              accent={pg.accent}
              heads={pg.heads}
              metrics={pg.metrics}
              insp={pg.insp}
              inspKey={pg.inspKey}
              mods={pg.mods}
              trees={pg.trees}
            />
          </PlaygroundPanel>
        )}
      </main>

      <ControlsBar
        accent={pg.accent}
        playLabel={pg.playLabel}
        onPlay={actions.play}
        onBack={actions.stepBack}
        onFwd={actions.stepFwd}
        c={pg.c}
        T={pg.T}
        onScrub={actions.scrub}
        speed={pg.speed}
        onSpeed={pg.setSpeed}
        rate={pg.rate}
        rateUsed={!!pg.pr.rate}
        onRate={actions.changeRate}
        status={pg.status}
        caption={pg.caption}
        captionColor={pg.captionColor}
      />
    </div>
  );
}
