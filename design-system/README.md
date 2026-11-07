# Design system

Os design tokens da interface do HR-Compliance-AI. Eles vêm do artifact
[Tako](https://claude.ai/artifact/JtXM5615xQnir9ge51zPMK) (em 07/11/2026), que capturou
a linguagem visual de tako.ai/pt.

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
  font-weight: 300;
}
```

Os dois temas funcionam como **tipos de seção**, e não como modo claro/escuro do usuário. O creme é o
padrão; para uma seção grafite, use a classe `.section-dark` ou o atributo `data-theme="dark"`:

```html
<section class="section-dark" style="background: var(--surface); color: var(--ink)">
  <p class="text-eyebrow" style="color: var(--orange-dark)">Conformidade</p>
  <h2 class="text-display-h2">Auditoria contínua</h2>
</section>
```

As principais regras (os detalhes estão no [BRAND.md](BRAND.md)):
- O laranja é para sinais (pontos, linhas, ícones), não para fundos. Em texto pequeno sobre creme,
  use `--orange-deep`.
- Use bordas `--line` em vez de sombras. Os botões levam `--radius-pill`; os cards, `--radius-xl`.
- `--ink-subtle` é o mínimo para texto legível; `--ink-faint` serve apenas para placeholders.

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

- **PP Eiko** é uma fonte comercial (Pangram Pangram). Sem licença, a pilha de fontes cai para
  **Instrument Serif**, que o `tokens.css` já carrega do Google Fonts junto com a Plus Jakarta Sans.
- O logo da Tako não foi copiado. Use o nome do produto em texto ou um logo próprio.
