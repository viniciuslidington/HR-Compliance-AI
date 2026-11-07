import type { ReactNode } from "react";
import estilos from "./Eyebrow.module.css";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={`text-eyebrow ${estilos.eyebrow}`}>{children}</p>;
}
