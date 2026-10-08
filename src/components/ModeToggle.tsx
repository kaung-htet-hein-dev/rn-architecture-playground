import { motion } from "motion/react";
import { useSettings } from "../app/SettingsProvider";
import type { Mode } from "../sim/colors";

const STYLE: Record<Mode, { bg: string; fg: string }> = {
  old: { bg: "#f2b35b", fg: "#1a1408" },
  new: { bg: "#5fd3e6", fg: "#071a1e" }
};

/** Old / New segmented toggle with a sliding pill. */
export function ModeToggle({
  layoutId = "mode-pill",
  onChange
}: {
  layoutId?: string;
  onChange?: (m: Mode) => void;
}) {
  const { mode, setMode } = useSettings();
  return (
    <div
      role="group"
      aria-label="Architecture"
      className="flex gap-0.5 rounded-[7px] border border-line-strong p-0.5"
    >
      {(["old", "new"] as const).map((m) => {
        const on = mode === m;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => {
              setMode(m);
              if (m !== mode) onChange?.(m);
            }}
            className="relative h-[30px] rounded-[5px] px-2 text-[12.5px] leading-none font-semibold transition-colors duration-200 sm:px-3"
            style={{ color: on ? STYLE[m].fg : "#b1b9c3" }}
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[5px]"
                style={{ background: STYLE[m].bg }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{m === "old" ? "Old" : "New"}</span>
          </button>
        );
      })}
    </div>
  );
}

export function BrandMark() {
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      <span className="h-4 w-1.5 rounded-[2px] bg-old" />
      <span className="h-4 w-1.5 rounded-[2px] bg-new" />
    </span>
  );
}
