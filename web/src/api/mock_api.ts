// Api de mentira: o motor puro de src/domain sobre um Armazenamento. Sem cache de estado entre mutações:
// toda mutação relê o armazenamento (outra janela pode ter mexido), aplica, cobra, grava e notifica.
import { CATALOGO, MODELOS, MODELO_DOCUMENTO } from "../domain/catalogo";
import { rotulo_relativo } from "../domain/datas";
import type { Estado } from "../domain/estado";
import { aplicar, type Evento } from "../domain/motor";
import { alerta_prazo, executar_cobranca } from "../domain/motor/cobranca";
import { acao_sugerida } from "../domain/motor/escalacoes";
import type { Admissao, StatusAdmissao, TipoDocumento } from "../domain/tipos";
import { gerar_seed } from "../seed/seed";
import type { Armazenamento } from "../store/armazenamento";
import { PLACEHOLDER, reduzir_imagem as reduzir_imagem_padrao } from "../store/arquivos";
import { PREFIXO_ARQUIVO, carregar_estado, salvar_estado } from "../store/estado";
import { Notificador, assinar_estado_externo } from "../store/sync";
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

const MS_DIA = 86_400_000;

export interface OpcoesMockApi {
  reduzir_imagem?: (arquivo: File) => Promise<string>;
}

function inicio_do_dia(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(a, m - 1, d).getTime();
}

/** Instante para onde o preset leva o relógio (função pura; `agora` em ms). */
function calcular_alvo(preset: PresetTempo, admissao: Admissao, agora: number): number {
  const [a, m, d] = admissao.data_inicio.split("-").map(Number);
  switch (preset) {
    case "mais_24h":
      return agora + MS_DIA;
    case "metade_prazo":
      return (new Date(admissao.criada_em).getTime() + inicio_do_dia(admissao.data_inicio)) / 2 + 60_000;
    case "dois_dias_antes":
      return new Date(a, m - 1, d - 2, 9, 0, 0).getTime();
    case "prazo_estourado":
      return new Date(a, m - 1, d + 1, 9, 0, 0).getTime();
  }
}

function tipo_de(id: string | null): TipoDocumento | null {
  return CATALOGO.find((t) => t.id === id) ?? null;
}

export class MockApi implements Api {
  private notificador = new Notificador();
  private contador_arquivos = 0;
  private reduzir: (arquivo: File) => Promise<string>;

  constructor(
    private arm: Armazenamento,
    private relogio_base: () => number = () => Date.now(),
    opcoes: OpcoesMockApi = {},
  ) {
    this.reduzir = opcoes.reduzir_imagem ?? ((f) => reduzir_imagem_padrao(f));
  }

  // --- estado ---

  private ler(): Estado {
    const existente = carregar_estado(this.arm);
    if (existente) return existente;
    const seed = gerar_seed(new Date(this.relogio_base()));
    salvar_estado(this.arm, seed); // grava já, para outra janela abrindo agora ler o mesmo seed
    return seed;
  }

  private agora_de(e: Estado): Date {
    return new Date(this.relogio_base() + e.relogio.deslocamento_ms);
  }

  /** Relê, transforma, cobra, grava e notifica. */
  private mutar(transformar: (e: Estado, agora: Date) => Estado): void {
    const atual = this.ler();
    const agora = this.agora_de(atual);
    let novo = transformar(atual, agora);
    novo = executar_cobranca(novo, this.agora_de(novo));
    salvar_estado(this.arm, novo);
    this.notificador.notificar();
  }

  private aplicar_evento(evento: Evento): void {
    this.mutar((e, agora) => aplicar(e, evento, agora));
  }

  // --- leitura ---

  agora(): Date {
    return this.agora_de(this.ler());
  }

  listar_admissoes(): AdmissaoResumo[] {
    const e = this.ler();
    const agora = this.agora_de(e);
    const rank = (a: Admissao) => (a.status === "escalada" ? 0 : 1);
    return [...e.admissoes]
      .sort((a, b) => rank(a) - rank(b) || a.data_inicio.localeCompare(b.data_inicio) || a.criada_em.localeCompare(b.criada_em))
      .map((admissao) => {
        const docs = e.documentos.filter((d) => d.admissao_id === admissao.id);
        return {
          admissao,
          modelo_nome: MODELOS.find((m) => m.id === admissao.modelo_id)?.nome ?? admissao.modelo_id,
          pendentes: docs.filter((d) => d.status !== "aprovado").length,
          total: docs.length,
          rotulo_inicio: rotulo_relativo(admissao.data_inicio, agora),
          alerta_prazo: alerta_prazo(admissao.id, e),
          escalacoes_abertas: e.escalacoes.filter((x) => x.admissao_id === admissao.id && x.status === "aberta").length,
        };
      });
  }

  resumo_status(): Record<StatusAdmissao, number> {
    const r: Record<StatusAdmissao, number> = { criada: 0, em_coleta: 0, escalada: 0, concluida: 0 };
    for (const a of this.ler().admissoes) r[a.status] += 1;
    return r;
  }

  obter_admissao(id: string): AdmissaoDetalhe | null {
    const e = this.ler();
    const admissao = e.admissoes.find((a) => a.id === id);
    if (!admissao) return null;
    return {
      admissao,
      modelo_nome: MODELOS.find((m) => m.id === admissao.modelo_id)?.nome ?? admissao.modelo_id,
      documentos: e.documentos
        .filter((d) => d.admissao_id === id)
        .map((documento) => ({
          documento,
          tipo: tipo_de(documento.tipo_documento_id),
          envios: e.envios
            .filter((x) => x.documento_admissao_id === documento.id)
            .sort((a, b) => a.criado_em.localeCompare(b.criado_em)),
        })),
      mensagens: e.mensagens.filter((m) => m.admissao_id === id).sort((a, b) => a.criada_em.localeCompare(b.criada_em)),
      lembretes: e.lembretes.filter((l) => l.admissao_id === id),
      escalacoes: e.escalacoes.filter((x) => x.admissao_id === id),
    };
  }

  listar_escalacoes(f?: { status?: "aberta" | "resolvida" }): EscalacaoView[] {
    const e = this.ler();
    return e.escalacoes
      .filter((x) => !f?.status || x.status === f.status)
      .sort((a, b) => b.criada_em.localeCompare(a.criada_em))
      .map((escalacao) => {
        const documento = e.documentos.find((d) => d.id === escalacao.documento_admissao_id) ?? null;
        const envios = documento
          ? e.envios
              .filter((x) => x.documento_admissao_id === documento.id)
              .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
          : [];
        const mensagens = e.mensagens
          .filter((m) => m.admissao_id === escalacao.admissao_id)
          .sort((a, b) => a.criada_em.localeCompare(b.criada_em));
        return {
          escalacao,
          admissao: e.admissoes.find((a) => a.id === escalacao.admissao_id)!,
          documento,
          tipo: documento ? tipo_de(documento.tipo_documento_id) : null,
          acao_sugerida: acao_sugerida(escalacao),
          acoes_permitidas: documento
            ? ["aprovar_manualmente", "pedir_de_novo", "falar_com_colaborador"]
            : ["falar_com_colaborador"],
          ultimas_mensagens: mensagens.slice(-3),
          ultimo_envio_url: envios.length ? envios[envios.length - 1].arquivo_url : null,
        };
      });
  }

  listar_catalogo(): TipoDocumento[] {
    return CATALOGO;
  }

  listar_modelos(): ModeloComDocumentos[] {
    return MODELOS.map((modelo) => ({
      modelo,
      tipos: MODELO_DOCUMENTO.filter((m) => m.modelo_id === modelo.id)
        .map((m) => tipo_de(m.tipo_documento_id))
        .filter((t): t is TipoDocumento => t !== null),
    }));
  }

  resolver_midia(url: string | null): string | null {
    if (url === null) return null;
    if (url.startsWith("local:")) return this.arm.ler(PREFIXO_ARQUIVO + url.slice("local:".length)) ?? PLACEHOLDER;
    return url;
  }

  // --- mutações ---

  criar_admissao(i: NovaAdmissaoInput): Admissao {
    let criada: Admissao | undefined;
    this.mutar((e, agora) => {
      const novo = aplicar(e, { tipo: "admissao_criada", dados: i }, agora);
      criada = novo.admissoes[novo.admissoes.length - 1];
      return novo;
    });
    // Relê: a cobrança pode ter mexido na admissão recém-criada.
    return this.ler().admissoes.find((a) => a.id === criada!.id)!;
  }

  resolver_escalacao(id: string, acao: AcaoEscalacao, texto?: string): void {
    this.aplicar_evento({ tipo: "escalacao_resolvida", escalacao_id: id, acao, texto });
  }

  enviar_texto(admissao_id: string, texto: string): void {
    this.aplicar_evento({ tipo: "texto_recebido", admissao_id, texto });
  }

  async enviar_arquivo(admissao_id: string, arquivo: File): Promise<void> {
    const reduzida = await this.reduzir(arquivo);
    let arquivo_url = PLACEHOLDER;
    if (reduzida.startsWith("data:")) {
      this.contador_arquivos += 1;
      const id = `${this.relogio_base()}_${this.contador_arquivos}`;
      try {
        this.arm.gravar(PREFIXO_ARQUIVO + id, reduzida);
        arquivo_url = `local:${id}`;
      } catch {
        // QuotaExceededError (ou armazenamento indisponível): segue com o placeholder.
      }
    } else {
      arquivo_url = reduzida;
    }
    this.aplicar_evento({ tipo: "arquivo_recebido", admissao_id, nome_arquivo: arquivo.name, arquivo_url });
  }

  // --- tempo ---

  alvo_preset(preset: PresetTempo, admissao_id: string): Date | null {
    const e = this.ler();
    const admissao = e.admissoes.find((a) => a.id === admissao_id);
    if (!admissao) return null;
    const agora = this.agora_de(e).getTime();
    const alvo = calcular_alvo(preset, admissao, agora);
    return alvo > agora ? new Date(alvo) : null;
  }

  avancar_tempo(preset: PresetTempo, admissao_id: string): void {
    const e = this.ler();
    const admissao = e.admissoes.find((a) => a.id === admissao_id);
    if (!admissao) throw new Error(`Admissão não encontrada: ${admissao_id}`);
    const agora = this.agora_de(e).getTime();
    const alvo = calcular_alvo(preset, admissao, agora);
    if (alvo <= agora) return;
    this.mutar((atual) => {
      const ajustado: Estado = { ...atual, relogio: { deslocamento_ms: alvo - this.relogio_base() } };
      return aplicar(ajustado, { tipo: "tempo_avancado", ate: new Date(alvo).toISOString() }, new Date(alvo));
    });
  }

  resetar(): void {
    const anterior = carregar_estado(this.arm)?.epoca ?? 0;
    for (const k of this.arm.chaves()) if (k.startsWith(PREFIXO_ARQUIVO)) this.arm.remover(k);
    salvar_estado(this.arm, { ...gerar_seed(new Date(this.relogio_base())), epoca: anterior + 1 });
    this.notificador.notificar();
  }

  epoca(): number {
    return this.ler().epoca ?? 0; // estado gravado antes do campo existir
  }

  // --- assinatura ---

  assinar(cb: () => void): () => void {
    const a = this.notificador.assinar(cb);
    const b = assinar_estado_externo(this.arm, cb);
    return () => {
      a();
      b();
    };
  }
}

