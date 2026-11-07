import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Conversa } from "./Conversa";
import type { Mensagem } from "../domain/tipos";

const m = (id: string, p: Partial<Mensagem>): Mensagem => ({
  id,
  admissao_id: "a1",
  direcao: "saida",
  texto: id,
  midia_url: null,
  criada_em: "2026-11-07T10:00:00.000Z",
  ...p,
});

const msgs = [
  m("terceira", { criada_em: "2026-11-07T12:00:00.000Z", direcao: "entrada" }),
  m("primeira", { criada_em: "2026-11-07T10:00:00.000Z" }),
  m("segunda", { criada_em: "2026-11-07T11:00:00.000Z", autor: "rh" }),
];

describe("Conversa", () => {
  it("ordena por criada_em", () => {
    render(<Conversa mensagens={msgs} resolver_midia={(u) => u} />);
    const itens = screen.getAllByRole("listitem").map((i) => i.textContent ?? "");
    expect(itens[0]).toContain("primeira");
    expect(itens[1]).toContain("segunda");
    expect(itens[2]).toContain("terceira");
  });

  it("marca direção e distingue o RH", () => {
    render(<Conversa mensagens={msgs} resolver_midia={(u) => u} variante="telefone" />);
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveAttribute("data-direcao", "saida");
    expect(itens[2]).toHaveAttribute("data-direcao", "entrada");
    expect(itens[1]).toHaveAttribute("data-autor", "rh");
    expect(screen.getByText("RH")).toBeInTheDocument();
    expect(screen.getAllByText("RH")).toHaveLength(1);
  });

  it("legenda visível do remetente: Agente, RH e Colaborador", () => {
    render(
      <Conversa
        mensagens={[
          m("a", { criada_em: "2026-11-07T10:00:00.000Z" }),
          m("b", { criada_em: "2026-11-07T11:00:00.000Z", autor: "rh" }),
          m("c", { criada_em: "2026-11-07T12:00:00.000Z", direcao: "entrada" }),
        ]}
        resolver_midia={(u) => u}
      />,
    );
    const itens = screen.getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("Agente");
    expect(itens[1]).toHaveTextContent("RH");
    expect(itens[1]).not.toHaveTextContent("Agente");
    expect(itens[2]).toHaveTextContent("Colaborador");
  });

  it("é uma região aria-live polite", () => {
    render(<Conversa mensagens={msgs} resolver_midia={(u) => u} />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
  });

  it("live={false} desliga o aria-live", () => {
    render(<Conversa mensagens={[]} resolver_midia={(u) => u} live={false} />);
    expect(screen.getByRole("log")).toHaveAttribute("aria-live", "off");
  });

  it("renderiza imagem quando há mídia", () => {
    render(<Conversa mensagens={[m("foto", { midia_url: "blob:x" })]} resolver_midia={() => "data:image/png;base64,AA=="} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "data:image/png;base64,AA==");
  });

  it("variante telefone com proprio=entrada marca a lista para alinhar as do colaborador à direita", () => {
    const { rerender } = render(<Conversa mensagens={msgs} resolver_midia={(u) => u} variante="telefone" proprio="entrada" />);
    expect(screen.getAllByRole("listitem")[0].parentElement!.className).toMatch(/do_colaborador/);
    rerender(<Conversa mensagens={msgs} resolver_midia={(u) => u} variante="telefone" />);
    expect(screen.getAllByRole("listitem")[0].parentElement!.className).not.toMatch(/do_colaborador/);
  });
});
