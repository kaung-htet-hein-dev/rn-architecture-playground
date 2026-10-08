import type { Trace } from './types'

/** Px width the track needs so the tightest task label still fits its slot. */
export function timelineWidth(traces: Trace[], T: number): number {
  let width = 420
  for (const tr of traces) {
    const byLane = new Map<string, typeof tr.tasks>()
    for (const task of tr.tasks) {
      const laneTasks = byLane.get(task.lane) ?? []
      laneTasks.push(task)
      byLane.set(task.lane, laneTasks)
    }
    for (const tasks of byLane.values()) {
      tasks.sort((a, b) => a.t - b.t)
      tasks.forEach((task, i) => {
        const nextTime = tasks[i + 1]?.t ?? T
        const timeGap = nextTime - task.t
        if (timeGap <= 0) return
        const labelWidth = task.label.length * 6.8 + 18
        width = Math.max(width, (labelWidth * T) / timeGap)
      })
    }
  }
  return Math.ceil(width)
}
