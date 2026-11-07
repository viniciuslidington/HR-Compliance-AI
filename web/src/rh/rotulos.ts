// Rótulos legíveis para chaves técnicas do catálogo, compartilhados por Detalhe e Catálogo.

const CAMPOS: Record<string, string> = {
  nome: "Nome",
  numero: "Número",
  data_nascimento: "Data de nascimento",
  filiacao: "Filiação",
  validade_cnh: "Validade da CNH",
  titular: "Titular",
  endereco: "Endereço",
  data_emissao: "Data de emissão",
  banco: "Banco",
  agencia: "Agência",
  conta: "Conta",
  instituicao: "Instituição",
  curso: "Curso",
  data: "Data",
};

const REGRAS: Record<string, string> = {
  legivel: "Imagem legível",
  frente_e_verso: "Frente e verso",
  cnh_dentro_validade: "CNH dentro da validade",
  cpf_digito_valido: "CPF com dígitos válidos",
  nome_igual_rg: "Nome igual ao do RG",
  emitido_menos_90_dias: "Emitido nos últimos 90 dias",
  titular_igual_colaborador: "Titular é o próprio colaborador",
  data_recente: "Emitida recentemente",
};

function humanizar(chave: string): string {
  const t = chave.replace(/_/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export const rotulo_campo = (chave: string): string => CAMPOS[chave] ?? humanizar(chave);
export const rotulo_regra = (chave: string): string => REGRAS[chave] ?? humanizar(chave);

export function data_hora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
}

export const MOTIVO_ESCALACAO: Record<string, string> = {
  tres_falhas: "Documento recusado 3 vezes",
  inconsistencia: "Dados não batem entre documentos",
  fora_do_escopo: "Pergunta fora do escopo",
  prazo_estourado: "Prazo estourado",
  suspeita_adulteracao: "Suspeita de adulteração",
};
