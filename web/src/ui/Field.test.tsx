import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  it("liga o rótulo ao controle", () => {
    render(<Field rotulo="Nome"><input /></Field>);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("liga erro e ajuda por aria-describedby e marca inválido", () => {
    render(<Field rotulo="CPF" erro="CPF inválido" ajuda="Só números"><input /></Field>);
    const campo = screen.getByLabelText("CPF");
    expect(campo).toHaveAccessibleDescription("Só números CPF inválido");
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido");
  });
});
