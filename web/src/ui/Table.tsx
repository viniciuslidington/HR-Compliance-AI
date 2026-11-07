import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import estilos from "./Table.module.css";

export interface ColunaTabela {
  chave: string;
  titulo: string;
  alinhar?: "inicio" | "fim";
}

export interface TableProps<T> {
  colunas: ColunaTabela[];
  linhas: T[];
  render: (linha: T, chave: string) => ReactNode;
  chave_linha: (linha: T) => string;
  ao_clicar?: (linha: T) => void;
  vazio?: ReactNode;
}

export function Table<T>({ colunas, linhas, render, chave_linha, ao_clicar, vazio }: TableProps<T>) {
  if (linhas.length === 0 && vazio) {
    return <div className={`text-body-sm ${estilos.envoltorio} ${estilos.vazio}`}>{vazio}</div>;
  }

  function ao_teclar(e: KeyboardEvent<HTMLTableRowElement>, linha: T) {
    if (e.target === e.currentTarget && e.key === "Enter") {
      e.preventDefault();
      ao_clicar?.(linha);
    }
  }

  return (
    <div className={estilos.envoltorio}>
      <table className={`text-body-sm ${estilos.tabela}`}>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.chave} scope="col" className={`text-label ${estilos.th} ${c.alinhar === "fim" ? estilos.fim : ""}`}>
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr
              key={chave_linha(linha)}
              className={`${estilos.linha} ${ao_clicar ? estilos.clicavel : ""}`}
              style={{ "--i": Math.min(i, 8) } as CSSProperties}
              tabIndex={ao_clicar ? 0 : undefined}
              onClick={
                ao_clicar
                  ? (e) => {
                      const interno = (e.target as HTMLElement).closest("button,a");
                      if (interno && interno !== e.currentTarget) return;
                      ao_clicar(linha);
                    }
                  : undefined
              }
              onKeyDown={ao_clicar ? (e) => ao_teclar(e, linha) : undefined}
            >
              {colunas.map((c) => (
                <td key={c.chave} className={`${estilos.td} ${c.alinhar === "fim" ? estilos.fim : ""}`}>
                  <span className={`text-caption ${estilos.rotulo}`}>{c.titulo}</span>
                  <span>{render(linha, c.chave)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
