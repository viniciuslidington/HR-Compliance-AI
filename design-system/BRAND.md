# Tako

Design tokens capturados do site tako.ai/pt (07/11/2026), a partir dos estilos computados e das variáveis CSS da página. Servem de base para estilizar um projeto novo na mesma linguagem visual.

## Linguagem visual

Editorial e quente. Títulos serifados grandes com tracking negativo, corpo em sans **light (300)**, muito respiro, e uma única cor de marca — um laranja vivo — usada com parcimônia.

- **Duas superfícies alternadas.** Seções creme (`surface` #eeebe7) e grafite (`surface` #0d0d0d no tema escuro). Uma página típica alterna: hero creme → faixa escura de logos → creme → escuro… Use os dois temas deste sistema como "tipos de seção", não como modo claro/escuro do usuário.
- **Laranja é sinal, não fundo.** `orange` (#ff4802) e `orange-bright` (#ff5e00) aparecem em pontos de 4–6px, linhas de progresso de 2px, botão de envio circular e no brilho do gradiente do hero. A única área grande laranja é a barra de anúncio (`orange-dark` #e13e00).
- **Bordas, não sombras.** Cards usam hairline `line` (10% de opacidade). Sombras pesadas só existem sob mockups escuros de produto (`shadow-window`, `shadow-hero`).
- **Tudo é pill.** Botões, toggles e badges usam `radius-pill`. Cards usam `radius-xl` (14px).

## Tipografia

- `display` — **PP Eiko** (Pangram Pangram, fonte comercial; o site a hospeda como "ppEiko"). Peso 500, tracking negativo ≈ −0.025em (hero 56px/−1.4px; h2 36px/−0.9px). Sem licença, use **Instrument Serif** (Google Fonts) como substituto próximo.
- `sans` — **Plus Jakarta Sans** (Google Fonts). Corpo em 300; rótulos, botões e eyebrows em 500.
- Eyebrows: 12px, 500, UPPERCASE, +0.3px, em `orange-deep` sobre creme ou `orange-dark` sobre grafite.
- Números de destaque: 40px, 300, −1px, em `orange-text`.

O site também declara Satoshi, mas não a usa na página.

## Componentes observados

- **CTA principal**: pill, 48px de altura, padding 0 32px, fundo `ink`, texto branco 14px/500.
- **CTA WhatsApp**: pill, mesma altura, fundo transparente, borda 1.5px `whatsapp`, ícone verde.
- **Botões do header**: pill 32px, padding 0 12px, borda 0.5px `ink`, texto 12px/300.
- **Toggle Humano/Máquina**: trilho pill com borda `line`, segmento ativo preenchido.
- **Barra de anúncio**: 36px, fundo `orange-dark`, texto ink 12px com seta →.
- **Janela de produto**: fundo `surface-deep`, `radius-2xl`, borda `line`, `shadow-window`; texto interno em `zinc-400`.

## Acessibilidade

- `orange` / `orange-bright` sobre creme dá ~3:1 — só para elementos gráficos e texto ≥24px. Para texto pequeno use `orange-deep` (5.6:1).
- `orange-dark` como eyebrow sobre grafite fica em ~4.4:1: um pouco abaixo de AA para 12px. O site faz assim; se precisar de AA estrito, clareie para `orange-bright`.
- `ink-subtle` (55%) é o mínimo para texto legível; `ink-faint` só para placeholders.

## Layout

Container de 1152px, texto até 576px, seções com 96px de padding vertical (64px nas compactas), grid de 4px.

## Uso em código

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Instrument+Serif&display=swap');
:root { --surface:#eeebe7; --ink:#0d0d0d; --orange:#ff4802; --radius-pill:9999px; }
.section-dark { --surface:#0d0d0d; --ink:#eeebe7; }
```

Logo não foi copiado: o wordmark "tako" é da marca Tako. Num projeto próprio, use texto ou o seu logo.
