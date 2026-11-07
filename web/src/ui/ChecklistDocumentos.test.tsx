import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChecklistDocumentos } from "./ChecklistDocumentos";
import type { DocumentoDetalhe } from "../api/api";

function doc(id: string, nome: string, p: Partial<DocumentoDetalhe["documento"]> = {}): DocumentoDetalhe {
  return {
    documento: {
      id,
      admissao_id: "a1",
      tipo_documento_id: id,
      descricao_personalizada: null,
      status: "pendente",
      tentativas: 0,
      motivo_recusa: null,
      dados_extraidos: null,
      ...p,
    },
    tipo: { id, nome, instrucao_colaborador: "", campos_extracao: [], regras_validacao: [] },
    envios: [],
  };
}

const docs = [
  doc("rg", "RG", { status: "aprovado", tentativas: 1 }),
  doc("comp", "Comprovante de residência", {
    tentativas: 2,
    motivo_recusa: "o comprovante é de março; preciso de um emitido nos últimos 90 dias",
  }),
  { ...doc("x", ""), tipo: null, documento: { ...doc("x", "").documento, tipo_documento_id: null, descricao_personalizada: "Certidão de casamento" } },
];

describe("ChecklistDocumentos", () => {
  it("mostra nome, status, tentativas e motivo de recusa", () => {
    render(<ChecklistDocumentos documentos={docs} />);
    expect(screen.getByText("RG")).toBeInTheDocument();
    expect(screen.getByText("Certidão de casamento")).toBeInTheDocument();
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText(/2ª tentativa/)).toBeInTheDocument();
    expect(screen.getByText(/emitido nos últimos 90 dias/)).toBeInTheDocument();
  });

  it("mostra o progresso 'N de M aprovados'", () => {
    render(<ChecklistDocumentos documentos={docs} />);
    expect(screen.getByText("1 de 3 aprovados")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });

  it("chama ao_selecionar ao clicar na linha", async () => {
    const f = vi.fn();
    render(<ChecklistDocumentos documentos={docs} ao_selecionar={f} />);
    await userEvent.click(screen.getByRole("button", { name: "RG, Aprovado" }));
    expect(f).toHaveBeenCalledWith("rg");
  });
});
