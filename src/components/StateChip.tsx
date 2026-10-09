import { chipFor, type SimStatus } from '../sim/colors'

interface Props {
  status: SimStatus
  accent: string
  errorLabel?: string
  /** override the label text */
  label?: string
}

/** Status chip: dot + label. */
export function StateChip({ status, accent, errorLabel, label }: Props) {
  const base = chipFor(status, accent, errorLabel)
  const chip = label ? { ...base, label } : base
  return (
    <span
      className="inline-flex flex-none items-center gap-1.5 rounded-[4px] px-2 py-[5px] text-xs leading-none font-medium transition-colors duration-250"
      style={{ color: chip.fg, background: chip.bg }}
    >
      <span className="size-1.5 rounded-full" style={{ background: chip.fg }} />
      {chip.label}
    </span>
  )
}
