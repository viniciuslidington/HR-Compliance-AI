import { data_local, dias_entre } from "../datas";
import type { Estado } from "../estado";
import { novo_id } from "../estado";
import type { NivelLembrete } from "../tipos";
import { abrir_escalacao, copiar, mensagem_agente, rotulos_faltantes } from "./comum";
import * as conversa from "./conversa";

const MS_DIA = 86_400_000;

function inicio_do_dia(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(a, m - 1, d).getTime();
}

export function alerta_prazo(admissao_id: string, estado: Estado): boolean {
  const a = estado.admissoes.find((x) => x.id === admissao_id);
  return (
    !!a &&
    a.status !== "concluida" &&
    estado.lembretes.some((l) => l.admissao_id === admissao_id && l.nivel === "firme")
  );
}

export function executar_cobranca(estado: Estado, agora: Date): Estado {
  const e = copiar(estado);
  const t = agora.getTime();
  let mudou = false;

  for (const a of e.admissoes) {
    if (a.status !== "em_coleta" && a.status !== "escalada") continue;
    const meus = e.lembretes.filter((l) => l.admissao_id === a.id);
    const ja = (nivel: NivelLembrete) => meus.some((l) => l.nivel === nivel);
    const enviar = (nivel: NivelLembrete, texto: string) => {
      e.lembretes.push({
        id: novo_id(e, "lem"),
        admissao_id: a.id,
        nivel,
        agendado_para: agora.toISOString(),
        enviado_em: agora.toISOString(),
      });
      mensagem_agente(e, a.id, texto, agora);
      mudou = true;
    };

    // No máximo UM lembrete por execução: o de nível mais alto devido (firme > prazo > leve). Os níveis
    // mais baixos pulados contam como enviados porque cada nível olha "já houve um nível ≥ este":
    // o prazo não sai se já saiu o firme, e o leve não sai se qualquer lembrete saiu depois da última
    // resposta do colaborador. Assim um salto grande de relógio manda só o firme, e nada depois duplica.
    const entradas = e.mensagens.filter((m) => m.admissao_id === a.id && m.direcao === "entrada");
    const referencia = entradas.length ? entradas[entradas.length - 1].criada_em : a.criada_em;
    const algum_depois = meus.some((l) => (l.enviado_em ?? "") >= referencia);
    const leve_devido = t - new Date(referencia).getTime() >= MS_DIA && !algum_depois;

    const criada = new Date(a.criada_em).getTime();
    const prazo_devido = t > (criada + inicio_do_dia(a.data_inicio)) / 2 && !ja("prazo") && !ja("firme");

    const dias = dias_entre(data_local(agora), a.data_inicio);
    const firme_devido = dias <= 2 && !ja("firme");

    if (firme_devido) enviar("firme", conversa.lembrete_firme(a.data_inicio, rotulos_faltantes(e, a.id)));
    else if (prazo_devido) enviar("prazo", conversa.lembrete_prazo(a.data_inicio, rotulos_faltantes(e, a.id)));
    else if (leve_devido) enviar("leve", conversa.lembrete_leve(rotulos_faltantes(e, a.id)));

    if (dias < 0 && !e.escalacoes.some((x) => x.admissao_id === a.id && x.motivo === "prazo_estourado")) {
      abrir_escalacao(e, a, "prazo_estourado", null, agora);
      mudou = true;
    }
  }

  if (!mudou) return estado;
  e.rev += 1;
  return e;
}
