// Estado do sistema: todas as tabelas + relógio. TypeScript puro. Catálogo e modelos ficam fora (constantes).
import type {
  Admissao,
  DocumentoAdmissao,
  Escalacao,
  EnvioDocumento,
  Lembrete,
  Mensagem,
} from "./tipos";

export interface Estado {
  admissoes: Admissao[];
  documentos: DocumentoAdmissao[];
  envios: EnvioDocumento[];
  mensagens: Mensagem[];
  lembretes: Lembrete[];
  escalacoes: Escalacao[];
  relogio: { deslocamento_ms: number };
  /** Contador dos ids determinísticos. */
  seq: number;
  /** Incrementa a cada mudança. */
  rev: number;
}

export function estado_vazio(): Estado {
  return {
    admissoes: [],
    documentos: [],
    envios: [],
    mensagens: [],
    lembretes: [],
    escalacoes: [],
    relogio: { deslocamento_ms: 0 },
    seq: 0,
    rev: 0,
  };
}

/** Gera `${prefixo}_${n}` e incrementa o contador. Muta o estado recebido (use numa cópia). */
export function novo_id(estado: Estado, prefixo: string): string {
  estado.seq += 1;
  return `${prefixo}_${estado.seq}`;
}
