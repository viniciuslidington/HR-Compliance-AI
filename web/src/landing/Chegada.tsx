"use client";

import { Logo, Simbolo } from "../ui/Logo";
import estilos from "./Chegada.module.css";

export interface ChegadaProps {
  /** `entrar`: revela a marca ao montar. `encaixar`: assenta o símbolo no estado concluído. */
  movimento?: "parado" | "entrar" | "encaixar";
  /** Com `encaixar`: true conclui a chegada do símbolo. */
  fechado?: boolean;
  tom?: "tinta" | "marca";
  className?: string;
}

export function SimboloChegada({ movimento = "parado", fechado = false, tom = "tinta", className = "" }: ChegadaProps) {
  return (
    <Simbolo
      tom={tom}
      className={`${estilos.simbolo} ${estilos[movimento] ?? ""} ${fechado ? estilos.fechado : ""} ${className}`}
    />
  );
}

export function MarcaChegada({ className = "", movimento = "entrar" }: { className?: string; movimento?: ChegadaProps["movimento"] }) {
  return (
    <Logo className={`${estilos.marca} ${estilos[movimento] ?? ""} ${className}`} />
  );
}
