import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ImagemEnvio } from "./ImagemEnvio";

describe("ImagemEnvio", () => {
  it("mostra placeholder quando src é nulo", () => {
    render(<ImagemEnvio src={null} alt="RG" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Sem imagem")).toBeInTheDocument();
  });

  it("mostra miniatura com alt", () => {
    render(<ImagemEnvio src="data:image/png;base64,AA==" alt="Foto do RG" />);
    expect(screen.getByRole("img", { name: "Foto do RG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ampliar/i })).toBeInTheDocument();
  });

  it("abre o dialog ao clicar", async () => {
    render(<ImagemEnvio src="data:image/png;base64,AA==" alt="Foto do RG" />);
    await userEvent.click(screen.getByRole("button", { name: /ampliar/i }));
    expect(document.querySelector("dialog")).toHaveAttribute("open");
  });
});
