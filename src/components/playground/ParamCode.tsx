import { tokenize, TOK_COLOR } from '../../sim/syntax'
import type { Params } from '../../sim/playground'
import { CodePanel } from '../CodePanel'

interface Props {
  file: string
  lines: string[]
  active: [number, number] | null
  accent: string
  P: Params
  onParam: (k: string, v: string) => void
}

/** Code panel whose `§param§` tokens are editable inputs. */
export function ParamCode({ file, lines, active, accent, P, onParam }: Props) {
  const renderLine = (line: string, li: number) =>
    line.split('§').map((part, j) => {
      if (j % 2) {
        const v = String(P[part])
        return (
          <input
            key={j}
            value={v}
            onChange={(e) => onParam(part, e.target.value)}
            spellCheck={false}
            aria-label={`${part} (line ${li + 1})`}
            className="mx-px box-content rounded-[4px] border border-[#5fd3e6aa] bg-[#5fd3e614] px-1 font-mono text-[12.5px] leading-normal font-medium text-text-bright outline-none focus:border-new"
            style={{ width: Math.max(2, v.length + 0.5) + 'ch' }}
          />
        )
      }
      if (!part) return null
      return tokenize(part).map((tk, k) => (
        <span key={j + '-' + k} style={{ color: TOK_COLOR[tk.k] }}>
          {tk.t}
        </span>
      ))
    })
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <CodePanel
        file={file}
        lines={lines}
        active={active}
        accent={accent}
        open
        onToggle={() => {}}
        hideToggle
        fontSize={12.5}
        renderLine={renderLine}
      />
    </div>
  )
}
