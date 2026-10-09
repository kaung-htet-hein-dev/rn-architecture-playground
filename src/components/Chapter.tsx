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

/** Reading width for prose; sims and grids use the wider section width. */
export const PROSE_W = 'max-w-[780px]'

export function ChapterHead({
  n,
  title,
  eyebrow,
  children,
}: {
  n: number
  title: ReactNode
  /** replaces "Chapter 0n" */
  eyebrow?: string
  children?: ReactNode
}) {
  return (
    <Reveal className={`flex flex-col gap-3.5 ${PROSE_W}`}>
      <span className="eyebrow">{eyebrow ?? `Chapter ${String(n).padStart(2, '0')}`}</span>
      <h2 className="h2">{title}</h2>
      {children}
    </Reveal>
  )
}

/** Why / What / How, read top to bottom with the label in a left gutter. */
export function WhyWhatHow({ why, what, how }: { why: ReactNode; what: ReactNode; how: ReactNode }) {
  const rows: [string, ReactNode][] = [
    ['Why', why],
    ['What', what],
    ['How', how],
  ]
  return (
    <div className={`flex flex-col gap-7 ${PROSE_W}`}>
      {rows.map(([k, body], i) => (
        <Reveal key={k} delay={i * 0.06} className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-6">
          <span className="pt-[6px] text-sm leading-none font-semibold text-text-faint">{k}</span>
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
  last?: boolean
  gap?: number
}

export function ChapterSection({ id, label, children, last, gap = 48 }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`scroll-mt-[58px] px-10 ${last ? 'pt-28 pb-[140px]' : 'py-28'} ${last ? '' : 'border-b border-line-soft'}`}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col" style={{ gap }}>
        {children}
      </div>
    </section>
  )
}

/** Inline colored term, e.g. <T c="js">JS thread</T> */
export function T({ c, children }: { c: 'js' | 'shadow' | 'ui' | 'old' | 'new'; children: ReactNode }) {
  return <span style={{ color: C[c] }}>{children}</span>
}
