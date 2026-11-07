"use client";

import { useRef } from "react";
import estilos from "./ImagemEnvio.module.css";

export function ImagemEnvio({ src, alt }: { src: string | null; alt: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);

  if (!src) {
    return <div className={`text-caption ${estilos.vazio}`}>Sem imagem</div>;
  }

  function abrir() {
    const d = dialogo.current;
    if (!d) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }

  function fechar() {
    const d = dialogo.current;
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }

  return (
    <>
      <button type="button" className={estilos.miniatura} onClick={abrir} aria-label={`Ampliar: ${alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
      </button>
      <dialog ref={dialogo} className={estilos.dialogo} aria-label={alt} onClick={(e) => e.target === e.currentTarget && fechar()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={estilos.grande} />
        <button type="button" className={`text-label ${estilos.fechar}`} onClick={fechar}>
          Fechar
        </button>
      </dialog>
    </>
  );
}
