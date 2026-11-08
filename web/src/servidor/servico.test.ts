// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Estado } from "../domain/estado";
import type { TipoDocumento } from "../domain/tipos";
import { Servico } from "./servico";
import { ErroLeitura, PersistenciaMemoria, type Leitor } from "./worker";

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
