# Design system

Os design tokens da marca **vinda** (o agente de admissão). O guia visual está em [BRAND.md](BRAND.md), e a
versão renderizada fica em `/marca` no app web.

| Arquivo | O que é |
| --- | --- |
| [tokens.json](tokens.json) | **Fonte da verdade.** Cores (2 temas), tipografia, espaçamento, raios e sombras. Cada token tem uma nota de uso. |
| [tokens.css](tokens.css) | Variáveis CSS e classes `.text-*`, **geradas** a partir do `tokens.json`. Não edite à mão. |
| [build-tokens.mjs](build-tokens.mjs) | O script que gera o `tokens.css`. |
| [BRAND.md](BRAND.md) | O guia visual: linguagem, tipografia, componentes e regras de acessibilidade. |

## Como usar

Importe o CSS uma vez, na raiz da aplicação:

```css
@import "./design-system/tokens.css";

body {
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-sans);
  font-weight: 400;
}
```

Os dois temas funcionam como **tipos de seção**, e não como modo claro/escuro do usuário. O papel é o
padrão; para uma seção grafite, use a classe `.section-dark` ou o atributo `data-theme="dark"`:

```html
<section class="section-dark" style="background: var(--surface); color: var(--ink)">
  <p class="text-eyebrow" style="color: var(--accent-ink)">Conformidade</p>
  <h2 class="text-display-h2">Auditoria contínua</h2>
</section>
```

As principais regras (os detalhes estão no [BRAND.md](BRAND.md)):
- O gradiente da marca (`--gradient-brand`) aparece em poucos lugares: o logo, o progresso e a luz do topo.
- Para texto, use `--accent-ink` (resolvido) e `--alert-ink` (precisa de alguém), nunca `--accent` ou
  `--alert`, que são para gráficos.
- Bordas `--line` com `--shadow-xs`. Os botões levam `--radius-pill`; os cards, `--radius-xl`.
- Animações usam `--ease-out` e as `--duration-*`, sempre dentro de `prefers-reduced-motion: no-preference`.

## Mudar um token

1. Edite o `tokens.json`. Mantenha o formato `{ "name", "value", "usage" }`; nas cores, `value` pode ser uma
   string (vale para todos os temas) ou `{ "light", "dark" }`.
2. Gere o CSS de novo:

   ```bash
   node design-system/build-tokens.mjs
   ```

3. Faça commit dos dois arquivos juntos.

O artifact e este repositório **não se sincronizam sozinhos**. Se os tokens mudarem no artifact, copie o
novo `tokens.json` para cá e rode o script.

## Pontos de atenção

- As fontes (Funnel Display, Funnel Sans e Geist Mono) são livres (OFL). O Next as hospeda com `next/font`,
  e o `@import` do topo do `tokens.css` serve só páginas fora do Next, como `worker/static`.
- O logo é um componente (`web/src/ui/Logo.tsx`); o favicon fica em `web/src/app/icon.svg`.
- Renomeado na v2: `--orange*` virou `--accent*` e `--alert*`, e `--surface-sand` virou `--surface-sunken`.
