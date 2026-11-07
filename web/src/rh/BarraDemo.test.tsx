import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarraDemo } from "./BarraDemo";
import { criar_api as criar_api_com_imagem } from "../whatsapp/teste_util";
import { Com, criar_api } from "./teste_util";

const id_de = (api: ReturnType<typeof criar_api>, nome: string) =>
  api.listar_admissoes().find((r) => r.admissao.nome === nome)!.admissao.id;

function nova_admissao(api: ReturnType<typeof criar_api>) {
  return api.criar_admissao({
    nome: "Júlia Martins",
    whatsapp: "+55 11 91234-5678",
    cargo: "Estagiária",
    data_inicio: "2026-11-17",
    modelo_id: "estagio",
    documentos: [{ tipo_documento_id: "rg_cnh" }],
  });
}

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

  it("a admissão padrão fica travada quando conclui; uma admissão nova vira o padrão", async () => {
    const api = criar_api_com_imagem();
    render(<Com api={api}><BarraDemo /></Com>);
    const diego = id_de(api, "Diego Rocha");
    await act(async () => {
      for (const nome of ["rg-ok.jpg", "cpf.jpg", "comprovante-ok.jpg", "matricula.jpg", "banco.jpg"])
        await api.enviar_arquivo(diego, new File(["x"], nome, { type: "image/jpeg" }));
    });
    expect(api.obter_admissao(diego)!.admissao.status).toBe("concluida");
    expect(screen.getByRole("combobox")).toHaveDisplayValue("Diego Rocha");
    act(() => void nova_admissao(api));
    expect(screen.getByRole("combobox")).toHaveDisplayValue("Júlia Martins");
  });

  it("Reiniciar dados em outra janela descarta a escolha manual", async () => {
    const api = criar_api();
    render(<Com api={api}><BarraDemo /></Com>);
    await userEvent.selectOptions(screen.getByRole("combobox"), "Ana Souza");
    act(() => api.resetar());
    expect(screen.getByRole("combobox")).toHaveDisplayValue("Diego Rocha");
  });

  it("preset cujo alvo já passou fica desabilitado com 'Já passou'", async () => {
    const api = criar_api();
    render(<Com api={api}><BarraDemo /></Com>);
    const botao = (nome: string) => screen.getByRole("button", { name: nome });
    expect(botao("2 dias antes")).toBeEnabled();
    await userEvent.click(botao("Prazo estourado"));
    expect(botao("2 dias antes")).toBeDisabled();
    expect(botao("2 dias antes")).toHaveAttribute("title", "Já passou");
    expect(botao("Metade do prazo")).toBeDisabled();
    expect(botao("+24 h")).toBeEnabled();
  });
});
