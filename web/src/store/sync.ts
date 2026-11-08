// Sincronização: notifica a própria janela (o evento `storage` só chega nas outras) e repassa o das outras.
import type { Armazenamento } from "./armazenamento";
import { CHAVE_ESTADO } from "./estado";

export class Notificador {
  private ouvintes = new Set<() => void>();

  assinar(cb: () => void): () => void {
    this.ouvintes.add(cb);
    return () => this.ouvintes.delete(cb);
  }

  notificar(): void {
    for (const cb of [...this.ouvintes]) cb();
  }
}

/** Chama `cb` quando OUTRA janela muda o estado (ou limpa o armazenamento). */
export function assinar_estado_externo(arm: Armazenamento, cb: () => void): () => void {
  return arm.assinar((chave) => {
    if (chave === null || chave === CHAVE_ESTADO) cb();
  });
}
