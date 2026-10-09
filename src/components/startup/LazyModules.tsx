import { AnimatePresence, motion } from "motion/react";
import { C, alpha } from "../../sim/colors";
import { PLAN } from "../../sim/startup";
import { LAZY_SLOWDOWN, type LazyState } from "../../hooks/useStartupSim";

interface Props {
  show: boolean;
  lazy: LazyState;
  reduced: boolean;
  onLoad: (name: string, ms: number) => void;
}

/** Modules the New Architecture left unloaded; tap one to load it on first use. */
export function LazyModules({ show, lazy, reduced, onLoad }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-2 overflow-hidden pt-1"
        >
          <span className="text-[13px] leading-[1.4] text-text-dim">
            Not loaded yet. Tap one to use it from JS:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PLAN.lazy.map(([n, d], i) => {
              const ls = lazy[n];
              return (
                <motion.button
                  key={n}
                  type="button"
                  onClick={() => onLoad(n, d)}
                  aria-disabled={!!ls}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={ls ? undefined : { scale: 0.95 }}
                  className="relative h-[30px] overflow-hidden rounded-[6px] border px-2.5 font-mono text-xs leading-none font-medium"
                  style={{
                    borderColor: ls ? C.new : C.lineStrong,
                    background: ls === "ready" ? alpha(C.new, 12) : "transparent",
                    color: ls ? C.new : C.muted
                  }}
                >
                  {ls === "loading" && !reduced && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 bg-new/12"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: (d * LAZY_SLOWDOWN) / 1000, ease: "linear" }}
                    />
                  )}
                  <span className="relative">
                    {ls === "ready"
                      ? n + " · ready"
                      : ls === "loading"
                        ? n + " · loading " + d + " ms"
                        : n}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
