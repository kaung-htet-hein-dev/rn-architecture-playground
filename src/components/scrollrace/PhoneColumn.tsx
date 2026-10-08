import { motion } from "motion/react";
import { C } from "../../sim/colors";
import type { SideView } from "../../sim/scrollRace";
import { PhoneFrame } from "../PhoneFrame";
import { Swatch } from "../ui/Swatch";
import { StatLabel } from "../ui/Stat";

interface Props {
  ph: SideView;
  frames: number;
  /** this phone matches the active Old/New mode */
  selected: boolean;
  reduced: boolean;
}

/** One phone plus its live counters: dropped frames, queue, JS lag, cost. */
export function PhoneColumn({ ph, frames, selected, reduced }: Props) {
  return (
    <div className="flex max-w-[440px] flex-[1_1_300px] flex-wrap items-start justify-center gap-4">
      <div className="flex w-[212px] flex-none flex-col items-center gap-2.5">
        <div
          className="flex items-center gap-2 text-[13px] leading-none font-semibold"
          style={{ color: ph.color }}
        >
          <Swatch color={ph.color} />
          {ph.name}
        </div>
        <PhoneFrame
          label={ph.name}
          frame={selected ? ph.color : C.lineStrong}
          flash={ph.flash}
          over={ph.over}
          ry={ph.ry}
          rows={ph.rows}
          reduced={reduced}
        />
      </div>
      <dl className="m-0 flex min-w-[160px] flex-[1_1_160px] flex-col gap-3.5 pt-7 tabular-nums">
        <div className="flex flex-col gap-1">
          <StatLabel>DROPPED FRAMES</StatLabel>
          <dd className="m-0 flex flex-col gap-1">
            <span
              className="font-mono text-[28px] leading-none font-semibold"
              style={{ color: ph.dropped > 0 ? C.load : C.bright }}
            >
              {ph.dropped}
            </span>
            <span className="text-xs leading-[1.4] text-text-dim">
              {ph.dropPct} of {frames} frames
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-1.5">
          <StatLabel>{ph.qLabel}</StatLabel>
          <dd className="m-0 flex flex-col gap-1.5">
            <span
              aria-hidden
              className="flex min-h-2.5 max-w-[170px] flex-wrap gap-[3px]"
            >
              {ph.qbox.map((c, i) => (
                <motion.span
                  key={i}
                  className="size-2 rounded-[2px]"
                  style={{ background: c }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.14 }}
                />
              ))}
            </span>
            <span
              className="font-mono text-[13px] leading-[1.3] font-medium"
              style={{ color: ph.qWarn ? C.load : C.muted }}
            >
              {ph.qText}
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <StatLabel>JS IS BEHIND BY</StatLabel>
          <dd
            className="m-0 font-mono text-lg leading-none font-semibold"
            style={{ color: ph.lagWarn ? C.load : C.bright }}
          >
            {ph.lag} ms
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <StatLabel>COST PER EVENT</StatLabel>
          <dd className="m-0 font-mono text-[12.5px] leading-[1.45] text-text-muted">
            {ph.cost}
          </dd>
        </div>
      </dl>
    </div>
  );
}
