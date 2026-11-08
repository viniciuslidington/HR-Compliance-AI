import type { Admissao, DocumentoAdmissao, Motivo, TipoDocumento } from "../tipos";
import { validar_consistencia } from "./consistencia";
import { validar_qualidade } from "./qualidade";
import { validar_regras } from "./regras";

/** Resultado do leitor simulado (preenchido na Task 3). */
export interface LeituraMock {
  qualidade: "ok" | "ilegivel" | "tipo_errado";
  detalhe_qualidade?: string;
  /** Chaves = `campos_extracao` do tipo; datas YYYY-MM-DD. */
  dados_extraidos: Record<string, string>;
}

export interface EntradaValidacao {
  tipo: TipoDocumento;
  leitura: LeituraMock;
  admissao: Admissao;
  aprovados: DocumentoAdmissao[];
  agora: Date;
}

/** Qualidade primeiro (se falhar, para), depois regras do tipo, depois consistência. */
export function validar_envio(i: EntradaValidacao): { aprovado: boolean; motivos: Motivo[] } {
  const qualidade = validar_qualidade(i.tipo, i.leitura);
  if (qualidade.length > 0) return { aprovado: false, motivos: qualidade };
  const motivos = [
    ...validar_regras(i.tipo, i.leitura, i.admissao, i.agora),
    ...validar_consistencia(i.tipo, i.leitura, i.admissao, i.aprovados),
  ];
  return { aprovado: motivos.length === 0, motivos };
}
