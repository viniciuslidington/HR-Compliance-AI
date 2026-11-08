import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";

interface L { id: string; nome: string; cargo: string }
const linhas: L[] = [
  { id: "1", nome: "Ana", cargo: "Dev" },
  { id: "2", nome: "Bia", cargo: "Design" },
];
const colunas = [
  { chave: "nome", titulo: "Nome" },
  { chave: "cargo", titulo: "Cargo", alinhar: "fim" as const },
];
const render_cel = (l: L, c: string) => (c === "nome" ? l.nome : l.cargo);

describe("Table", () => {
  it("renderiza cabeçalhos e linhas", () => {
    render(<Table colunas={colunas} linhas={linhas} render={render_cel} chave_linha={(l) => l.id} />);
    expect(screen.getByRole("columnheader", { name: "Cargo" })).toBeInTheDocument();
    expect(screen.getByText("Bia")).toBeInTheDocument();
  });

  it("linha clicável é navegável por teclado (Tab + Enter)", async () => {
    const f = vi.fn();
    render(<Table colunas={colunas} linhas={linhas} render={render_cel} chave_linha={(l) => l.id} ao_clicar={f} />);
    await userEvent.tab();
    expect(screen.getAllByRole("row")[1]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(f).toHaveBeenCalledWith(linhas[0]);
  });

  it("clique do mouse chama ao_clicar", async () => {
    const f = vi.fn();
    render(<Table colunas={colunas} linhas={linhas} render={render_cel} chave_linha={(l) => l.id} ao_clicar={f} />);
    await userEvent.click(screen.getByText("Bia"));
    expect(f).toHaveBeenCalledWith(linhas[1]);
  });

  it("clique em botão interno não aciona ao_clicar da linha", async () => {
    const f = vi.fn();
    const g = vi.fn();
    render(
      <Table colunas={colunas} linhas={linhas} render={(l, c) => (c === "nome" ? <button onClick={g}>Abrir {l.nome}</button> : l.cargo)} chave_linha={(l) => l.id} ao_clicar={f} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Abrir Ana" }));
    expect(g).toHaveBeenCalled();
    expect(f).not.toHaveBeenCalled();
  });

  it("mostra o estado vazio", () => {
    render(<Table colunas={colunas} linhas={[]} render={render_cel} chave_linha={(l: L) => l.id} vazio={<p>Nenhuma admissão</p>} />);
    expect(screen.getByText("Nenhuma admissão")).toBeInTheDocument();
  });
});
