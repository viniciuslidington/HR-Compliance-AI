import { describe, expect, it, vi } from "vitest";
import { ArmazenamentoMemoria } from "./armazenamento";

describe("ArmazenamentoMemoria", () => {
  it("lê, grava e remove", () => {
    const a = new ArmazenamentoMemoria();
    expect(a.ler("x")).toBeNull();
    a.gravar("x", "1");
    expect(a.ler("x")).toBe("1");
    a.remover("x");
    expect(a.ler("x")).toBeNull();
  });

  it("disparar_externo notifica os assinantes com a chave, e cancelar para de notificar", () => {
    const a = new ArmazenamentoMemoria();
    const cb = vi.fn();
    const cancelar = a.assinar(cb);
    a.disparar_externo("admissao-demo:estado");
    expect(cb).toHaveBeenCalledWith("admissao-demo:estado");
    cancelar();
    a.disparar_externo("outra");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("gravar na própria janela não notifica (só o evento externo)", () => {
    const a = new ArmazenamentoMemoria();
    const cb = vi.fn();
    a.assinar(cb);
    a.gravar("x", "1");
    expect(cb).not.toHaveBeenCalled();
  });

  it("chaves lista as chaves gravadas", () => {
    const a = new ArmazenamentoMemoria();
    a.gravar("a", "1");
    a.gravar("arquivo:1", "2");
    expect(a.chaves().sort()).toEqual(["a", "arquivo:1"]);
  });
});
