import { describe, expect, it, vi } from "vitest";
import { data_local } from "../domain/datas";
import { ArmazenamentoMemoria } from "../store/armazenamento";
import { reduzir_imagem } from "../store/arquivos";
import { CHAVE_ESTADO } from "../store/estado";
import type { NovaAdmissaoInput } from "./api";
import { MockApi } from "./mock_api";

const BASE = new Date(2026, 10, 7, 10, 0, 0).getTime();
const relogio = () => BASE;

function nova(): { arm: ArmazenamentoMemoria; api: MockApi } {
  const arm = new ArmazenamentoMemoria();
  return { arm, api: new MockApi(arm, relogio) };
}

function input(): NovaAdmissaoInput {
  return {
    nome: "Elisa Prado",
    whatsapp: "+55 11 90000-0000",
    cargo: "Analista",
    data_inicio: "2026-11-30",
    modelo_id: "clt_padrao",
    documentos: [{ tipo_documento_id: "rg_cnh" }, { tipo_documento_id: "cpf" }],
  };
}

describe("MockApi: leitura", () => {
  it("gera o seed quando não há estado, e quando o JSON é inválido", () => {
    const { arm, api } = nova();
    expect(api.listar_admissoes()).toHaveLength(4);
    expect(arm.ler(CHAVE_ESTADO)).not.toBeNull();
    arm.gravar(CHAVE_ESTADO, "{lixo");
    expect(new MockApi(arm, relogio).listar_admissoes()).toHaveLength(4);
  });

  it("listar_admissoes: escaladas primeiro, depois por data de início; DTO completo", () => {
    const { api } = nova();
    const l = api.listar_admissoes();
    expect(l.map((r) => r.admissao.nome)).toEqual(["Bruno Lima", "Ana Souza", "Diego Rocha", "Carla Mendes"]);
    const ana = l.find((r) => r.admissao.nome === "Ana Souza")!;
    expect(ana).toMatchObject({ pendentes: 4, total: 5, rotulo_inicio: "em 3 dias", modelo_nome: "Estágio" });
    const bruno = l[0];
    expect(bruno).toMatchObject({ alerta_prazo: true, escalacoes_abertas: 1, pendentes: 3, total: 4 });
  });

  it("resumo_status conta por status", () => {
    const { api } = nova();
    expect(api.resumo_status()).toEqual({ criada: 0, em_coleta: 2, escalada: 1, concluida: 1 });
  });

  it("obter_admissao devolve docs com tipo e envios, mensagens ordenadas; null se não existe", () => {
    const { api } = nova();
    const bruno = api.listar_admissoes()[0].admissao;
    const d = api.obter_admissao(bruno.id)!;
    expect(d.modelo_nome).toBe("CLT padrão");
    expect(d.documentos).toHaveLength(4);
    const comp = d.documentos.find((x) => x.documento.tipo_documento_id === "comprovante_residencia")!;
    expect(comp.tipo?.nome).toBe("Comprovante de residência");
    expect(comp.envios).toHaveLength(3);
    const tempos = d.mensagens.map((m) => m.criada_em);
    expect([...tempos].sort()).toEqual(tempos);
    expect(d.escalacoes).toHaveLength(1);
    expect(api.obter_admissao("nao_existe")).toBeNull();
  });

  it("listar_escalacoes traz a ação sugerida e as ações permitidas", () => {
    const { api } = nova();
    const [v] = api.listar_escalacoes({ status: "aberta" });
    expect(v.escalacao.motivo).toBe("tres_falhas");
    expect(v.acao_sugerida).toBe("Conferir a imagem e aprovar manualmente ou pedir de novo");
    expect(v.documento?.tipo_documento_id).toBe("comprovante_residencia");
    expect(v.acoes_permitidas).toEqual(["aprovar_manualmente", "pedir_de_novo", "falar_com_colaborador"]);
    expect(api.listar_escalacoes({ status: "resolvida" })).toHaveLength(0);
  });

  it("catálogo e modelos são só leitura", () => {
    const { api } = nova();
    expect(api.listar_catalogo().length).toBeGreaterThanOrEqual(5);
    const m = api.listar_modelos().find((x) => x.modelo.id === "estagio")!;
    expect(m.tipos.map((t) => t.id)).toContain("declaracao_matricula");
  });
});

describe("MockApi: mutações", () => {
  it("criar_admissao -> listar_admissoes (ida e volta) e notifica", () => {
    const { api } = nova();
    const cb = vi.fn();
    api.assinar(cb);
    const a = api.criar_admissao(input());
    expect(cb).toHaveBeenCalledTimes(1);
    const r = api.listar_admissoes().find((x) => x.admissao.id === a.id)!;
    expect(r.admissao.nome).toBe("Elisa Prado");
    expect(r).toMatchObject({ pendentes: 2, total: 2 });
    expect(a.status).toBe("em_coleta");
  });

  it("evento storage de outra janela notifica os assinantes; cancelar para", () => {
    const { arm, api } = nova();
    const cb = vi.fn();
    const cancelar = api.assinar(cb);
    arm.disparar_externo(CHAVE_ESTADO);
    expect(cb).toHaveBeenCalledTimes(1);
    arm.disparar_externo("arquivo:1");
    expect(cb).toHaveBeenCalledTimes(1);
    arm.disparar_externo(null);
    expect(cb).toHaveBeenCalledTimes(2);
    cancelar();
    arm.disparar_externo(CHAVE_ESTADO);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("mutação relê o estado antes de aplicar: duas instâncias não perdem nada", () => {
    const arm = new ArmazenamentoMemoria();
    const a = new MockApi(arm, relogio);
    const b = new MockApi(arm, relogio);
    const bruno = a.listar_admissoes()[0].admissao; // a leu o estado antes
    const esc = a.listar_escalacoes({ status: "aberta" })[0];
    b.enviar_texto(bruno.id, "oi, tudo bem?"); // b muda o estado depois da leitura de a
    a.resolver_escalacao(esc.escalacao.id, "pedir_de_novo");
    const d = b.obter_admissao(bruno.id)!;
    expect(d.mensagens.some((m) => m.direcao === "entrada" && m.texto === "oi, tudo bem?")).toBe(true);
    expect(d.escalacoes[0].status).toBe("resolvida");
    expect(d.documentos.find((x) => x.documento.tipo_documento_id === "comprovante_residencia")!.documento.status).toBe(
      "pendente",
    );
  });

  it("resolver_escalacao com falar_com_colaborador grava a mensagem do RH", () => {
    const { api } = nova();
    const esc = api.listar_escalacoes({ status: "aberta" })[0];
    api.resolver_escalacao(esc.escalacao.id, "falar_com_colaborador", "Oi Bruno, pode mandar por aqui?");
    const d = api.obter_admissao(esc.admissao.id)!;
    expect(d.mensagens.some((m) => m.autor === "rh" && m.texto === "Oi Bruno, pode mandar por aqui?")).toBe(true);
  });

  it("enviar_arquivo: cai no placeholder se não decodifica e registra o envio", async () => {
    const api = new MockApi(new ArmazenamentoMemoria(), relogio, {
      reduzir_imagem: (f) => reduzir_imagem(f, () => Promise.reject(new Error("não decodifica"))),
    });
    const ana = api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao;
    const f = new File(["x"], "cpf.jpg", { type: "image/jpeg" });
    await api.enviar_arquivo(ana.id, f);
    const d = api.obter_admissao(ana.id)!;
    const entrada = d.mensagens.filter((m) => m.direcao === "entrada").pop()!;
    expect(entrada.midia_url).toBe("/seed/placeholder.svg");
    expect(api.resolver_midia(entrada.midia_url)).toBe("/seed/placeholder.svg");
  });

  it("enviar_arquivo: grava arquivo:<id> e resolver_midia devolve o data URL", async () => {
    const arm = new ArmazenamentoMemoria();
    const api = new MockApi(arm, relogio, { reduzir_imagem: async () => "data:image/jpeg;base64,AAAA" });
    const ana = api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao;
    await api.enviar_arquivo(ana.id, new File(["x"], "cpf.jpg", { type: "image/jpeg" }));
    const entrada = api.obter_admissao(ana.id)!.mensagens.filter((m) => m.direcao === "entrada").pop()!;
    expect(entrada.midia_url).toMatch(/^local:/);
    expect(arm.chaves().some((k) => k.startsWith("arquivo:"))).toBe(true);
    expect(api.resolver_midia(entrada.midia_url)).toBe("data:image/jpeg;base64,AAAA");
    expect(api.resolver_midia(null)).toBeNull();
  });

  it("enviar_arquivo: QuotaExceededError ao gravar vira placeholder", async () => {
    class Cheio extends ArmazenamentoMemoria {
      gravar(chave: string, valor: string) {
        if (chave.startsWith("arquivo:")) throw new DOMException("cheio", "QuotaExceededError");
        super.gravar(chave, valor);
      }
    }
    const api = new MockApi(new Cheio(), relogio, { reduzir_imagem: async () => "data:image/jpeg;base64,AAAA" });
    const ana = api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao;
    await api.enviar_arquivo(ana.id, new File(["x"], "cpf.jpg", { type: "image/jpeg" }));
    const entrada = api.obter_admissao(ana.id)!.mensagens.filter((m) => m.direcao === "entrada").pop()!;
    expect(entrada.midia_url).toBe("/seed/placeholder.svg");
  });
});

describe("MockApi: tempo", () => {
  const ana = (api: MockApi) => api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao;

  it("agora() usa o relógio base mais o deslocamento", () => {
    const { api } = nova();
    expect(api.agora().getTime()).toBe(BASE);
  });

  it("mais_24h soma 24 h", () => {
    const { api } = nova();
    api.avancar_tempo("mais_24h", ana(api).id);
    expect(api.agora().getTime()).toBe(BASE + 86_400_000);
  });

  it("metade_prazo vai ao meio entre criada_em e o início, mais 1 min", () => {
    const { api } = nova();
    const a = ana(api);
    api.avancar_tempo("metade_prazo", a.id);
    const inicio = new Date(2026, 10, 10).getTime();
    const alvo = (new Date(a.criada_em).getTime() + inicio) / 2 + 60_000;
    expect(api.agora().getTime()).toBe(alvo);
  });

  it("dois_dias_antes vai a início − 2 dias, 09:00 locais", () => {
    const { api } = nova();
    api.avancar_tempo("dois_dias_antes", ana(api).id);
    expect(api.agora().getTime()).toBe(new Date(2026, 10, 8, 9, 0, 0).getTime());
    expect(api.obter_admissao(ana(api).id)!.lembretes.map((l) => l.nivel)).toContain("firme");
  });

  it("prazo_estourado vai a início + 1 dia, 09:00, e abre a escalação de prazo", () => {
    const { api } = nova();
    const a = ana(api);
    api.avancar_tempo("prazo_estourado", a.id);
    expect(api.agora().getTime()).toBe(new Date(2026, 10, 11, 9, 0, 0).getTime());
    expect(data_local(api.agora())).toBe("2026-11-11");
    expect(api.obter_admissao(a.id)!.escalacoes.map((e) => e.motivo)).toContain("prazo_estourado");
  });

  it("só avança: alvo no passado não tem efeito", () => {
    const { api } = nova();
    const a = ana(api);
    api.avancar_tempo("prazo_estourado", a.id);
    const depois = api.agora().getTime();
    api.avancar_tempo("dois_dias_antes", a.id);
    expect(api.agora().getTime()).toBe(depois);
  });

  it("resetar devolve o seed com relógio zerado e apaga arquivos", async () => {
    const arm = new ArmazenamentoMemoria();
    const api = new MockApi(arm, relogio, { reduzir_imagem: async () => "data:image/jpeg;base64,AAAA" });
    const a = ana(api);
    await api.enviar_arquivo(a.id, new File(["x"], "cpf.jpg", { type: "image/jpeg" }));
    api.criar_admissao(input());
    api.avancar_tempo("prazo_estourado", a.id);
    const cb = vi.fn();
    api.assinar(cb);
    api.resetar();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(api.agora().getTime()).toBe(BASE);
    expect(api.listar_admissoes()).toHaveLength(4);
    expect(arm.chaves().filter((k) => k.startsWith("arquivo:"))).toEqual([]);
    expect(JSON.parse(arm.ler(CHAVE_ESTADO)!).relogio.deslocamento_ms).toBe(0);
  });
});
