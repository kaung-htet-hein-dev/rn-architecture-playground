import { AnimatePresence, motion } from 'motion/react'
import type { LaneView, PacketView } from '../sim/panel'

interface Props {
  lanes: LaneView[]
  gridCols: string
  height: number
  packet: PacketView | null
  wire: string
  compact: boolean
}

/** Thread lane columns + wire + JSON packet / JSI line overlay. */
export function ThreadLanes({ lanes, gridCols, height, packet, wire, compact }: Props) {
  return (
    <div className="relative grid gap-2" style={{ gridTemplateColumns: gridCols, height }}>
      {lanes.map((ln) => (
        <Lane key={ln.id} ln={ln} compact={compact} />
      ))}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[62px] right-[10%] left-[10%] h-0 border-t border-dashed transition-colors duration-250"
        style={{ borderColor: wire }}
      />
      {packet?.kind === 'json' && <Packet label={packet.label} x={packet.x} maxW={compact ? 110 : 220} />}
      {packet?.kind === 'ref' && <JsiLine packet={packet} maxW={compact ? 110 : 220} />}
    </div>
  )
}

function Lane({ ln, compact }: { ln: LaneView; compact: boolean }) {
  const c = ln.tone
  return (
    <div
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border transition-[background,border-color] duration-250"
      style={{ borderColor: ln.active ? c : '#2d3642', background: ln.active ? c + '12' : '#171d24' }}
      aria-label={`${ln.name}${ln.active ? ' (active)' : ''}`}
      role="group"
    >
      <div className="box-border min-h-11 border-b border-line-lane px-3 pt-3 pb-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="size-2 flex-none rounded-[2px]" style={{ background: ln.color }} />
          <span
            className="truncate text-[13.5px] leading-[1.2] font-semibold transition-colors duration-250"
            style={{ color: ln.active ? c : '#e7eaee' }}
          >
            {ln.name}
          </span>
        </div>
        {!compact && <div className="mt-1 truncate font-mono text-xs leading-[1.3] text-text-dim">{ln.sub}</div>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2 pt-[34px] pb-2">
        {ln.isJsi && <div className="text-center font-mono text-[11px] leading-[1.4] text-text-faint">no JSON</div>}
        <AnimatePresence initial={false}>
          {ln.queue.map((q) => (
            <motion.div
              key={q}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="truncate rounded-[4px] border border-[#f2b35b44] bg-[#f2b35b14] px-1.5 py-[5px] font-mono text-[10.5px] leading-none font-medium text-old"
            >
              {q}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex-1" />
        <AnimatePresence initial={false} mode="popLayout">
          {ln.acts.map((ac) => (
            <motion.div
              key={ac.key}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-[5px] border px-[7px] py-1.5 font-mono text-[11.5px] leading-[1.4] font-medium break-words transition-colors duration-250"
              style={{
                color: ac.live ? '#eef1f4' : '#9aa4b0',
                background: ac.live ? c + '22' : 'transparent',
                borderColor: ac.live ? c + '77' : '#2d3642',
              }}
            >
              {ac.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {ln.screen !== null && (
          <div className="flex flex-col items-center gap-1 rounded-[10px] border border-line-strong bg-bg p-2">
            <span className="font-mono text-[10px] leading-none font-medium tracking-[.08em] text-text-faint">SCREEN</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ln.screen}
                initial={{ opacity: 0, scale: 1.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="text-[22px] leading-none font-semibold text-text-bright"
              >
                {ln.screen}
              </motion.span>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/** Amber JSON packet. Position is driven by the sim clock (ease-in-out quad). */
export function Packet({ label, x, maxW }: { label: string; x: number; maxW: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[50px] -translate-x-1/2 truncate rounded-[5px] bg-old px-2 py-1.5 font-mono text-[11px] leading-none font-medium text-old-ink shadow-[0_0_0_3px_#f2b35b26]"
      style={{ left: `${x}%`, maxWidth: maxW }}
    >
      {label}
    </div>
  )
}

/** Cyan JSI line growing from caller to callee. */
export function JsiLine({ packet, maxW }: { packet: PacketView; maxW: number }) {
  const l = Math.min(packet.from, packet.x)
  const w = Math.abs(packet.x - packet.from)
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[61px] h-0.5 bg-new shadow-[0_0_8px_#5fd3e699]"
        style={{ left: `${l}%`, width: `${w}%` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-14 -ml-1.5 size-3 rounded-full bg-new"
        style={{ left: `${packet.x}%` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -translate-x-1/2 truncate rounded-[3px] bg-bg px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium text-new"
        style={{ left: `${packet.mid}%`, maxWidth: maxW }}
      >
        {packet.label}
      </div>
    </>
  )
}
