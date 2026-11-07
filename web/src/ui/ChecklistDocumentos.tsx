import type { CSSProperties } from "react";
import type { DocumentoDetalhe } from "../api/api";
import { StatusPill } from "./StatusPill";
import estilos from "./ChecklistDocumentos.module.css";

export interface ChecklistDocumentosProps {
  documentos: DocumentoDetalhe[];
  ao_selecionar?: (id: string) => void;
}

const ROTULO_STATUS = { pendente: "Pendente", recebido: "Recebido", aprovado: "Aprovado", recusado: "Recusado" } as const;

function nome_do(d: DocumentoDetalhe): string {
  return d.tipo?.nome ?? d.documento.descricao_personalizada ?? "Documento";
}

export function ChecklistDocumentos({ documentos, ao_selecionar }: ChecklistDocumentosProps) {
  const total = documentos.length;
  const aprovados = documentos.filter((d) => d.documento.status === "aprovado").length;
  const pct = total === 0 ? 0 : (aprovados / total) * 100;

  return (
    <div className={estilos.raiz}>
      <div className={estilos.progresso}>
        <span className={`text-body-sm ${estilos.resumo}`}>{`${aprovados} de ${total} aprovados`}</span>
        <div
          className={estilos.trilho}
          role="progressbar"
          aria-label="Documentos aprovados"
          aria-valuemin={0}
          aria-valuemax={Math.max(total, 1)}
          aria-valuenow={aprovados}
        >
          <div className={estilos.barra} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className={estilos.lista}>
        {documentos.map((d, i) => {
          const { documento } = d;
          const nome = nome_do(d);
          const conteudo = (
            <>
              <span className="text-body-sm">
                <span className={`text-label ${estilos.nome}`}>{nome}</span>
                {documento.tentativas > 1 && (
                  <span className={`text-caption ${estilos.tentativa}`}>{`${documento.tentativas}ª tentativa`}</span>
                )}
              </span>
              <StatusPill status={documento.status} />
              {documento.motivo_recusa && (
                <span className={`text-body-sm ${estilos.motivo}`}>{documento.motivo_recusa}</span>
              )}
            </>
          );
          return (
            <li key={documento.id} className={estilos.item} style={{ "--i": Math.min(i, 8) } as CSSProperties}>
              {ao_selecionar ? (
                <button type="button" className={estilos.linha} aria-label={`${nome}, ${ROTULO_STATUS[documento.status]}`} onClick={() => ao_selecionar(documento.id)}>
                  {conteudo}
                </button>
              ) : (
                <div className={estilos.linha}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
