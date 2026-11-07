import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutRh } from "./LayoutRh";
import { Com, criar_api } from "./teste_util";

describe("LayoutRh", () => {
  it("marca o item ativo conforme caminho_atual", () => {
    render(<Com api={criar_api()}><LayoutRh caminho_atual="/rh/escalacoes"><p>conteúdo</p></LayoutRh></Com>);
    expect(screen.getByRole("link", { name: /Escalações/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Admissões" })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("/rh ativa Admissões; /rh/admissoes/nova ativa só Nova admissão", () => {
    const { rerender } = render(<Com api={criar_api()}><LayoutRh caminho_atual="/rh">x</LayoutRh></Com>);
    expect(screen.getByRole("link", { name: "Admissões" })).toHaveAttribute("aria-current", "page");
    rerender(<Com api={criar_api()}><LayoutRh caminho_atual="/rh/admissoes/nova">x</LayoutRh></Com>);
    expect(screen.getByRole("link", { name: "Nova admissão" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Admissões" })).not.toHaveAttribute("aria-current");
  });

  it("mostra a contagem de escalações abertas e a barra demo", () => {
    const api = criar_api();
    render(<Com api={api}><LayoutRh caminho_atual="/rh">x</LayoutRh></Com>);
    const n = api.listar_escalacoes({ status: "aberta" }).length;
    expect(n).toBeGreaterThan(0);
    expect(screen.getByLabelText(`${n} abertas`)).toHaveTextContent(String(n));
    expect(screen.getByText("Modo demo")).toBeInTheDocument();
  });
});
