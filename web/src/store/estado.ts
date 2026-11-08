// Persistência do Estado (o tipo e o estado vazio vivem no domínio).
import { estado_vazio, type Estado } from "../domain/estado";
import type { Armazenamento } from "./armazenamento";

export { estado_vazio };
export type { Estado };

export const CHAVE_ESTADO = "admissao-demo:estado";
export const PREFIXO_ARQUIVO = "arquivo:";

function parece_estado(x: unknown): x is Estado {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return (
    ["admissoes", "documentos", "envios", "mensagens", "lembretes", "escalacoes"].every((k) => Array.isArray(e[k])) &&
    typeof e.relogio === "object" &&
    e.relogio !== null &&
    typeof (e.relogio as { deslocamento_ms?: unknown }).deslocamento_ms === "number"
  );
}

/** Lê e valida. `null` se ausente ou inválido. */
export function carregar_estado(arm: Armazenamento): Estado | null {
  const bruto = arm.ler(CHAVE_ESTADO);
  if (bruto === null) return null;
  try {
    const x: unknown = JSON.parse(bruto);
    return parece_estado(x) ? x : null;
  } catch {
    return null;
  }
}

export function salvar_estado(arm: Armazenamento, estado: Estado): void {
  arm.gravar(CHAVE_ESTADO, JSON.stringify(estado));
}
