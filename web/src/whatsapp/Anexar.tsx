"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui/Button";
import estilos from "./Anexar.module.css";

export interface AnexarProps {
  /** Enviado ao confirmar a prévia; rejeitar mostra o erro e mantém a prévia. */
  ao_enviar: (arquivo: File) => Promise<void>;
  /** Campo de texto e botão de enviar: ficam no lugar da prévia enquanto não há anexo. */
  children: ReactNode;
}

interface Previa {
  arquivo: File;
  url: string | null;
}

function criar_url(arquivo: File): string | null {
  if (!arquivo.type.startsWith("image/") || typeof URL.createObjectURL !== "function") return null;
  return URL.createObjectURL(arquivo);
}

function revogar(url: string | null) {
  if (url && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(url);
}

export function Anexar({ ao_enviar, children }: AnexarProps) {
  const entrada = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<Previa | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);
  const url_atual = useRef<string | null>(null);

  useEffect(() => () => revogar(url_atual.current), []);

  function limpar() {
    revogar(url_atual.current);
    url_atual.current = null;
    setPrevia(null);
    setErro(false);
  }

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    revogar(url_atual.current);
    const url = criar_url(arquivo);
    url_atual.current = url;
    setErro(false);
    setPrevia({ arquivo, url });
  }

  async function enviar() {
    if (!previa || enviando) return;
    setEnviando(true);
    setErro(false);
    try {
      await ao_enviar(previa.arquivo);
      limpar();
    } catch {
      setErro(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <input
        ref={entrada}
        type="file"
        accept="image/*,application/pdf"
        hidden
        tabIndex={-1}
        aria-label="Anexar documento"
        onChange={escolher}
      />
      {previa ? (
        <div className={estilos.previa}>
          {previa.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={estilos.miniatura} src={previa.url} alt="Prévia do documento" />
          ) : (
            <span className={estilos.documento} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
            </span>
          )}
          <div className={estilos.info}>
            <p className={`text-label ${estilos.nome}`}>{previa.arquivo.name}</p>
            {erro && (
              <p role="alert" className={`text-caption ${estilos.erro}`}>
                Não consegui enviar. Tente de novo.
              </p>
            )}
          </div>
          <div className={estilos.acoes}>
            <Button tamanho="sm" variante="secundario" onClick={limpar} disabled={enviando}>
              Cancelar
            </Button>
            <Button tamanho="sm" onClick={enviar} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={estilos.clipe}
            aria-label="Anexar documento"
            onClick={() => entrada.current?.click()}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
            </svg>
          </button>
          {children}
        </>
      )}
    </>
  );
}
