import { useState } from 'react'
import { motion } from 'motion/react'

const DEFAULT_DATES = ['Mar 2022', 'Apr 2024', 'Oct 2024', 'Jun 2025', 'Oct 2025']
const KEY = 'atb-dates'

const TL: [string, string][] = [
  ['0.68', 'New Architecture available, but you have to turn it on.'],
  ['0.74', 'Bridgeless mode becomes the default when the New Architecture is on.'],
  ['0.76', 'New Architecture on by default for new and upgraded apps.'],
  ['0.80', 'Legacy architecture frozen: no new features or fixes.'],
  ['0.82', 'New Architecture only. The old one can no longer be turned back on.'],
]

function loadDates(): string[] {
  try {
    const d: unknown = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (Array.isArray(d) && d.length === 5 && d.every((x) => typeof x === 'string' && x.length <= 40)) return d
  } catch {
    /* ignore */
  }
  return DEFAULT_DATES.slice()
}

/** Editable release timeline; dates persist in localStorage['atb-dates']. */
export function Timeline() {
  const [dates, setDates] = useState(loadDates)

  const set = (i: number, v: string) => {
    const d = dates.slice()
    d[i] = v
    setDates(d)
    try {
      localStorage.setItem(KEY, JSON.stringify(d))
    } catch {
      /* ignore */
    }
  }
  const reset = () => {
    setDates(DEFAULT_DATES.slice())
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="h3">How we got here</h3>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs leading-[1.4] text-text-dim">Dates are editable. Check them against the release notes.</span>
          <button type="button" className="btn-ghost flex-none" onClick={reset}>
            Reset dates
          </button>
        </div>
      </div>
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-x-4 gap-y-5 p-0">
        {TL.map(([v, t], i) => {
          const c = i < 2 ? '#f2b35b' : '#5fd3e6'
          return (
            <motion.li
              key={v}
              className="relative flex flex-col gap-2.5 pt-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -40px 0px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <motion.span
                aria-hidden="true"
                className="absolute top-0 left-0 h-0.5 w-full origin-left"
                style={{ background: c }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              />
              <input
                value={dates[i]}
                onChange={(e) => set(i, e.target.value)}
                aria-label={`Release date for React Native ${v}`}
                maxLength={40}
                className="box-border w-full rounded-[5px] border border-dashed border-[#3a4450] bg-transparent px-2 py-1.5 font-mono text-[13px] leading-none font-medium text-text-bright outline-none focus:border-solid focus:border-text-dim"
              />
              <span className="font-mono text-xl leading-none font-semibold" style={{ color: c }}>
                {v}
              </span>
              <span className="text-sm leading-normal text-text-muted">{t}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
