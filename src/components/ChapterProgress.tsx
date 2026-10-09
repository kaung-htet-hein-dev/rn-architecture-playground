import { CHAPTER_TITLES, INTRO, INTRO_TITLE } from "../app/chapters";

interface Props {
  readonly active: number;
  readonly onGo: (i: number) => void;
}

const ITEMS: [number, string, string][] = [
  [INTRO, "00", INTRO_TITLE],
  ...CHAPTER_TITLES.map((t, i): [number, string, string] => [i, String(i + 1).padStart(2, "0"), t])
];

export function ChapterProgress({ active, onGo }: Props) {
  return (
    <nav
      aria-label="Chapters"
      className="fixed top-[calc(50%+29px)] left-4 z-30 w-[208px] -translate-y-1/2"
    >
      <p className="m-0 mb-3 px-2 text-[13px] leading-none font-semibold text-text-muted">Course</p>
      <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
        {ITEMS.map(([i, num, title]) => {
          const on = i === active;
          return (
            <li key={title}>
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => onGo(i)}
                className={`flex w-full items-start gap-2.5 rounded-md border-0 px-2 py-2 text-left text-[13.5px] leading-snug transition-colors ${on ? "bg-[#61dafb15] font-medium text-primary" : "bg-transparent text-text-dim hover:bg-surface hover:text-text"}`}
              >
                <span
                  className="w-5 shrink-0 pt-[3px] font-mono text-xs leading-none"
                >
                  {num}
                </span>
                <span>{title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
