import { useSettings } from "../app/SettingsProvider";
import { useConcurrentSim } from "../hooks/useConcurrentSim";
import { accentOf, C, type Mode } from "../sim/colors";
import { CODE, mapWait, type Phone, type Strategy } from "../sim/concurrent";
import { tokenize, TOK_COLOR } from "../sim/syntax";
import { JsTimeline } from "./concurrent/JsTimeline";
import { TabPhone } from "./concurrent/TabPhone";
import { MentorCaption } from "./MentorCaption";
import { SimControls } from "./SimControls";
import { StatLabel } from "./ui/Stat";
import { SimFrame, SimHeader } from "./ui/SimFrame";

/**
 * Chapter 7: two phones, the same two taps, one line of code different.
 * Switching mode remounts the inner sim, which resets it to idle.
 */
export function ConcurrentSim() {
  const { mode } = useSettings();
  return <ConcurrentSimInner key={mode} mode={mode} />;
}

const SIDES: { strategy: Strategy; title: string; lane: string }[] = [
  { strategy: "setState", title: "Without startTransition", lane: "setState" },
  { strategy: "transition", title: "With startTransition", lane: "startTransition" }
];

function ConcurrentSimInner({ mode }: { mode: Mode }) {
  const sim = useConcurrentSim(mode);
  const { caption: cap } = sim;
  const acc = accentOf(mode);
  const phones = [sim.left, sim.right];

  return (
    <SimFrame label="same two taps, one line of code different" fadeIn>
      <SimHeader
        status={sim.status}
        accent={acc}
        title="same two taps, one line of code different"
        right={
          <span className="font-mono text-xs leading-none whitespace-nowrap text-text-faint tabular-nums">
            t = {Math.floor(sim.t)} ms
          </span>
        }
      />

      <div className="grid grid-cols-2 divide-x divide-line-soft">
        {SIDES.map((side, i) => (
          <PhoneSide
            key={side.strategy}
            title={side.title}
            code={CODE[side.strategy]}
            note={mode === "old" ? (side.strategy === "transition" ? "Old architecture: no effect, renders like setState." : "") : undefined}
            phone={phones[i]}
          />
        ))}
      </div>

      <div className="border-t border-line-soft">
        <JsTimeline
          lanes={SIDES.map((side, i) => ({ name: side.lane, blocks: phones[i].blocks }))}
          t={sim.t}
          end={sim.race.end}
        />
      </div>

      <MentorCaption accent={cap.warn ? C.load : acc} text={cap.text} id={cap.kind} />
      <SimControls
        label="Concurrent rendering"
        playLabel={sim.playLabel}
        onPlay={sim.onPlay}
        onStep={sim.onStep}
        stepLabel="Next step"
        stepDisabled={sim.done}
        speed={sim.speed}
        onSpeed={sim.setSpeed}
        onReset={sim.onReset}
        started={sim.started}
      />
    </SimFrame>
  );
}

function PhoneSide({ title, code, note, phone }: { title: string; code: string[]; note?: string; phone: Phone }) {
  const wait = mapWait(phone);
  return (
    <div className="flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-col gap-2.5">
        <span className="text-[15px] leading-none font-semibold text-text-bright">{title}</span>
        <pre className="m-0 min-h-[106px] rounded-[6px] bg-code-bg px-3.5 py-2.5 font-mono text-[13px] leading-[1.6]">
          {code.map((line, i) => (
            <div key={i}>
              {tokenize(line).map((tk, j) => (
                <span key={j} style={{ color: TOK_COLOR[tk.k] }}>
                  {tk.t}
                </span>
              ))}
            </div>
          ))}
        </pre>
        {note != null && <span className="min-h-[18px] text-[13px] leading-[1.4] text-old">{note}</span>}
      </div>
      <div className="flex items-start gap-5">
        <TabPhone
          label={title}
          bar={phone.shown.bar}
          content={phone.shown.content}
          pending={phone.transition != null}
          taps={phone.taps}
          t={phone.t}
          frame={C.lineStrong}
        />
        <dl className="m-0 flex min-w-0 flex-col gap-5 pt-2 tabular-nums">
          <div className="flex flex-col gap-1.5">
            <StatLabel>{wait && !wait.done ? "Map tap waiting for" : "Map tab lit up after"}</StatLabel>
            <dd className="m-0 flex flex-col gap-1">
              <span
                className="font-mono text-[28px] leading-none font-semibold"
                style={{ color: !wait ? C.faint : wait.done ? (wait.ms > 50 ? C.load : C.okText) : C.load }}
              >
                {!wait ? "–" : `${wait.ms} ms`}
              </span>
              <span className="text-xs leading-[1.4] text-text-dim">
                {!wait ? "after you tap Map" : wait.done ? "from the tap" : wait.handling ? "JS is rendering Map" : "JS is busy with Photos"}
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <StatLabel>Work thrown away</StatLabel>
            <dd className="m-0 font-mono text-lg leading-none font-semibold text-text-bright">{phone.thrownMs} ms</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
