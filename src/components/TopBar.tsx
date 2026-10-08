import { Link } from "react-router";
import { useSettings } from "../app/SettingsProvider";
import { BrandMark, ModeToggle } from "./ModeToggle";

interface Props {
  onGo: (i: number) => void;
}

export function TopBar({ onGo }: Props) {
  const { mode } = useSettings();
  const pgHref = `/playground?mode=${mode}`;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#0f1216ee] backdrop-blur-[10px]">
      <div className="flex w-full min-h-[58px] flex-wrap items-center gap-[18px] px-3 py-2 sm:px-5">
        <a
          href="#ch1"
          onClick={(e) => {
            e.preventDefault();
            onGo(0);
          }}
          className="flex flex-none items-center gap-2.5 text-text-bright no-underline hover:text-white"
        >
          <BrandMark />
          <span className="text-[15px] leading-none font-semibold tracking-[-.01em]">
            Across the Bridge
          </span>
        </a>
        <div className="ml-auto flex flex-none items-center gap-1 sm:gap-2">
          <ModeToggle />
          <Link
            to={pgHref}
            className="flex h-[34px] items-center rounded-[7px] bg-text px-2 text-[13px] leading-none font-semibold text-bg no-underline transition-transform hover:text-bg active:scale-[.97] sm:px-3.5"
          >
            Playground
          </Link>
        </div>
      </div>
    </header>
  );
}
