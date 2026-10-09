import type { ReactNode } from "react";

interface Props {
  label: string;
  as?: "aside" | "section";
  edge?: "left" | "right";
  children: ReactNode;
}

const EDGE = {
  left: "border-l border-line",
  right: "border-r border-line"
};

/** One playground column. */
export function PlaygroundPanel({
  label,
  as: Tag = "aside",
  edge,
  children
}: Props) {
  return (
    <Tag
      aria-label={label}
      className={`flex min-h-0 min-w-0 flex-col overflow-auto ${edge ? EDGE[edge] : ""}`}
    >
      {children}
    </Tag>
  );
}
