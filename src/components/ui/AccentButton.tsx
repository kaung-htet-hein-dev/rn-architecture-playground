import type { ReactNode } from "react";
import { motion } from "motion/react";

interface Props {
  accent: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

/** Primary transport button: accent outline and tint, press-down on tap. Callers set size and radius. */
export function AccentButton({ accent, onClick, children, className = "" }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`border text-[13px] leading-none font-semibold transition-colors duration-250 ${className}`}
      style={{ borderColor: accent, background: accent + "14", color: accent }}
    >
      {children}
    </motion.button>
  );
}
