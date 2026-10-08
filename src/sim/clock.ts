import { useCallback, useEffect, useRef, useState } from 'react'

export type Speed = 0.5 | 1 | 2
export const SPEEDS: readonly Speed[] = [0.5, 1, 2]

export interface ClockModel<S> {
  /**
   * Advance the model by `dt` ms of real time (already multiplied by speed).
   * Return `stop: true` to pause the clock after this tick.
   */
  advance: (state: S, dt: number) => { state: S; stop?: boolean }
}

export interface SimClock<S> {
  state: S
  running: boolean
  speed: Speed
  setSpeed: (s: Speed) => void
  /** Replace or update the model state without touching the clock. */
  set: (next: S | ((s: S) => S)) => void
  /** Optionally rewrite the state, then start the rAF loop. */
  play: (prepare?: (s: S) => S) => void
  pause: () => void
  /** Stop and return to the initial state. */
  reset: (initial?: S) => void
}

/**
 * One rAF clock for every simulation (PROMPT rule 2).
 * The model is pure; this hook only owns time. requestAnimationFrame runs
 * only while `running` is true.
 */
export function useSimClock<S>(initial: S | (() => S), model: ClockModel<S>): SimClock<S> {
  const [state, setStateRaw] = useState<S>(initial)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)

  const stateRef = useRef(state)
  const modelRef = useRef(model)
  const speedRef = useRef(speed)
  const initialRef = useRef(initial)

  useEffect(() => {
    modelRef.current = model
    speedRef.current = speed
  })

  const set = useCallback((next: S | ((s: S) => S)) => {
    const v = typeof next === 'function' ? (next as (s: S) => S)(stateRef.current) : next
    stateRef.current = v
    setStateRaw(v)
  }, [])

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last: number | null = null
    const tick = (ts: number) => {
      const dt = last == null ? 16 : Math.min(80, ts - last)
      last = ts
      const r = modelRef.current.advance(stateRef.current, dt * speedRef.current)
      stateRef.current = r.state
      setStateRaw(r.state)
      if (r.stop) {
        setRunning(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  const play = useCallback(
    (prepare?: (s: S) => S) => {
      if (prepare) set(prepare)
      setRunning(true)
    },
    [set],
  )
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(
    (init?: S) => {
      setRunning(false)
      const base = initialRef.current
      set(init ?? (typeof base === 'function' ? (base as () => S)() : base))
    },
    [set],
  )

  return { state, running, speed, setSpeed, set, play, pause, reset }
}
