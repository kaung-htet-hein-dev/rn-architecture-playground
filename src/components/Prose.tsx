import type { ReactNode } from "react";

export const P = ({ children }: { children: ReactNode }) => (
  <p className="prose-atb">{children}</p>
);

export const B = ({ children }: { children: ReactNode }) => (
  <strong>{children}</strong>
);
