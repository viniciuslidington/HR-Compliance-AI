// Dados iniciais da demo. Montados passando eventos pelo motor (`aplicar`), nunca com tabelas escritas à mão,
// com instantes no passado relativos a `agora` para as mensagens e os envios ficarem coerentes.
import { data_local } from "../domain/datas";
import { estado_vazio, type Estado } from "../domain/estado";
import { aplicar } from "../domain/motor";
import { documentos_do_modelo } from "../domain/motor/admissao";
import { executar_cobranca } from "../domain/motor/cobranca";

const HORA = 3_600_000;
const DIA = 24 * HORA;

interface PessoaSeed {
  nome: string;
  whatsapp: string;
  cargo: string;
  modelo_id: "clt_padrao" | "estagio";
  extras: string[];
  /** Dias até o início (a partir de hoje). */
  inicio_em: number;
  /** Quando foi criada, em ms antes de `agora`. */
  criada_antes_ms: number;
  /** Envios na ordem: [nome do arquivo, imagem em /seed, ms depois da criação]. */
  envios: [string, string, number][];
}

const PESSOAS: PessoaSeed[] = [
  {
    nome: "Ana Souza",
    whatsapp: "+55 11 98421-3057",
    cargo: "Estagiária de RH",
    modelo_id: "estagio",
    extras: ["dados_bancarios"],
    inicio_em: 3,
    criada_antes_ms: DIA,
    envios: [["rg-ok.jpg", "rg", 2 * HORA]],
  },
  {
    nome: "Bruno Lima",
    whatsapp: "+55 11 97316-4482",
    cargo: "Assistente administrativo",
    modelo_id: "clt_padrao",
    extras: [],
    inicio_em: 2,
    criada_antes_ms: 3 * DIA,
    envios: [
      ["rg-ok.jpg", "rg", 2 * HORA],
      ["comprovante-antigo.jpg", "comprovante", 3 * HORA],
      ["comprovante-antigo.jpg", "comprovante", DIA + 3 * HORA],
      ["comprovante-antigo.jpg", "comprovante", 2 * DIA + 3 * HORA],
    ],
  },
  {
    nome: "Diego Rocha",
    whatsapp: "+55 11 96154-7730",
    cargo: "Estagiário de TI",
    modelo_id: "estagio",
    extras: ["dados_bancarios"],
    inicio_em: 6,
    criada_antes_ms: 20 * 60_000,
    envios: [],
  },
  {
    nome: "Carla Mendes",
    whatsapp: "+55 11 95588-2619",
    cargo: "Analista financeira",
    modelo_id: "clt_padrao",
    extras: [],
    inicio_em: 9,
    criada_antes_ms: 5 * DIA,
    envios: [
      ["rg-ok.jpg", "rg", HORA],
      ["cpf-ok.jpg", "cpf", 2 * HORA],
      ["comprovante-ok.jpg", "comprovante", 3 * HORA],
      ["banco-ok.jpg", "banco", 4 * HORA],
    ],
  },
];

export function gerar_seed(agora: Date): Estado {
  let estado = estado_vazio();
  const dia = (n: number) =>
    data_local(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + n));

  for (const p of PESSOAS) {
    const criada = new Date(agora.getTime() - p.criada_antes_ms);
    estado = aplicar(
      estado,
      {
        tipo: "admissao_criada",
        dados: {
          nome: p.nome,
          whatsapp: p.whatsapp,
          cargo: p.cargo,
          data_inicio: dia(p.inicio_em),
          modelo_id: p.modelo_id,
          documentos: [...documentos_do_modelo(p.modelo_id), ...p.extras].map((t) => ({ tipo_documento_id: t })),
        },
      },
      criada,
    );
    const id = estado.admissoes[estado.admissoes.length - 1].id;
    for (const [nome_arquivo, imagem, depois] of p.envios) {
      estado = aplicar(
        estado,
        { tipo: "arquivo_recebido", admissao_id: id, nome_arquivo, arquivo_url: `/seed/${imagem}.svg` },
        new Date(criada.getTime() + depois),
      );
    }
  }
  // Lembretes que já estariam vencidos (ex.: Bruno, a 2 dias do início, com o alerta de prazo ligado).
  return executar_cobranca(estado, agora);
}
