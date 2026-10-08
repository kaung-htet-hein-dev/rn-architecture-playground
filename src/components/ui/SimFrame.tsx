import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { SimStatus } from "../../sim/colors";
import { StateChip } from "../StateChip";

interface FrameProps {
  label: string;
  /** fade the panel in on mount (used when the mode swap remounts it) */
  fadeIn?: boolean;
  children: ReactNode;
}

/** Bordered panel shell shared by every simulation. */
export function SimFrame({ label, fadeIn, children }: FrameProps) {
  return (
    <motion.section
      aria-label={`Simulation: ${label}`}
      initial={fadeIn ? { opacity: 0.4 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-panel font-sans text-text"
    >
      {children}
    </motion.section>
  );
}

interface HeaderProps {
  status: SimStatus;
  accent: string;
  /** replaces the chip label, e.g. "overloaded · paused" */
  chipLabel?: string;
  title: string;
  titleClassName?: string;
  /** right-aligned readout, e.g. elapsed time */
  right?: ReactNode;
}

/** Status chip + title on the left, optional readout or controls on the right. */
export function SimHeader({
  status,
  accent,
  chipLabel,
  title,
  titleClassName = "font-mono text-xs leading-[1.2] font-medium text-text-dim",
  right
}: HeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <StateChip status={status} accent={accent} label={chipLabel} />
        <span className={titleClassName}>{title}</span>
      </div>
      {right}
    </div>
  );
}
