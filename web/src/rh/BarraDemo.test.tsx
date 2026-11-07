import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarraDemo } from "./BarraDemo";
import { Com, criar_api } from "./teste_util";

afterEach(() => vi.restoreAllMocks());

describe("BarraDemo", () => {
  it("a admissão padrão é a mais recente em coleta ou escalada", () => {
    render(<Com api={criar_api()}><BarraDemo /></Com>);
    expect(screen.getByRole("combobox")).toHaveDisplayValue("Diego Rocha");
  });

  it("+24 h põe um lembrete na admissão escolhida", async () => {
    const api = criar_api();
    render(<Com api={api}><BarraDemo /></Com>);
    await userEvent.selectOptions(screen.getByRole("combobox"), "Ana Souza");
    const ana = api.listar_admissoes().find((r) => r.admissao.nome === "Ana Souza")!.admissao.id;
    const antes = api.obter_admissao(ana)!.lembretes.length;
    await userEvent.click(screen.getByRole("button", { name: "+24 h" }));
    expect(api.obter_admissao(ana)!.lembretes.length).toBeGreaterThan(antes);
  });

  it("Reiniciar dados só chama resetar se o RH confirmar", async () => {
    const api = criar_api();
    const resetar = vi.spyOn(api, "resetar");
    render(<Com api={api}><BarraDemo /></Com>);
    vi.spyOn(window, "confirm").mockReturnValue(false);
    await userEvent.click(screen.getByRole("button", { name: "Reiniciar dados" }));
    expect(resetar).not.toHaveBeenCalled();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getByRole("button", { name: "Reiniciar dados" }));
    expect(resetar).toHaveBeenCalledTimes(1);
  });
});
