// Cliente do worker (FastAPI no Render). Só roda no servidor do Next: o token nunca vai para o navegador.
import type { LeituraExterna } from "../domain/motor";
import type { TipoDocumento } from "../domain/tipos";

export interface Persistencia {
  ler(chave: string): Promise<{ tipo: string; dados: Buffer } | null>;
  gravar(chave: string, tipo: string, dados: Buffer): Promise<void>;
}

export interface Leitor {
  /** Lança ErroLeitura se a IA não responder. */
  ler(imagem: Buffer, mime: string, candidatos: TipoDocumento[]): Promise<LeituraExterna>;
}

export class ErroLeitura extends Error {}

export interface ContextoConversa {
  nome: string;
  cargo: string;
  data_inicio: string;
  status: string;
  documentos: { nome: string; status: string; motivo_recusa: string | null; instrucao: string }[];
  historico: { autor: "colaborador" | "agente" | "rh"; texto: string; anexo: boolean }[];
  texto: string;
}

export interface Conversador {
  responder(contexto: ContextoConversa): Promise<{ texto: string; encaminhar_rh: boolean }>;
}

export class ConversadorWorker implements Conversador {
  constructor(private cfg: ConfigWorker) {}
  async responder(contexto: ContextoConversa) {
    const r = await (this.cfg.fetcher ?? fetch)(`${this.cfg.url}/conversa`, {
      method: "POST",
      headers: cabecalhos(this.cfg.token, { "Content-Type": "application/json" }),
      body: JSON.stringify(contexto),
      signal: AbortSignal.timeout(40_000),
    });
    if (!r.ok) throw new Error(`conversa indisponível (${r.status})`);
    const resposta = await r.json();
    if (typeof resposta.texto !== "string" || !resposta.texto.trim() || resposta.texto.length > 2000 || typeof resposta.encaminhar_rh !== "boolean") {
      throw new Error("resposta de conversa inválida");
    }
    return { texto: resposta.texto, encaminhar_rh: resposta.encaminhar_rh };
  }
}

export interface ConfigWorker {
  url: string;
  token: string | null;
  fetcher?: typeof fetch;
}

function cabecalhos(token: string | null, extra: Record<string, string> = {}): Record<string, string> {
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export class PersistenciaWorker implements Persistencia {
  private fetcher: typeof fetch;
  constructor(private cfg: ConfigWorker) {
    this.fetcher = cfg.fetcher ?? fetch;
  }

  async ler(chave: string) {
    const r = await this.fetcher(`${this.cfg.url}/front/kv/${encodeURIComponent(chave)}`, {
      headers: cabecalhos(this.cfg.token),
      cache: "no-store",
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`worker respondeu ${r.status} ao ler ${chave}`);
    return { tipo: r.headers.get("content-type") ?? "application/octet-stream", dados: Buffer.from(await r.arrayBuffer()) };
  }

  async gravar(chave: string, tipo: string, dados: Buffer) {
    const r = await this.fetcher(`${this.cfg.url}/front/kv/${encodeURIComponent(chave)}`, {
      method: "PUT",
      headers: cabecalhos(this.cfg.token, { "Content-Type": tipo }),
      body: new Uint8Array(dados),
    });
    if (!r.ok) throw new Error(`worker respondeu ${r.status} ao gravar ${chave}`);
  }
}

/** Sem worker configurado (dev local): guarda só em memória. */
export class PersistenciaMemoria implements Persistencia {
  private dados = new Map<string, { tipo: string; dados: Buffer }>();
  async ler(chave: string) {
    return this.dados.get(chave) ?? null;
  }
  async gravar(chave: string, tipo: string, dados: Buffer) {
    this.dados.set(chave, { tipo, dados });
  }
}

export class LeitorWorker implements Leitor {
  private fetcher: typeof fetch;
  constructor(private cfg: ConfigWorker) {
    this.fetcher = cfg.fetcher ?? fetch;
  }

  async ler(imagem: Buffer, mime: string, candidatos: TipoDocumento[]): Promise<LeituraExterna> {
    const form = new FormData();
    form.append("arquivo", new Blob([new Uint8Array(imagem)], { type: mime }), "documento");
    form.append(
      "candidatos",
      JSON.stringify(candidatos.map((t) => ({ id: t.id, nome: t.nome, campos: t.campos_extracao }))),
    );
    let r: Response;
    try {
      r = await this.fetcher(`${this.cfg.url}/leitura`, {
        method: "POST",
        headers: cabecalhos(this.cfg.token),
        body: form,
        signal: AbortSignal.timeout(110_000),
      });
    } catch (erro) {
      throw new ErroLeitura(`worker inacessível: ${String(erro)}`);
    }
    if (!r.ok) throw new ErroLeitura(`worker respondeu ${r.status}: ${await r.text()}`);
    const corpo = (await r.json()) as LeituraExterna;
    return {
      tipo_documento_id: corpo.tipo_documento_id ?? null,
      qualidade: corpo.qualidade,
      detalhe_qualidade: corpo.detalhe_qualidade ?? undefined,
      dados_extraidos: corpo.dados_extraidos ?? {},
    };
  }
}
