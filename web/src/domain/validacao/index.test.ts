import { describe, expect, it } from "vitest";
import { CATALOGO } from "../catalogo";
import type { Admissao, DocumentoAdmissao } from "../tipos";
import { validar_envio, type LeituraMock } from "./index";

const tipo = (id: string) => CATALOGO.find((t) => t.id === id)!;
const agora = new Date(2026, 5, 15, 10, 0, 0); // 15/06/2026 local
const dia = (n: number) => {
  const d = new Date(2026, 5, 15 - n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const admissao: Admissao = {
  id: "a1", nome: "Maria da Silva", whatsapp: "5511999999999", cargo: "Analista",
  data_inicio: "2026-07-01", modelo_id: "clt_padrao", status: "em_coleta",
  id_externo: null, criada_em: "2026-06-01T10:00:00.000Z", concluida_em: null,
};
const ok = (dados: Record<string, string>): LeituraMock => ({ qualidade: "ok", dados_extraidos: dados });
const rg_aprovado = (dados: Record<string, string>): DocumentoAdmissao => ({
  id: "d1", admissao_id: "a1", tipo_documento_id: "rg_cnh", descricao_personalizada: null,
  status: "aprovado", tentativas: 0, motivo_recusa: null, dados_extraidos: dados,
});
const validar = (t: string, leitura: LeituraMock, aprovados: DocumentoAdmissao[] = []) =>
  validar_envio({ tipo: tipo(t), leitura, admissao, aprovados, agora });

describe("camada 1: qualidade", () => {
  it("ilegível recusa pedindo nova foto e para", () => {
    const r = validar("rg_cnh", {
      qualidade: "ilegivel", detalhe_qualidade: "a foto cortou a data de nascimento",
      dados_extraidos: { validade_cnh: dia(10) },
    });
    expect(r.aprovado).toBe(false);
    expect(r.motivos).toHaveLength(1);
    expect(r.motivos[0].codigo).toBe("ilegivel");
    expect(r.motivos[0].gravidade).toBe("recusa");
    expect(r.motivos[0].texto).toContain("a foto cortou a data de nascimento");
    expect(r.motivos[0].o_que_fazer).toMatch(/nova foto/i);
  });
  it("tipo errado cita o documento esperado", () => {
    const r = validar("cpf", { qualidade: "tipo_errado", dados_extraidos: {} });
    expect(r.motivos.map((m) => m.codigo)).toEqual(["tipo_errado"]);
    expect(r.motivos[0].texto).toContain("CPF");
  });
});

describe("camada 2: regras", () => {
  it("comprovante de 91 dias recusa citando o mês", () => {
    const r = validar("comprovante_residencia", ok({ titular: "Maria da Silva", endereco: "Rua A", data_emissao: "2026-03-16" }));
    expect(r.aprovado).toBe(false);
    expect(r.motivos[0].codigo).toBe("comprovante_antigo");
    expect(r.motivos[0].texto).toContain("é de março");
    expect(r.motivos[0].o_que_fazer).toContain("preciso de um emitido nos últimos 90 dias");
  });
  it("comprovante de 89 dias aprova", () => {
    const r = validar("comprovante_residencia", ok({ titular: "Maria", endereco: "Rua A", data_emissao: dia(89) }));
    expect(r).toEqual({ aprovado: true, motivos: [] });
  });
  it("CNH vencida recusa; válida ou ausente passa", () => {
    const base = { nome: "Maria da Silva", numero: "1", data_nascimento: "1990-01-01", filiacao: "X" };
    const v = validar("rg_cnh", ok({ ...base, validade_cnh: dia(1) }));
    expect(v.motivos.map((m) => m.codigo)).toEqual(["cnh_vencida"]);
    expect(validar("rg_cnh", ok({ ...base, validade_cnh: "2030-01-01" })).aprovado).toBe(true);
    expect(validar("rg_cnh", ok(base)).aprovado).toBe(true);
  });
  it("CPF com dígito errado recusa", () => {
    const r = validar("cpf", ok({ nome: "Maria da Silva", numero: "529.982.247-24" }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["cpf_invalido"]);
  });
  it("titular bancário diferente recusa", () => {
    const r = validar("dados_bancarios", ok({ banco: "X", agencia: "1", conta: "2", titular: "João Souza" }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["titular_divergente"]);
    expect(validar("dados_bancarios", ok({ banco: "X", agencia: "1", conta: "2", titular: "MARIA DA SILVA" })).aprovado).toBe(true);
  });
  it("declaração de matrícula antiga recusa", () => {
    const r = validar("declaracao_matricula", ok({ nome: "Maria da Silva", instituicao: "U", curso: "C", data: dia(120) }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["declaracao_antiga"]);
  });
});

describe("especializados: ASO, NR-10 e NR-35 (camada 2)", () => {
  const nr = (dados: Record<string, string>) =>
    ok({ nome: "Maria da Silva", responsavel_tecnico: "Eng. Paulo", carga_horaria: "8 horas", ...dados });
  it("NR-35 dentro de 24 meses e com 8h aprova", () => {
    expect(validar("nr35", nr({ data_realizacao: dia(300) })).aprovado).toBe(true);
  });
  it("NR-35 com mais de 24 meses recusa dizendo quando venceu", () => {
    const r = validar("nr35", nr({ data_realizacao: "2024-06-10" }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["certificado_vencido"]);
    expect(r.motivos[0].texto).toContain("10/06/2026");
  });
  it("NR-10 com menos de 40h recusa citando a carga", () => {
    const r = validar("nr10", nr({ data_realizacao: dia(30), carga_horaria: "16h" }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["carga_insuficiente"]);
    expect(r.motivos[0].texto).toBe("o curso tem 16h e o certificado NR-10 exige pelo menos 40h");
  });
  it("sem data ou sem carga pede foto nova", () => {
    const r = validar("nr35", ok({ nome: "Maria da Silva" }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["carga_ilegivel", "data_ilegivel"]);
  });
  it("ASO apto e recente aprova; inapto ou vencido recusa", () => {
    const aso = (resultado: string, data_realizacao: string) =>
      validar("aso", ok({ nome: "Maria da Silva", cpf: "529.982.247-25", resultado, data_realizacao }));
    expect(aso("APTO", dia(10)).aprovado).toBe(true);
    expect(aso("Inapto", dia(10)).motivos.map((m) => m.codigo)).toEqual(["aso_nao_apto"]);
    expect(aso("Apto", dia(400)).motivos.map((m) => m.codigo)).toEqual(["certificado_vencido"]);
  });
  it("nome do certificado diferente do RG escala", () => {
    const r = validar("nr35", nr({ nome: "João Pereira", data_realizacao: dia(30) }));
    expect(r.motivos.map((m) => m.codigo)).toEqual(["inconsistencia"]);
  });
});

describe("datas ausentes ou inválidas (camada 2)", () => {
  const comp = (extra: Record<string, string>) =>
    validar("comprovante_residencia", ok({ titular: "Maria", endereco: "Rua A", ...extra }));
  const decl = (extra: Record<string, string>) =>
    validar("declaracao_matricula", ok({ nome: "Maria da Silva", instituicao: "U", curso: "C", ...extra }));
  it.each([[{}], [{ data_emissao: "31/02/2026" }], [{ data_emissao: "abc" }], [{ data_emissao: "2026-02-31" }]])(
    "comprovante com data %j é recusado", (extra) => {
      const r = comp(extra);
      expect(r.aprovado).toBe(false);
      expect(r.motivos[0].codigo).toBe("data_ilegivel");
      expect(r.motivos[0].o_que_fazer).toMatch(/data/i);
    });
  it.each([[{}], [{ data: "31/02/2026" }], [{ data: "abc" }]])("declaração com data %j é recusada", (extra) => {
    const r = decl(extra);
    expect(r.aprovado).toBe(false);
    expect(r.motivos[0].codigo).toBe("data_ilegivel");
  });
});

describe("camada 3: consistência", () => {
  it("nome do CPF diferente do RG aprovado escala", () => {
    const r = validar("cpf", ok({ nome: "Mariana Souza", numero: "529.982.247-25" }), [rg_aprovado({ nome: "Maria da Silva" })]);
    expect(r.aprovado).toBe(false);
    expect(r.motivos).toHaveLength(1);
    expect(r.motivos[0].codigo).toBe("inconsistencia");
    expect(r.motivos[0].gravidade).toBe("escalada");
    expect(r.motivos[0].o_que_fazer).not.toMatch(/RH/);
    expect(r.motivos[0].o_que_fazer).toMatch(/confirm/i);
  });
  it("sem RG aprovado compara com o nome da admissão", () => {
    expect(validar("cpf", ok({ nome: "Maria da Silva", numero: "529.982.247-25" })).aprovado).toBe(true);
    expect(validar("cpf", ok({ nome: "Outra Pessoa", numero: "529.982.247-25" })).motivos[0].codigo).toBe("inconsistencia");
  });
  it("data de nascimento divergente escala", () => {
    const r = validar("declaracao_matricula",
      ok({ nome: "Maria da Silva", instituicao: "U", curso: "C", data: dia(5), data_nascimento: "1991-02-02" }),
      [rg_aprovado({ nome: "Maria da Silva", data_nascimento: "1990-01-01" })]);
    expect(r.motivos.map((m) => m.codigo)).toEqual(["inconsistencia"]);
  });
  it("todo motivo tem texto e o_que_fazer", () => {
    const r = validar("cpf", ok({ nome: "Outro", numero: "1" }));
    for (const m of r.motivos) {
      expect(m.texto.length).toBeGreaterThan(0);
      expect(m.o_que_fazer.length).toBeGreaterThan(0);
    }
  });
});
