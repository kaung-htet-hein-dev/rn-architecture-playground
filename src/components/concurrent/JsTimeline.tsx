import { C, HATCH, alpha } from "../../sim/colors";
import { SCRIPT, tabLabel, type Block } from "../../sim/concurrent";
import { Swatch } from "../ui/Swatch";

interface Lane {
  name: string;
  blocks: Block[];
}

interface Props {
  lanes: Lane[];
  t: number;
  end: number;
}

/** Dark edge between slices so each 5 ms piece reads on its own. */
const SLICE_EDGE = `inset -1px 0 0 ${C.panel}`;
const TICK_MS = 50;

const LEGEND: [string, string][] = [
  [C.js, "Must finish once started"],
  [C.new, "startTransition: React can pause or drop it"]
];

/** What each phone's JS thread did, on one shared time axis, with the two taps marked across both. */
export function JsTimeline({ lanes, t, end }: Props) {
  const pct = (ms: number) => `${(ms / end) * 100}%`;
  const ticks = Array.from({ length: Math.floor(end / TICK_MS) + 1 }, (_, i) => i * TICK_MS);

  return (
    <div className="flex flex-col gap-3 px-6 pt-5 pb-4">
      <span className="text-[13px] leading-none font-semibold text-text">What each JS thread is doing</span>
      <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3">
        <span />
        <div className="relative h-5">
          {SCRIPT.map((d) => (
            <span
              key={d.at}
              className="absolute bottom-1 -translate-x-1/2 text-xs leading-none font-semibold whitespace-nowrap transition-opacity"
              style={{ left: pct(d.at), color: C.bright, opacity: t >= d.at ? 1 : 0.35 }}
            >
              tap {tabLabel(d.tab)}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {lanes.map((ln) => (
            <span key={ln.name} className="flex h-10 items-center font-mono text-xs leading-none text-text-dim">
              {ln.name}
            </span>
          ))}
        </div>
        <div className="relative flex flex-col gap-2">
          {lanes.map((ln) => (
            <LaneTrack key={ln.name} blocks={ln.blocks} t={t} pct={pct} />
          ))}
          {SCRIPT.map((d) => (
            <span
              key={d.at}
              aria-hidden
              className="absolute -top-1 -bottom-1 w-0 border-l border-dashed"
              style={{ left: pct(d.at), borderColor: alpha(C.bright, t >= d.at ? 60 : 20) }}
            />
          ))}
          <span aria-hidden className="absolute -top-1 -bottom-1 w-0.5 rounded-full" style={{ left: pct(t), background: C.bright }} />
        </div>

        <span />
        <div className="relative mt-1.5 h-3.5">
          {ticks.map((x) => (
            <span
              key={x}
              className="absolute top-0 -translate-x-1/2 font-mono text-[11px] leading-none text-text-faint tabular-nums"
              style={{ left: pct(x) }}
            >
              {x} ms
            </span>
          ))}
        </div>
      </div>

      <ul aria-label="Timeline legend" className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 pl-[132px] text-xs leading-none text-text-dim">
        {LEGEND.map(([c, label]) => (
          <li key={label} className="flex items-center gap-2">
            <Swatch color={c} className="h-2.5 w-4" />
            {label}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-4 rounded-[2px]" style={{ background: HATCH }} />
          Thrown away
        </li>
      </ul>
    </div>
  );
}

function LaneTrack({ blocks, t, pct }: { blocks: Block[]; t: number; pct: (ms: number) => string }) {
  const shown = blocks.filter((b) => b.kind !== "commit" && b.start < t);
  // one label per render: a whole urgent block, or every slice of one transition
  const groups = new Map<string, { start: number; end: number; text: string; dropped?: boolean }>();
  for (const b of shown) {
    const key = b.work != null ? `w${b.work}` : `b${b.id}`;
    const end = Math.min(b.end, t);
    const g = groups.get(key);
    if (g) g.end = end;
    else
      groups.set(key, {
        start: b.start,
        end,
        text: b.kind === "bar" ? "" : tabLabel(b.tab),
        dropped: b.dropped
      });
  }

  return (
    <div className="relative h-10 overflow-hidden rounded-lg border border-line-soft bg-surface">
      {shown.map((b) => (
        <span
          key={b.id}
          className="absolute inset-y-1.5 rounded-[2px]"
          style={{
            left: pct(b.start),
            width: `max(2px, ${pct(Math.min(b.end, t) - b.start)})`,
            background: b.dropped ? HATCH : b.kind === "slice" ? C.new : C.js,
            boxShadow: b.kind === "slice" ? SLICE_EDGE : undefined
          }}
        />
      ))}
      {[...groups.values()].map(
        (g) =>
          g.text && (
            <span
              key={g.start}
              className="pointer-events-none absolute inset-y-1.5 flex items-center overflow-hidden px-1.5 text-xs leading-none font-semibold whitespace-nowrap"
              style={{ left: pct(g.start), width: pct(g.end - g.start), color: g.dropped ? C.bright : C.bg }}
            >
              {g.dropped ? `${g.text}, thrown away` : g.text}
            </span>
          )
      )}
    </div>
  );
}
