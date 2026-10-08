import { useSettings } from "../app/SettingsProvider";
import { useSimClock } from "../sim/clock";
import {
  advance,
  caption as captionOf,
  initialRace,
  isComplete,
  loadColor,
  playFrom,
  playLabel,
  raceStatus,
  sideView,
  tick,
  withLoad,
  workOf,
  type RaceState
} from "../sim/scrollRace";

/** Clock and derived views for the two-phone scroll race. */
export function useScrollRace() {
  const { reduced } = useSettings();
  const clock = useSimClock<RaceState>(() => initialRace(), { advance: tick });
  const { state: s, running } = clock;
  const opts = { reduced, running };

  return {
    state: s,
    reduced,
    status: raceStatus(s, running),
    caption: captionOf(s),
    phones: [sideView(s, "o", opts), sideView(s, "n", opts)],
    complete: isComplete(s),
    work: workOf(s.load),
    loadColor: loadColor(s.load),
    playLabel: playLabel(s, running),
    speed: clock.speed,
    setSpeed: clock.setSpeed,
    onPlay: () => {
      if (running) return clock.pause();
      clock.play(playFrom);
    },
    onStep: () => {
      clock.pause();
      clock.set(advance);
    },
    onReset: () => clock.reset(initialRace(s.load)),
    onLoad: (load: number) => clock.set((st) => withLoad(st, load))
  };
}
