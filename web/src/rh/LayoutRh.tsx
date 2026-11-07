"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useConsulta } from "../api/contexto";
import { BarraDemo } from "./BarraDemo";
import estilos from "./LayoutRh.module.css";

export interface LayoutRhProps {
  caminho_atual: string;
  children: ReactNode;
}

const ITENS = [
  { href: "/rh", rotulo: "Admissões", chave: "lista" },
  { href: "/rh/admissoes/nova", rotulo: "Nova admissão", chave: "nova" },
  { href: "/rh/escalacoes", rotulo: "Escalações", chave: "escalacoes" },
  { href: "/rh/catalogo", rotulo: "Catálogo e modelos", chave: "catalogo" },
] as const;

/** Item ativo: `/rh` só casa exato (ou com uma admissão aberta); os demais casam por prefixo. */
function ativo(href: string, caminho: string): boolean {
  if (href === "/rh") return caminho === "/rh" || (caminho.startsWith("/rh/admissoes/") && !caminho.startsWith("/rh/admissoes/nova"));
  return caminho === href || caminho.startsWith(`${href}/`);
}

export function LayoutRh({ caminho_atual, children }: LayoutRhProps) {
  const abertas = useConsulta((api) => api.listar_escalacoes({ status: "aberta" }).length);

  return (
    <div className={estilos.raiz}>
      <nav className={estilos.nav} aria-label="Painel do RH">
        <p className={`text-display-h3 ${estilos.marca}`}>Admissão</p>
        <ul className={estilos.lista}>
          {ITENS.map((item) => {
            const e_ativo = ativo(item.href, caminho_atual);
            return (
              <li key={item.chave}>
                <Link
                  href={item.href}
                  className={`text-body-sm ${estilos.item} ${e_ativo ? estilos.ativo : ""}`}
                  aria-current={e_ativo ? "page" : undefined}
                >
                  <span className={estilos.ponto} aria-hidden="true" />
                  {item.rotulo}
                  {item.chave === "escalacoes" && abertas !== null && abertas > 0 && (
                    <span className={`text-caption ${estilos.contagem}`} aria-label={`${abertas} abertas`}>
                      {abertas}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={estilos.coluna}>
        <main className={estilos.principal}>{children}</main>
        <BarraDemo />
      </div>
    </div>
  );
}
