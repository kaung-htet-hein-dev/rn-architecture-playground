import { chipFor, type SimStatus } from '../sim/colors'

interface Props {
  status: SimStatus
  accent: string
  errorLabel?: string
  /** override the label text */
  label?: string
}

/** Status chip: mono 11px uppercase, dot + label. */
export function StateChip({ status, accent, errorLabel, label }: Props) {
  const base = chipFor(status, accent, errorLabel)
  const chip = label ? { ...base, label } : base
  return (
    <span
      className="inline-flex flex-none items-center gap-1.5 rounded-[4px] px-2 py-[5px] font-mono text-[11px] leading-none font-medium tracking-[.08em] uppercase transition-colors duration-250"
      style={{ color: chip.fg, background: chip.bg }}
    >
      <span className="size-1.5 rounded-full" style={{ background: chip.fg }} />
      {chip.label}
    </span>
  )
}
