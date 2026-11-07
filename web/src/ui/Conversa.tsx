import type { CSSProperties } from "react";
import type { Mensagem } from "../domain/tipos";
import { ImagemEnvio } from "./ImagemEnvio";
import estilos from "./Conversa.module.css";

export interface ConversaProps {
  mensagens: Mensagem[];
  resolver_midia: (url: string | null) => string | null;
  variante?: "painel" | "telefone";
  /** Variante "telefone": de quem é o aparelho. "entrada" = o colaborador (as suas ficam à direita). */
  proprio?: "entrada" | "saida";
  /** Anuncia mensagens novas a leitores de tela (aria-live polite). Desligue em trechos estáticos. */
  live?: boolean;
}

function hora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function Conversa({
  mensagens,
  resolver_midia,
  variante = "painel",
  proprio = "saida",
  live = true,
}: ConversaProps) {
  const ordenadas = [...mensagens].sort((a, b) => Date.parse(a.criada_em) - Date.parse(b.criada_em));

  return (
    <div role="log" aria-live={live ? "polite" : "off"} aria-label="Conversa">
      <ul className={`${estilos.lista} ${estilos[variante]} ${proprio === "entrada" ? estilos.do_colaborador : ""}`}>
        {ordenadas.map((m, i) => {
          const legenda = m.direcao === "entrada" ? "Colaborador" : m.autor === "rh" ? "RH" : "Agente";
          return (
            <li
              key={m.id}
              className={estilos.msg}
              data-direcao={m.direcao}
              data-autor={m.autor ?? (m.direcao === "saida" ? "agente" : "colaborador")}
              style={{ "--i": Math.min(i, 8) } as CSSProperties}
            >
              <div className={`text-caption ${estilos.meta}`}>
                <span className={estilos.autor}>{legenda}</span>
                <time dateTime={m.criada_em}>{hora(m.criada_em)}</time>
              </div>
              {m.midia_url && (
                <div className={estilos.midia}>
                  <ImagemEnvio src={resolver_midia(m.midia_url)} alt="Imagem enviada na conversa" />
                </div>
              )}
              {m.texto && <p className={`text-body-sm ${estilos.texto}`}>{m.texto}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
