import { Link } from 'react-router'
import { useSettings } from '../app/SettingsProvider'
import { useIsMobile } from '../hooks/useMediaQuery'
import { BrandMark, ModeToggle, MotionToggle } from './ModeToggle'
import { ChapterProgress } from './ChapterProgress'

interface Props {
  active: number
  onGo: (i: number) => void
}

export function TopBar({ active, onGo }: Props) {
  const { mode, reduced } = useSettings()
  const mobile = useIsMobile()
  const pgHref = `/playground?mode=${mode}${reduced ? '&motion=reduced' : ''}`
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#0f1216ee] backdrop-blur-[10px]">
      <div className="mx-auto flex min-h-[58px] max-w-[1240px] flex-wrap items-center gap-[18px] px-5 py-2">
        <a
          href="#ch1"
          onClick={(e) => {
            e.preventDefault()
            onGo(0)
          }}
          className="flex flex-none items-center gap-2.5 text-text-bright no-underline hover:text-white"
        >
          <BrandMark />
          <span className="text-[15px] leading-none font-semibold tracking-[-.01em]">Across the Bridge</span>
        </a>
        <ChapterProgress active={active} onGo={onGo} showLabel={!mobile} />
        <div className="flex flex-none items-center gap-2">
          <ModeToggle />
          <MotionToggle />
          <Link
            to={pgHref}
            className="flex h-[34px] items-center rounded-[7px] bg-text px-3.5 text-[13px] leading-none font-semibold text-bg no-underline transition-transform hover:text-bg active:scale-[.97]"
          >
            Playground
          </Link>
        </div>
      </div>
    </header>
  )
}
