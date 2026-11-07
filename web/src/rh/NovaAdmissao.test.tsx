import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NovaAdmissao, mascarar_whatsapp } from "./NovaAdmissao";
import { Com, criar_api } from "./teste_util";

async function preencher(o: { nome?: string; whatsapp?: string; cargo?: string; data?: string } = {}) {
  const u = userEvent;
  await u.type(screen.getByLabelText("Nome"), o.nome ?? "Elisa Prado");
  await u.type(screen.getByLabelText("WhatsApp"), o.whatsapp ?? "11987654321");
  await u.type(screen.getByLabelText("Cargo"), o.cargo ?? "Analista");
  await u.type(screen.getByLabelText("Data de início"), o.data ?? "2026-11-30");
}

function montar() {
  const api = criar_api();
  const ao_criar = vi.fn();
  render(<Com api={api}><NovaAdmissao ao_criar={ao_criar} ao_cancelar={() => {}} /></Com>);
  return { api, ao_criar };
}

describe("NovaAdmissao", () => {
  it("Estágio preenche 4 documentos; com Dados bancários, cria com 5", async () => {
    const { api, ao_criar } = montar();
    await userEvent.selectOptions(screen.getByLabelText("Modelo"), "Estágio");
    expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(4);
    await userEvent.click(screen.getByRole("button", { name: "+ Dados bancários" }));
    await preencher();
    await userEvent.click(screen.getByRole("button", { name: "Criar admissão" }));
    expect(ao_criar).toHaveBeenCalledTimes(1);
    const id = ao_criar.mock.calls[0][0] as string;
    const det = api.obter_admissao(id)!;
    expect(det.documentos).toHaveLength(5);
    expect(det.admissao.whatsapp).toBe("+5511987654321");
  });

  it("bloqueia checklist vazio", async () => {
    const { ao_criar } = montar();
    await preencher();
    for (const b of screen.getAllByRole("button", { name: /^Remover / })) await userEvent.click(b);
    await userEvent.click(screen.getByRole("button", { name: "Criar admissão" }));
    expect(screen.getByText(/Escolha ao menos um documento/)).toBeInTheDocument();
    expect(ao_criar).not.toHaveBeenCalled();
  });

  it("bloqueia data de início antes de hoje (relógio simulado)", async () => {
    const { ao_criar } = montar();
    await preencher({ data: "2026-11-06" });
    await userEvent.click(screen.getByRole("button", { name: "Criar admissão" }));
    expect(screen.getByText(/não pode ser anterior a hoje/)).toBeInTheDocument();
    expect(ao_criar).not.toHaveBeenCalled();
  });

  it("aceita hoje como data de início", async () => {
    const { ao_criar } = montar();
    await preencher({ data: "2026-11-07" });
    await userEvent.click(screen.getByRole("button", { name: "Criar admissão" }));
    expect(ao_criar).toHaveBeenCalledTimes(1);
  });

  it("bloqueia WhatsApp com menos de 10 dígitos", async () => {
    const { ao_criar } = montar();
    await preencher({ whatsapp: "119876543" });
    await userEvent.click(screen.getByRole("button", { name: "Criar admissão" }));
    expect(screen.getByText(/Informe um WhatsApp com DDD/)).toBeInTheDocument();
    expect(ao_criar).not.toHaveBeenCalled();
  });

  it("mascara o WhatsApp", () => {
    expect(mascarar_whatsapp("11987654321")).toBe("(11) 98765-4321");
    expect(mascarar_whatsapp("+5511987654321")).toBe("+55 (11) 98765-4321");
    expect(mascarar_whatsapp("1")).toBe("(1");
  });
});
