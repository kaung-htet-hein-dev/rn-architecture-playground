import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "../../app/SettingsProvider";

/** Content that switches in place with the Old/New toggle. */
export function ModeSwap({ old, next }: { old: ReactNode; next: ReactNode }) {
  const { mode } = useSettings();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        {mode === "new" ? next : old}
      </motion.div>
    </AnimatePresence>
  );
}
