import { useEffect, useRef } from "react";

interface Handlers {
  play: () => void;
  stepFwd: () => void;
  stepBack: () => void;
}

/** True when the focused control should keep the key for itself. */
function keyBelongsToControl(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  // A focused tab owns the arrow keys (PanelTabs moves between tabs).
  if (el?.getAttribute("role") === "tab") return e.key !== " ";
  if (!el || !/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(el.tagName)) {
    return false;
  }
  // Space/Enter belong to the focused control; arrows to inputs and selects.
  return e.key === " " || el.tagName !== "BUTTON";
}

/** Global shortcuts: ←/→ step, Space play/pause. */
export function usePlaygroundKeys(handlers: Handlers) {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (keyBelongsToControl(e)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        latest.current.stepFwd();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        latest.current.stepBack();
      } else if (e.key === " ") {
        e.preventDefault();
        latest.current.play();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
