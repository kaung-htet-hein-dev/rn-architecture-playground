import type { ReactNode } from 'react'
import { tokenize, TOK_COLOR } from '../sim/syntax'
import { C } from '../sim/colors'

interface Props {
  file: string
  lines: string[]
  /** inclusive [from, to], 0-based */
  active: [number, number] | null
  accent: string
  open: boolean
  /** omit to hide the Show/Hide button (playground) */
  onToggle?: () => void
  /** optional custom renderer per line (playground editable params) */
  renderLine?: (line: string, index: number) => ReactNode
  /** wrap long lines instead of scrolling sideways (narrow columns) */
  wrap?: boolean
  /** fade the code until the sim starts, so the diagram reads first */
  muted?: boolean
  className?: string
}

/** Code panel in reactnative.dev's dark Prism style: line numbers, ▸ marker, highlighted active line(s). */
export function CodePanel({ file, lines, active, accent, open, onToggle, renderLine, wrap = false, muted = false, className = '' }: Props) {
  const toks = lines.map(tokenize)
  return (
    <div className={`flex min-w-0 flex-col bg-code-bg ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3">
        <span className="font-mono text-[13px] leading-none text-text-ghost">{file}</span>
        {onToggle && (
          <button type="button" className="btn-ghost" onClick={onToggle} aria-expanded={open}>
            {open ? 'Hide code' : 'Show code'}
          </button>
        )}
      </div>
      {open && (
        <div
          className={`overflow-x-auto py-4 font-mono text-code leading-code text-syn-default transition-opacity duration-300 ${muted ? 'opacity-50' : ''}`}
        >
          {lines.map((line, i) => {
            const on = !!active && i >= active[0] && i <= active[1]
            return (
              <div
                key={i}
                className={`flex pr-4 transition-[background] duration-200 ${wrap ? 'whitespace-pre-wrap break-words' : 'min-w-max whitespace-pre'}`}
                style={{ background: on ? C.codeHighlight : 'transparent' }}
                aria-current={on && active && i === active[0] ? 'step' : undefined}
              >
                <span
                  className="w-10 flex-none pr-2 text-right select-none"
                  style={{ color: on ? accent : C.gutter }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="w-4 flex-none text-center" style={{ color: accent }} aria-hidden="true">
                  {on && active && i === active[0] ? '▸' : ''}
                </span>
                <span className="min-w-0">
                  {renderLine
                    ? renderLine(line, i)
                    : toks[i].map((tk, j) => (
                        <span key={j} style={{ color: TOK_COLOR[tk.k] }}>
                          {tk.t}
                        </span>
                      ))}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
