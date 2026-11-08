import { describe, expect, it } from "vitest";
import { alerta_prazo } from "../domain/motor/cobranca";
import { gerar_seed } from "./seed";

const AGORA = new Date(2026, 10, 7, 10, 0, 0);

function por_nome(e: ReturnType<typeof gerar_seed>, nome: string) {
  const a = e.admissoes.find((x) => x.nome === nome)!;
  const docs = e.documentos.filter((d) => d.admissao_id === a.id);
  return { a, docs, pendentes: docs.filter((d) => d.status !== "aprovado").length };
}

describe("gerar_seed", () => {
  const e = gerar_seed(AGORA);

  it("tem as quatro admissões, com relógio zerado e época 0", () => {
    expect(e.admissoes.map((a) => a.nome)).toEqual(["Ana Souza", "Bruno Lima", "Diego Rocha", "Carla Mendes"]);
    expect(e.relogio.deslocamento_ms).toBe(0);
    expect(e.epoca).toBe(0);
  });

  it("Ana: Estágio, em_coleta, 4 de 5, início em 20 dias", () => {
    const { a, docs, pendentes } = por_nome(e, "Ana Souza");
    expect(a.cargo).toBe("Estagiária de RH");
    expect(a.modelo_id).toBe("estagio");
    expect(a.status).toBe("em_coleta");
    expect([pendentes, docs.length]).toEqual([4, 5]);
    expect(a.data_inicio).toBe("2026-11-27");
    expect(a.criada_em).toBe(new Date(AGORA.getTime() - 86_400_000).toISOString());
  });

  it("Bruno: CLT, escalada por tres_falhas, 3 envios recusados do comprovante, início em 2 dias", () => {
    const { a, docs, pendentes } = por_nome(e, "Bruno Lima");
    expect(a.modelo_id).toBe("clt_padrao");
    expect(a.status).toBe("escalada");
    expect([pendentes, docs.length]).toEqual([3, 4]);
    expect(a.data_inicio).toBe("2026-11-09");
    const comp = docs.find((d) => d.tipo_documento_id === "comprovante_residencia")!;
    const recusados = e.envios.filter((x) => x.documento_admissao_id === comp.id && x.resultado === "recusado");
    expect(recusados).toHaveLength(3);
    const esc = e.escalacoes.filter((x) => x.admissao_id === a.id && x.status === "aberta");
    expect(esc.map((x) => x.motivo)).toEqual(["tres_falhas"]);
    expect(alerta_prazo(a.id, e)).toBe(true);
    expect(e.lembretes.filter((l) => l.admissao_id === a.id).map((l) => l.nivel)).toEqual(["firme"]);
  });

  it("Diego: Estágio, 5 de 5, criado hoje, início em 25 dias", () => {
    const { a, docs, pendentes } = por_nome(e, "Diego Rocha");
    expect(a.cargo).toBe("Estagiário de TI");
    expect([pendentes, docs.length]).toEqual([5, 5]);
    expect(a.data_inicio).toBe("2026-12-02");
    expect(e.envios.filter((x) => docs.some((d) => d.id === x.documento_admissao_id))).toHaveLength(0);
  });

  it("Carla: CLT, concluída com id_externo, início em 9 dias", () => {
    const { a, pendentes } = por_nome(e, "Carla Mendes");
    expect(a.status).toBe("concluida");
    expect(a.id_externo).toBeTruthy();
    expect(pendentes).toBe(0);
    expect(a.data_inicio).toBe("2026-11-16");
  });

  it("WhatsApp fictício no formato +55 11 9XXXX-XXXX e envios apontam para /seed/*.svg", () => {
    for (const a of e.admissoes) expect(a.whatsapp).toMatch(/^\+55 11 9\d{4}-\d{4}$/);
    expect(e.envios.length).toBeGreaterThan(0);
    for (const x of e.envios) expect(x.arquivo_url).toMatch(/^\/seed\/[a-z]+\.svg$/);
  });

  it("mensagens e envios ficam no passado (a menos do desvio de ms que ordena as respostas do agente)", () => {
    const limite = AGORA.getTime() + 5;
    for (const m of e.mensagens) expect(new Date(m.criada_em).getTime()).toBeLessThanOrEqual(limite);
    for (const x of e.envios) expect(new Date(x.criado_em).getTime()).toBeLessThanOrEqual(limite);
  });
});
