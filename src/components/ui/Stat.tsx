import type { ReactNode } from "react";

/** Small mono caption for a readout, used as a `<dt>`. */
export function StatLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <dt
      className={`font-mono text-[11px] leading-none font-medium tracking-[.08em] text-text-faint ${className}`}
    >
      {children}
    </dt>
  );
}
