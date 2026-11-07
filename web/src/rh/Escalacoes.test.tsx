import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Escalacoes } from "./Escalacoes";
import { Com, criar_api } from "./teste_util";

function bruno(api: ReturnType<typeof criar_api>) {
  return api.listar_admissoes().find((r) => r.admissao.nome === "Bruno Lima")!.admissao.id;
}

describe("Escalacoes", () => {
  it("mostra o caso do Bruno com motivo e ação sugerida; aprovar tira de Abertas", async () => {
    const api = criar_api();
    render(<Com api={api}><Escalacoes /></Com>);
    expect(screen.getByText("Documento recusado 3 vezes")).toBeInTheDocument();
    expect(screen.getByText("Conferir a imagem e aprovar manualmente ou pedir de novo")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Abertas (1)" })).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("button", { name: "Aprovar manualmente" }));
    expect(screen.queryByText("Documento recusado 3 vezes")).toBeNull();
    expect(screen.getByText("Nenhuma escalação aberta. O agente está dando conta.")).toBeInTheDocument();
    expect(api.obter_admissao(bruno(api))!.admissao.status).not.toBe("escalada");

    await userEvent.click(screen.getByRole("tab", { name: "Resolvidas" }));
    expect(screen.getByText("Documento recusado 3 vezes")).toBeInTheDocument();
    expect(screen.getByText("aprovado manualmente")).toBeInTheDocument();
  });

  it("Falar com o colaborador bloqueia texto vazio e envia com texto", async () => {
    const api = criar_api();
    render(<Com api={api}><Escalacoes /></Com>);
    await userEvent.click(screen.getByRole("button", { name: "Falar com o colaborador" }));
    await userEvent.type(screen.getByLabelText(/Mensagem para/), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(within(screen.getByRole("tabpanel")).getByRole("alert")).toBeInTheDocument();
    expect(api.listar_escalacoes({ status: "aberta" })).toHaveLength(1);

    await userEvent.type(screen.getByLabelText(/Mensagem para/), "Pode mandar outra conta?");
    await userEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(api.listar_escalacoes({ status: "aberta" })).toHaveLength(0);
    const msgs = api.obter_admissao(bruno(api))!.mensagens;
    expect(msgs.some((m) => m.autor === "rh")).toBe(true);
  });
});
