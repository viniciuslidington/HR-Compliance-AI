// Helpers compartilhados pelos handlers do motor. Operam sobre uma cópia do estado (mutam a cópia).
import { CATALOGO } from "../catalogo";
import { cadastrar_colaborador } from "../destino_mock";
import type { Estado } from "../estado";
import { novo_id } from "../estado";
import type { Admissao, DocumentoAdmissao, Escalacao, MotivoEscalacao, TipoDocumento } from "../tipos";
import * as conversa from "./conversa";
import { rotulo_curto } from "./conversa";

export function copiar(estado: Estado): Estado {
  return structuredClone(estado);
}

export function mensagem_entrada(
  e: Estado,
  admissao_id: string,
  texto: string,
  midia_url: string | null,
  agora: Date,
): void {
  e.mensagens.push({
    id: novo_id(e, "msg"),
    admissao_id,
    direcao: "entrada",
    texto,
    midia_url,
    criada_em: agora.toISOString(),
  });
}

/** `ordem` (1, 2, ...) desloca em ms para manter a ordem estável após a mensagem de entrada. */
export function mensagem_agente(e: Estado, admissao_id: string, texto: string, agora: Date, ordem = 1): void {
  e.mensagens.push({
    id: novo_id(e, "msg"),
    admissao_id,
    direcao: "saida",
    texto,
    midia_url: null,
    criada_em: new Date(agora.getTime() + ordem).toISOString(),
    autor: "agente",
  });
}

export function achar_admissao(e: Estado, id: string): Admissao {
  const a = e.admissoes.find((x) => x.id === id);
  if (!a) throw new Error(`Admissão não encontrada: ${id}`);
  return a;
}

export function documentos_da(e: Estado, admissao_id: string): DocumentoAdmissao[] {
  return e.documentos.filter((d) => d.admissao_id === admissao_id);
}

export function nome_do_documento(d: DocumentoAdmissao): string {
  const tipo = CATALOGO.find((t) => t.id === d.tipo_documento_id);
  return tipo?.nome ?? d.descricao_personalizada ?? "Documento";
}

export function rotulo_do_documento(d: DocumentoAdmissao): string {
  return rotulo_curto(d.tipo_documento_id, d.descricao_personalizada);
}

export function tipo_do_documento(d: DocumentoAdmissao): TipoDocumento {
  return (
    CATALOGO.find((t) => t.id === d.tipo_documento_id) ?? {
      id: "personalizado",
      nome: d.descricao_personalizada ?? "Documento",
      instrucao_colaborador: "",
      campos_extracao: [],
      regras_validacao: [],
    }
  );
}

/** Rótulos dos documentos que ainda não foram aprovados, na ordem do checklist. */
export function rotulos_faltantes(e: Estado, admissao_id: string): string[] {
  return documentos_da(e, admissao_id)
    .filter((d) => d.status !== "aprovado")
    .map(rotulo_do_documento);
}

export function abrir_escalacao(
  e: Estado,
  admissao: Admissao,
  motivo: MotivoEscalacao,
  documento_id: string | null,
  agora: Date,
): Escalacao {
  const esc: Escalacao = {
    id: novo_id(e, "esc"),
    admissao_id: admissao.id,
    documento_admissao_id: documento_id,
    motivo,
    status: "aberta",
    resolucao: null,
    criada_em: agora.toISOString(),
  };
  e.escalacoes.push(esc);
  if (admissao.status !== "concluida") admissao.status = "escalada";
  return esc;
}

/** Conclui a admissão: cadastra no destino, resolve escalações abertas e avisa a pessoa. */
export function concluir(e: Estado, admissao_id: string, agora: Date): void {
  const admissao = achar_admissao(e, admissao_id);
  const { id_externo } = cadastrar_colaborador(admissao, documentos_da(e, admissao_id));
  admissao.id_externo = id_externo;
  admissao.concluida_em = agora.toISOString();
  admissao.status = "concluida";
  for (const esc of e.escalacoes) {
    if (esc.admissao_id === admissao_id && esc.status === "aberta") {
      esc.status = "resolvida";
      esc.resolucao = "admissão concluída";
    }
  }
  mensagem_agente(e, admissao_id, conversa.conclusao(admissao.nome, id_externo, admissao.data_inicio), agora);
}
