// Motor do agente: `aplicar` é pura e despacha cada evento ao seu handler.
// Tasks 5 e 6 acrescentam `escalacao_resolvida` e `tempo_avancado` ao switch.
import type { Estado } from "../estado";
import { criar_admissao, receber_texto } from "./admissao";
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
    case "tempo_avancado": // Task 6
    case "escalacao_resolvida": // Task 5
    case "reset": // Task 7 (no store)
      return estado;
  }
}
