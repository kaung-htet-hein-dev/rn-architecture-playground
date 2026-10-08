import type { ReactNode } from "react";
import type { PlaygroundTab } from "../../sim/playground";

interface Props {
  name: PlaygroundTab;
  /** accessible name when shown as a plain landmark (desktop) */
  label: string;
  /** mobile shows one panel at a time as a tabpanel */
  mobile: boolean;
  as?: "aside" | "section";
  edge?: "left" | "right";
  children: ReactNode;
}

const EDGE = {
  left: "border-l border-line",
  right: "border-r border-line"
};

/** One playground column; carries tabpanel semantics on mobile. */
export function PlaygroundPanel({
  name,
  label,
  mobile,
  as: Tag = "aside",
  edge,
  children
}: Props) {
  const edgeClass = !mobile && edge ? EDGE[edge] : "";
  return (
    <Tag
      id={"pg-panel-" + name}
      role={mobile ? "tabpanel" : undefined}
      aria-labelledby={mobile ? "pg-tab-" + name : undefined}
      aria-label={mobile ? undefined : label}
      className={`flex min-h-0 min-w-0 flex-col overflow-auto ${edgeClass}`}
    >
      {children}
    </Tag>
  );
}
