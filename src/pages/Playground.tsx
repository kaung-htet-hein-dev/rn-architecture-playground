import { usePageMeta } from "../hooks/usePageMeta";
import { InspectorPanel } from "../components/playground/InspectorPanel";
import { ControlsBar } from "../components/playground/ControlsBar";
import { LaneTracks } from "../components/playground/LaneTracks";
import { ParamCode } from "../components/playground/ParamCode";
import { PhonePreview } from "../components/playground/PhonePreview";
import { Select } from "../components/ui/Select";
import { activeRange, PRESETS } from "../sim/playground";
import { PlaygroundHeader } from "./playground/PlaygroundHeader";
import { PlaygroundPanel } from "./playground/PlaygroundPanel";
import { usePlayground } from "./playground/usePlayground";

const PRESET_OPTIONS = PRESETS.map((p) => ({ value: p.id, label: p.name }));

export default function Playground() {
  usePageMeta({
    title: "React Native Playground: trace the bridge, JSI and Fabric",
    description:
      "Run React Native architecture scenarios with your own numbers and watch thread lanes, bridge traffic and frame timing change in a live trace.",
    path: "/playground",
  });
  const pg = usePlayground();
  const { actions } = pg;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg font-sans text-text">
      <PlaygroundHeader
        mode={pg.mode}
        compare={pg.compare}
        onCompare={actions.toggleCompare}
        onModeChange={actions.resetIdle}
      />

      <main className="grid min-h-0 flex-1 grid-cols-[420px_minmax(0,1fr)_320px]">
        <PlaygroundPanel label="Code and phone" edge="right">
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

        <PlaygroundPanel label="Threads over time" as="section">
          <LaneTracks
            traces={pg.traces}
            snaps={pg.snaps}
            c={pg.c}
            T={pg.T}
            sel={pg.sel}
            onPick={actions.pickMessage}
          />
        </PlaygroundPanel>

        <PlaygroundPanel label="Inspector" edge="left">
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
