import { C } from './colors'
/** Syntax tokenizer ported from SimPanel.dc.html `tok()`. */
export type TokKind = 'comment' | 'string' | 'tag' | 'keyword' | 'number' | 'plain'
export interface Tok {
  t: string
  k: TokKind
}

export const TOK_COLOR: Record<TokKind, string> = {
  comment: C.synComment,
  string: C.synString,
  tag: C.synTag,
  keyword: C.synKeyword,
  number: C.synNumber,
  plain: C.synDefault,
}

const RE =
  /(\/\/.*$)|('[^']*'|"[^"]*")|(<\/?[A-Za-z][\w.]*|\/?>)|\b(function|const|let|return|await|async|import|export|from|type|interface|extends|default|for|class|public|virtual|void|bool|double|true|false|new)\b|(\b\d[\d_.]*\b)/g

export function tokenize(line: string): Tok[] {
  const out: Tok[] = []
  const re = new RegExp(RE.source, 'g')
  let i = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    if (m[0] === '') {
      re.lastIndex++
      continue
    }
    if (m.index > i) out.push({ t: line.slice(i, m.index), k: 'plain' })
    out.push({ t: m[0], k: m[1] ? 'comment' : m[2] ? 'string' : m[3] ? 'tag' : m[4] ? 'keyword' : 'number' })
    i = m.index + m[0].length
  }
  if (i < line.length) out.push({ t: line.slice(i), k: 'plain' })
  if (!out.length) out.push({ t: ' ', k: 'plain' })
  return out
}
