import { useState } from "react";
import { useSettings } from "../../app/SettingsProvider";
import { useSimClock } from "../../sim/clock";
import { C, type Mode } from "../../sim/colors";
import {
  advancePlayback,
  captionOf,
  DEFAULT_RATE,
  gen,
  inspectorFor,
  isOverloaded,
  metricRows,
  moduleRows,
  nextPoint,
  paramsFor,
  parsePlaygroundSearch,
  pickMessage,
  PLAYBACK_IDLE,
  presetById,
  prevPoint,
  stateAt,
  statusOf,
  stepPoints,
  treeViews,
  type Params,
  type Playback,
  type PlaygroundTab,
  type PresetId,
  type Trace
} from "../../sim/playground";
import { usePlaygroundKeys } from "./usePlaygroundKeys";
import { usePlaygroundUrlSync } from "./usePlaygroundUrlSync";

function buildTraces(
  preset: PresetId,
  edits: Params | undefined,
  mode: Mode,
  compare: boolean,
  rate: number
): Trace[] {
  const P = paramsFor(preset, edits);
  return compare
    ? [gen(preset, "old", P, rate), gen(preset, "new", P, rate)]
    : [gen(preset, mode, P, rate)];
}

const maxTotal = (ts: Trace[]) => Math.max(...ts.map((t) => t.total));

interface Selection {
  g: number;
  i: number;
}

/**
 * Playground state: scenario, edits, traces, clock and everything derived from
 * the playhead. The page only lays this out.
 */
export function usePlayground() {
  const { mode, reduced, accent } = useSettings();

  const [boot] = useState(() => parsePlaygroundSearch(window.location.search));
  const [preset, setPreset] = useState<PresetId>(boot.preset ?? "tap");
  const [compare, setCompare] = useState(!!boot.compare);
  const [rate, setRate] = useState(boot.rate ?? DEFAULT_RATE);
  const [tab, setTab] = useState<PlaygroundTab>(boot.tab ?? "threads");
  const [edits, setEdits] = useState<Partial<Record<PresetId, Params>>>({});
  const [sel, setSel] = useState<Selection | null>(null);

  const pr = presetById(preset);
  const presetEdits = edits[preset];
  const P = paramsFor(preset, presetEdits);
  const traces = buildTraces(preset, presetEdits, mode, compare, rate);
  const T = maxTotal(traces);
  const points = stepPoints(traces);

  const clock = useSimClock<Playback>(
    () => {
      if (boot.at == null) return PLAYBACK_IDLE;
      const t0 = maxTotal(
        buildTraces(
          boot.preset ?? "tap",
          undefined,
          mode,
          !!boot.compare,
          boot.rate ?? DEFAULT_RATE
        )
      );
      return { c: t0 * boot.at, started: boot.at > 0, racc: 0 };
    },
    {
      advance: (s, dt) => advancePlayback(s, dt, { total: T, points, reduced })
    }
  );
  const { running } = clock;
  const c = Math.min(clock.state.c, T);
  const started = clock.state.started;

  const primary = compare ? traces[mode === "new" ? 1 : 0] : traces[0];
  const snaps = traces.map((tr) => stateAt(tr, c));
  const A = snaps[traces.indexOf(primary)];
  const complete = c >= T - 0.01;

  /* ── actions ── */
  const resetIdle = () => {
    clock.reset(PLAYBACK_IDLE);
    setSel(null);
  };
  const play = () => {
    if (running) return clock.pause();
    setSel(null);
    clock.play((s) => ({
      c: s.c >= T ? 0 : Math.min(s.c, T),
      started: true,
      racc: 0
    }));
  };
  const restart = () => {
    setSel(null);
    clock.play(() => ({ c: 0, started: true, racc: 0 }));
  };
  const seek = (to: (s: Playback) => Playback) => {
    clock.pause();
    setSel(null);
    clock.set(to);
  };
  const stepFwd = () =>
    seek((s) => ({
      c: nextPoint(points, Math.min(s.c, T), T),
      started: true,
      racc: 0
    }));
  const stepBack = () =>
    seek((s) => ({ ...s, c: prevPoint(points, Math.min(s.c, T)), racc: 0 }));
  const scrub = (v: number) =>
    seek(() => ({ c: (v / 1000) * T, started: true, racc: 0 }));

  const changePreset = (next: PresetId) => {
    clock.reset(PLAYBACK_IDLE);
    setSel(null);
    setPreset(next);
  };
  const toggleCompare = () => {
    setCompare(!compare);
    setSel(null);
  };
  const changeParam = (k: string, v: string) => {
    setEdits((e) => ({ ...e, [preset]: { ...(e[preset] ?? {}), [k]: v } }));
    setSel(null);
  };
  const changeRate = (r: number) => {
    setRate(r);
    setSel(null);
  };
  const pickMessageAt = (g: number, i: number) => setSel({ g, i });

  usePlaygroundKeys({ play, stepFwd, stepBack });
  usePlaygroundUrlSync({
    preset,
    compare,
    rate,
    at: !running && started && c > 0 ? c / T : null,
    tab
  });

  /* ── derived view data ── */
  const status = statusOf({ snap: A, started, running, c, total: T });
  const entries = traces.map((tr, i) => ({ tr, snap: snaps[i] }));
  const heads = compare
    ? [
        { t: "OLD", c: C.old },
        { t: "NEW", c: C.new }
      ]
    : [{ t: mode === "new" ? "NEW" : "OLD", c: accent }];
  const selMsg = sel ? (traces[sel.g]?.messages[sel.i] ?? null) : null;
  const msg = pickMessage(primary, c, selMsg);
  const inspKey = !msg
    ? "none"
    : sel && selMsg
      ? `s${sel.g}-${sel.i}`
      : `${primary.mode}-${primary.messages.indexOf(msg)}`;

  return {
    mode,
    accent,
    preset,
    pr,
    P,
    compare,
    rate,
    tab,
    setTab,
    sel,
    traces,
    snaps,
    c,
    T,
    started,
    running,
    speed: clock.speed,
    setSpeed: clock.setSpeed,
    live: A.live,
    ui: A.ui,
    activeLine: A.ln,
    status,
    playLabel: running
      ? "Pause"
      : complete
        ? "Replay"
        : started
          ? "Resume"
          : "Play",
    caption: captionOf(pr, A, started, c),
    captionColor: isOverloaded(A) && started ? C.load : accent,
    heads,
    metrics: metricRows(entries, primary, c),
    insp: msg ? inspectorFor(msg) : null,
    inspKey,
    mods: moduleRows(pr, primary, c),
    trees: treeViews(pr, primary, c, T),
    actions: {
      resetIdle,
      play,
      restart,
      stepFwd,
      stepBack,
      scrub,
      changePreset,
      toggleCompare,
      changeParam,
      changeRate,
      pickMessage: pickMessageAt
    }
  };
}
