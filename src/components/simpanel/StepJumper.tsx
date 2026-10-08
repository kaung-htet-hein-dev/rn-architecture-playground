import { segFill, type StepState } from "../../sim/panel";

interface Props {
  count: number;
  state: StepState;
  accent: string;
  onJump: (i: number) => void;
}

/** One segment per step; click to play from that step. */
export function StepJumper({ count, state, accent, onJump }: Props) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Jump to step">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          title={`Step ${i + 1}`}
          aria-label={`Play step ${i + 1}`}
          aria-current={i === state.step ? "step" : undefined}
          onClick={() => onJump(i)}
          className="h-2 w-5 rounded-[3px] border-0 p-0 transition-[background,transform] duration-200 hover:scale-y-150"
          style={{ background: segFill(i, state, accent) }}
        />
      ))}
    </div>
  );
}
