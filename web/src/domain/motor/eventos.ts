import type { LeituraMock } from "../validacao";

/** Leitura feita fora do motor (IA do worker): qual documento é e o que foi lido. */
export interface LeituraExterna extends LeituraMock {
  tipo_documento_id: string | null;
}

export interface NovaAdmissaoInput {
  nome: string;
  whatsapp: string;
  cargo: string;
  data_inicio: string; // YYYY-MM-DD
  modelo_id: string;
  /** Checklist final escolhido pelo RH. */
  documentos: { tipo_documento_id: string | null; descricao_personalizada?: string }[];
}

export type Evento =
  | { tipo: "admissao_criada"; dados: NovaAdmissaoInput }
  | {
      tipo: "arquivo_recebido";
      admissao_id: string;
      nome_arquivo: string;
      arquivo_url: string;
      /** Sem leitura, o motor usa o leitor simulado; "indisponivel" = a IA não respondeu (não conta tentativa). */
      leitura?: LeituraExterna | "indisponivel";
    }
  | { tipo: "texto_recebido"; admissao_id: string; texto: string }
  | { tipo: "tempo_avancado"; ate: string }
  | {
      tipo: "escalacao_resolvida";
      escalacao_id: string;
      acao: "aprovar_manualmente" | "pedir_de_novo" | "falar_com_colaborador";
      texto?: string;
    }
  | { tipo: "reset" };
