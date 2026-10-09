import { segGeom, type Seg } from "../../sim/startup";

/** One startup segment; fills left to right as the playhead passes it. */
export function SegBar({ x, t }: { x: Seg; t: number }) {
  const g = segGeom(x, t);
  return (
    <div
      title={x.name}
      className="absolute top-1 bottom-1 overflow-hidden rounded-[3px] bg-line-soft ring-1 ring-line ring-inset"
      style={{ left: `${g.l}%`, width: `${g.w}%` }}
    >
      <div className="h-full" style={{ width: `${g.f}%`, background: x.c }} />
    </div>
  );
}
