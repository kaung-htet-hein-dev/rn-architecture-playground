import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "../../app/SettingsProvider";
import { NEW_MAP, OLD_MAP } from "../../content/wrapup";

export function MapCards() {
  const { mode } = useSettings();
  const isNew = mode === "new";
  const cards = isNew ? NEW_MAP : OLD_MAP;
  return (
    <div className="flex flex-col gap-5">
      <h3 className="h3">
        {isNew ? "The new map" : "The old map, for comparison"}
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial="hidden"
          animate="show"
          exit="exit"
          className="flex flex-col gap-5"
        >
          <motion.div
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] items-stretch gap-3"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          >
            {cards.map((m) => (
              <motion.div
                key={m.name}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } }
                }}
                className="flex flex-col gap-2 rounded-[10px] border p-4"
                style={{ borderColor: m.bd, background: m.bg }}
              >
                <span
                  className="text-sm leading-none font-semibold"
                  style={{ color: m.c }}
                >
                  {m.name}
                </span>
                <span
                  className={
                    m.mono
                      ? "font-mono text-[13px] leading-normal text-text-muted"
                      : "text-sm leading-normal text-text-muted"
                  }
                >
                  {m.body}
                </span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            className="rounded-lg border border-dashed border-line-strong px-3.5 py-3 font-mono text-[13px] leading-normal text-text-dim"
          >
            {isNew
              ? "Build time · Codegen reads your TypeScript specs and generates the C++ interfaces both sides must match."
              : "Switch to New in the top bar to see what replaced each part."}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
