import { useMemo } from "react";
import { useSimClock } from "../sim/clock";
import type { Mode, SimStatus } from "../sim/colors";
import { buildRace, caption, phoneAt, SLOWDOWN } from "../sim/concurrent";

/** Plays back the precomputed two-phone race for chapter 7. */
export function useConcurrentSim(mode: Mode) {
  const race = useMemo(() => buildRace(mode === "new"), [mode]);
  const clock = useSimClock<number>(0, {
    advance: (t, dt) => {
      const next = t + dt / SLOWDOWN;
      return next >= race.end ? { state: race.end, stop: true } : { state: next };
    }
  });
  const { state: t, running } = clock;
  const done = t >= race.end;
  const status: SimStatus = running ? "running" : t === 0 ? "idle" : done ? "complete" : "paused";

  return {
    race,
    t,
    left: phoneAt(race.left, t),
    right: phoneAt(race.right, t),
    status,
    caption: caption(race, t),
    playLabel: running ? "Pause" : t === 0 ? "Play" : done ? "Replay" : "Resume",
    done,
    started: t > 0,
    speed: clock.speed,
    setSpeed: clock.setSpeed,
    onPlay: () => {
      if (running) return clock.pause();
      clock.play(done ? () => 0 : undefined);
    },
    /** jump to the next moment worth reading about */
    onStep: () => {
      clock.pause();
      clock.set((now) => race.stops.find((x) => x > now) ?? race.end);
    },
    onReset: () => clock.reset(0)
  };
}
