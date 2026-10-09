import type { ReactNode } from "react";

/** Small mono caption for a readout, used as a `<dt>`. */
export function StatLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <dt
      className={`text-[13px] leading-none font-medium text-text-faint ${className}`}
    >
      {children}
    </dt>
  );
}
