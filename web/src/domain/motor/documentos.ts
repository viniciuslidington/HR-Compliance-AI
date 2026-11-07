import { identificar_tipo, ler_documento_mock } from "../leitor_mock";
import type { Estado } from "../estado";
import { novo_id } from "../estado";
import { validar_envio } from "../validacao";
import type { DocumentoAdmissao, MotivoEscalacao } from "../tipos";
import {
  abrir_escalacao,
  achar_admissao,
  concluir,
  copiar,
  documentos_da,
  mensagem_agente,
  mensagem_entrada,
  rotulos_faltantes,
  tipo_do_documento,
} from "./comum";
import * as conversa from "./conversa";

const LIMITE_TENTATIVAS = 3;

function escolher_alvo(pendentes: DocumentoAdmissao[], nome_arquivo: string): DocumentoAdmissao | undefined {
  const candidatos = pendentes.map((d) => d.tipo_documento_id).filter((t): t is string => t !== null);
  const id = identificar_tipo(nome_arquivo, candidatos);
  const alvo = id ? pendentes.find((d) => d.tipo_documento_id === id) : undefined;
  return alvo ?? pendentes[0];
}

export function receber_arquivo(
  estado: Estado,
  admissao_id: string,
  nome_arquivo: string,
  arquivo_url: string,
  agora: Date,
): Estado {
  const e = copiar(estado);
  const admissao = achar_admissao(e, admissao_id);
  mensagem_entrada(e, admissao_id, nome_arquivo, arquivo_url, agora);

  const docs = documentos_da(e, admissao_id);
  const doc = escolher_alvo(
    docs.filter((d) => d.status === "pendente" || d.status === "recusado"),
    nome_arquivo,
  );
  if (!doc) {
    mensagem_agente(e, admissao_id, conversa.nada_pendente(), agora);
    e.rev += 1;
    return e;
  }

  const tipo = tipo_do_documento(doc);
  const tentativa = doc.tentativas + 1;
  const leitura = ler_documento_mock({
    tipo_documento_id: tipo.id,
    nome_arquivo,
    admissao,
    tentativa,
    agora,
  });
  const aprovados = docs.filter((d) => d.status === "aprovado");
  const { aprovado, motivos } = validar_envio({ tipo, leitura, admissao, aprovados, agora });

  if (aprovado) {
    doc.status = "aprovado";
    doc.dados_extraidos = leitura.dados_extraidos;
    doc.motivo_recusa = null;
    e.envios.push({
      id: novo_id(e, "env"),
      documento_admissao_id: doc.id,
      arquivo_url,
      resultado: "aprovado",
      motivo: null,
      criado_em: agora.toISOString(),
    });
    const faltantes = rotulos_faltantes(e, admissao_id);
    if (faltantes.length === 0) {
      concluir(e, admissao_id, agora);
    } else {
      mensagem_agente(
        e,
        admissao_id,
        conversa.aprovado(doc.tipo_documento_id, doc.descricao_personalizada, faltantes),
        agora,
      );
    }
    e.rev += 1;
    return e;
  }

  const motivo = motivos[0];
  const houve_inconsistencia_antes = e.envios.some(
    (x) =>
      x.documento_admissao_id === doc.id && x.resultado === "recusado" && x.motivo_codigo === "inconsistencia",
  );
  doc.tentativas = tentativa;
  doc.status = "pendente";
  doc.motivo_recusa = motivo.texto;
  e.envios.push({
    id: novo_id(e, "env"),
    documento_admissao_id: doc.id,
    arquivo_url,
    resultado: "recusado",
    motivo: motivo.texto,
    motivo_codigo: motivo.codigo,
    criado_em: agora.toISOString(),
  });
  mensagem_agente(e, admissao_id, conversa.recusado(motivo.texto, motivo.o_que_fazer), agora, 1);

  let razao: MotivoEscalacao | null = null;
  if (motivo.gravidade === "escalada" && houve_inconsistencia_antes) razao = "inconsistencia";
  else if (doc.tentativas >= LIMITE_TENTATIVAS) razao = "tres_falhas";
  const ja_aberta = e.escalacoes.some(
    (x) => x.documento_admissao_id === doc.id && x.status === "aberta",
  );
  if (razao && !ja_aberta) {
    abrir_escalacao(e, admissao, razao, doc.id, agora);
    mensagem_agente(e, admissao_id, conversa.aviso_escalacao_documento(), agora, 2);
  }
  e.rev += 1;
  return e;
}
