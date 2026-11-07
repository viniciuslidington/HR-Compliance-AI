import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Com } from "../rh/teste_util";
import { Telefone } from "./Telefone";
import { criar_api } from "./teste_util";

function id_de(api: ReturnType<typeof criar_api>, nome: string): string {
  return api.listar_admissoes().find((r) => r.admissao.nome === nome)!.admissao.id;
}

function montar(props: { admissao_inicial?: string; ao_trocar_contato?: (id: string) => void } = {}) {
  const api = criar_api();
  const u = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(
    <Com api={api}>
      <Telefone {...props} />
    </Com>,
  );
  return { api, u };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  URL.createObjectURL = vi.fn(() => "blob:previa");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Telefone", () => {
  it("sem admissao_inicial, abre a em_coleta mais recente (Diego)", async () => {
    montar();
    expect(await screen.findByLabelText("Conversando como")).toHaveValue(
      (await screen.findByRole("option", { name: /Diego Rocha/ })).getAttribute("value"),
    );
  });

  it("admissao_inicial inválida cai no padrão; válida fixa o contato", async () => {
    const { api } = montar({ admissao_inicial: "nao-existe" });
    const seletor = await screen.findByLabelText("Conversando como");
    expect(seletor).toHaveValue(id_de(api, "Diego Rocha"));
  });

  it("admissao_inicial válida fixa o contato", async () => {
    const api = criar_api();
    render(
      <Com api={api}>
        <Telefone admissao_inicial={id_de(api, "Ana Souza")} />
      </Com>,
    );
    expect(await screen.findByLabelText("Conversando como")).toHaveValue(id_de(api, "Ana Souza"));
  });

  it("trocar o contato troca a conversa e avisa quem chamou", async () => {
    const ao_trocar_contato = vi.fn();
    const { api, u } = montar({ ao_trocar_contato });
    const ana = id_de(api, "Ana Souza");
    await u.selectOptions(await screen.findByLabelText("Conversando como"), ana);
    expect(ao_trocar_contato).toHaveBeenCalledWith(ana);
    expect(screen.getByLabelText("Conversando como")).toHaveValue(ana);
    // a Ana já mandou o RG (seu arquivo aparece); o Diego, não
    expect(await screen.findByText("rg-ok.jpg")).toBeInTheDocument();
    await u.selectOptions(screen.getByLabelText("Conversando como"), id_de(api, "Diego Rocha"));
    expect(screen.queryByText("rg-ok.jpg")).not.toBeInTheDocument();
  });

  it("texto vazio ou só com espaços não envia; texto válido vira bolha do colaborador", async () => {
    const { api, u } = montar();
    const espiao = vi.spyOn(api, "enviar_texto");
    const campo = await screen.findByLabelText("Mensagem");
    const enviar = screen.getByRole("button", { name: "Enviar" });
    expect(enviar).toBeDisabled();
    await u.type(campo, "   ");
    expect(enviar).toBeDisabled();
    await u.keyboard("{Enter}");
    expect(espiao).not.toHaveBeenCalled();
    await u.clear(campo);
    await u.type(campo, "Oi, tudo bem?{Enter}");
    expect(espiao).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Oi, tudo bem?")).toBeInTheDocument();
    expect(campo).toHaveValue("");
  });

  it("rg-borrado.jpg: mostra a imagem, segura a recusa por 1200 ms com 'digitando…'", async () => {
    const { api, u } = montar();
    const diego = id_de(api, "Diego Rocha");
    await screen.findByLabelText("Mensagem");
    await u.upload(
      screen.getByLabelText("Anexar documento", { selector: "input" }),
      new File(["x"], "rg-borrado.jpg", { type: "image/jpeg" }),
    );
    expect(screen.getByText("rg-borrado.jpg")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "Enviar" }));

    // a imagem do colaborador aparece de imediato
    const log = await screen.findByRole("log");
    expect((await within(log).findAllByAltText("Imagem enviada na conversa")).length).toBeGreaterThan(0);
    // o motor já gravou a resposta, mas a UI a segura
    expect(api.obter_admissao(diego)!.mensagens.at(-1)!.texto).toMatch(/borrada/i);
    expect(screen.getByText("Agente digitando")).toBeInTheDocument();
    expect(screen.queryByText(/borrada/i)).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    expect(screen.queryByText("Agente digitando")).not.toBeInTheDocument();
    expect(await screen.findByText(/borrada/i)).toBeInTheDocument();
  });

  it("enquanto o envio do arquivo está pendente, mostra a bolha própria e ainda não o 'digitando…'", async () => {
    const { api, u } = montar();
    let concluir!: () => void;
    vi.spyOn(api, "enviar_arquivo").mockImplementation(() => new Promise<void>((r) => (concluir = r)));
    await screen.findByLabelText("Mensagem");
    await u.upload(
      screen.getByLabelText("Anexar documento", { selector: "input" }),
      new File(["x"], "rg-ok.jpg", { type: "image/jpeg" }),
    );
    await u.click(screen.getByRole("button", { name: "Enviar" }));
    expect(screen.getByAltText("Documento sendo enviado")).toBeInTheDocument();
    expect(screen.queryByText("Agente digitando")).not.toBeInTheDocument();
    await act(async () => concluir());
    expect(screen.queryByAltText("Documento sendo enviado")).not.toBeInTheDocument();
    expect(screen.getByText("Agente digitando")).toBeInTheDocument();
  });

  it("falha no envio: remove a bolha, mantém a prévia e mostra o erro", async () => {
    const { api, u } = montar();
    vi.spyOn(api, "enviar_arquivo").mockRejectedValue(new Error("x"));
    await screen.findByLabelText("Mensagem");
    await u.upload(
      screen.getByLabelText("Anexar documento", { selector: "input" }),
      new File(["x"], "rg-ok.jpg", { type: "image/jpeg" }),
    );
    await u.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Não consegui enviar. Tente de novo.")).toBeInTheDocument();
    expect(screen.queryByAltText("Documento sendo enviado")).not.toBeInTheDocument();
    expect(screen.getByText("rg-ok.jpg")).toBeInTheDocument();
  });

  it("cancelar a prévia não envia nada", async () => {
    const { api, u } = montar();
    const espiao = vi.spyOn(api, "enviar_arquivo");
    await screen.findByLabelText("Mensagem");
    await u.upload(
      screen.getByLabelText("Anexar documento", { selector: "input" }),
      new File(["x"], "rg-ok.jpg", { type: "image/jpeg" }),
    );
    await u.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(espiao).not.toHaveBeenCalled();
    expect(screen.queryByText("rg-ok.jpg")).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("mensagens que chegam sem envio desta janela aparecem direto, sem 'digitando…'", async () => {
    const { api } = montar();
    const diego = id_de(api, "Diego Rocha");
    await screen.findByLabelText("Mensagem");
    const antes = within(screen.getByRole("log")).getAllByRole("listitem").length;
    act(() => api.avancar_tempo("mais_24h", diego));
    expect(within(screen.getByRole("log")).getAllByRole("listitem").length).toBeGreaterThan(antes);
    expect(screen.queryByText("Agente digitando")).not.toBeInTheDocument();
  });
});
