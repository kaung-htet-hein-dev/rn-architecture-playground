/** Small rounded color square used in legends and lane/row titles. */
export function Swatch({
  color,
  className = "size-2"
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex-none rounded-[2px] ${className}`}
      style={{ background: color }}
    />
  );
}
