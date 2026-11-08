import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListaAdmissoes } from "./ListaAdmissoes";
import { Com, criar_api } from "./teste_util";

describe("ListaAdmissoes", () => {
  it("o resumo bate com resumo_status()", () => {
    const api = criar_api();
    render(<Com api={api}><ListaAdmissoes ao_abrir={() => {}} /></Com>);
    const r = api.resumo_status();
    const resumo = within(screen.getByRole("group", { name: "Resumo por status" }));
    const esperado = [
      ["Em coleta", r.em_coleta],
      ["Escalada", r.escalada],
      ["Concluída", r.concluida],
    ] as const;
    for (const [rotulo, n] of esperado) {
      const item = resumo.getByText(rotulo).parentElement!;
      expect(within(item).getByText(String(n))).toBeInTheDocument();
    }
    // "Criada" só aparece quando há alguma; o seed não tem nenhuma.
    expect(r.criada).toBe(0);
    expect(resumo.queryByText("Criada")).toBeNull();
  });

  it("o aviso de escalações aponta para /rh/escalacoes", () => {
    render(<Com api={criar_api()}><ListaAdmissoes ao_abrir={() => {}} /></Com>);
    expect(screen.getByText(/precisa de você/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver escalações" })).toHaveAttribute("href", "/rh/escalacoes");
  });

  it("clicar numa linha chama ao_abrir com o id", async () => {
    const api = criar_api();
    const f = vi.fn();
    render(<Com api={api}><ListaAdmissoes ao_abrir={f} /></Com>);
    await userEvent.click(screen.getByText("Ana Souza"));
    expect(f).toHaveBeenCalledWith(api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao.id);
  });

  it("tem botão Nova admissão para /rh/admissoes/nova", () => {
    render(<Com api={criar_api()}><ListaAdmissoes ao_abrir={() => {}} /></Com>);
    expect(screen.getByRole("link", { name: "Nova admissão" })).toHaveAttribute("href", "/rh/admissoes/nova");
  });
});
