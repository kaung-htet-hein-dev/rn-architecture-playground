import { useId } from "react";

interface Option<V extends string> {
  value: V;
  label: string;
}

interface Props<V extends string> {
  label: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (value: V) => void;
}

/** Labelled native select with a drawn chevron. */
export function Select<V extends string>({
  label,
  value,
  options,
  onChange
}: Props<V>) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-2.5">
      <span className="text-[13px] leading-none font-semibold text-text-muted">
        {label}
      </span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as V)}
          className="h-10 w-full appearance-none rounded-[7px] border border-line-strong bg-surface pl-2.5 pr-10 text-[13.5px] leading-none font-medium text-text-bright outline-none focus-visible:border-text-dim"
        >
          {options.map((o) => (
            <option
              key={o.value}
              value={o.value}
              className="bg-surface text-text-bright"
            >
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-text-bright"
          fill="none"
        >
          <path
            d="m2.5 5.5 5.5 5 5.5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </span>
    </label>
  );
}
