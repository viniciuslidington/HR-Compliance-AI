# vinda

Marca própria do agente de admissão (08/11/2026). Substitui a v1, que era uma captura da linguagem visual
da Tako. O guia vivo, com logo, cores, tipos e motion renderizados, está em `/marca` no app web.

> **Admissão que se resolve sozinha.**

## Nome

**vinda**, sempre em minúsculas: a chegada de quem é admitido, de "boas-vindas". O nome fica em um lugar só
(`MARCA` em `web/src/ui/Logo.tsx`); se o nome mudar, mude ali e neste arquivo.

## Símbolo

Um **v em duas faixas dobradas**, separado por um intervalo diagonal. O conceito é passagem:
a responsabilidade segue de uma etapa para a próxima, com continuidade e acompanhamento.
A assimetria entre as faixas cria uma silhueta própria, sem usar um check de aprovação.

- Símbolo sem moldura na interface; cor `--ink`, adaptada ao fundo.
- Sobre grafite, variante de marca em âmbar → laranja. A cor não é necessária para reconhecer a forma.
- Tamanhos: 24px (inline), 32px (navegação), 48px e 96px (vitrine).
- Favicon: silhueta simplificada dentro de fundo grafite, com margem óptica.
- Wordmark: Funnel Display 600, tracking −0.055em, gap de 26% do símbolo.
- Movimento: elevação de uma faixa em 1 unidade somente no hover; sem loops, pulso ou brilho do logo.
- Arquivo vetorial independente: `web/public/brand/vinda-simbolo.svg`.
- Não girar as faixas, fechar o intervalo, trocar as proporções ou confundir o símbolo com status de aceite.

## Cor

A paleta segue o pitch do Hackathon Tako: **creme** `#eeebe7`, **grafite** `#0d0d0d` e **laranja**.
O laranja é um sinal, não um fundo.

| Papel | Tokens | Onde |
| --- | --- | --- |
| Marca | `--orange` `#ff4802`, `--orange-bright` `#ff5e00`, `--gradient-brand` (âmbar `#ffb066` → `#ff5e00` → `#e13e00`) | Símbolo sobre grafite, progresso, `.text-gradient` em títulos grandes, glow `--gradient-aurora` no canto superior (o mesmo radial dos slides) |
| Em andamento | `--accent` (gráfico), `--accent-ink` (texto), `--accent-tint` (fundo) | Item ativo, "em coleta", eyebrows, foco de inputs |
| Precisa de alguém | `--alert`, `--alert-ink`, `--alert-tint` | Escalações, recusas, erros de campo. Diferencia-se do "em coleta" pelo fundo preenchido |
| Concluído | `--success`, `--success-ink`, `--success-tint` | Concluída, aprovado. O único verde da interface |

Regras:
- Em texto pequeno sobre creme, use `--orange-deep` (`#b33100`, 5.6:1); `--orange` e `--orange-bright`
  dão ~3:1 e servem só para gráficos e texto ≥24px. Sobre grafite, `--orange-bright` passa como texto (6.4:1).
- O gradiente nunca vira fundo de texto pequeno nem aparece em mais de dois lugares por tela.
- `--ink-subtle` é o mínimo para texto legível; `--ink-faint` serve só para placeholders.
- O tema `dark` (`.section-dark`) é um tipo de seção, como o WhatsApp simulado e a landing, e não um modo
  escuro do sistema operacional.

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
  `--shadow-glow` só sob o botão primário.

## Movimento

- Curva padrão `--ease-out`; `--ease-spring` só para pontos e ícones pequenos.
- Durações: 140ms para cor, 260ms para transforms, 560ms para entradas.
- Anime só `transform` e `opacity`, tudo dentro de `@media (prefers-reduced-motion: no-preference)`.
- O que existe hoje: entrada em cascata dos blocos da página, linhas de tabela em stagger, pulso do
  "Agente ativo", respiração do ponto "em coleta", deslocamento pontual da faixa no hover do logo, fio de
  gradiente e glow no botão primário, e a barra de progresso com o gradiente.
- O movimento confirma algo (chegou, está vivo, foi aprovado). Ele não decora.

## Voz

Fala como um colega do RH: o fato primeiro, o próximo passo depois. Sem emoji, sem a palavra "IA" no texto
para o colaborador e sem jargão de sistema ("processo concluído com sucesso").
