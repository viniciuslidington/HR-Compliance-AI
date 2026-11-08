import type { StatusAdmissao, StatusDocumento } from "../domain/tipos";
import estilos from "./StatusPill.module.css";

export type StatusExibivel = StatusAdmissao | StatusDocumento;

const ROTULOS: Record<StatusExibivel, string> = {
  criada: "Criada",
  em_coleta: "Em coleta",
  escalada: "Escalada",
  concluida: "Concluída",
  pendente: "Pendente",
  recebido: "Recebido",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export function StatusPill({ status }: { status: StatusExibivel }) {
  return (
    <span data-status={status} className={`text-label ${estilos.pill} ${estilos[status]}`}>
      {ROTULOS[status]}
    </span>
  );
}
