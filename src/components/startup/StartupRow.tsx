import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { C } from "../../sim/colors";
import { AXIS_MS, type Seg } from "../../sim/startup";
import { Swatch } from "../ui/Swatch";
import { SegBar } from "./SegBar";

export interface StartupRowData {
  key: string;
  name: string;
  /** row accent */
  c: string;
  /** border color: highlighted when this row matches the active mode */
  bd: string;
  segs: Seg[];
  /** ms at which the first screen is usable */
  end: number;
  done: boolean;
  legend: [string, string][];
}

interface Props {
  row: StartupRowData;
  /** playhead, ms */
  t: number;
  children?: ReactNode;
}

/** One architecture's startup bar with its legend; `children` renders below it. */
export function StartupRow({ row: r, t, children }: Props) {
  const playhead = Math.min(100, (t / AXIS_MS) * 100);
  return (
    <div
      className="flex flex-col gap-2.5 rounded-[10px] border bg-surface p-3.5 transition-[border-color] duration-250"
      style={{ borderColor: r.bd }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span
          className="flex items-center gap-2 text-sm leading-[1.2] font-semibold"
          style={{ color: r.c }}
        >
          <Swatch color={r.c} />
          {r.name}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={r.done ? "done" : "go"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="font-mono text-[13px] leading-none font-medium"
            style={{ color: r.done ? r.c : C.faint }}
          >
            {r.done ? `interactive at ${r.end} ms` : "starting…"}
          </motion.span>
        </AnimatePresence>
      </div>
      <div
        className="relative h-[30px] rounded-[5px] bg-bg"
        role="img"
        aria-label={`${r.name}: ready to use at ${r.end} ms`}
      >
        {r.segs.map((x) => (
          <SegBar key={x.name} x={x} t={t} />
        ))}
        {r.done && (
          <motion.div
            className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-text-bright"
            style={{ left: `${(r.end / AXIS_MS) * 100}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
          />
        )}
        <div
          className="absolute -top-1 -bottom-1 w-px bg-text-dim opacity-70"
          style={{ left: `${playhead}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-3.5 font-mono text-xs leading-[1.4] text-text-dim">
        {r.legend.map(([c, txt]) => (
          <span key={txt} className="flex items-center gap-1.5">
            <Swatch color={c} />
            {txt}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}
