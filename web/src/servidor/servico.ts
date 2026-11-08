// O "backend" do painel: a MockApi (motor puro) roda aqui, no servidor do Next, sobre um estado único que
// o painel do RH e o WhatsApp simulado compartilham. Cada mutação é serializada, gravada no worker e
// ganha uma nova versão (ETag). A leitura de documentos vai para a IA do worker.
import { randomUUID } from "node:crypto";
import type { NovaAdmissaoInput } from "../api/api";
import { MockApi } from "../api/mock_api";
import { CATALOGO } from "../domain/catalogo";
import type { LeituraExterna } from "../domain/motor";
import type { Estado } from "../domain/estado";
import { ArmazenamentoMemoria } from "../store/armazenamento";
import { CHAVE_ESTADO, carregar_estado } from "../store/estado";
import {
  ErroLeitura,
  ConversadorWorker,
  type Conversador,
  LeitorWorker,
  PersistenciaMemoria,
  PersistenciaWorker,
  type Leitor,
  type Persistencia,
} from "./worker";

const CHAVE_PERSISTIDA = "estado";

export const METODOS = ["criar_admissao", "resolver_escalacao", "enviar_texto", "avancar_tempo", "resetar"] as const;
export type Metodo = (typeof METODOS)[number];

export interface Instantaneo {
  versao: string;
  estado: string;
}

export interface ArquivoRecebido {
  admissao_id: string;
  nome_arquivo: string;
  /** JPEG reduzido para exibir no chat e no painel. */
  previa: { dados: Buffer; mime: string } | null;
  /** Imagem para a IA ler (maior que a prévia). */
  imagem: { dados: Buffer; mime: string } | null;
}

export class Servico {
  private arm = new ArmazenamentoMemoria();
  private api = new MockApi(this.arm);
  private fila: Promise<unknown> = Promise.resolve();
  private midias = new Map<string, { tipo: string; dados: Buffer }>();
  private boot = randomUUID().slice(0, 8);
  private contador = 0;
  private carregado: Promise<void> | null = null;

  constructor(
    private persistencia: Persistencia,
    private leitor: Leitor | null,
    private conversador: Conversador | null = null,
  ) {}

  /** Carrega o estado do worker na primeira vez; se o worker falhar, tenta de novo na próxima chamada. */
  private pronto(): Promise<void> {
    this.carregado ??= this.carregar().catch((erro) => {
      this.carregado = null;
      throw erro;
    });
    return this.carregado;
  }

  private async carregar(): Promise<void> {
    const salvo = await this.persistencia.ler(CHAVE_PERSISTIDA);
    if (salvo) this.arm.gravar(CHAVE_ESTADO, salvo.dados.toString("utf8"));
    if (!carregar_estado(this.arm)) {
      this.arm.remover(CHAVE_ESTADO);
      this.api.epoca(); // a MockApi grava o seed na primeira leitura
      await this.persistir();
    }
  }

  /** Uma mutação por vez: o estado é lido, alterado e gravado sem intercalar com outra. */
  private serializar<T>(fn: () => Promise<T>): Promise<T> {
    const r = this.fila.then(() => this.pronto()).then(fn);
    this.fila = r.catch(() => undefined);
    return r;
  }

  private async persistir(): Promise<void> {
    this.contador += 1;
    await this.persistencia.gravar(CHAVE_PERSISTIDA, "application/json", Buffer.from(this.estado_bruto(), "utf8"));
  }

  private estado_bruto(): string {
    return this.arm.ler(CHAVE_ESTADO) ?? "null";
  }

  private instantaneo(): Instantaneo {
    return { versao: `${this.boot}-${this.contador}`, estado: this.estado_bruto() };
  }

  async ler(): Promise<Instantaneo> {
    await this.pronto();
    return this.instantaneo();
  }

  executar(metodo: Metodo, args: unknown[]): Promise<Instantaneo & { retorno: unknown }> {
    return this.serializar(async () => {
      let retorno: unknown = null;
      switch (metodo) {
        case "criar_admissao":
          retorno = this.api.criar_admissao(args[0] as NovaAdmissaoInput);
          break;
        case "resolver_escalacao":
          this.api.resolver_escalacao(String(args[0]), args[1] as never, args[2] as string | undefined);
          break;
        case "enviar_texto":
          if (this.conversador) {
            const id = String(args[0]);
            const texto = String(args[1] ?? "").trim();
            if (!texto || texto.length > 4000) throw new Error("Envie uma mensagem com até 4000 caracteres.");
            const detalhe = this.api.obter_admissao(id);
            if (!detalhe) throw new Error("Admissão não encontrada");
            const { admissao: a } = detalhe;
            // A fila mantém o contexto consistente com anexos e decisões do RH durante a resposta.
            const resposta = await this.conversador.responder({
              nome: a.nome, cargo: a.cargo, data_inicio: a.data_inicio, status: a.status, texto,
              documentos: detalhe.documentos.map(({ documento: d, tipo }) => ({
                nome: tipo?.nome ?? d.descricao_personalizada ?? "Documento",
                status: d.status, motivo_recusa: d.motivo_recusa, instrucao: tipo?.instrucao_colaborador ?? "",
              })),
              historico: detalhe.mensagens.slice(-30).map((m) => ({
                autor: m.direcao === "entrada" ? "colaborador" : m.autor ?? "agente",
                texto: m.texto.slice(0, 8000), anexo: !!m.midia_url,
              })),
            });
            this.api.aplicar_evento({ tipo: "texto_recebido", admissao_id: id, texto, resposta });
          } else {
            this.api.enviar_texto(String(args[0]), String(args[1]));
          }
          break;
        case "avancar_tempo":
          this.api.avancar_tempo(args[0] as never, String(args[1]));
          break;
        case "resetar":
          this.api.resetar();
          break;
      }
      await this.persistir();
      return { ...this.instantaneo(), retorno };
    });
  }

  private candidatos(estado: Estado, admissao_id: string) {
    // Todos os documentos da admissão: a IA também reconhece um que já foi aprovado (reenvio).
    const docs = estado.documentos.filter((d) => d.admissao_id === admissao_id);
    if (!docs.some((d) => d.status === "pendente" || d.status === "recusado")) return [];
    const ids = docs.map((d) => d.tipo_documento_id);
    return CATALOGO.filter((t) => ids.includes(t.id));
  }

  async receber_arquivo(a: ArquivoRecebido): Promise<Instantaneo> {
    await this.pronto();
    const estado = JSON.parse(this.estado_bruto()) as Estado;
    if (!estado.admissoes.some((x) => x.id === a.admissao_id)) throw new Error("admissão não encontrada");

    let arquivo_url = "/seed/placeholder.svg";
    if (a.previa) {
      const id = randomUUID();
      const midia = { tipo: a.previa.mime, dados: a.previa.dados };
      this.midias.set(id, midia);
      await this.persistencia.gravar(`midia:${id}`, midia.tipo, midia.dados);
      arquivo_url = `/api/midia/${id}`;
    }

    // A leitura (10 a 30 s) acontece fora da fila para não travar o painel; o resultado entra serializado.
    let leitura: LeituraExterna | "indisponivel" | undefined;
    const candidatos = this.candidatos(estado, a.admissao_id);
    if (this.leitor && candidatos.length > 0) {
      if (!a.imagem) {
        leitura = { tipo_documento_id: null, qualidade: "ilegivel", detalhe_qualidade: "por enquanto só leio fotos (JPG ou PNG)", dados_extraidos: {} };
      } else {
        try {
          leitura = await this.leitor.ler(a.imagem.dados, a.imagem.mime, candidatos);
        } catch (erro) {
          if (!(erro instanceof ErroLeitura)) throw erro;
          console.error("[leitura]", erro.message);
          leitura = "indisponivel";
        }
      }
    }

    return this.serializar(async () => {
      this.api.aplicar_evento({
        tipo: "arquivo_recebido",
        admissao_id: a.admissao_id,
        nome_arquivo: a.nome_arquivo,
        arquivo_url,
        leitura,
      });
      await this.persistir();
      return this.instantaneo();
    });
  }

  async midia(id: string): Promise<{ tipo: string; dados: Buffer } | null> {
    const local = this.midias.get(id);
    if (local) return local;
    const salvo = await this.persistencia.ler(`midia:${id}`);
    if (salvo) this.midias.set(id, salvo);
    return salvo;
  }
}

function criar_servico(): Servico {
  const url = process.env.WORKER_URL?.replace(/\/+$/, "");
  const token = process.env.WORKER_TOKEN || null;
  if (!url) {
    console.warn("[servico] WORKER_URL não definida: estado em memória e leitor simulado.");
    return new Servico(new PersistenciaMemoria(), null);
  }
  const leitor = process.env.LEITOR === "mock" ? null : new LeitorWorker({ url, token });
  return new Servico(new PersistenciaWorker({ url, token }), leitor, new ConversadorWorker({ url, token }));
}

// Um serviço por processo (sobrevive ao hot reload do dev).
const global_ = globalThis as unknown as { __servico_admissao?: Servico };
export function servico(): Servico {
  global_.__servico_admissao ??= criar_servico();
  return global_.__servico_admissao;
}
