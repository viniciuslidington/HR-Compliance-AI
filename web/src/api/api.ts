// A fronteira entre o front e o back: as telas só falam com esta interface (via useConsulta/useAcao).
// MockApi: motor em src/domain sobre o localStorage. HttpApi: o mesmo motor no servidor do Next (src/servidor),
// com a leitura de documentos pela IA do worker. As mutações podem devolver Promise (HttpApi).
import type { NovaAdmissaoInput } from "../domain/motor";
import type {
  Admissao,
  DocumentoAdmissao,
  EnvioDocumento,
  Escalacao,
  Lembrete,
  Mensagem,
  Modelo,
  StatusAdmissao,
  TipoDocumento,
} from "../domain/tipos";

export type { NovaAdmissaoInput };
export type AcaoEscalacao = "aprovar_manualmente" | "pedir_de_novo" | "falar_com_colaborador";
export type PresetTempo = "mais_24h" | "metade_prazo" | "dois_dias_antes" | "prazo_estourado";

export interface AdmissaoResumo {
  admissao: Admissao;
  modelo_nome: string;
  /** "4 de 5": `pendentes` de `total`. */
  pendentes: number;
  total: number;
  rotulo_inicio: string;
  alerta_prazo: boolean;
  escalacoes_abertas: number;
}

export interface DocumentoDetalhe {
  documento: DocumentoAdmissao;
  tipo: TipoDocumento | null;
  envios: EnvioDocumento[];
}

export interface AdmissaoDetalhe {
  admissao: Admissao;
  modelo_nome: string;
  documentos: DocumentoDetalhe[];
  mensagens: Mensagem[];
  lembretes: Lembrete[];
  escalacoes: Escalacao[];
}

export interface EscalacaoView {
  escalacao: Escalacao;
  admissao: Admissao;
  documento: DocumentoAdmissao | null;
  tipo: TipoDocumento | null;
  acao_sugerida: string;
  acoes_permitidas: AcaoEscalacao[];
  /** As 3 últimas mensagens da admissão, em ordem cronológica. */
  ultimas_mensagens: Mensagem[];
  /** `arquivo_url` do último envio do documento da escalação (passe por `resolver_midia`); null sem documento/envio. */
  ultimo_envio_url: string | null;
}

export interface ModeloComDocumentos {
  modelo: Modelo;
  tipos: TipoDocumento[];
}

export interface Api {
  listar_admissoes(): AdmissaoResumo[];
  resumo_status(): Record<StatusAdmissao, number>;
  obter_admissao(id: string): AdmissaoDetalhe | null;
  criar_admissao(i: NovaAdmissaoInput): Admissao | Promise<Admissao>;
  listar_escalacoes(f?: { status?: "aberta" | "resolvida" }): EscalacaoView[];
  resolver_escalacao(id: string, acao: AcaoEscalacao, texto?: string): void | Promise<void>;
  listar_catalogo(): TipoDocumento[];
  listar_modelos(): ModeloComDocumentos[];
  enviar_texto(admissao_id: string, texto: string): void | Promise<void>;
  enviar_arquivo(admissao_id: string, arquivo: File): Promise<void>;
  /** Resolve a `midia_url` de uma mensagem/envio para algo que um <img> entende. */
  resolver_midia(url: string | null): string | null;
  agora(): Date;
  /** Para onde o preset levaria o relógio, sem mexer nele; null se a admissão não existe ou o alvo já passou. */
  alvo_preset(preset: PresetTempo, admissao_id: string): Date | null;
  avancar_tempo(preset: PresetTempo, admissao_id: string): void | Promise<void>;
  resetar(): void | Promise<void>;
  /** Sobe a cada `resetar` (0 no seed): as telas usam para descartar escolhas feitas sobre os dados antigos. */
  epoca(): number;
  assinar(cb: () => void): () => void;
}
