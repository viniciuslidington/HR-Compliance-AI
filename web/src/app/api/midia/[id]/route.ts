import { servico } from "../../../../servidor/servico";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/midia/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("não encontrado", { status: 404 });
  const m = await servico().midia(id);
  if (!m) return new Response("não encontrado", { status: 404 });
  return new Response(new Uint8Array(m.dados), {
    headers: { "Content-Type": m.tipo, "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
