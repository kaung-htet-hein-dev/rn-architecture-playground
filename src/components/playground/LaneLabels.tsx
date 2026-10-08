import { LANE_H, type LaneReadout } from "../../sim/playground";

/** Left column of a lane group: lane names with live readouts. */
export function LaneLabels({ lanes }: { lanes: LaneReadout[] }) {
  return (
    <div className="flex flex-col">
      {lanes.map((ln) => (
        <div
          key={ln.name}
          className="box-border flex min-w-0 flex-col justify-center gap-1.5 border-b border-line-soft"
          style={{ height: LANE_H }}
        >
          <span className="flex items-center gap-2 text-[13px] leading-none font-semibold text-text-bright">
            <span
              className="size-2 rounded-[2px]"
              style={{ background: ln.color }}
            />
            {ln.name}
          </span>
          {ln.bar != null ? (
            <div className="flex items-center gap-1.5">
              <div
                className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-line"
                role="meter"
                aria-label="UI frame budget"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ln.bar)}
                aria-valuetext={ln.text}
              >
                <div
                  className="h-full"
                  style={{ width: ln.bar + "%", background: ln.textColor }}
                />
              </div>
              <span
                className="font-mono text-[11px] leading-none font-medium whitespace-nowrap"
                style={{ color: ln.textColor }}
              >
                {ln.text}
              </span>
            </div>
          ) : (
            <span
              className="truncate font-mono text-[11.5px] leading-[1.1] whitespace-nowrap"
              style={{ color: ln.textColor }}
            >
              {ln.text}
            </span>
          )}
        </div>
      ))}
      <div className="flex h-[22px] items-center font-mono text-[11px] leading-none text-text-faint">
        frames · 16.6 ms
      </div>
    </div>
  );
}
