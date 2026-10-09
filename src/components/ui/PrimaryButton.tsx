import type { ReactNode } from "react";
import { motion } from "motion/react";

interface Props {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

/** Primary transport button (Play / Pause): reactnative.dev button color in both modes. Callers set size. */
export function PrimaryButton({ onClick, children, className = "" }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`btn-primary justify-center border-0 text-[13px] leading-none ${className}`}
    >
      {children}
    </motion.button>
  );
}
