import { accentOf, C } from "../../sim/colors";
import {
  laneGeometry,
  laneReadouts,
  LANE_H,
  TRACK_H,
  type Snapshot,
  type Trace
} from "../../sim/playground";
import { LaneLabels } from "./LaneLabels";

const SEPS = [1, 2, 3, 4, 5].map((i) => i * LANE_H);

export function LaneGroup({
  tr,
  snap,
  c,
  T,
  selected,
  onPick
}: {
  tr: Trace;
  snap: Snapshot;
  c: number;
  T: number;
  selected: number | null;
  onPick: (i: number) => void;
}) {
  const o = tr.mode === "old";
  const col = accentOf(tr.mode);
  const lanes = laneReadouts(tr, snap, c);
  const { blocks, packets, arrows, frames } = laneGeometry(tr, c, T, selected);
  const name = o ? "Old architecture" : "New Architecture";
  return (
    <section aria-label={name} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="flex items-center gap-2 text-sm leading-none font-semibold"
          style={{ color: col }}
        >
          <span className="size-2 rounded-[2px]" style={{ background: col }} />
          {name}
        </span>
        <span className="text-[13px] leading-none text-text-dim">
          {o ? "bridge: async JSON queue" : "JSI: direct calls"}
        </span>
      </div>
      <div className="grid grid-cols-[164px_minmax(0,1fr)] gap-x-4">
        <LaneLabels lanes={lanes} />
        <div
          className="relative border-l border-line"
          style={{ height: TRACK_H }}
        >
          {SEPS.map((sp) => (
            <div
              key={sp}
              className="absolute right-0 left-0 h-px bg-line-soft"
              style={{ top: sp }}
            />
          ))}
          {blocks.map((b) => (
            <div
              key={b.key}
              title={b.label}
              className="absolute box-border flex h-[26px] min-w-[3px] items-center overflow-hidden rounded-[4px] border px-1.5 font-mono text-[11.5px] leading-none font-medium whitespace-nowrap"
              style={{
                top: b.top,
                left: b.l + "%",
                width: "max-content",
                minWidth: b.w + "%",
                maxWidth: `calc(100% - ${b.l}%)`,
                borderColor: b.bd,
                background: b.bg,
                color: b.fg
              }}
            >
              {b.label}
            </div>
          ))}
          {packets.map((pk) => (
            <button
              key={pk.i}
              type="button"
              title={pk.label}
              aria-label={`Inspect bridge message ${pk.label}`}
              aria-pressed={selected === pk.i}
              onClick={() => onPick(pk.i)}
              className="absolute box-border h-[9px] min-w-1.5 rounded-[3px] border p-0"
              style={{
                top: pk.top,
                left: pk.l + "%",
                width: pk.w + "%",
                background: pk.bg,
                borderColor: pk.bd
              }}
            />
          ))}
          {arrows.map((ar) => (
            <button
              key={ar.i}
              type="button"
              title={ar.label}
              aria-label={`Inspect JSI call ${ar.label}`}
              aria-pressed={selected === ar.i}
              onClick={() => onPick(ar.i)}
              className="absolute -ml-1 flex w-[9px] justify-center border-0 bg-transparent p-0"
              style={{ left: ar.l + "%", top: ar.top, height: ar.h }}
            >
              <span className="h-full w-0.5" style={{ background: ar.c }} />
            </button>
          ))}
          {arrows.map((ar) => (
            <div
              key={"d" + ar.i}
              aria-hidden="true"
              className="pointer-events-none absolute -ml-1 size-2 rounded-full"
              style={{ left: ar.l + "%", top: ar.dot, background: ar.c }}
            />
          ))}
          {frames.map((fr) => (
            <div
              key={fr.key}
              aria-hidden="true"
              className="absolute box-border h-3 border-r border-bg"
              style={{
                top: LANE_H * 5 + 4,
                left: fr.l + "%",
                width: fr.w + "%",
                background: fr.dropped ? C.load : "#3a4a3f"
              }}
            />
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1.5 bottom-0 -ml-px w-0.5 bg-text-bright"
            style={{ left: (c / T) * 100 + "%" }}
          />
        </div>
      </div>
    </section>
  );
}
