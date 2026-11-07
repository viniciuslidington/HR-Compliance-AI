import type { SelectHTMLAttributes } from "react";
import estilos from "./Select.module.css";

export function Select({ className, ...resto }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`text-body-sm ${estilos.select} ${className ?? ""}`} {...resto} />;
}
