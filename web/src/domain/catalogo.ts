import type { Modelo, ModeloDocumento, TipoDocumento } from "./tipos";

// Catálogo (PDF p. 2). Só leitura no MVP; o ajuste é por admissão.
export const CATALOGO: TipoDocumento[] = [
  {
    id: "rg_cnh",
    nome: "RG ou CNH",
    campos_extracao: ["nome", "numero", "data_nascimento", "filiacao", "validade_cnh"],
    regras_validacao: ["legivel", "frente_e_verso", "cnh_dentro_validade"],
    instrucao_colaborador:
      "Seu RG ou sua CNH. Mande uma foto da frente e outra do verso, em um lugar bem iluminado, com o documento inteiro aparecendo.",
  },
  {
    id: "cpf",
    nome: "CPF",
    campos_extracao: ["nome", "numero"],
    regras_validacao: ["cpf_digito_valido", "nome_igual_rg"],
    instrucao_colaborador:
      "Seu CPF. Pode ser uma foto do cartão, do app Meu CPF ou do comprovante de inscrição; o nome tem que estar igual ao do RG.",
  },
  {
    id: "comprovante_residencia",
    nome: "Comprovante de residência",
    campos_extracao: ["titular", "endereco", "data_emissao"],
    regras_validacao: ["emitido_menos_90_dias"],
    instrucao_colaborador:
      "Uma conta de luz, água, internet ou telefone com seu endereço, emitida nos últimos 90 dias. Foto ou PDF, mostrando a página inteira.",
  },
  {
    id: "dados_bancarios",
    nome: "Dados bancários",
    campos_extracao: ["banco", "agencia", "conta", "titular"],
    regras_validacao: ["titular_igual_colaborador"],
    instrucao_colaborador:
      "Um print do app do banco ou foto do cartão com banco, agência e conta. A conta precisa estar no seu nome.",
  },
  {
    id: "declaracao_matricula",
    nome: "Declaração de matrícula",
    campos_extracao: ["nome", "instituicao", "curso", "data"],
    regras_validacao: ["nome_igual_rg", "data_recente"],
    instrucao_colaborador:
      "A declaração de matrícula da sua faculdade ou escola, emitida recentemente, com seu nome, a instituição e o curso. Foto ou PDF.",
  },
];

export const MODELOS: Modelo[] = [
  { id: "clt_padrao", nome: "CLT padrão" },
  { id: "estagio", nome: "Estágio" },
];

export const MODELO_DOCUMENTO: ModeloDocumento[] = [
  { modelo_id: "clt_padrao", tipo_documento_id: "rg_cnh" },
  { modelo_id: "clt_padrao", tipo_documento_id: "cpf" },
  { modelo_id: "clt_padrao", tipo_documento_id: "comprovante_residencia" },
  { modelo_id: "clt_padrao", tipo_documento_id: "dados_bancarios" },
  { modelo_id: "estagio", tipo_documento_id: "rg_cnh" },
  { modelo_id: "estagio", tipo_documento_id: "cpf" },
  { modelo_id: "estagio", tipo_documento_id: "comprovante_residencia" },
  { modelo_id: "estagio", tipo_documento_id: "declaracao_matricula" },
];
