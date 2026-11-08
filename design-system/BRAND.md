# vinda

Marca própria do agente de admissão (08/11/2026). Substitui a v1, que era uma captura da linguagem visual
da Tako. O guia vivo, com logo, cores, tipos e motion renderizados, está em `/marca` no app web.

> **Admissão que se resolve sozinha.**

## Nome

**vinda**, sempre em minúsculas: a chegada de quem é admitido, de "boas-vindas". O nome fica em um lugar só
(`MARCA` em `web/src/ui/Logo.tsx`); se o nome mudar, mude ali e neste arquivo.

## Símbolo

Um "v" que também é um check: dois traços que convergem num ponto. Ele se lê como a *vinda* do colaborador e
como o documento aprovado.

- O tile é um quadrado com raio de 30% preenchido com `--gradient-brand`. O traço é sempre `--surface-deep`,
  com espessura de 3.4/32 e pontas redondas.
- Tamanhos: 22px (inline), 28px (navegação), 44px e acima (vitrine). Abaixo de 16px, use só o favicon
  (`web/src/app/icon.svg`).
- Wordmark: Funnel Display 600, tracking −0.05em, à direita do tile, com gap de 36% do tile.
- Não faça: mudar a cor do traço, girar o símbolo, pôr o tile sobre outro gradiente ou usar o wordmark em
  maiúsculas.

## Cor

A interface é quase monocromática (papel e tinta). A cor tem dois papéis:

| Papel | Tokens | Onde |
| --- | --- | --- |
| Marca | `--gradient-brand` (lima `#d4f75b` → menta `#5be3a0` → água `#3cc3e6`) | Tile do logo, barras de progresso, `.text-gradient` em títulos grandes, luz `--gradient-aurora` no topo das páginas |
| Resolvido | `--accent` (gráfico), `--accent-ink` (texto), `--accent-tint` (fundo) | Ponto do item ativo, "em coleta", "concluída", eyebrows, foco de inputs |
| Precisa de alguém | `--alert`, `--alert-ink`, `--alert-tint` | Escalações, recusas, erros de campo |

Regras:
- O gradiente nunca vira fundo de texto pequeno nem aparece em mais de dois lugares por tela.
- `--accent` e `--alert` são para gráficos (≥3:1). Para texto, use as versões `-ink` (≈6:1).
- `--ink-subtle` é o mínimo para texto legível; `--ink-faint` serve só para placeholders.
- O tema `dark` (`.section-dark`) é um tipo de seção, como o WhatsApp simulado, e não um modo escuro do
  sistema operacional.

## Tipografia

| Papel | Família | Uso |
| --- | --- | --- |
| Display | **Funnel Display** 500–600, tracking negativo | Títulos, números de destaque (`text-stat`), wordmark |
| Texto | **Funnel Sans** 400/500 | Corpo, rótulos, botões |
| Técnico | **Geist Mono** 400/500, tabular | Eyebrows, cabeçalhos de tabela, CPFs, prazos e contagens (`text-data`) |

Funnel tem terminais cortados e um desenho geométrico próprio, longe das grotescas genéricas (Inter,
Plus Jakarta) que fazem uma interface parecer gerada. O corpo usa peso 400, e não 300: texto light em tela
parece frágil. Eyebrows são em mono e em caixa normal, com um quadradinho de gradiente; nada de rótulos em
CAIXA ALTA espaçada.

No Next, as fontes vêm de `next/font` (`web/src/app/layout.tsx`) e preenchem `--font-funnel-*` e
`--font-geist-mono`. Páginas estáticas (`worker/static`) usam o `@import` do Google Fonts que está no topo
do `tokens.css`.

## Espaço e forma

- Container de 1120px, texto até 560px, grid de 4px. O topo da página tem 64px; entre blocos, 48px.
- Raios: inputs com 12, cards com 16, janelas com 24, botões e badges em pill.
- Bordas hairline (`--line`) mais `--shadow-xs`; `--shadow-card` só no hover de algo clicável, e
  `--shadow-glow` só sob o botão primário e o logo.

## Movimento

- Curva padrão `--ease-out`; `--ease-spring` só para pontos e ícones pequenos.
- Durações: 140ms para cor, 260ms para transforms, 560ms para entradas.
- Anime só `transform` e `opacity`, tudo dentro de `@media (prefers-reduced-motion: no-preference)`.
- O que existe hoje: entrada em cascata dos blocos da página, linhas de tabela em stagger, pulso do
  "Agente ativo", respiração do ponto "em coleta", traço do check do logo, brilho no hover do logo, fio de
  gradiente e glow no botão primário, e a barra de progresso com o gradiente.
- O movimento confirma algo (chegou, está vivo, foi aprovado). Ele não decora.

## Voz

Fala como um colega do RH: o fato primeiro, o próximo passo depois. Sem emoji, sem a palavra "IA" no texto
para o colaborador e sem jargão de sistema ("processo concluído com sucesso").
