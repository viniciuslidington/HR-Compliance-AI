import type { Estado } from "../estado";
import { novo_id } from "../estado";
import type { Escalacao } from "../tipos";
import {
  achar_admissao,
  concluir,
  copiar,
  documentos_da,
  mensagem_agente,
  rotulo_do_documento,
  rotulos_faltantes,
  tipo_do_documento,
} from "./comum";
import * as conversa from "./conversa";
import type { Evento } from "./eventos";

export function acao_sugerida(e: Escalacao): string {
  switch (e.motivo) {
    case "tres_falhas":
      return "Conferir a imagem e aprovar manualmente ou pedir de novo";
    case "inconsistencia":
      return "Comparar os documentos e decidir";
    case "fora_do_escopo":
      return "Responder a pergunta do colaborador";
    case "prazo_estourado":
      return "Falar com o colaborador ou adiar o início";
    case "suspeita_adulteracao":
      return "Verificar a autenticidade";
  }
}

type Resolvida = Extract<Evento, { tipo: "escalacao_resolvida" }>;

export function resolver_escalacao(estado: Estado, ev: Resolvida, agora: Date): Estado {
  const e = copiar(estado);
  const esc = e.escalacoes.find((x) => x.id === ev.escalacao_id);
  if (!esc) throw new Error(`Escalação não encontrada: ${ev.escalacao_id}`);
  if (esc.status === "resolvida") return estado;
  const admissao = achar_admissao(e, esc.admissao_id);
  const doc = documentos_da(e, admissao.id).find((d) => d.id === esc.documento_admissao_id);

  esc.status = "resolvida";
  if (ev.acao === "aprovar_manualmente") {
    esc.resolucao = "aprovado manualmente";
    if (doc) {
      doc.status = "aprovado";
      doc.motivo_recusa = null;
      const faltantes = rotulos_faltantes(e, admissao.id);
      if (faltantes.length === 0) concluir(e, admissao.id, agora);
      else
        mensagem_agente(
          e,
          admissao.id,
          conversa.aprovado_pelo_rh(doc.tipo_documento_id, doc.descricao_personalizada, faltantes),
          agora,
        );
    }
  } else if (ev.acao === "pedir_de_novo") {
    esc.resolucao = "pediu reenvio";
    if (doc) {
      doc.status = "pendente";
      doc.tentativas = 0;
      const instrucao = tipo_do_documento(doc).instrucao_colaborador || null;
      mensagem_agente(e, admissao.id, conversa.pedir_de_novo(rotulo_do_documento(doc), instrucao), agora);
    }
  } else {
    esc.resolucao = "RH falou com o colaborador";
    e.mensagens.push({
      id: novo_id(e, "msg"),
      admissao_id: admissao.id,
      direcao: "saida",
      texto: ev.texto ?? "",
      midia_url: null,
      criada_em: agora.toISOString(),
      autor: "rh",
    });
  }

  if (admissao.status !== "concluida" && !e.escalacoes.some((x) => x.admissao_id === admissao.id && x.status === "aberta"))
    admissao.status = "em_coleta";
  e.rev += 1;
  return e;
}
