"use client";

import { useId } from "react";
import { MARCA } from "../ui/Logo";
import estilos from "./Chegada.module.css";

/*
 * Proposta B de símbolo (docs/brand/claude/REVISAO.md): um disco cortado em três faixas diagonais;
 * a de cima ainda está chegando. Isolado aqui até a escolha da usuária; aprovado, os paths vão
 * para o Simbolo de ui/Logo.tsx.
 */
const FAIXA_CHEGANDO = "M41.23 5.57 L5.57 41.23 A28 28 0 0 1 41.23 5.57Z";
const FAIXA_MEIO = "M7.55 45.65 L45.65 7.55 A28 28 0 0 1 54.90 15.90 L15.90 54.90 A28 28 0 0 1 7.55 45.65Z";
const FAIXA_BASE = "M19.93 57.27 L57.27 19.93 A28 28 0 0 1 19.93 57.27Z";

export interface ChegadaProps {
  /** `entrar`: as faixas deslizam até o lugar ao montar. `encaixar`: a faixa de cima fecha o disco (estado concluído). */
  movimento?: "parado" | "entrar" | "encaixar";
  /** Com `encaixar`: true fecha o disco. */
  fechado?: boolean;
  tom?: "tinta" | "marca";
  className?: string;
}

export function SimboloChegada({ movimento = "parado", fechado = false, tom = "tinta", className = "" }: ChegadaProps) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${estilos.simbolo} ${estilos[movimento] ?? ""} ${fechado ? estilos.fechado : ""} ${className}`}
      fill={tom === "marca" ? `url(#${id})` : "currentColor"}
      aria-hidden="true"
      focusable="false"
    >
      {tom === "marca" && (
        <defs>
          <linearGradient id={id} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--orange-soft)" />
            <stop offset="1" stopColor="var(--orange)" />
          </linearGradient>
        </defs>
      )}
      <path className={estilos.chegando} d={FAIXA_CHEGANDO} />
      <path className={estilos.meio} d={FAIXA_MEIO} />
      <path d={FAIXA_BASE} />
    </svg>
  );
}

export function MarcaChegada({ className = "", movimento = "entrar" }: { className?: string; movimento?: ChegadaProps["movimento"] }) {
  return (
    <span className={`${estilos.marca} ${className}`} role="img" aria-label={MARCA}>
      <SimboloChegada movimento={movimento} />
      <span className={estilos.nome} aria-hidden="true">
        {MARCA}
      </span>
    </span>
  );
}
