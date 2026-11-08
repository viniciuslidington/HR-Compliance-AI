import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogoModelos } from "./CatalogoModelos";
import { Com, criar_api } from "./teste_util";

describe("CatalogoModelos", () => {
  it("lista os 8 tipos e os 3 modelos com seus documentos", () => {
    const api = criar_api();
    render(<Com api={api}><CatalogoModelos /></Com>);
    const tipos = within(screen.getByRole("region", { name: "Tipos de documento" }));
    for (const t of api.listar_catalogo()) {
      expect(tipos.getByRole("heading", { name: t.nome })).toBeInTheDocument();
    }
    expect(api.listar_catalogo()).toHaveLength(8);
    const modelos = within(screen.getByRole("region", { name: "Modelos" }));
    expect(modelos.getByRole("heading", { name: "CLT padrão" })).toBeInTheDocument();
    expect(modelos.getByRole("heading", { name: "Estágio" })).toBeInTheDocument();
    expect(modelos.getByText("Declaração de matrícula")).toBeInTheDocument();
    expect(screen.getByText("Emitido nos últimos 90 dias")).toBeInTheDocument();
    expect(screen.getByText("Ajustes são feitos por admissão.")).toBeInTheDocument();
  });
});
