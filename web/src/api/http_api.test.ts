import { describe, expect, it, vi } from "vitest";
import { gerar_seed } from "../seed/seed";
import { HttpApi } from "./http_api";

function servidor() {
  let estado = gerar_seed(new Date());
  let versao = 1;
  const chamadas: { url: string; init?: RequestInit }[] = [];
  const fetcher = vi.fn(async (url: string, init?: RequestInit) => {
    chamadas.push({ url, init });
    if (url.endsWith("/api/estado")) {
      const h = new Headers(init?.headers);
      if (h.get("If-None-Match") === `"${versao}"`) return new Response(null, { status: 304 });
      // Como o proxy do Render: ETag fraco.
      return new Response(JSON.stringify(estado), { headers: { ETag: `W/"${versao}"` } });
    }
    if (url.endsWith("/api/acao")) {
      const { metodo } = JSON.parse(String(init?.body));
      if (metodo === "resetar") estado = { ...estado, epoca: estado.epoca + 1 };
      versao += 1;
      return Response.json({ versao: String(versao), estado, retorno: metodo === "criar_admissao" ? estado.admissoes[0] : null });
    }
    return new Response("{}", { status: 404 });
  });
  return { fetcher: fetcher as unknown as typeof fetch, chamadas, mudar: () => { estado = { ...estado, epoca: 9 }; versao += 1; } };
}

describe("HttpApi", () => {
  it("propaga erro ao enviar texto para o chat recuperar o rascunho", async () => {
    const api = new HttpApi({
      fetcher: (async () => Response.json({ erro: "IA indisponível" }, { status: 503 })) as typeof fetch,
    });
    await expect(api.enviar_texto("adm_1", "Já mandei")).rejects.toThrow("IA indisponível");
  });

  it("carrega o estado do servidor e responde as consultas com ele", async () => {
    const s = servidor();
    const api = new HttpApi({ fetcher: s.fetcher, intervalo_ms: 10 });
    await api.carregar();
    expect(api.listar_admissoes().length).toBeGreaterThan(0);
    expect(api.epoca()).toBe(0);
  });

  it("mutação vai por POST e o estado devolvido já vale", async () => {
    const s = servidor();
    const api = new HttpApi({ fetcher: s.fetcher });
    await api.carregar();
    const avisado = vi.fn();
    api.assinar(avisado);
    await api.resetar();
    expect(api.epoca()).toBe(1);
    expect(avisado).toHaveBeenCalled();
    const criada = await api.criar_admissao({ nome: "x", whatsapp: "1", cargo: "c", data_inicio: "2099-01-01", modelo_id: "clt_padrao", documentos: [] });
    expect(criada.id).toBeTruthy();
    expect(s.chamadas.filter((c) => c.url.endsWith("/api/acao"))).toHaveLength(2);
    api.encerrar();
  });

  it("o polling usa ETag e avisa quando outra janela muda o estado", async () => {
    const s = servidor();
    const api = new HttpApi({ fetcher: s.fetcher, intervalo_ms: 5 });
    await api.carregar();
    const avisado = vi.fn();
    api.assinar(avisado);
    await new Promise((r) => setTimeout(r, 30));
    expect(avisado).not.toHaveBeenCalled(); // 304: nada mudou
    s.mudar();
    await vi.waitFor(() => expect(api.epoca()).toBe(9));
    expect(avisado).toHaveBeenCalled();
    api.encerrar();
  });

  it("envia o arquivo com prévia e imagem para a IA", async () => {
    const s = servidor();
    const api = new HttpApi({
      fetcher: (async (url: string, init?: RequestInit) =>
        url.endsWith("/api/arquivo")
          ? Response.json({ versao: "x", estado: gerar_seed(new Date()) })
          : s.fetcher(url, init)) as typeof fetch,
      preparar: async () => ({ previa: new Blob(["p"], { type: "image/jpeg" }), imagem: new Blob(["i"], { type: "image/jpeg" }) }),
    });
    await api.carregar();
    await expect(api.enviar_arquivo("adm_1", new File(["x"], "rg.jpg", { type: "image/jpeg" }))).resolves.toBeUndefined();
  });
});
