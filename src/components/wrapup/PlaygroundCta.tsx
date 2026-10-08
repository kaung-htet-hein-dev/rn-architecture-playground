import { Link } from "react-router";
import { useSettings } from "../../app/SettingsProvider";

export function PlaygroundCta() {
  const { mode } = useSettings();
  return (
    <div className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-xl border border-line-strong bg-surface p-7">
      <div className="relative flex flex-col gap-1.5">
        <span className="text-xl leading-[1.3] font-semibold text-text-bright">
          Now try it yourself
        </span>
        <span className="text-[15px] leading-normal text-text-muted">
          Seven scenarios to run in either architecture. Pause on any step and
          look inside.
        </span>
      </div>
      <Link
        to={`/playground?mode=${mode}`}
        className="relative flex h-[42px] items-center rounded-lg bg-text px-[18px] text-sm leading-none font-semibold text-bg no-underline transition-transform hover:text-bg active:scale-[.97]"
      >
        Open the Playground
      </Link>
    </div>
  );
}
