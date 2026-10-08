import type { ReactNode } from "react";
import { Reveal } from "../Chapter";

/** Course block: h3 title over its content, revealed on scroll. */
export function TitledBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal className="flex flex-col gap-5">
      <h3 className="h3">{title}</h3>
      {children}
    </Reveal>
  );
}
