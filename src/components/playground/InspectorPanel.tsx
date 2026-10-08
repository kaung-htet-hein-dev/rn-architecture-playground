import { AnimatePresence, motion } from 'motion/react'
import { C } from '../../sim/colors'
import type { InspectorView, MetricRow, ModuleRow, TreeView } from '../../sim/playground'

interface Props {
  accent: string
  heads: { t: string; c: string }[]
  metrics: MetricRow[]
  insp: InspectorView | null
  /** changes when a different message is shown */
  inspKey: string
  mods: ModuleRow[]
  trees: TreeView[]
}

const Eyebrow = ({ children, id }: { children: string; id?: string }) => (
  <h2 id={id} className="m-0 text-[13px] leading-none font-semibold text-text-muted">
    {children}
  </h2>
)

/** Right column: metrics, message inspector, native module status, trees. */
export function InspectorPanel({ accent, heads, metrics, insp, inspKey, mods, trees }: Props) {
  const cols = heads.length
  return (
    <div className="flex flex-col divide-y divide-line-soft">
      <section aria-labelledby="pg-metrics" className="flex flex-col gap-3.5 px-5 py-5">
        <Eyebrow id="pg-metrics">Metrics</Eyebrow>
        <div
          className="grid items-baseline gap-x-4 gap-y-3"
          style={{ gridTemplateColumns: `minmax(0,1fr) repeat(${cols}, auto)` }}
        >
          <span />
          {heads.map((h) => (
            <span key={h.t} className="text-right font-mono text-[11px] leading-none font-semibold" style={{ color: h.c }}>
              {h.t}
            </span>
          ))}
          {metrics.map((m) => (
            <MetricLine key={m.l} m={m} />
          ))}
        </div>
      </section>

      <section aria-labelledby="pg-insp" className="flex flex-col gap-3.5 px-5 py-5">
        <Eyebrow id="pg-insp">Message inspector</Eyebrow>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={inspKey}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {insp ? (
              <div
                className="flex flex-col gap-2.5 rounded-lg border bg-surface p-3.5"
                style={{ borderColor: insp.bd }}
              >
                <span className="text-[13px] leading-[1.2] font-semibold" style={{ color: insp.c }}>
                  {insp.kind}
                </span>
                {insp.rows.map((r) => (
                  <div key={r.k} className="flex justify-between gap-2.5 font-mono text-xs leading-[1.4]">
                    <span className="text-text-faint">{r.k}</span>
                    <span className="text-right break-words text-text">{r.v}</span>
                  </div>
                ))}
                {insp.payload != null && (
                  <pre className="m-0 max-h-[140px] overflow-auto rounded-[6px] border border-line bg-bg p-2 font-mono text-[11.5px] leading-normal break-all whitespace-pre-wrap text-old">
                    {insp.payload}
                  </pre>
                )}
              </div>
            ) : (
              <p className="m-0 text-[13px] leading-normal text-text-dim">
                No message has crossed yet. Step forward, or click a packet or arrow in the lanes.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <section aria-labelledby="pg-mods" className="flex flex-col gap-3.5 px-5 py-5">
        <Eyebrow id="pg-mods">Native modules</Eyebrow>
        {mods.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {mods.map((md) => (
              <li
                key={md.n}
                className="flex items-center justify-between gap-2 rounded-[6px] bg-surface px-3 py-2.5 font-mono text-xs leading-none"
              >
                <span className="text-text">{md.n}</span>
                {md.s && (
                  <span
                    className="flex items-center gap-1.5 transition-colors duration-250"
                    // "not loaded" text uses faint for contrast; the dot keeps the spec color.
                    style={{ color: md.s === 'not loaded' ? C.faint : md.c }}
                  >
                    <span className="size-1.5 rounded-full" style={{ background: md.c }} />
                    {md.s}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[13px] leading-normal text-text-dim">This preset doesn’t call a native module.</p>
        )}
      </section>

      <section aria-labelledby="pg-trees" className="flex flex-col gap-3.5 px-5 py-5">
        <Eyebrow id="pg-trees">Trees</Eyebrow>
        {trees.map((tr) => (
          <div
            key={tr.key}
            className="rounded-lg border bg-surface p-3.5 transition-colors duration-250"
            style={{ borderColor: tr.updated ? accent : C.line }}
          >
            <div className="mb-2.5 flex justify-between gap-2 font-mono text-[11.5px] leading-none font-medium text-text-dim">
              <span>{tr.title}</span>
              <span style={{ color: tr.updated ? accent : C.faint }}>{tr.updated ? 'updated' : tr.built ? '' : 'not built'}</span>
            </div>
            {tr.nodes.map((nd, i) => (
              <div
                key={i}
                className="truncate font-mono text-xs leading-[1.75] whitespace-nowrap transition-colors duration-250"
                style={{ paddingLeft: nd.depth * 12, color: tr.built ? (tr.updated ? accent : C.muted) : C.faint }}
              >
                {(nd.depth ? '└ ' : '') + nd.label}
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}

function MetricLine({ m }: { m: MetricRow }) {
  return (
    <>
      <span className="text-[13px] leading-[1.3] text-text-muted">{m.l}</span>
      {m.vals.map((v, i) => (
        <span
          key={i}
          className="text-right font-mono text-[15px] leading-none font-semibold whitespace-nowrap"
          style={{ color: v.c }}
        >
          {v.t}
        </span>
      ))}
    </>
  )
}
