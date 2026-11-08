import { servico } from "../../../servidor/servico";

export const runtime = "nodejs";

/** Estado compartilhado do painel. Com `If-None-Match` igual à versão atual, responde 304 (polling barato). */
export async function GET(request: Request) {
  try {
    const { versao, estado } = await servico().ler();
    const etag = `"${versao}"`;
    // O proxy do Render comprime e enfraquece o ETag (W/"..."): compara sem o prefixo.
    const pedido = request.headers.get("if-none-match")?.replace(/^W\//, "");
    if (pedido === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
    return new Response(estado, {
      headers: { "Content-Type": "application/json", ETag: etag, "Cache-Control": "no-store" },
    });
  } catch (erro) {
    console.error("[api/estado]", erro);
    return Response.json({ erro: "estado indisponível" }, { status: 503 });
  }
}
