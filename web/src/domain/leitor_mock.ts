// Leitor simulado e determinístico: segue o roteiro da demo e as dicas no nome do arquivo.
// TypeScript puro; nenhuma chamada a `new Date()` sem argumento.
import { data_local } from "./datas";
import { normalizar } from "./identificadores";
import type { Admissao } from "./tipos";
import type { LeituraMock } from "./validacao";

export interface EntradaLeitura {
  tipo_documento_id: string;
  nome_arquivo: string;
  admissao: Admissao;
  /** 1-based: número deste envio do documento (1 = primeiro envio; conta os envios gravados, não `tentativas`). */
  tentativa: number;
  agora: Date;
}

const MS_DIA = 86_400_000;
const OUTRA_PESSOA = "Mariana Alves Costa";

function hash(t: string): number {
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) h = Math.imul(h ^ t.charCodeAt(i), 16777619);
  return h >>> 0;
}

const p2 = (n: number) => String(n).padStart(2, "0");

function cpf_do_id(id: string): string {
  let h = hash(id);
  const d: number[] = [];
  for (let i = 0; i < 9; i++) {
    d.push(h % 10);
    h = Math.floor(h / 10) || hash(id + i);
  }
  if (d.every((x) => x === d[0])) d[8] = (d[0] + 1) % 10;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += d[i] * (tamanho + 1 - i);
    d.push(soma % 11 < 2 ? 0 : 11 - (soma % 11));
  }
  const s = d.join("");
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}

function nascimento_do_id(id: string): string {
  const h = hash(id + "nasc");
  return `${1985 + (h % 15)}-${p2(1 + ((h >>> 4) % 12))}-${p2(1 + ((h >>> 8) % 28))}`;
}

function dias_antes(agora: Date, n: number): string {
  return data_local(new Date(agora.getTime() - n * MS_DIA));
}

/** Último 15 de março que está a 90 dias ou mais antes de `agora`. */
function data_de_marco(agora: Date): string {
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  for (let ano = agora.getFullYear(); ; ano--) {
    if ((hoje - Date.UTC(ano, 2, 15)) / MS_DIA >= 90) return `${ano}-03-15`;
  }
}

function leitura_valida(i: EntradaLeitura, antigo: boolean, outro_nome: boolean): LeituraMock {
  const { admissao, agora } = i;
  const nome = outro_nome ? OUTRA_PESSOA : admissao.nome;
  const h = hash(admissao.id);
  let dados: Record<string, string>;
  switch (i.tipo_documento_id) {
    case "rg_cnh":
      dados = {
        nome,
        numero: String(10_000_000 + (h % 89_999_999)),
        data_nascimento: nascimento_do_id(admissao.id),
        filiacao: "Ana Souza e Carlos Souza",
      };
      break;
    case "cpf":
      dados = { nome, numero: cpf_do_id(admissao.id) };
      break;
    case "comprovante_residencia":
      dados = {
        titular: nome,
        endereco: "Rua das Flores, 120, São Paulo/SP",
        data_emissao: antigo ? data_de_marco(agora) : dias_antes(agora, 10),
      };
      break;
    case "dados_bancarios":
      dados = {
        banco: "Banco do Brasil",
        agencia: String(1000 + (h % 8999)),
        conta: `${10_000 + ((h >>> 3) % 89_999)}-${h % 10}`,
        titular: nome,
      };
      break;
    case "declaracao_matricula":
      dados = {
        nome,
        instituicao: "Universidade Federal",
        curso: "Administração",
        data: antigo ? data_de_marco(agora) : dias_antes(agora, 15),
      };
      break;
    default:
      dados = { nome };
  }
  return { qualidade: "ok", dados_extraidos: dados };
}

export function ler_documento_mock(i: EntradaLeitura): LeituraMock {
  const arquivo = normalizar(i.nome_arquivo);
  const tem = (dica: string) => arquivo.includes(dica);

  if (tem("borrado")) {
    return { qualidade: "ilegivel", detalhe_qualidade: "a imagem está borrada", dados_extraidos: {} };
  }
  const forca_ok = tem("ok");
  const antigo = tem("antigo");
  const outro_nome = tem("outro-nome");

  if (!forca_ok && !antigo && !outro_nome && i.tentativa === 1) {
    if (i.tipo_documento_id === "rg_cnh") {
      return {
        qualidade: "ilegivel",
        detalhe_qualidade: "a foto cortou a data de nascimento",
        dados_extraidos: {},
      };
    }
    if (i.tipo_documento_id === "comprovante_residencia") {
      return leitura_valida(i, true, false);
    }
  }
  return leitura_valida(i, antigo, outro_nome);
}

const PALAVRAS_CHAVE: [string, string[]][] = [
  ["rg_cnh", ["rg", "cnh", "identidade"]],
  ["cpf", ["cpf"]],
  ["comprovante_residencia", ["comprovante", "residencia", "conta-de-luz", "conta_de_luz"]],
  ["dados_bancarios", ["banco", "bancario", "conta-bancaria"]],
  ["declaracao_matricula", ["matricula", "declaracao"]],
];

/** Primeiro candidato (na ordem de `candidatos`) cujas palavras-chave aparecem no nome. */
export function identificar_tipo(nome_arquivo: string, candidatos: string[]): string | null {
  const arquivo = normalizar(nome_arquivo);
  for (const id of candidatos) {
    const palavras = PALAVRAS_CHAVE.find(([t]) => t === id)?.[1] ?? [];
    if (palavras.some((p) => arquivo.includes(p))) return id;
  }
  return null;
}
