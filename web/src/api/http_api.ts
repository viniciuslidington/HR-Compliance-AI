// Api do navegador sobre o servidor do Next (src/app/api). O estado vive no servidor; aqui fica a última cópia,
// lida por uma MockApi interna (as mesmas consultas da versão local). Mutações vão por POST e trazem o estado
// novo; o polling com ETag traz o que outra janela (ou o celular) mudou.
import type { Estado } from "../domain/estado";
import type { Admissao } from "../domain/tipos";
import { ArmazenamentoMemoria } from "../store/armazenamento";
import { reduzir_imagem } from "../store/arquivos";
import { CHAVE_ESTADO } from "../store/estado";
import { Notificador } from "../store/sync";
import type {
  AcaoEscalacao,
  AdmissaoDetalhe,
  AdmissaoResumo,
  Api,
  EscalacaoView,
  ModeloComDocumentos,
  NovaAdmissaoInput,
  PresetTempo,
} from "./api";
import { MockApi } from "./mock_api";

export interface OpcoesHttpApi {
  base?: string;
  fetcher?: typeof fetch;
  intervalo_ms?: number;
  /** Prévia (exibição) e imagem para a IA; por padrão, JPEG de 1000 px e de 2000 px. */
  preparar?: (arquivo: File) => Promise<{ previa: Blob | null; imagem: Blob | null }>;
}

async function data_url_para_blob(url: string): Promise<Blob | null> {
  if (!url.startsWith("data:")) return null;
  return (await fetch(url)).blob();
}

async function preparar_padrao(arquivo: File) {
  const [previa, imagem] = await Promise.all([
    reduzir_imagem(arquivo).then(data_url_para_blob),
    reduzir_imagem(arquivo, undefined, 2000, 0.85).then(data_url_para_blob),
  ]);
  return { previa, imagem: imagem ?? (/^image\/(png|jpeg|webp)$/.test(arquivo.type) ? arquivo : null) };
}

export class HttpApi implements Api {
  private arm = new ArmazenamentoMemoria();
  private leitura = new MockApi(this.arm);
  private notificador = new Notificador();
  private etag: string | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private base: string;
  private fetcher: typeof fetch;
  private intervalo: number;
  private preparar: (arquivo: File) => Promise<{ previa: Blob | null; imagem: Blob | null }>;

  constructor(opcoes: OpcoesHttpApi = {}) {
    this.base = opcoes.base ?? "";
    this.fetcher = opcoes.fetcher ?? ((...a) => fetch(...a));
    this.intervalo = opcoes.intervalo_ms ?? 1500;
    this.preparar = opcoes.preparar ?? preparar_padrao;
  }

  /** Primeira carga: a Api só entra no ApiProvider depois disso (antes, as telas mostram o esqueleto). */
  async carregar(): Promise<void> {
    await this.buscar();
    if (!this.arm.ler(CHAVE_ESTADO)) throw new Error("o servidor não devolveu o estado");
  }

  private receber(estado: Estado | string, versao: string | null): void {
    this.arm.gravar(CHAVE_ESTADO, typeof estado === "string" ? estado : JSON.stringify(estado));
    if (versao) this.etag = `"${versao}"`;
    this.notificador.notificar();
  }

  private async buscar(): Promise<void> {
    const r = await this.fetcher(`${this.base}/api/estado`, {
      headers: this.etag ? { "If-None-Match": this.etag } : {},
      cache: "no-store",
    });
    if (r.status === 304) return;
    if (!r.ok) throw new Error(`estado: ${r.status}`);
    const etag = r.headers.get("ETag");
    this.receber(await r.text(), etag ? etag.replace(/"/g, "") : null);
  }

  private async rpc(metodo: string, args: unknown[]): Promise<unknown> {
    const r = await this.fetcher(`${this.base}/api/acao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metodo, args }),
    });
    const corpo = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(corpo.erro ?? `ação ${metodo}: ${r.status}`);
    this.receber(corpo.estado, corpo.versao);
    return corpo.retorno;
  }

  /** Mutação sem retorno: as telas não esperam; a falha vai para o console e o polling corrige a tela. */
  private disparar(metodo: string, args: unknown[]): Promise<void> {
    return this.rpc(metodo, args).then(
      () => undefined,
      (erro) => console.error(`[HttpApi] ${metodo}`, erro),
    );
  }

  // --- leitura: a mesma MockApi, sobre a cópia local do estado ---

  listar_admissoes(): AdmissaoResumo[] {
    return this.leitura.listar_admissoes();
  }
  resumo_status() {
    return this.leitura.resumo_status();
  }
  obter_admissao(id: string): AdmissaoDetalhe | null {
    return this.leitura.obter_admissao(id);
  }
  listar_escalacoes(f?: { status?: "aberta" | "resolvida" }): EscalacaoView[] {
    return this.leitura.listar_escalacoes(f);
  }
  listar_catalogo() {
    return this.leitura.listar_catalogo();
  }
  listar_modelos(): ModeloComDocumentos[] {
    return this.leitura.listar_modelos();
  }
  resolver_midia(url: string | null): string | null {
    return this.leitura.resolver_midia(url);
  }
  agora(): Date {
    return this.leitura.agora();
  }
  alvo_preset(preset: PresetTempo, admissao_id: string): Date | null {
    return this.leitura.alvo_preset(preset, admissao_id);
  }
  epoca(): number {
    return this.leitura.epoca();
  }

  // --- mutações: no servidor ---

  async criar_admissao(i: NovaAdmissaoInput): Promise<Admissao> {
    return (await this.rpc("criar_admissao", [i])) as Admissao;
  }
  resolver_escalacao(id: string, acao: AcaoEscalacao, texto?: string): Promise<void> {
    return this.disparar("resolver_escalacao", [id, acao, texto]);
  }
  enviar_texto(admissao_id: string, texto: string): Promise<void> {
    // O chat espera o envio para mostrar falhas e permitir tentar novamente.
    return this.rpc("enviar_texto", [admissao_id, texto]).then(() => undefined);
  }
  avancar_tempo(preset: PresetTempo, admissao_id: string): Promise<void> {
    return this.disparar("avancar_tempo", [preset, admissao_id]);
  }
  resetar(): Promise<void> {
    return this.disparar("resetar", []);
  }

  async enviar_arquivo(admissao_id: string, arquivo: File): Promise<void> {
    const { previa, imagem } = await this.preparar(arquivo);
    const form = new FormData();
    form.append("admissao_id", admissao_id);
    form.append("nome_arquivo", arquivo.name);
    if (previa) form.append("previa", previa, "previa.jpg");
    if (imagem) form.append("imagem", imagem, "imagem");
    const r = await this.fetcher(`${this.base}/api/arquivo`, { method: "POST", body: form });
    const corpo = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(corpo.erro ?? `arquivo: ${r.status}`);
    this.receber(corpo.estado, corpo.versao);
  }

  // --- assinatura: polling enquanto alguém escuta ---

  assinar(cb: () => void): () => void {
    // O polling segue enquanto a página está aberta: o ApiProvider mantém uma única HttpApi.
    if (!this.timer) this.agendar();
    return this.notificador.assinar(cb);
  }

  private agendar(): void {
    this.timer = setTimeout(async () => {
      try {
        await this.buscar();
      } catch {
        // rede instável: tenta no próximo ciclo
      }
      this.agendar();
    }, this.intervalo);
  }

  /** Para o polling (testes). */
  encerrar(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
