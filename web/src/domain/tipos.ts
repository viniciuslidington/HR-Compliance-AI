// As 9 tabelas do PDF (p. 7-8) como tipos. Datas ISO em string. Enums em snake_case sem acento.

export type StatusAdmissao = "criada" | "em_coleta" | "escalada" | "concluida";
export type StatusDocumento = "pendente" | "recebido" | "aprovado" | "recusado";
export type NivelLembrete = "leve" | "prazo" | "firme";
export type StatusEscalacao = "aberta" | "resolvida";
export type Direcao = "entrada" | "saida";
export type ResultadoEnvio = "aprovado" | "recusado";

export interface TipoDocumento {
  id: string;
  nome: string;
  instrucao_colaborador: string;
  campos_extracao: string[];
  regras_validacao: string[];
}

export interface Modelo {
  id: string;
  nome: string;
}

export interface ModeloDocumento {
  modelo_id: string;
  tipo_documento_id: string;
}

export interface Admissao {
  id: string;
  nome: string;
  whatsapp: string;
  cargo: string;
  data_inicio: string; // YYYY-MM-DD
  modelo_id: string;
  status: StatusAdmissao;
  id_externo: string | null; // vem do sistema de destino
  criada_em: string;
  concluida_em: string | null;
}

export interface DocumentoAdmissao {
  id: string;
  admissao_id: string;
  tipo_documento_id: string | null; // nulo se personalizado
  descricao_personalizada: string | null;
  status: StatusDocumento;
  tentativas: number;
  motivo_recusa: string | null;
  dados_extraidos: Record<string, string> | null;
}

export interface EnvioDocumento {
  id: string;
  documento_admissao_id: string;
  arquivo_url: string;
  resultado: ResultadoEnvio;
  motivo: string | null;
  /** Só no front: código do Motivo da recusa (alinhar com o worker). */
  motivo_codigo?: string;
  criado_em: string;
}

export interface Mensagem {
  id: string;
  admissao_id: string;
  direcao: Direcao;
  texto: string;
  midia_url: string | null;
  criada_em: string;
  /** Só no front: separa mensagens do RH das do agente (alinhar com o worker). */
  autor?: "agente" | "rh";
}

export interface Lembrete {
  id: string;
  admissao_id: string;
  nivel: NivelLembrete;
  agendado_para: string;
  enviado_em: string | null;
}

export type MotivoEscalacao =
  | "prazo_estourado"
  | "tres_falhas"
  | "inconsistencia"
  | "suspeita_adulteracao"
  | "fora_do_escopo";

export interface Escalacao {
  id: string;
  admissao_id: string;
  documento_admissao_id: string | null;
  motivo: MotivoEscalacao;
  status: StatusEscalacao;
  resolucao: string | null;
  criada_em: string;
}

export interface Motivo {
  codigo: string;
  texto: string;
  /** O que o colaborador deve fazer (anotado para alinhar com o worker). */
  o_que_fazer: string;
  gravidade: "recusa" | "escalada";
}
