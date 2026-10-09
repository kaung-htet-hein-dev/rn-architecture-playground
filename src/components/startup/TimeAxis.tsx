import { AXIS_MS } from "../../sim/startup";

const TICKS = [0, 0.25, 0.5, 0.75, 1].map((f) => f * AXIS_MS);

export function TimeAxis() {
  return (
    <div className="relative mx-0.5 h-3.5" aria-hidden="true">
      {TICKS.map((v) => (
        <span
          key={v}
          className="absolute -translate-x-1/2 font-mono text-xs leading-none whitespace-nowrap text-text-faint"
          style={{ left: `${(v / AXIS_MS) * 100}%` }}
        >
          {v}
          {v === AXIS_MS ? " ms" : ""}
        </span>
      ))}
    </div>
  );
}
