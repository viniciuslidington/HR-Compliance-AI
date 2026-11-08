import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";
import type { StatusAdmissao, StatusDocumento } from "../domain/tipos";

const casos: [StatusAdmissao | StatusDocumento, string][] = [
  ["criada", "Criada"],
  ["em_coleta", "Em coleta"],
  ["escalada", "Escalada"],
  ["concluida", "Concluída"],
  ["pendente", "Pendente"],
  ["recebido", "Recebido"],
  ["aprovado", "Aprovado"],
  ["recusado", "Recusado"],
];

describe("StatusPill", () => {
  it.each(casos)("mostra o rótulo e o data-status de %s", (status, rotulo) => {
    render(<StatusPill status={status} />);
    const pill = screen.getByText(rotulo);
    expect(pill).toHaveAttribute("data-status", status);
    expect(pill.className).toContain(status);
  });
});
