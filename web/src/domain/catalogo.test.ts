import { describe, expect, it } from "vitest";
import { CATALOGO, MODELO_DOCUMENTO, MODELOS } from "./catalogo";

describe("catálogo", () => {
  it("tem os 5 tipos do PDF e os 3 especializados, com ids estáveis", () => {
    expect(CATALOGO.map((t) => t.id)).toEqual([
      "rg_cnh",
      "cpf",
      "comprovante_residencia",
      "dados_bancarios",
      "declaracao_matricula",
      "aso",
      "nr10",
      "nr35",
    ]);
    for (const t of CATALOGO) {
      expect(t.campos_extracao.length).toBeGreaterThan(0);
      expect(t.regras_validacao.length).toBeGreaterThan(0);
      expect(t.instrucao_colaborador.length).toBeGreaterThan(20);
    }
  });
  it("CLT padrão e Estágio ligam os documentos certos", () => {
    const de = (m: string) => MODELO_DOCUMENTO.filter((l) => l.modelo_id === m).map((l) => l.tipo_documento_id);
    expect(MODELOS.map((m) => m.nome)).toEqual(["CLT padrão", "Estágio", "Eletricista (NR-10 e NR-35)"]);
    expect(de("eletricista")).toEqual([
      "rg_cnh", "cpf", "comprovante_residencia", "dados_bancarios", "aso", "nr10", "nr35",
    ]);
    expect(de("clt_padrao")).toEqual(["rg_cnh", "cpf", "comprovante_residencia", "dados_bancarios"]);
    expect(de("estagio")).toEqual(["rg_cnh", "cpf", "comprovante_residencia", "declaracao_matricula"]);
  });
  it("todo vínculo aponta para tipo e modelo existentes", () => {
    for (const l of MODELO_DOCUMENTO) {
      expect(CATALOGO.some((t) => t.id === l.tipo_documento_id)).toBe(true);
      expect(MODELOS.some((m) => m.id === l.modelo_id)).toBe(true);
    }
  });
});
