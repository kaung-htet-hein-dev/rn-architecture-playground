import { Link } from "react-router";
import { BrandMark, ModeToggle } from "../../components/ModeToggle";
import { C, type Mode } from "../../sim/colors";

interface Props {
  mode: Mode;
  compare: boolean;
  onCompare: () => void;
  onModeChange: () => void;
}

export function PlaygroundHeader({
  mode,
  compare,
  onCompare,
  onModeChange
}: Props) {
  return (
    <header className="flex min-h-[60px] flex-none flex-wrap items-center gap-4 border-b border-line bg-bg px-6 py-2">
      <Link
        to={"/?mode=" + mode}
        className="flex items-center gap-2.5 text-text-bright no-underline hover:text-white"
      >
        <BrandMark />
        <span className="text-sm leading-none font-semibold">
          React Native Internal
        </span>
      </Link>
      <span aria-hidden="true" className="h-4 w-px bg-line-strong" />
      <h1 className="m-0 text-sm leading-none font-medium text-text-dim">
        Playground
      </h1>
      <span className="flex-1" />
      <ModeToggle layoutId="pg-mode-pill" onChange={onModeChange} />
      <button
        type="button"
        aria-pressed={compare}
        onClick={onCompare}
        className="h-9 rounded-[7px] border px-3.5 text-[13px] leading-none font-semibold transition-colors duration-200"
        style={{
          borderColor: compare ? C.bright : C.lineStrong,
          background: compare ? C.bright : "transparent",
          color: compare ? C.bg : C.text
        }}
      >
        {compare ? "Comparing" : "Compare"}
      </button>
    </header>
  );
}
