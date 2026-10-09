import { useId } from "react";

interface Props {
  value: number;
  /** ms of JS work per scroll event at this load */
  work: number;
  color: string;
  onChange: (load: number) => void;
}

export function JsLoadSlider({ value, work, color, onChange }: Props) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex min-w-[220px] flex-[1_1_260px] items-center gap-3 ml-2"
    >
      <span className="font-mono text-xs leading-none font-medium whitespace-nowrap text-text-dim">
        JS load
      </span>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        aria-valuetext={`${work.toFixed(1)} ms work per event`}
        onChange={(e) => onChange(+e.target.value)}
        className="min-w-0 flex-1"
        style={{ accentColor: color }}
      />
      <span
        className="w-24 text-right font-mono text-xs leading-none font-semibold tabular-nums"
        style={{ color }}
      >
        {work.toFixed(1)} ms work
      </span>
    </label>
  );
}
