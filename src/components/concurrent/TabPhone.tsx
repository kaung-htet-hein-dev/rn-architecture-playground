import { C, alpha } from "../../sim/colors";
import { TABS, tabLabel, type Tap, type TabId } from "../../sim/concurrent";

interface Props {
  label: string;
  bar: TabId;
  content: TabId;
  /** a transition is rendering: the old screen is dimmed */
  pending: boolean;
  taps: Tap[];
  t: number;
  frame: string;
}

/** The finger's press shows for this long, whatever JS is doing. */
const PRESS_MS = 8;

/** 190×330 phone with a tab bar over a mock screen. */
export function TabPhone({ label, bar, content, pending, taps, t, frame }: Props) {
  const pressed = taps.find((tp) => t - tp.at < PRESS_MS)?.tab;
  return (
    <div
      role="img"
      aria-label={`${label} phone: ${tabLabel(bar)} tab selected, showing the ${tabLabel(content)} screen${pending ? ", next screen still rendering" : ""}`}
      className="box-border h-[330px] w-[190px] flex-none rounded-[28px] border-2 bg-phone-body p-2 transition-colors duration-250"
      style={{ borderColor: frame }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[20px] bg-panel">
        <div className="flex h-10 flex-none items-center border-b border-track bg-raised px-3.5">
          <span className="text-[13px] leading-none font-semibold text-text-bright">Trips</span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden p-2.5 transition-opacity duration-150" style={{ opacity: pending ? 0.4 : 1 }}>
          <Screen tab={content} />
        </div>
        <div aria-hidden className="grid flex-none grid-cols-3 border-t border-track bg-raised">
          {TABS.map(({ id, label: name }) => {
            const on = id === bar;
            return (
              <span
                key={id}
                className="relative flex h-11 items-center justify-center text-xs leading-none font-semibold"
                style={{ color: on ? C.bright : C.faint, background: pressed === id ? alpha(C.text, 14) : "transparent" }}
              >
                <span
                  className="absolute inset-x-3 top-0 h-[3px] rounded-b-full"
                  style={{ background: on ? C.brand : "transparent" }}
                />
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Screen({ tab }: { tab: TabId }) {
  if (tab === "photos")
    return (
      <div aria-hidden className="grid grid-cols-3 gap-1">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} className="aspect-square rounded-[3px]" style={{ background: i % 4 === 1 ? C.skeleton : C.raised }} />
        ))}
      </div>
    );
  if (tab === "map")
    return (
      <div aria-hidden className="relative h-full rounded-lg bg-raised">
        {[
          [22, 30],
          [60, 48],
          [38, 70]
        ].map(([x, y]) => (
          <span key={`${x}-${y}`} className="absolute size-2.5 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: C.ui }} />
        ))}
        <span className="absolute inset-x-[18%] top-[52%] h-px rotate-[-14deg]" style={{ background: C.skeleton }} />
      </div>
    );
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="flex h-11 flex-col justify-center gap-[5px] rounded-lg bg-raised px-2.5">
          <span className="h-1.5 w-3/5 rounded-full bg-skeleton" />
          <span className="h-1.5 w-2/5 rounded-full bg-track" />
        </span>
      ))}
    </div>
  );
}
