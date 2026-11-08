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
  | { tipo: "arquivo_recebido"; admissao_id: string; nome_arquivo: string; arquivo_url: string }
  | { tipo: "texto_recebido"; admissao_id: string; texto: string }
  | { tipo: "tempo_avancado"; ate: string }
  | {
      tipo: "escalacao_resolvida";
      escalacao_id: string;
      acao: "aprovar_manualmente" | "pedir_de_novo" | "falar_com_colaborador";
      texto?: string;
    }
  | { tipo: "reset" };
