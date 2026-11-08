"use client";

import { useId } from "react";
import estilos from "./Logo.module.css";

export const MARCA = "vinda";

export interface LogoProps {
  variante?: "completo" | "simbolo";
  tamanho?: "sm" | "md" | "lg" | "xl";
  tom?: "tinta" | "marca";
  className?: string;
}

/** Duas faixas, uma passagem: o intervalo diagonal permanece visível em uma cor. */
export function Simbolo({ className = "", tom = "tinta" }: { className?: string; tom?: LogoProps["tom"] }) {
  const id = useId();
  return (
    <span className={`${estilos.simbolo} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" className={estilos.desenho} fill="none" focusable="false">
        <defs>
          <linearGradient id={id} x1="8" y1="8" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--orange-soft)" />
            <stop offset="1" stopColor="var(--orange)" />
          </linearGradient>
        </defs>
        <g fill={tom === "marca" ? `url(#${id})` : "currentColor"}>
          <path className={estilos.faixa_entrada} d="M8 9H18L32 33L23 48L4 16C2 12 4 9 8 9Z" />
          <path className={estilos.faixa_continua} d="M46 9H56C59 9 60 12 58 15L37 51C34 56 30 56 27 51L26 49L35 33L46 9Z" />
        </g>
      </svg>
    </span>
  );
}

export function Logo({ variante = "completo", tamanho = "md", tom = "tinta", className = "" }: LogoProps) {
  return (
    <span className={`${estilos.logo} ${estilos[tamanho]} ${className}`} role="img" aria-label={MARCA}>
      <Simbolo tom={tom} />
      {variante === "completo" && <span className={estilos.nome} aria-hidden="true">{MARCA}</span>}
    </span>
  );
}
