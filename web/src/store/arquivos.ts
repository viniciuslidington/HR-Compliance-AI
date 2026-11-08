// Arquivos enviados no WhatsApp simulado: reduzidos num canvas antes de ir para o armazenamento.

export const PLACEHOLDER = "/seed/placeholder.svg";
const LADO_MAXIMO = 1000;
const QUALIDADE_JPEG = 0.7;

type Decodificada = HTMLImageElement | ImageBitmap;

function decodificar_padrao(arquivo: File): Promise<Decodificada> {
  if (typeof createImageBitmap === "function") return createImageBitmap(arquivo);
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("não foi possível decodificar a imagem"));
    };
    img.src = url;
  });
}

/** Devolve um data URL JPEG (até 1000 px, qualidade 0,7) ou o placeholder se não der para ler a imagem. */
export async function reduzir_imagem(
  arquivo: File,
  decodificar: (f: File) => Promise<Decodificada> = decodificar_padrao,
  lado_maximo = LADO_MAXIMO,
  qualidade = QUALIDADE_JPEG,
): Promise<string> {
  if (!arquivo.type.startsWith("image/")) return PLACEHOLDER;
  try {
    const img = await decodificar(arquivo);
    const escala = Math.min(1, lado_maximo / Math.max(img.width, img.height));
    const largura = Math.max(1, Math.round(img.width * escala));
    const altura = Math.max(1, Math.round(img.height * escala));
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return PLACEHOLDER;
    ctx.drawImage(img, 0, 0, largura, altura);
    if ("close" in img && typeof img.close === "function") img.close();
    const url = canvas.toDataURL("image/jpeg", qualidade);
    return url.startsWith("data:image/") ? url : PLACEHOLDER;
  } catch {
    return PLACEHOLDER;
  }
}
