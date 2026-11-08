import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Planos } from "./Planos";

const esperados: [string, string][] = [
  ["Grátis", "R$ 0"],
  ["Essencial", "R$ 149"],
  ["Profissional", "R$ 449"],
  ["Corporativo", "R$ 1.500"],
];

describe("Planos", () => {
  it("é uma seção nomeada pelo título, com os quatro planos em lista", () => {
    render(<Planos />);
    const secao = screen.getByRole("region", { name: /Planos para cada ritmo de admissão/ });
    const planos = within(secao).getAllByRole("heading", { level: 3 });
    expect(planos.map((h) => h.textContent)).toEqual(esperados.map(([nome]) => nome));
  });

  it.each(esperados)("mostra o nome e o preço do plano %s", (nome, preco) => {
    render(<Planos />);
    const card = screen.getByRole("heading", { level: 3, name: nome }).closest("li");
    expect(card).not.toBeNull();
    expect(within(card!).getByText(preco)).toBeInTheDocument();
    expect(within(card!).getByRole("link", { name: new RegExp(`plano ${nome}$`) })).toHaveAttribute("href", "/rh");
  });

  it("marca só o Profissional como recomendado", () => {
    render(<Planos />);
    const selo = screen.getByText("Recomendado");
    expect(selo.closest("li")).toHaveTextContent("Profissional");
    expect(screen.getAllByText("Recomendado")).toHaveLength(1);
  });

  it("mostra o prefixo do Corporativo e a periodicidade dos planos pagos", () => {
    render(<Planos />);
    const card = screen.getByRole("heading", { level: 3, name: "Corporativo" }).closest("li")!;
    expect(within(card).getByText(/a partir de/)).toBeInTheDocument();
    expect(screen.getAllByText("por mês")).toHaveLength(3);
  });
});
