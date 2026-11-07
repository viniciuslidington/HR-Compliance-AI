// Armazenamento chave/valor atrás de uma interface: localStorage no navegador, memória nos testes.

export interface Armazenamento {
  ler(chave: string): string | null;
  gravar(chave: string, valor: string): void;
  remover(chave: string): void;
  /** Lista as chaves gravadas (usado para apagar os arquivos no reset). */
  chaves(): string[];
  /** Avisa mudanças feitas por OUTRA janela (o evento `storage` não chega na própria). `null` = tudo limpo. */
  assinar(cb: (chave: string | null) => void): () => void;
}

export class ArmazenamentoLocal implements Armazenamento {
  ler(chave: string): string | null {
    try {
      return window.localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  gravar(chave: string, valor: string): void {
    window.localStorage.setItem(chave, valor);
  }

  remover(chave: string): void {
    window.localStorage.removeItem(chave);
  }

  chaves(): string[] {
    const r: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k !== null) r.push(k);
    }
    return r;
  }

  assinar(cb: (chave: string | null) => void): () => void {
    const ouvir = (ev: StorageEvent) => cb(ev.key);
    window.addEventListener("storage", ouvir);
    return () => window.removeEventListener("storage", ouvir);
  }
}

export class ArmazenamentoMemoria implements Armazenamento {
  private dados = new Map<string, string>();
  private ouvintes = new Set<(chave: string | null) => void>();

  ler(chave: string): string | null {
    return this.dados.get(chave) ?? null;
  }

  gravar(chave: string, valor: string): void {
    this.dados.set(chave, valor);
  }

  remover(chave: string): void {
    this.dados.delete(chave);
  }

  chaves(): string[] {
    return [...this.dados.keys()];
  }

  assinar(cb: (chave: string | null) => void): () => void {
    this.ouvintes.add(cb);
    return () => this.ouvintes.delete(cb);
  }

  /** Simula o evento `storage` vindo de outra janela. */
  disparar_externo(chave: string | null): void {
    for (const cb of [...this.ouvintes]) cb(chave);
  }
}
