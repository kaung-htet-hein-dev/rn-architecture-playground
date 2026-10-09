import { motion } from "motion/react";
import { useSettings } from "../app/SettingsProvider";
import { C, type Mode } from "../sim/colors";

/** Old / New segmented toggle; the selected pill uses the reactnative.dev button color in both modes. */
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
            className={`relative h-[30px] rounded-[5px] px-3 text-[13px] leading-none font-semibold transition-colors duration-200 ${on ? "text-button-text" : "text-text-dim hover:text-text"}`}
          >
            {on && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[5px] bg-button"
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
    <span
      className="flex size-5 items-center justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-full" fill="none">
        <g style={{ stroke: C.logo }} strokeWidth="1.7">
          <ellipse cx="16" cy="16" rx="14" ry="5.5" />
          <ellipse
            cx="16"
            cy="16"
            rx="14"
            ry="5.5"
            transform="rotate(60 16 16)"
          />
          <ellipse
            cx="16"
            cy="16"
            rx="14"
            ry="5.5"
            transform="rotate(120 16 16)"
          />
        </g>
        <circle cx="16" cy="16" r="2.2" style={{ fill: C.logo }} />
      </svg>
    </span>
  );
}
