import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { accentOf, type Mode } from '../sim/colors'

interface Settings {
  mode: Mode
  setMode: (m: Mode) => void
  /** Effective reduced motion: toggle override, else OS preference. */
  reduced: boolean
  toggleMotion: () => void
  accent: string
}

const SettingsContext = createContext<Settings | null>(null)

const MODE_KEY = 'atb-mode'
const MOTION_KEY = 'atb-motion'

function readParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}
function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeStore(key: string, v: string) {
  try {
    localStorage.setItem(key, v)
  } catch {
    /* storage unavailable */
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export const isMode = (v: unknown): v is Mode => v === 'old' || v === 'new'

function initialMode(): Mode {
  const p = readParam('mode')
  if (isMode(p)) return p
  const s = readStore(MODE_KEY)
  return isMode(s) ? s : 'old'
}

/** 'reduced' | 'full' | null (follow OS). */
function initialMotion(): 'reduced' | 'full' | null {
  const p = readParam('motion')
  if (p === 'reduced' || p === 'full') return p
  const s = readStore(MOTION_KEY)
  return s === 'reduced' || s === 'full' ? s : null
}

function useOsReducedMotion() {
  const [v, setV] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setV(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return v
}

/** Keep `?mode=` (and `?motion=`) in the URL without a navigation. */
function syncUrl(mode: Mode, motion: 'reduced' | 'full' | null) {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('mode', mode)
    if (motion) url.searchParams.set('motion', motion)
    else url.searchParams.delete('motion')
    window.history.replaceState(window.history.state, '', url)
  } catch {
    /* ignore */
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(initialMode)
  const [motion, setMotion] = useState(initialMotion)
  const os = useOsReducedMotion()
  const reduced = motion ? motion === 'reduced' : os

  useEffect(() => {
    writeStore(MODE_KEY, mode)
    syncUrl(mode, motion)
  }, [mode, motion])

  useEffect(() => {
    if (motion) writeStore(MOTION_KEY, motion)
  }, [motion])

  const setMode = useCallback((m: Mode) => setModeState(m), [])
  const toggleMotion = useCallback(() => setMotion(reduced ? 'full' : 'reduced'), [reduced])

  const value = useMemo(
    () => ({ mode, setMode, reduced, toggleMotion, accent: accentOf(mode) }),
    [mode, setMode, reduced, toggleMotion],
  )

  return (
    <SettingsContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): Settings {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
