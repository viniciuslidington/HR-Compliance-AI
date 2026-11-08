import { CATALOGO, MODELO_DOCUMENTO } from "../catalogo";
import { normalizar } from "../identificadores";
import type { Estado } from "../estado";
import { novo_id } from "../estado";
import type { Admissao, DocumentoAdmissao } from "../tipos";
import {
  abrir_escalacao,
  achar_admissao,
  copiar,
  mensagem_agente,
  mensagem_entrada,
  rotulos_faltantes,
} from "./comum";
import * as conversa from "./conversa";
import type { NovaAdmissaoInput } from "./eventos";

/** Ids dos tipos de documento do modelo, na ordem do catálogo de modelos. */
export function documentos_do_modelo(modelo_id: string): string[] {
  return MODELO_DOCUMENTO.filter((m) => m.modelo_id === modelo_id).map((m) => m.tipo_documento_id);
}

export function criar_admissao(estado: Estado, dados: NovaAdmissaoInput, agora: Date): Estado {
  const e = copiar(estado);
  const admissao: Admissao = {
    id: novo_id(e, "adm"),
    nome: dados.nome,
    whatsapp: dados.whatsapp,
    cargo: dados.cargo,
    data_inicio: dados.data_inicio,
    modelo_id: dados.modelo_id,
    status: "criada",
    id_externo: null,
    criada_em: agora.toISOString(),
    concluida_em: null,
  };
  e.admissoes.push(admissao);

  const docs: DocumentoAdmissao[] = dados.documentos.map((d) => ({
    id: novo_id(e, "doc"),
    admissao_id: admissao.id,
    tipo_documento_id: d.tipo_documento_id,
    descricao_personalizada: d.tipo_documento_id ? null : (d.descricao_personalizada ?? null),
    status: "pendente",
    tentativas: 0,
    motivo_recusa: null,
    dados_extraidos: null,
  }));
  e.documentos.push(...docs);

  // O agente começa na hora.
  admissao.status = "em_coleta";
  const itens = docs.map((d) => {
    const tipo = CATALOGO.find((t) => t.id === d.tipo_documento_id);
    return { nome: tipo?.nome ?? d.descricao_personalizada ?? "Documento", instrucao: tipo?.instrucao_colaborador ?? null };
  });
  mensagem_agente(e, admissao.id, conversa.boas_vindas(admissao.nome, admissao.data_inicio, itens), agora, 0);
  e.rev += 1;
  return e;
}

const PALAVRAS_FORA_DO_ESCOPO = ["salario", "beneficio", "contrato"];

export function receber_texto(estado: Estado, admissao_id: string, texto: string, agora: Date): Estado {
  const e = copiar(estado);
  const admissao = achar_admissao(e, admissao_id);
  mensagem_entrada(e, admissao_id, texto, null, agora);

  const t = normalizar(texto);
  if (PALAVRAS_FORA_DO_ESCOPO.some((p) => t.includes(p))) {
    const ja_aberta = e.escalacoes.some(
      (x) => x.admissao_id === admissao_id && x.motivo === "fora_do_escopo" && x.status === "aberta",
    );
    if (!ja_aberta) abrir_escalacao(e, admissao, "fora_do_escopo", null, agora);
    mensagem_agente(e, admissao_id, conversa.encaminhado_ao_rh(), agora);
  } else {
    mensagem_agente(e, admissao_id, conversa.status_pendentes(rotulos_faltantes(e, admissao_id)), agora);
  }
  e.rev += 1;
  return e;
}
