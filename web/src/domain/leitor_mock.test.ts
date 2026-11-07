import { describe, expect, it } from "vitest";
import { CATALOGO } from "./catalogo";
import { cpf_valido } from "./identificadores";
import { identificar_tipo, ler_documento_mock } from "./leitor_mock";
import { cadastrar_colaborador } from "./destino_mock";
import type { Admissao, DocumentoAdmissao } from "./tipos";
import { validar_envio } from "./validacao";

const agora = new Date(2026, 5, 15, 10, 0, 0);
const admissao: Admissao = {
  id: "a1", nome: "Maria da Silva", whatsapp: "5511999999999", cargo: "Analista",
  data_inicio: "2026-07-01", modelo_id: "clt_padrao", status: "em_coleta",
  id_externo: null, criada_em: "2026-06-01T10:00:00.000Z", concluida_em: null,
};
const ler = (tipo: string, nome_arquivo = "foto.jpg", tentativa = 1, a = admissao) =>
  ler_documento_mock({ tipo_documento_id: tipo, nome_arquivo, admissao: a, tentativa, agora });
const tipo = (id: string) => CATALOGO.find((t) => t.id === id)!;
const validar = (id: string, leitura: ReturnType<typeof ler>) =>
  validar_envio({ tipo: tipo(id), leitura, admissao, aprovados: [], agora });

describe("roteiro", () => {
  it("RG tentativa 1 é ilegível; tentativa 2 é ok", () => {
    const r1 = ler("rg_cnh");
    expect(r1.qualidade).toBe("ilegivel");
    expect(r1.detalhe_qualidade).toBe("a foto cortou a data de nascimento");
    expect(ler("rg_cnh", "foto.jpg", 2).qualidade).toBe("ok");
  });
  it("comprovante tentativa 1 é de março e é recusado; tentativa 2 é recente", () => {
    const r1 = ler("comprovante_residencia");
    expect(r1.dados_extraidos.data_emissao).toBe("2026-03-15");
    const v = validar("comprovante_residencia", r1);
    expect(v.aprovado).toBe(false);
    expect(v.motivos[0].texto).toContain("é de março");
    expect(validar("comprovante_residencia", ler("comprovante_residencia", "f.jpg", 2)).aprovado).toBe(true);
  });
  it("março: usa o 15/03 mais recente a 90+ dias", () => {
    const r = ler_documento_mock({
      tipo_documento_id: "comprovante_residencia", nome_arquivo: "f.jpg", admissao, tentativa: 1,
      agora: new Date(2026, 1, 10),
    });
    expect(r.dados_extraidos.data_emissao).toBe("2025-03-15");
  });
});

describe("dicas no nome", () => {
  it("borrado -> ilegível", () => {
    expect(ler("cpf", "CPF-Borrado.jpg", 2).qualidade).toBe("ilegivel");
  });
  it("antigo -> data antiga em comprovante e declaração", () => {
    expect(ler("comprovante_residencia", "comprovante antigo.png", 2).dados_extraidos.data_emissao).toBe("2026-03-15");
    expect(ler("declaracao_matricula", "declaração-antigo.pdf", 2).dados_extraidos.data).toBe("2026-03-15");
  });
  it("outro-nome -> outro titular/nome", () => {
    expect(ler("cpf", "cpf-outro-nome.jpg", 2).dados_extraidos.nome).toBe("Mariana Alves Costa");
    expect(ler("dados_bancarios", "banco-outro-nome.jpg", 2).dados_extraidos.titular).toBe("Mariana Alves Costa");
  });
  it("ok força leitura válida na tentativa 1", () => {
    expect(ler("rg_cnh", "rg-ok.jpg", 1).qualidade).toBe("ok");
    expect(validar("comprovante_residencia", ler("comprovante_residencia", "ok.jpg", 1)).aprovado).toBe(true);
  });
  it("dica manda sobre o roteiro", () => {
    expect(ler("rg_cnh", "rg-borrado-ok.jpg", 2).qualidade).toBe("ilegivel");
  });
});

describe("leitura válida", () => {
  it.each(CATALOGO.map((t) => t.id))("%s: chaves = campos_extracao, aprova em validar_envio", (id) => {
    const l = ler(id, "x.jpg", 2);
    expect(l.qualidade).toBe("ok");
    const campos = tipo(id).campos_extracao.filter((c) => c !== "validade_cnh");
    for (const c of campos) expect(l.dados_extraidos[c]).toBeTruthy();
    expect(Object.keys(l.dados_extraidos).every((k) => tipo(id).campos_extracao.includes(k))).toBe(true);
    expect(validar(id, l)).toEqual({ aprovado: true, motivos: [] });
  });
  it("nome = admissao.nome, CPF válido e determinístico", () => {
    const l = ler("cpf", "x.jpg", 2);
    expect(l.dados_extraidos.nome).toBe(admissao.nome);
    expect(cpf_valido(l.dados_extraidos.numero)).toBe(true);
    expect(l.dados_extraidos.numero).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    expect(ler("cpf", "y.jpg", 3).dados_extraidos.numero).toBe(l.dados_extraidos.numero);
    for (const id of ["b1", "b2", "b3", "b4"]) {
      expect(cpf_valido(ler("cpf", "x.jpg", 2, { ...admissao, id }).dados_extraidos.numero)).toBe(true);
    }
  });
  it("RG não traz validade_cnh; datas em YYYY-MM-DD", () => {
    const l = ler("rg_cnh", "x.jpg", 2);
    expect(l.dados_extraidos.validade_cnh ?? "").toBe("");
    expect(l.dados_extraidos.data_nascimento).toMatch(/^(19[6-9]\d|200[0-5])-\d{2}-\d{2}$/);
  });
});

describe("identificar_tipo", () => {
  const todos = CATALOGO.map((t) => t.id);
  it.each([
    ["RG-borrado.jpg", "rg_cnh"],
    ["comprovante antigo.png", "comprovante_residencia"],
    ["cpf_ana.pdf", "cpf"],
    ["declaracao-matricula.jpg", "declaracao_matricula"],
    ["Conta_de_Luz.pdf", "comprovante_residencia"],
    ["extrato-bancario.png", "dados_bancarios"],
    ["Comprovante de Residência.jpg", "comprovante_residencia"],
  ])("%s -> %s", (nome, esperado) => {
    expect(identificar_tipo(nome, todos)).toBe(esperado);
  });
  it("sem palavra-chave ou fora dos candidatos -> null", () => {
    expect(identificar_tipo("foto123.jpg", todos)).toBeNull();
    expect(identificar_tipo("cpf.pdf", ["rg_cnh"])).toBeNull();
  });
});

describe("cadastrar_colaborador", () => {
  const doc = (status: DocumentoAdmissao["status"]): DocumentoAdmissao => ({
    id: "d", admissao_id: "a1", tipo_documento_id: "cpf", descricao_personalizada: null,
    status, tentativas: 0, motivo_recusa: null, dados_extraidos: null,
  });
  it("id_externo determinístico", () => {
    const a = cadastrar_colaborador(admissao, [doc("aprovado")]);
    expect(a.id_externo).toMatch(/^COL-\d{6}$/);
    expect(cadastrar_colaborador(admissao, [doc("aprovado")])).toEqual(a);
  });
  it("lança se algum doc não está aprovado", () => {
    expect(() => cadastrar_colaborador(admissao, [doc("aprovado"), doc("pendente")])).toThrow();
  });
});
