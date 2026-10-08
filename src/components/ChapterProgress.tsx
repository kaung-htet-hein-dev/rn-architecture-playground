import { useSettings } from "../app/SettingsProvider";
import { CHAPTER_TITLES } from "../app/chapters";

interface Props {
  readonly active: number;
  readonly onGo: (i: number) => void;
}

export function ChapterProgress({ active, onGo }: Props) {
  const { accent } = useSettings();
  return (
    <nav
      aria-label="Chapters"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] min-[1200px]:left-5 min-[1200px]:top-[calc(50%+29px)] min-[1200px]:bottom-auto min-[1200px]:w-[200px] min-[1200px]:-translate-y-1/2 min-[1200px]:border-0 min-[1200px]:bg-transparent min-[1200px]:p-0"
    >
      <div className="min-[1200px]:hidden">
        <div className="mb-1.5 truncate font-mono text-[11px] leading-none font-medium text-text-dim">
          {String(active + 1).padStart(2, "0")} / 07 · {CHAPTER_TITLES[active]}
        </div>
        <div className="flex gap-1" aria-label="Chapter progress">
          {CHAPTER_TITLES.map((title, i) => {
            let progressColor = "#303944";
            if (i < active) progressColor = "#808a96";
            else if (i === active) progressColor = accent;
            return (
              <button
                key={title}
                type="button"
                title={`${i + 1}. ${title}`}
                aria-label={`Chapter ${i + 1}: ${title}`}
                aria-current={i === active ? "step" : undefined}
                onClick={() => onGo(i)}
                className="group flex h-3.5 flex-1 items-center border-0 bg-transparent py-1"
              >
                <span
                  className="block h-1 w-full rounded-xs transition-[background,transform] duration-200 group-hover:scale-y-150"
                  style={{ background: progressColor }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div className="hidden min-[1200px]:block">
        <p className="mb-3 font-mono text-[11px] leading-none font-semibold tracking-widest text-text-dim">
          COURSE
        </p>
        <ol className="m-0 flex list-none flex-col gap-1 p-0">
          {CHAPTER_TITLES.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                aria-current={i === active ? "step" : undefined}
                onClick={() => onGo(i)}
                className={`flex w-full items-start gap-2.5 border-0 bg-transparent px-1.5 py-2 text-left text-[13px] leading-snug transition-colors ${i === active ? "text-text-bright" : "text-text-dim hover:text-text"}`}
              >
                <span
                  className="shrink-0 font-mono text-[11px] leading-[1.65]"
                  style={{ color: i === active ? accent : undefined }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
