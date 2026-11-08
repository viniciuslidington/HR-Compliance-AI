import estilos from "./Logo.module.css";

/** Nome da marca num lugar só: trocar aqui troca o wordmark e os textos de marca. */
export const MARCA = "vinda";

export interface LogoProps {
  /** `completo` = símbolo + nome; `simbolo` = só o tile. */
  variante?: "completo" | "simbolo";
  tamanho?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * O símbolo é um "v" que também é um check: dois traços que convergem num ponto.
 * Lê-se "vinda" (a chegada do colaborador) e "aprovado" (o documento resolvido).
 */
export function Simbolo({ className = "" }: { className?: string }) {
  return (
    <span className={`${estilos.tile} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" className={estilos.check} fill="none">
        <path d="M9.5 15.5 14.5 22 23 9.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Logo({ variante = "completo", tamanho = "md", className = "" }: LogoProps) {
  return (
    <span className={`${estilos.logo} ${estilos[tamanho]} ${className}`} role="img" aria-label={MARCA}>
      <Simbolo />
      {variante === "completo" && (
        <span className={estilos.nome} aria-hidden="true">
          {MARCA}
        </span>
      )}
    </span>
  );
}
