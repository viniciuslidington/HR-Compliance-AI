// Sistema de destino simulado (cadastro do colaborador). TypeScript puro.
import type { Admissao, DocumentoAdmissao } from "./tipos";

function hash(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function cadastrar_colaborador(
  a: Admissao,
  docs: DocumentoAdmissao[],
): { id_externo: string } {
  if (docs.some((d) => d.status !== "aprovado")) {
    throw new Error("Não é possível cadastrar: há documentos que não foram aprovados.");
  }
  return { id_externo: `COL-${String(hash(a.id) % 1_000_000).padStart(6, "0")}` };
}
