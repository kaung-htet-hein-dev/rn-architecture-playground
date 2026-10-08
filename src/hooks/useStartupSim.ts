import { useEffect, useRef, useState } from "react";
import { useSettings } from "../app/SettingsProvider";
import { useSimClock } from "../sim/clock";
import {
  advanceStartup,
  nextBoundary,
  PLAN,
  startupCaption,
  startupStatus,
  STARTUP_IDLE,
  type StartupState
} from "../sim/startup";

/** Lazy module loads play this many times slower than their plan duration. */
export const LAZY_SLOWDOWN = 4;

export type LazyState = Record<string, "loading" | "ready">;

/** Clock plus the lazily-loaded module buttons for the startup comparison. */
export function useStartupSim() {
  const { reduced } = useSettings();
  const [lazy, setLazy] = useState<LazyState>({});
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clock = useSimClock<StartupState>(STARTUP_IDLE, {
    advance: (s, dt) => advanceStartup(s, dt, reduced)
  });
  const { t } = clock.state;
  const doneOld = t >= PLAN.oldEnd;

  const clearLazy = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLazy({});
  };

  const onPlay = () => {
    if (clock.running) return clock.pause();
    if (doneOld) clearLazy();
    clock.play((s) => (s.t >= PLAN.oldEnd ? STARTUP_IDLE : s));
  };
  const onStep = () => {
    const nb = nextBoundary(t);
    if (nb != null) {
      clock.pause();
      clock.set({ t: nb, acc: 0 });
    }
  };
  const onReset = () => {
    clearLazy();
    clock.reset();
  };
  const loadModule = (name: string, ms: number) => {
    if (lazy[name]) return;
    setLazy((l) => ({ ...l, [name]: "loading" }));
    const id = window.setTimeout(
      () => setLazy((l) => ({ ...l, [name]: "ready" })),
      reduced ? 0 : ms * LAZY_SLOWDOWN
    );
    timers.current.push(id);
  };

  return {
    t,
    reduced,
    lazy,
    status: startupStatus(t, clock.running),
    caption: startupCaption(t),
    doneOld,
    doneNew: t >= PLAN.newEnd,
    playLabel: clock.running ? "Pause" : doneOld ? "Replay" : t === 0 ? "Play" : "Resume",
    speed: clock.speed,
    setSpeed: clock.setSpeed,
    onPlay,
    onStep,
    onReset,
    loadModule
  };
}
