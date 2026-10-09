import { AnimatePresence, motion } from 'motion/react'
import type { TreeView } from '../sim/panel'

/** Element tree / Shadow tree / Host views row (Fabric chapter). */
export function TreeViews({ trees, accent }: { trees: TreeView[]; accent: string }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {trees.map((tr) => (
        <div
          key={tr.title}
          className="min-w-0 rounded-lg border bg-surface p-2.5 transition-[border-color] duration-250"
          style={{ borderColor: tr.updated ? accent : '#30363d' }}
        >
          <div className="mb-2 flex justify-between gap-1.5 font-mono text-xs leading-[1.2] font-medium text-text-dim">
            <span className="truncate">{tr.title}</span>
            <AnimatePresence>
              {tr.updated && (
                <motion.span
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ color: accent }}
                >
                  updated
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {tr.nodes ? (
            tr.nodes.map((nd, i) => (
              <motion.div
                key={nd.label + i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
                className="truncate font-mono text-xs leading-[1.7] transition-colors duration-250"
                style={{ paddingLeft: nd.depth * 14, color: nd.hot ? accent : '#ccd0d5' }}
              >
                {nd.label}
              </motion.div>
            ))
          ) : (
            <div className="font-mono text-xs leading-[1.7] text-text-faint">not built yet</div>
          )}
        </div>
      ))}
    </div>
  )
}
