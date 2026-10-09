import { Link } from "react-router";
import { useSettings } from "../app/SettingsProvider";
import { INTRO } from "../app/chapters";
import { BrandMark, ModeToggle } from "./ModeToggle";

interface Props {
  onGo: (i: number) => void;
}

export function TopBar({ onGo }: Props) {
  const { mode } = useSettings();
  const pgHref = `/playground?mode=${mode}`;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-panel/93 backdrop-blur-[10px]">
      <div className="flex w-full min-h-(--header-h) items-center gap-[18px] px-5 py-2">
        <a
          href="#intro"
          onClick={(e) => {
            e.preventDefault();
            onGo(INTRO);
          }}
          className="flex flex-none items-center gap-2.5 border-0 text-text-bright no-underline hover:text-white"
        >
          <BrandMark />
          <span className="text-[17px] leading-none font-bold">
            React Native Internal
          </span>
        </a>
        <div className="ml-auto flex flex-none items-center gap-2">
          <ModeToggle />
          <Link
            to={pgHref}
            className="btn-primary h-[34px] px-3.5 text-[13px] leading-none"
          >
            Playground
          </Link>
        </div>
      </div>
    </header>
  );
}
