import { normalizar } from "../identificadores";
import type { Admissao, DocumentoAdmissao, Motivo, TipoDocumento } from "../tipos";
import type { LeituraMock } from "./index";

function inconsistencia(texto: string): Motivo {
  return {
    codigo: "inconsistencia",
    texto,
    o_que_fazer: "confirme se o nome e a data de nascimento estão corretos e mande de novo o documento certo",
    gravidade: "escalada",
  };
}

/** Camada 3: coerência com o que já foi aprovado nesta admissão. */
export function validar_consistencia(
  tipo: TipoDocumento,
  leitura: LeituraMock,
  admissao: Admissao,
  aprovados: DocumentoAdmissao[],
): Motivo[] {
  const d = leitura.dados_extraidos;
  const rg = aprovados.find((a) => a.tipo_documento_id === "rg_cnh" && a.status === "aprovado");
  const motivos: Motivo[] = [];

  if (tipo.regras_validacao.includes("nome_igual_rg")) {
    const referencia = rg?.dados_extraidos?.nome ?? admissao.nome;
    if (normalizar(d.nome ?? "") !== normalizar(referencia)) {
      motivos.push(inconsistencia("o nome neste documento não confere com o do seu RG"));
    }
  }

  for (const doc of aprovados) {
    const nasc = doc.dados_extraidos?.data_nascimento;
    if (doc.status === "aprovado" && nasc && d.data_nascimento && nasc !== d.data_nascimento) {
      motivos.push(inconsistencia("a data de nascimento neste documento não confere com a do seu RG"));
      break;
    }
  }
  return motivos;
}
