import { afterEach, describe, expect, it, vi } from "vitest";
import { PLACEHOLDER, reduzir_imagem } from "./arquivos";

afterEach(() => vi.restoreAllMocks());

describe("reduzir_imagem", () => {
  it("arquivo que não é imagem vira placeholder", async () => {
    const f = new File(["x"], "doc.pdf", { type: "application/pdf" });
    expect(await reduzir_imagem(f)).toBe(PLACEHOLDER);
  });

  it("falha de decodificação vira placeholder", async () => {
    const f = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    const url = await reduzir_imagem(f, () => Promise.reject(new Error("não decodifica")));
    expect(url).toBe("/seed/placeholder.svg");
  });

  it("sem canvas (jsdom) cai no placeholder em vez de lançar", async () => {
    const f = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const img = { width: 100, height: 100 } as ImageBitmap;
    expect(await reduzir_imagem(f, () => Promise.resolve(img))).toBe(PLACEHOLDER);
  });

  it("reduz para no máximo 1000 px e exporta JPEG 0,7", async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage } as never);
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/jpeg;base64,AAAA");
    const f = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    const img = { width: 2000, height: 1000 } as ImageBitmap;
    const url = await reduzir_imagem(f, () => Promise.resolve(img));
    expect(url).toBe("data:image/jpeg;base64,AAAA");
    expect(toDataURL).toHaveBeenCalledWith("image/jpeg", 0.7);
    expect(drawImage).toHaveBeenCalledWith(img, 0, 0, 1000, 500);
  });
});
