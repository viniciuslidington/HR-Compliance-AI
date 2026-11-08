"use client";

import { useEffect, useRef } from "react";

/*
 * Hero em ASCII a partir de uma foto (Marco Zero, Recife). A foto é reduzida a uma grade de células;
 * o brilho de cada célula escolhe o caractere e as luzes quentes acendem em laranja. Um campo de
 * fluxo desloca a amostragem (o chão "escorre" como reflexo molhado, os prédios só respiram), o
 * cursor abre uma ondulação e, ao rolar, a cidade se desfaz. Na entrada, os caracteres se assentam
 * de baixo para cima. Pausa fora da tela; com movimento reduzido, desenha um quadro só.
 */

const RAMPA = [" ", ".", "·", ":", "-", "=", "+", "*", "%", "#", "@"];
const QUADRO_MS = 1000 / 30;
const BALDES = 8;

function rgb(cor: string, padrao: [number, number, number]): [number, number, number] {
  const m = cor.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return padrao;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Ruído determinístico por célula, para o desfazer no scroll e a entrada não piscarem. */
function hash(i: number, j: number): number {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface CidadeAsciiProps {
  src: string;
  className?: string;
  /** Ponto de foco da foto no recorte (0–1). O padrão segura a base dos prédios. */
  foco_y?: number;
}

export function CidadeAscii({ src, className = "", foco_y = 0.62 }: CidadeAsciiProps) {
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = tela.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const estilo = getComputedStyle(canvas);
    const tinta = rgb(estilo.getPropertyValue("--ink"), [238, 235, 231]);
    const laranja = rgb(estilo.getPropertyValue("--orange-bright"), [255, 94, 0]);
    const familia = estilo.fontFamily || "monospace";

    const foto = new Image();
    foto.decoding = "async";
    foto.src = src;

    const amostra = document.createElement("canvas");
    const actx = amostra.getContext("2d", { willReadFrequently: true });

    let largura = 0;
    let altura = 0;
    let colunas = 0;
    let linhas = 0;
    let passo_x = 9;
    let passo_y = 14;
    let lum = new Float32Array(0);
    let quente = new Float32Array(0);
    let visivel = true;
    let quadro = 0;
    let ultimo = 0;
    let t = 0;
    let inicio = 0;
    const mouse = { x: -9999, y: -9999, forca: 0 };
    const baldes_tinta: number[][] = Array.from({ length: BALDES }, () => []);
    const baldes_luz: number[][] = Array.from({ length: BALDES }, () => []);

    // Reamostra a foto na grade atual, recortando como object-fit: cover.
    const medir = () => {
      if (!actx || !foto.naturalWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fonte = largura < 700 ? 9 : 11;
      passo_x = Math.round(fonte * 0.78);
      passo_y = Math.round(fonte * 1.25);
      ctx.font = `500 ${fonte}px ${familia}`;
      ctx.textBaseline = "top";
      colunas = Math.ceil(largura / passo_x);
      linhas = Math.ceil(altura / passo_y);

      // Cover: a foto preenche a grade (no espaço de pixels da tela) e é cortada nas sobras.
      const escala = Math.max(largura / foto.naturalWidth, altura / foto.naturalHeight);
      const vis_w = largura / escala;
      const vis_h = altura / escala;
      const sx = (foto.naturalWidth - vis_w) / 2;
      const sy = Math.min(Math.max((foto.naturalHeight - vis_h) * foco_y, 0), foto.naturalHeight - vis_h);
      amostra.width = colunas;
      amostra.height = linhas;
      actx.drawImage(foto, sx, sy, vis_w, vis_h, 0, 0, colunas, linhas);
      const px = actx.getImageData(0, 0, colunas, linhas).data;

      lum = new Float32Array(colunas * linhas);
      quente = new Float32Array(colunas * linhas);
      for (let k = 0; k < colunas * linhas; k++) {
        const r = px[k * 4] / 255;
        const g = px[k * 4 + 1] / 255;
        const b = px[k * 4 + 2] / 255;
        // Curva de contraste: o céu afunda no preto e as luzes ganham presença.
        const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        lum[k] = Math.min(Math.pow(l, 1.1) * 1.45, 1);
        quente[k] = r - b;
      }
    };

    const rolagem = () => (reduzido ? 0 : Math.min(window.scrollY / window.innerHeight, 1));

    const desenhar = () => {
      if (!lum.length) return;
      for (const b of baldes_tinta) b.length = 0;
      for (const b of baldes_luz) b.length = 0;
      const desfaz = rolagem();
      const entrada = reduzido ? 1 : Math.min((performance.now() - inicio) / 1600, 1);
      const chao = linhas * 0.8; // abaixo disso é o piso molhado da praça

      for (let j = 0; j < linhas; j++) {
        // Entrada: as linhas se assentam de baixo para cima.
        const assentou = entrada * 1.4 - (1 - j / linhas) * 0.4;
        const molhado = j > chao ? (j - chao) / (linhas - chao) : 0;
        for (let i = 0; i < colunas; i++) {
          const h = hash(i, j);
          if (h < desfaz * 1.15 - 0.1) continue; // a cidade se desfaz ao rolar
          if (h > assentou) continue;

          // Fluxo: o piso escorre como reflexo; o resto só respira.
          const amp = 0.35 + molhado * 2.6 + desfaz * 3;
          const di = Math.round(Math.sin(j * 0.23 + t * 0.9 + i * 0.015) * amp);
          const dj = Math.round(Math.sin(i * 0.05 - t * 0.6) * (0.2 + desfaz * 2));
          let si = i + di;
          let sj = j + dj;
          if (si < 0) si = 0;
          else if (si >= colunas) si = colunas - 1;
          if (sj < 0) sj = 0;
          else if (sj >= linhas) sj = linhas - 1;
          const k = sj * colunas + si;

          // Luz que varre a cena devagar, em diagonal.
          const varre = 0.88 + 0.12 * Math.sin(i * 0.045 + j * 0.03 - t * 0.8);
          let v = lum[k] * varre;

          if (mouse.forca > 0.01) {
            const dx = i * passo_x - mouse.x;
            const dy = j * passo_y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 52000) {
              const dist = Math.sqrt(d2);
              v += mouse.forca * Math.exp(-d2 / 14000) * 0.35 * (0.5 + 0.5 * Math.sin(dist * 0.11 - t * 6));
            }
          }
          if (v < 0.07) continue;
          v = Math.min(v, 1);

          const balde = Math.min(BALDES - 1, Math.floor(v * BALDES));
          const indice = i * 8192 + j;
          if (v > 0.72 && quente[k] > 0.22) baldes_luz[balde].push(indice);
          else baldes_tinta[balde].push(indice);
        }
      }

      ctx.clearRect(0, 0, largura, altura);
      const pintar = (baldes: number[][], cor: [number, number, number], base: number, ganho: number) => {
        baldes.forEach((lista, b) => {
          if (!lista.length) return;
          const v = (b + 0.5) / BALDES;
          ctx.fillStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${(base + v * ganho).toFixed(3)})`;
          const ch = RAMPA[Math.min(RAMPA.length - 1, 1 + Math.floor(v * (RAMPA.length - 1)))];
          for (const indice of lista) {
            ctx.fillText(ch, Math.floor(indice / 8192) * passo_x, (indice % 8192) * passo_y);
          }
        });
      };
      pintar(baldes_tinta, tinta, 0.08, 0.62);
      pintar(baldes_luz, laranja, 0.4, 0.55);
    };

    const laco = (agora: number) => {
      quadro = requestAnimationFrame(laco);
      if (!visivel || document.hidden) return;
      if (agora - ultimo < QUADRO_MS) return;
      t += Math.min(agora - ultimo, 100) / 1000;
      ultimo = agora;
      mouse.forca *= 0.95;
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
    Promise.all([foto.decode().catch(() => undefined), document.fonts.ready]).then(() => {
      if (!ativo || !foto.naturalWidth) return;
      inicio = performance.now();
      medir();
      desenhar();
      obs_tamanho.observe(canvas);
      if (reduzido) return;
      obs_tela.observe(canvas);
      if (fino) window.addEventListener("pointermove", ao_mover, { passive: true });
      ultimo = performance.now();
      quadro = requestAnimationFrame(laco);
    });

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      obs_tamanho.disconnect();
      obs_tela.disconnect();
      window.removeEventListener("pointermove", ao_mover);
    };
  }, [src, foco_y]);

  return <canvas ref={tela} className={className} aria-hidden="true" />;
}
