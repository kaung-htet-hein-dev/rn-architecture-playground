import { tokenize, TOK_COLOR, type Tok } from "../../sim/syntax";
import type { Params } from "../../sim/playground";
import { CodePanel } from "../CodePanel";

interface Props {
  file: string;
  lines: string[];
  active: [number, number] | null;
  accent: string;
  P: Params;
  onParam: (k: string, v: string) => void;
}

type Piece = { param: string } | { tokens: Tok[] };

/** Split `§param§` markers once, so playback frames never re-tokenize. */
function parseLine(line: string): Piece[] {
  const pieces: Piece[] = [];
  line.split("§").forEach((part, j) => {
    if (j % 2) pieces.push({ param: part });
    else if (part) pieces.push({ tokens: tokenize(part) });
  });
  return pieces;
}

/** Code panel whose `§param§` tokens are editable inputs. */
export function ParamCode({
  file,
  lines,
  active,
  accent,
  P,
  onParam
}: Props) {
  const parsed = lines.map(parseLine);
  const renderLine = (_line: string, li: number) =>
    parsed[li].map((piece, j) => {
      if ("param" in piece) {
        const name = piece.param;
        const v = String(P[name]);
        return (
          <input
            key={j}
            value={v}
            onChange={(e) => onParam(name, e.target.value)}
            spellCheck={false}
            aria-label={`${name} (line ${li + 1})`}
            className="mx-px box-content rounded-[4px] border border-new/67 bg-new/8 px-1 font-mono text-[length:inherit] leading-normal font-medium text-text-bright outline-none focus:border-new"
            style={{ width: Math.max(2, v.length + 0.5) + "ch" }}
          />
        );
      }
      return piece.tokens.map((tk, k) => (
        <span key={j + "-" + k} style={{ color: TOK_COLOR[tk.k] }}>
          {tk.t}
        </span>
      ));
    });
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <CodePanel
        file={file}
        lines={lines}
        active={active}
        accent={accent}
        open
        wrap
        renderLine={renderLine}
      />
    </div>
  );
}
