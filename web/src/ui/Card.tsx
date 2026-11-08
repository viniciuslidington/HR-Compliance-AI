import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import estilos from "./Card.module.css";

export interface CardProps {
  titulo?: string;
  eyebrow?: string;
  acoes?: ReactNode;
  children: ReactNode;
}

export function Card({ titulo, eyebrow, acoes, children }: CardProps) {
  const tem_cabecalho = Boolean(titulo || eyebrow || acoes);
  return (
    <section className={estilos.card}>
      {tem_cabecalho && (
        <header className={estilos.cabecalho}>
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {titulo && <h2 className={`text-display-h3 ${estilos.titulo}`}>{titulo}</h2>}
          </div>
          {acoes && <div className={estilos.acoes}>{acoes}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
