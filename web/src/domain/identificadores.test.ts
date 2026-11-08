import { describe, expect, it } from "vitest";
import { cpf_valido, digitos, normalizar } from "./identificadores";

describe("cpf_valido", () => {
  it("aceita CPF válido sem máscara", () => {
    expect(cpf_valido("52998224725")).toBe(true);
  });
  it("aceita CPF válido com máscara", () => {
    expect(cpf_valido("529.982.247-25")).toBe(true);
  });
  it("recusa dígito verificador errado", () => {
    expect(cpf_valido("529.982.247-24")).toBe(false);
  });
  it("recusa dígitos repetidos", () => {
    expect(cpf_valido("111.111.111-11")).toBe(false);
  });
  it("recusa tamanho errado, vazio e nulo", () => {
    expect(cpf_valido("123")).toBe(false);
    expect(cpf_valido("")).toBe(false);
    expect(cpf_valido(null)).toBe(false);
  });
});

describe("normalizar", () => {
  it("tira acento, caixa e espaços repetidos", () => {
    expect(normalizar("Ána  SOUZA")).toBe("ana souza");
    expect(normalizar("  João   da Conceição ")).toBe("joao da conceicao");
  });
});

describe("digitos", () => {
  it("mantém só dígitos", () => {
    expect(digitos("529.982.247-25")).toBe("52998224725");
    expect(digitos(null)).toBe("");
  });
});
