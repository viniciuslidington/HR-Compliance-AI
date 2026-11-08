"use client";

import { useEffect, useRef } from "react";

/*
 * Fundo ASCII da landing, depois do hero: linhas de onda (curvas de nível que escorrem) desenhadas com
 * caracteres monoespaçados. A frente da onda sobe do rodapé conforme o hero sai da tela; as cristas
 * acendem em laranja; o cursor abre uma ondulação. Canvas 2D, ~30 fps, pausa fora da tela, com
 * aba oculta e com movimento reduzido (aí desenha um quadro só).
 */

const RAMPA = [" ", ".", "·", ":", "-", "=", "+", "*", "#"];
const FONTE_PX = 13;
const PASSO_X = 12;
const PASSO_Y = 18;
const QUADRO_MS = 1000 / 30;
const BALDES = 7;

function rgb(cor: string, padrao: [number, number, number]): [number, number, number] {
  const m = cor.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return padrao;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function OndaAscii({ className = "" }: { className?: string }) {
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = tela.current;
    const ctx = canvas?.getContext("2d");
    const area = canvas?.parentElement;
    if (!canvas || !ctx || !area) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const estilo = getComputedStyle(canvas);
    const tinta = rgb(estilo.getPropertyValue("--ink"), [238, 235, 231]);
    const laranja = rgb(estilo.getPropertyValue("--orange-bright"), [255, 94, 0]);
    const familia = estilo.fontFamily || "monospace";

    let largura = 0;
    let altura = 0;
    let colunas = 0;
    let linhas = 0;
    let visivel = false;
    let quadro = 0;
    let ultimo = 0;
    let t = 0;
    const mouse = { x: -9999, y: -9999, forca: 0 };

    // Um balde por faixa de opacidade (tinta) e outro conjunto para as cristas (laranja).
    const baldes_tinta: number[][] = Array.from({ length: BALDES }, () => []);
    const baldes_crista: number[][] = Array.from({ length: BALDES }, () => []);

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `400 ${FONTE_PX}px ${familia}`;
      ctx.textBaseline = "top";
      colunas = Math.ceil(largura / PASSO_X) + 1;
      linhas = Math.ceil(altura / PASSO_Y) + 1;
    };

    // Progresso da transição: 0 quando a área começa a entrar por baixo, 1 quando chega ao topo.
    const progresso = () => {
      if (reduzido) return 1;
      const r = area.getBoundingClientRect();
      return Math.min(Math.max(1 - r.top / window.innerHeight, 0), 1);
    };

    const desenhar = () => {
      const p = progresso();
      for (const b of baldes_tinta) b.length = 0;
      for (const b of baldes_crista) b.length = 0;

      const sobe = 1 - p * p * (3 - 2 * p); // ease da frente da onda
      for (let i = 0; i < colunas; i++) {
        const x = i * 0.11;
        const frente = altura * (-0.2 + 1.2 * sobe) + Math.sin(i * 0.12 + t * 0.9) * 22 + Math.sin(i * 0.05 - t * 0.4) * 30;
        for (let j = 0; j < linhas; j++) {
          const py = j * PASSO_Y;
          if (py < frente) continue;
          const y = j * 0.2;
          const px = i * PASSO_X;

          // Campo de fluxo: duas ondas que se dobram uma sobre a outra.
          const w1 = Math.sin(x * 0.9 + t * 0.55 + Math.sin(y * 0.7 + t * 0.25) * 1.6);
          const w2 = Math.sin(x * 0.35 - y * 0.6 + t * 0.35);
          const d = (w1 * 0.62 + w2 * 0.38 + 1) / 2;
          const nivel = (d * 4.5) % 1;
          let k = Math.pow(1 - Math.abs(nivel - 0.5) * 2, 3);

          // Ondulação do cursor.
          if (mouse.forca > 0.01) {
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 260) k += mouse.forca * Math.exp(-(dist * dist) / 9000) * (0.55 + 0.45 * Math.sin(dist * 0.09 - t * 5));
          }

          // Perto da frente, a crista fica mais densa.
          const perto = 1 - Math.min((py - frente) / 70, 1);
          k = Math.min(k + perto * 0.55, 1);
          if (k < 0.14) continue;

          const indice = i * 4096 + j;
          const balde = Math.min(BALDES - 1, Math.floor(k * BALDES));
          if (perto > 0.45 || (k > 0.985 && (i + j) % 7 === 0)) baldes_crista[balde].push(indice);
          else baldes_tinta[balde].push(indice);
        }
      }

      ctx.clearRect(0, 0, largura, altura);
      const pintar = (baldes: number[][], cor: [number, number, number], base: number, ganho: number) => {
        baldes.forEach((lista, b) => {
          if (lista.length === 0) return;
          const k = (b + 0.5) / BALDES;
          ctx.fillStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${(base + k * ganho).toFixed(3)})`;
          const ch = RAMPA[Math.min(RAMPA.length - 1, 1 + Math.floor(k * (RAMPA.length - 1)))];
          for (const indice of lista) {
            const i = Math.floor(indice / 4096);
            const j = indice % 4096;
            ctx.fillText(ch, i * PASSO_X, j * PASSO_Y);
          }
        });
      };
      pintar(baldes_tinta, tinta, 0.035, 0.24);
      pintar(baldes_crista, laranja, 0.18, 0.55);
    };

    const laco = (agora: number) => {
      quadro = requestAnimationFrame(laco);
      if (!visivel || document.hidden) return;
      if (agora - ultimo < QUADRO_MS) return;
      t += Math.min(agora - ultimo, 100) / 1000;
      ultimo = agora;
      mouse.forca *= 0.96;
      desenhar();
    };

    const ao_mover = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.forca = 1;
    };

    const obs_tamanho = new ResizeObserver(() => {
      medir();
      desenhar();
    });
    const obs_tela = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
    });

    let ativo = true;
    document.fonts.ready.then(() => {
      if (!ativo) return;
      medir();
      desenhar();
      obs_tamanho.observe(canvas);
      if (reduzido) return;
      obs_tela.observe(area);
      if (fino) window.addEventListener("pointermove", ao_mover, { passive: true });
      quadro = requestAnimationFrame(laco);
    });

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      obs_tamanho.disconnect();
      obs_tela.disconnect();
      window.removeEventListener("pointermove", ao_mover);
    };
  }, []);

  return <canvas ref={tela} className={className} aria-hidden="true" />;
}
