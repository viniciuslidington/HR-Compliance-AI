// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Estado } from "../domain/estado";
import type { TipoDocumento } from "../domain/tipos";
import { Servico } from "./servico";
import { ErroLeitura, PersistenciaMemoria, type Leitor, type ContextoConversa, type Conversador } from "./worker";

const JPEG = { dados: Buffer.from("jpeg"), mime: "image/jpeg" };

class LeitorFixo implements Leitor {
  recebidos: TipoDocumento[][] = [];
  constructor(private resposta: Awaited<ReturnType<Leitor["ler"]>> | Error) {}
  async ler(_i: Buffer, _m: string, candidatos: TipoDocumento[]) {
    this.recebidos.push(candidatos);
    if (this.resposta instanceof Error) throw this.resposta;
    return this.resposta;
  }
}

const estado = (s: { estado: string }) => JSON.parse(s.estado) as Estado;

async function nova_admissao(s: Servico, modelo_id = "eletricista") {
  const r = await s.executar("criar_admissao", [
    { nome: "Rafael Costa", whatsapp: "+5581999990000", cargo: "Eletricista", data_inicio: "2099-12-01", modelo_id,
      documentos: [{ tipo_documento_id: "cpf" }, { tipo_documento_id: "nr35" }] },
  ]);
  return (r.retorno as { id: string }).id;
}

describe("Servico (servidor do painel)", () => {
  it("conversa usa histórico e pendências reais, persiste a resposta e não aprova CPF digitado", async () => {
    const recebidos: ContextoConversa[] = [];
    const conversador: Conversador = { async responder(c) {
      recebidos.push(c);
      return { texto: "Recebi sua mensagem. Anexe uma foto legível do CPF pelo clipe.", encaminhar_rh: false };
    } };
    const p = new PersistenciaMemoria();
    const s = new Servico(p, null, conversador);
    const id = await nova_admissao(s);
    const antes = estado(await s.ler()).documentos;
    const r = await s.executar("enviar_texto", [id, "122222222"]);
    expect(recebidos[0].documentos.map((d) => d.nome)).toEqual(["CPF", "Certificado NR-35"]);
    expect(recebidos[0].historico.at(-1)?.autor).toBe("agente");
    expect(recebidos[0].nome).toBe("Rafael Costa");
    expect(estado(r).mensagens.at(-2)?.texto).toBe("122222222");
    expect(estado(r).mensagens.at(-1)?.texto).toContain("foto legível");
    expect(estado(r).documentos).toEqual(antes);
    await s.executar("enviar_texto", [id, "mandei"]);
    expect(recebidos[1].historico.at(-2)?.texto).toBe("122222222");
    expect((await new Servico(p, null).ler()).estado).toBe((await s.ler()).estado);
  });

  it("IA encaminha pedido de humano ao RH uma única vez", async () => {
    const s = new Servico(new PersistenciaMemoria(), null, { async responder() {
      return { texto: "Encaminhei sua dúvida ao RH.", encaminhar_rh: true };
    } });
    const id = await nova_admissao(s);
    await s.executar("enviar_texto", [id, "quero falar com uma pessoa"]);
    const e = estado(await s.executar("enviar_texto", [id, "por favor"]));
    expect(e.escalacoes.filter((x) => x.admissao_id === id && x.motivo === "fora_do_escopo")).toHaveLength(1);
  });

  it("falha da conversa permite tentar de novo sem gravar resposta nem duplicar mensagem", async () => {
    let falhar = true;
    const s = new Servico(new PersistenciaMemoria(), null, { async responder() {
      if (falhar) throw new Error("indisponível");
      return { texto: "Pode anexar por aqui.", encaminhar_rh: false };
    } });
    const id = await nova_admissao(s);
    const antes = (await s.ler()).estado;
    await expect(s.executar("enviar_texto", [id, "oi"])).rejects.toThrow("indisponível");
    expect((await s.ler()).estado).toBe(antes);
    falhar = false;
    const e = estado(await s.executar("enviar_texto", [id, "oi"]));
    expect(e.mensagens.filter((m) => m.admissao_id === id && m.direcao === "entrada")).toHaveLength(1);
  });

  it("nasce com o seed, grava no armazenamento e muda de versão a cada mutação", async () => {
    const p = new PersistenciaMemoria();
    const s = new Servico(p, null);
    const a = await s.ler();
    expect(estado(a).admissoes.length).toBeGreaterThan(0);
    expect(await p.ler("estado")).not.toBeNull();
    await nova_admissao(s);
    const b = await s.ler();
    expect(b.versao).not.toBe(a.versao);
    // Outro processo (deploy novo) lê o mesmo estado do armazenamento.
    const outro = new Servico(p, null);
    expect((await outro.ler()).estado).toBe(b.estado);
  });

  it("manda à IA os documentos da admissão e aplica a leitura no motor", async () => {
    const leitor = new LeitorFixo({
      tipo_documento_id: "nr35", qualidade: "ok",
      dados_extraidos: { nome: "Rafael Costa", data_realizacao: "2099-01-10", carga_horaria: "8h", responsavel_tecnico: "Eng. X" },
    });
    const s = new Servico(new PersistenciaMemoria(), leitor);
    const id = await nova_admissao(s);
    const r = await s.receber_arquivo({ admissao_id: id, nome_arquivo: "IMG_1.jpg", previa: JPEG, imagem: JPEG });
    expect(leitor.recebidos[0].map((t) => t.id)).toEqual(["cpf", "nr35"]);
    const e = estado(r);
    const nr35 = e.documentos.find((d) => d.admissao_id === id && d.tipo_documento_id === "nr35")!;
    expect(nr35.status).toBe("aprovado");
    const entrada = e.mensagens.find((m) => m.admissao_id === id && m.direcao === "entrada")!;
    expect(entrada.midia_url).toMatch(/^\/api\/midia\/[0-9a-f-]{36}$/);
    expect((await s.midia(entrada.midia_url!.split("/").pop()!))?.dados.toString()).toBe("jpeg");
  });

  it("IA fora do ar não conta tentativa", async () => {
    const s = new Servico(new PersistenciaMemoria(), new LeitorFixo(new ErroLeitura("503")));
    const id = await nova_admissao(s);
    const e = estado(await s.receber_arquivo({ admissao_id: id, nome_arquivo: "a.jpg", previa: JPEG, imagem: JPEG }));
    expect(e.documentos.filter((d) => d.admissao_id === id).every((d) => d.tentativas === 0)).toBe(true);
    expect(e.mensagens.at(-1)?.texto).toContain("não consegui ler o documento agora");
  });

  it("arquivo que não é foto (PDF) volta com pedido de foto", async () => {
    const s = new Servico(new PersistenciaMemoria(), new LeitorFixo(new Error("não deveria chamar")));
    const id = await nova_admissao(s);
    const e = estado(await s.receber_arquivo({ admissao_id: id, nome_arquivo: "cpf.pdf", previa: null, imagem: null }));
    expect(e.mensagens.at(-1)?.texto).toContain("só leio fotos");
  });
});
