import { useSettings } from '../app/SettingsProvider'
import { CHAPTER_TITLES } from '../app/chapters'

interface Props {
  active: number
  onGo: (i: number) => void
  showLabel: boolean
}

export function ChapterProgress({ active, onGo, showLabel }: Props) {
  const { accent } = useSettings()
  return (
    <nav aria-label="Chapters" className="flex min-w-0 flex-[1_1_200px] flex-col gap-1.5">
      <div className="flex gap-1">
        {CHAPTER_TITLES.map((title, i) => (
          <button
            key={i}
            type="button"
            title={`${i + 1}. ${title}`}
            aria-label={`Chapter ${i + 1}: ${title}`}
            aria-current={i === active ? 'step' : undefined}
            onClick={() => onGo(i)}
            className="group flex h-3.5 flex-1 items-center border-0 bg-transparent py-1"
          >
            <span
              className="block h-1 w-full rounded-[2px] transition-[background,transform] duration-200 group-hover:scale-y-150"
              style={{ background: i < active ? '#808a96' : i === active ? accent : '#303944' }}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="truncate font-mono text-[11px] leading-none font-medium text-text-dim">
          {String(active + 1).padStart(2, '0')} / 07 · {CHAPTER_TITLES[active]}
        </span>
      )}
    </nav>
  )
}
