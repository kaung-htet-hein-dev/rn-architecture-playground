import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { C } from '../sim/colors'

/** Fade-up reveal for course blocks; collapses to nothing under reduced motion via MotionConfig. */
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function ChapterHead({ n, title, children }: { n: number; title: ReactNode; children?: ReactNode }) {
  return (
    <Reveal className="flex flex-col gap-3.5">
      <span className="eyebrow">Chapter {String(n).padStart(2, '0')}</span>
      <h2 className="h2">{title}</h2>
      {children}
    </Reveal>
  )
}

/** Why / What / How grid. */
export function WhyWhatHow({ why, what, how }: { why: ReactNode; what: ReactNode; how: ReactNode }) {
  const cols: [string, ReactNode][] = [
    ['WHY', why],
    ['WHAT', what],
    ['HOW', how],
  ]
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-11 gap-y-6">
      {cols.map(([k, body], i) => (
        <Reveal key={k} delay={i * 0.08} className="flex flex-col gap-2.5">
          <span className="font-mono text-xs leading-none font-semibold tracking-[.1em] text-text-dim">{k}</span>
          {body}
        </Reveal>
      ))}
    </div>
  )
}

interface SectionProps {
  id: string
  label: string
  children: ReactNode
  first?: boolean
  last?: boolean
  gap?: number
}

export function ChapterSection({ id, label, children, first, last, gap = 44 }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`scroll-mt-[58px] px-5 ${last ? 'pt-24 pb-[120px]' : first ? 'pt-[72px] pb-24' : 'py-24'} ${last ? '' : 'border-b border-line-soft'}`}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col" style={{ gap }}>
        {children}
      </div>
    </section>
  )
}

/** Inline colored term, e.g. <T c="js">JS thread</T> */
export function T({ c, children }: { c: 'js' | 'shadow' | 'ui' | 'old' | 'new'; children: ReactNode }) {
  return <span style={{ color: C[c] }}>{children}</span>
}
