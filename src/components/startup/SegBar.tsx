import { segGeom, type Seg } from "../../sim/startup";

/** One startup segment; fills left to right as the playhead passes it. */
export function SegBar({ x, t }: { x: Seg; t: number }) {
  const g = segGeom(x, t);
  return (
    <div
      title={x.name}
      className="absolute top-1 bottom-1 overflow-hidden rounded-[3px] bg-line-soft shadow-[inset_0_0_0_1px_#2d3642]"
      style={{ left: `${g.l}%`, width: `${g.w}%` }}
    >
      <div className="h-full" style={{ width: `${g.f}%`, background: x.c }} />
    </div>
  );
}
