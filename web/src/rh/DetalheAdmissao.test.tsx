import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DetalheAdmissao } from "./DetalheAdmissao";
import { Com, criar_api } from "./teste_util";

function id_de(api: ReturnType<typeof criar_api>, nome: string) {
  return api.listar_admissoes().find((r) => r.admissao.nome === nome)!.admissao.id;
}

describe("DetalheAdmissao", () => {
  it("Bruno: nome, pill Escalada, link para escalações, checklist e histórico", async () => {
    const api = criar_api();
    render(<Com api={api}><DetalheAdmissao id={id_de(api, "Bruno Lima")} /></Com>);
    expect(screen.getByRole("heading", { name: "Bruno Lima" })).toBeInTheDocument();
    expect(screen.getAllByText("Escalada").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Resolver escalação" })).toHaveAttribute("href", "/rh/escalacoes");

    const comp = screen.getByRole("button", { name: /^Comprovante de residência/ });
    // Pelo motor, após a recusa o documento volta a "pendente" com o motivo; o "recusado" vive nos envios.
    expect(within(comp).getByText(/90 dias/)).toBeInTheDocument();
    expect(within(comp).getByText("3ª tentativa")).toBeInTheDocument();

    await userEvent.click(comp);
    const envios = within(screen.getByRole("region", { name: "Envios" })).getAllByRole("listitem");
    expect(envios.length).toBe(3);
    for (const e of envios) expect(within(e).getByText("Recusado")).toBeInTheDocument();

    const conversa = within(screen.getByRole("log", { name: "Conversa" }));
    expect(conversa.getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  it("Carla concluída mostra o id externo", () => {
    const api = criar_api();
    render(<Com api={api}><DetalheAdmissao id={id_de(api, "Carla Mendes")} /></Com>);
    expect(screen.getByText(/Cadastrada no sistema de destino · COL-\d{6}/)).toBeInTheDocument();
  });

  it("id desconhecido mostra Admissão não encontrada", () => {
    render(<Com api={criar_api()}><DetalheAdmissao id="nao-existe" /></Com>);
    expect(screen.getByText("Admissão não encontrada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar às admissões" })).toHaveAttribute("href", "/rh");
  });
});
