import {
  axisTicks,
  timelineWidth,
  type Snapshot,
  type Trace
} from "../../sim/playground";
import { LaneGroup } from "./LaneGroup";

interface Props {
  traces: Trace[];
  snaps: Snapshot[];
  c: number;
  T: number;
  /** selected message: group + index */
  sel: { g: number; i: number } | null;
  onPick: (g: number, i: number) => void;
}

/** Center column: time axis, one lane group per trace on a shared scale, legend. */
export function LaneTracks({ traces, snaps, c, T, sel, onPick }: Props) {
  const ticks = axisTicks(T);
  const trackWidth = timelineWidth(traces, T);
  return (
    <div className="min-w-0 overflow-x-auto">
      <div
        className="flex min-w-[600px] flex-col gap-8 px-6 pt-5 pb-8"
        style={{ minWidth: trackWidth + 180 }}
      >
        <div className="grid grid-cols-[164px_minmax(0,1fr)] gap-x-4">
          <span className="sticky left-0 z-10 -ml-6 -mr-4 bg-bg pr-4 pl-6 text-[13px] leading-none font-semibold text-text-muted">
            Threads over time
          </span>
          <div className="relative h-3.5" aria-hidden="true">
            {ticks.map((tk) => (
              <span
                key={tk.t}
                className="absolute -translate-x-1/2 font-mono text-xs leading-none whitespace-nowrap text-text-faint"
                style={{ left: tk.l + "%" }}
              >
                {tk.t}
              </span>
            ))}
          </div>
        </div>
        {traces.map((tr, g) => (
          <LaneGroup
            key={tr.mode}
            tr={tr}
            snap={snaps[g]}
            c={c}
            T={T}
            selected={sel && sel.g === g ? sel.i : null}
            onPick={(i) => onPick(g, i)}
          />
        ))}
        <div className="flex flex-wrap gap-x-6 gap-y-2 pl-[180px] text-[13px] leading-[1.4] text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-[2px] bg-old" />
            bridge message (click to inspect)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-new" />
            JSI call or event (no JSON)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2.5 bg-load" />
            dropped frame
          </span>
        </div>
      </div>
    </div>
  );
}
