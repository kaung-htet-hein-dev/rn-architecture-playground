import type { KeyboardEvent } from "react";
import { motion } from "motion/react";
import { C } from "../../sim/colors";
import type { PlaygroundTab } from "../../sim/playground";

const TAB_LIST: [PlaygroundTab, string][] = [
  ["code", "Code"],
  ["threads", "Threads"],
  ["inspect", "Inspect"]
];

interface Props {
  tab: PlaygroundTab;
  accent: string;
  onTab: (t: PlaygroundTab) => void;
}

/** Arrow/Home/End move selection and focus between tabs. */
function moveTab(e: KeyboardEvent<HTMLButtonElement>, from: PlaygroundTab, onTab: (t: PlaygroundTab) => void) {
  const i = TAB_LIST.findIndex(([k]) => k === from);
  const to =
    e.key === "ArrowRight" ? (i + 1) % TAB_LIST.length
    : e.key === "ArrowLeft" ? (i + TAB_LIST.length - 1) % TAB_LIST.length
    : e.key === "Home" ? 0
    : e.key === "End" ? TAB_LIST.length - 1
    : -1;
  if (to < 0) return;
  e.preventDefault();
  const next = TAB_LIST[to][0];
  onTab(next);
  document.getElementById("pg-tab-" + next)?.focus();
}

/** Mobile-only switcher between the three playground panels. */
export function PanelTabs({ tab, accent, onTab }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Panels"
      className="flex flex-none border-b border-line"
    >
      {TAB_LIST.map(([k, t]) => {
        const on = tab === k;
        return (
          <button
            key={k}
            type="button"
            role="tab"
            id={"pg-tab-" + k}
            aria-selected={on}
            aria-controls={on ? "pg-panel-" + k : undefined}
            onClick={() => onTab(k)}
            onKeyDown={(e) => moveTab(e, k, onTab)}
            tabIndex={on ? 0 : -1}
            className="relative h-11 flex-1 border-0 bg-transparent text-[13px] leading-none font-semibold transition-colors"
            style={{ color: on ? C.bright : C.dim }}
          >
            {t}
            {on && (
              <motion.span
                layoutId="pg-tab-underline"
                className="absolute right-0 bottom-0 left-0 h-0.5"
                style={{ background: accent }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
