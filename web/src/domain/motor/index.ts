// Motor do agente: `aplicar` é pura e despacha cada evento ao seu handler.
import type { Estado } from "../estado";
import { criar_admissao, receber_texto } from "./admissao";
import { executar_cobranca } from "./cobranca";
import { resolver_escalacao } from "./escalacoes";
import { receber_arquivo } from "./documentos";
import type { Evento } from "./eventos";

export type { Evento, NovaAdmissaoInput } from "./eventos";

export function aplicar(estado: Estado, evento: Evento, agora: Date): Estado {
  switch (evento.tipo) {
    case "admissao_criada":
      return criar_admissao(estado, evento.dados, agora);
    case "arquivo_recebido":
      return receber_arquivo(estado, evento.admissao_id, evento.nome_arquivo, evento.arquivo_url, agora);
    case "texto_recebido":
      return receber_texto(estado, evento.admissao_id, evento.texto, agora);
    case "tempo_avancado":
      return executar_cobranca(estado, new Date(evento.ate));
    case "escalacao_resolvida":
      return resolver_escalacao(estado, evento, agora);
    case "reset": // Task 7 (no store)
      return estado;
  }
}
