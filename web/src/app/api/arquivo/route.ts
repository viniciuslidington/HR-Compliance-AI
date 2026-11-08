import { servico } from "../../../servidor/servico";

export const runtime = "nodejs";
export const maxDuration = 120;

const TAMANHO_MAXIMO = 10 * 1024 * 1024;
const LEGIVEIS = new Set(["image/png", "image/jpeg", "image/webp"]);

async function ler_parte(form: FormData, nome: string) {
  const parte = form.get(nome);
  if (!(parte instanceof Blob) || parte.size === 0 || parte.size > TAMANHO_MAXIMO) return null;
  return { dados: Buffer.from(await parte.arrayBuffer()), mime: parte.type || "application/octet-stream" };
}

/** Arquivo do WhatsApp simulado: `admissao_id`, `nome_arquivo`, `previa` (JPEG reduzido) e `imagem` (para a IA). */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ erro: "envie multipart/form-data" }, { status: 400 });
  }
  const admissao_id = String(form.get("admissao_id") ?? "");
  const nome_arquivo = String(form.get("nome_arquivo") ?? "arquivo").slice(0, 200);
  if (!admissao_id) return Response.json({ erro: "admissao_id obrigatório" }, { status: 400 });
  const previa = await ler_parte(form, "previa");
  const imagem = await ler_parte(form, "imagem");
  try {
    const r = await servico().receber_arquivo({
      admissao_id,
      nome_arquivo,
      previa: previa && previa.mime.startsWith("image/") ? previa : null,
      imagem: imagem && LEGIVEIS.has(imagem.mime) ? imagem : null,
    });
    return Response.json({ versao: r.versao, estado: JSON.parse(r.estado) });
  } catch (erro) {
    console.error("[api/arquivo]", erro);
    return Response.json({ erro: erro instanceof Error ? erro.message : "falha" }, { status: 500 });
  }
}
