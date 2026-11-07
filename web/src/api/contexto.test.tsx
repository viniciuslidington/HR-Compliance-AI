import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ArmazenamentoMemoria } from "../store/armazenamento";
import { ApiProvider, useAcao, useConsulta } from "./contexto";
import { MockApi } from "./mock_api";

afterEach(cleanup);

const BASE = new Date(2026, 10, 7, 10, 0, 0).getTime();

function Contador() {
  const n = useConsulta((api) => api.listar_admissoes().length);
  const executar = useAcao();
  return (
    <div>
      <span data-testid="n">{n === null ? "carregando" : n}</span>
      <button
        onClick={() =>
          executar((api) =>
            api.criar_admissao({
              nome: "Nova",
              whatsapp: "+55 11 90000-0000",
              cargo: "X",
              data_inicio: "2026-12-01",
              modelo_id: "clt_padrao",
              documentos: [{ tipo_documento_id: "cpf" }],
            }),
          )
        }
      >
        criar
      </button>
    </div>
  );
}

describe("ApiProvider / useConsulta / useAcao", () => {
  it("consulta, reage a mutações e a mudanças vindas de outra instância", () => {
    const arm = new ArmazenamentoMemoria();
    const api = new MockApi(arm, () => BASE);
    render(
      <ApiProvider api={api}>
        <Contador />
      </ApiProvider>,
    );
    expect(screen.getByTestId("n")).toHaveTextContent("4");
    act(() => screen.getByText("criar").click());
    expect(screen.getByTestId("n")).toHaveTextContent("5");

    const outra = new MockApi(arm, () => BASE);
    act(() => {
      outra.resetar();
      arm.disparar_externo("admissao-demo:estado");
    });
    expect(screen.getByTestId("n")).toHaveTextContent("4");
  });

  it("sem api injetada cria a MockApi no cliente (após montar)", async () => {
    window.localStorage.clear();
    render(
      <ApiProvider>
        <Contador />
      </ApiProvider>,
    );
    expect(await screen.findByText("4")).toBeInTheDocument();
  });
});

describe("renderização no servidor", () => {
  it("não renderiza dado do mock: useConsulta devolve null", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(
      <ApiProvider>
        <Contador />
      </ApiProvider>,
    );
    expect(html).toContain("carregando");
  });
});
