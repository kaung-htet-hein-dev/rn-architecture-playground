import { useSettings } from "../app/SettingsProvider";
import { useSimClock } from "../sim/clock";
import { accentOf, alpha, C, HATCH, type Mode, type SimStatus } from "../sim/colors";
import { advance, phaseAt, scriptFor, type DBlock, type LaneId, type Playhead, type Script } from "../sim/priority";
import { MentorCaption } from "./MentorCaption";
import { SimControls } from "./SimControls";
import { Swatch } from "./ui/Swatch";
import { SimFrame, SimHeader } from "./ui/SimFrame";

/**
 * Chapter 7: how React schedules the Photos → Map taps, drawn as two lanes of work.
 * Switching mode remounts it with the other script.
 */
export function PriorityDiagram() {
  const { mode } = useSettings();
  return <PriorityDiagramInner key={mode} mode={mode} />;
}

const LANES: LaneId[] = ["top", "bottom"];

const KIND_COLOR = { slice: C.new, urgent: C.js, commit: C.ui, wait: C.load } as const;

function PriorityDiagramInner({ mode }: { mode: Mode }) {
  const script = scriptFor(mode === "new");
  const clock = useSimClock<Playhead>({ x: 0, hold: 0 }, { advance: (p, dt) => advance(script, p, dt) });
  const { x } = clock.state;
  const running = clock.running;
  const done = x >= script.end;
  const started = x > 0;
  const status: SimStatus = running ? "running" : !started ? "idle" : done ? "complete" : "paused";
  const acc = accentOf(mode);
  const phase = started ? phaseAt(script, x) : null;
  const pct = (u: number) => `${(u / script.end) * 100}%`;

  const legend: [string, string][] =
    mode === "new"
      ? [
          [C.new, "Transition slice"],
          [C.js, "Urgent render"],
          [C.ui, "Commit"]
        ]
      : [
          [C.js, "Render, always urgent"],
          [C.ui, "Commit"],
          [C.load, "Tap waiting"]
        ];

  return (
    <SimFrame label="inside React: two lanes of work" fadeIn>
      <SimHeader
        status={status}
        accent={acc}
        title={mode === "new" ? "inside React: two lanes of work" : "inside React: one lane, no interruptions"}
        right={<OnScreen screen={script.screenAt(x)} />}
      />

      <div className="flex flex-col gap-4 px-6 pt-6 pb-5">
        <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-x-4">
          <span />
          <div className="relative h-7">
            {script.notes.map((n) => (
              <span
                key={n.text}
                className="absolute bottom-1.5 text-xs leading-none whitespace-nowrap text-text-dim transition-opacity duration-300"
                style={{ left: pct(n.at), opacity: x >= n.at ? 1 : 0 }}
              >
                {n.text}
              </span>
            ))}
            <span
              className="absolute bottom-3 -translate-x-1/2 text-[13px] leading-none font-semibold whitespace-nowrap transition-opacity duration-200"
              style={{ left: pct(script.tap), color: C.bright, opacity: x >= script.tap ? 1 : 0 }}
            >
              tap Map
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {LANES.map((l) => (
              <span key={l} className="flex h-[76px] items-center text-[13px] leading-[1.3] font-semibold text-text">
                {script.lanes[l]}
              </span>
            ))}
          </div>
          <div className="relative flex flex-col gap-3">
            {LANES.map((l) => (
              <Lane key={l} lane={l} script={script} x={x} pct={pct} />
            ))}
            {/* user input line, like a pin dropped across both lanes */}
            <span
              aria-hidden
              className="absolute -top-2 -bottom-2 w-0.5 rounded-full transition-opacity duration-200"
              style={{ left: pct(script.tap), background: C.bright, opacity: x >= script.tap ? 1 : 0 }}
            />
            <span
              aria-hidden
              className="absolute -top-[5px] size-2.5 -translate-x-[4px] rounded-full transition-opacity duration-200"
              style={{ left: pct(script.tap), background: C.bright, opacity: x >= script.tap ? 1 : 0 }}
            />
            {started && !done && (
              <span aria-hidden className="absolute -top-2 -bottom-2 w-px" style={{ left: pct(x), background: alpha(C.text, 45) }} />
            )}
          </div>
        </div>

        <ul aria-label="Diagram legend" className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 pl-[196px] text-xs leading-none text-text-dim">
          {legend.map(([c, label]) => (
            <li key={label} className="flex items-center gap-2">
              <Swatch color={c} className="h-2.5 w-4" />
              {label}
            </li>
          ))}
          {mode === "new" && (
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-4 rounded-[2px]" style={{ background: HATCH }} />
              Thrown away
            </li>
          )}
        </ul>
      </div>

      <MentorCaption
        accent={phase?.warn ? C.load : acc}
        text={
          phase?.text ??
          (mode === "new"
            ? "The same example as below: tap Photos, then Map. Press Play to see how React orders the work."
            : "The same example as below, on the old architecture. Press Play to see how React orders the work.")
        }
        id={phase ? String(phase.from) : "intro"}
      />
      <SimControls
        label="Two lanes of work"
        playLabel={running ? "Pause" : !started ? "Play" : done ? "Replay" : "Resume"}
        onPlay={() => {
          if (running) return clock.pause();
          clock.play((p) => (done ? { x: 0, hold: 0 } : { ...p, once: false }));
        }}
        onStep={() => clock.play((p) => ({ x: p.x, hold: 0, once: true }))}
        stepLabel="Next step"
        stepDisabled={done || running}
        speed={clock.speed}
        onSpeed={clock.setSpeed}
        onReset={() => clock.reset({ x: 0, hold: 0 })}
        started={started}
      />
    </SimFrame>
  );
}

function Lane({ lane, script, x, pct }: { lane: LaneId; script: Script; x: number; pct: (u: number) => string }) {
  const blocks = script.blocks.filter((b) => b.lane === lane && b.start < x);
  const dropped = (b: DBlock) => b.droppedAt != null && x >= b.droppedAt;

  // one label across each group's visible extent
  const spans = new Map<string, { start: number; end: number; dropped: boolean }>();
  for (const b of blocks) {
    if (!b.group) continue;
    const end = Math.min(b.end, x);
    const g = spans.get(b.group);
    if (g) g.end = end;
    else spans.set(b.group, { start: b.start, end, dropped: dropped(b) });
  }

  return (
    <div className="relative h-[76px] overflow-hidden rounded-lg border border-line-soft bg-surface">
      {script.checks
        .filter((c) => lane === "top" && c <= x)
        .map((c) => (
          <span
            key={c}
            aria-hidden
            className="absolute top-1 size-1.5 -translate-x-1/2 rounded-full"
            style={{ left: pct(c), background: C.dim }}
          />
        ))}
      {blocks.map((b) => {
        const isDropped = dropped(b);
        const wait = b.kind === "wait";
        return (
          <span
            key={b.id}
            className={`absolute rounded-[3px] transition-[background,opacity] duration-500 ${wait ? "top-[25px] h-[3px]" : "top-3 h-7"}`}
            style={{
              left: pct(b.start),
              width: pct(Math.min(b.end, x) - b.start),
              background: isDropped ? HATCH : KIND_COLOR[b.kind],
              opacity: isDropped ? 0.85 : 1
            }}
          />
        );
      })}
      {[...spans.entries()].map(([id, g]) => {
        const meta = script.groups.find((m) => m.id === id)!;
        return (
          <span
            key={id}
            className="pointer-events-none absolute bottom-2.5 text-xs leading-none font-semibold whitespace-nowrap transition-colors duration-500"
            style={{ left: pct(g.start), color: g.dropped ? C.badText : C.muted }}
          >
            {g.dropped && meta.droppedLabel ? meta.droppedLabel : meta.label}
          </span>
        );
      })}
    </div>
  );
}

/** What the user sees right now, so the diagram stays tied to the phone. */
function OnScreen({ screen }: { screen: { bar: string; content: string; dim: boolean } }) {
  return (
    <span className="flex items-center gap-3 text-xs leading-none text-text-faint" aria-live="polite">
      On screen
      <span className="rounded-[4px] bg-raised px-2 py-[5px] font-semibold text-text-bright">{screen.bar} tab lit</span>
      <span className="rounded-[4px] bg-raised px-2 py-[5px] font-semibold" style={{ color: screen.dim ? C.dim : C.bright }}>
        {screen.content} screen{screen.dim ? ", dimmed" : ""}
      </span>
    </span>
  );
}
