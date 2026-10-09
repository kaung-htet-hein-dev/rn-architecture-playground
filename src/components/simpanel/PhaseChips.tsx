import { C, alpha } from "../../sim/colors";
import type { PanelView } from "../../sim/panel";

/** Row of phase chips (Render · Commit · Mount) highlighting the current one. */
export function PhaseChips({
  phases,
  accent
}: {
  phases: PanelView["phases"];
  accent: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {phases.map((ph) => (
        <div
          key={ph.t}
          className="flex items-center gap-2 rounded-[6px] border px-3 py-[7px] text-[13px] leading-none font-medium transition-colors duration-250"
          style={{
            borderColor: ph.on ? accent : C.lineStrong,
            background: ph.on ? alpha(accent, 12) : "transparent",
            color: ph.on ? accent : ph.past ? C.muted : C.faint
          }}
        >
          <span className="font-mono text-xs leading-none">{ph.n}</span>
          {ph.t}
        </div>
      ))}
    </div>
  );
}
