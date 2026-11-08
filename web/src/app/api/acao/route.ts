import { METODOS, servico, type Metodo } from "../../../servidor/servico";

export const runtime = "nodejs";

/** Mutação do painel: `{ metodo, args }` com um dos métodos da Api. Devolve o estado novo e o retorno. */
export async function POST(request: Request) {
  let corpo: { metodo?: string; args?: unknown[] };
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ erro: "JSON inválido" }, { status: 400 });
  }
  if (!METODOS.includes(corpo.metodo as Metodo) || !Array.isArray(corpo.args ?? [])) {
    return Response.json({ erro: "método desconhecido" }, { status: 400 });
  }
  try {
    const r = await servico().executar(corpo.metodo as Metodo, corpo.args ?? []);
    return Response.json({ versao: r.versao, estado: JSON.parse(r.estado), retorno: r.retorno ?? null });
  } catch (erro) {
    console.error("[api/acao]", corpo.metodo, erro);
    return Response.json({ erro: erro instanceof Error ? erro.message : "falha" }, { status: 500 });
  }
}
