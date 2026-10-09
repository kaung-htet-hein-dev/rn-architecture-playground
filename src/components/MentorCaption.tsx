import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface Props {
  accent: string
  text: string
  /** changes whenever a new caption should animate in and be announced */
  id?: string
  className?: string
}

/**
 * Mentor caption: 3px accent bar + sentence. The polite live region announces
 * the caption only when `id` changes, so live numbers inside it don't spam readers.
 */
export function MentorCaption({ accent, text, id, className = '' }: Props) {
  const key = id ?? text
  const [live, setLive] = useState({ key, text })
  if (live.key !== key) setLive({ key, text })
  return (
    <div className={`flex min-h-[84px] gap-3.5 border-t border-line bg-code-bg px-6 py-5 ${className}`}>
      <span className="w-[3px] flex-none rounded-[2px] transition-colors duration-250" style={{ background: accent }} />
      <div className="relative max-w-[760px] flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="m-0 text-[16.5px] leading-[1.6] text-text-bright"
            aria-hidden="true"
          >
            {text}
          </motion.p>
        </AnimatePresence>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {live.text}
        </span>
      </div>
    </div>
  )
}
