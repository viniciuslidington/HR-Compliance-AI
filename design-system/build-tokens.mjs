#!/usr/bin/env node
// Gera design-system/tokens.css a partir de design-system/tokens.json.
// Uso: node design-system/build-tokens.mjs
// tokens.json é a fonte da verdade; não edite tokens.css à mão.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, "tokens.json"), "utf8"));

const [primary, ...others] = tokens.color.themes.map((t) => t.id);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const decl = (name, value) => `  --${name}: ${value};`;

// Cores: valor string vale para todos os temas; objeto tem um valor por tema.
const colorFor = (themeId) =>
  tokens.color.tokens.flatMap(({ name, value }) => {
    if (typeof value === "string") return themeId === primary ? [decl(name, value)] : [];
    // Sem valor para o tema: herda o do tema primário pela cascata do :root.
    return value[themeId] ? [decl(name, value[themeId])] : [];
  });

const listFamily = (family) =>
  (tokens[family]?.tokens ?? []).map(({ name, value }) => decl(name, value));

const fontFamilies = Object.entries(tokens.type.families).map(([k, v]) => decl(`font-${k}`, v));

const typeVars = [];
const typeClasses = [];
for (const group of tokens.type.groups) {
  for (const style of group.styles) {
    const { name, ...props } = style;
    const lines = [`  font-family: var(--font-${group.family});`];
    for (const [prop, value] of Object.entries(props)) {
      const cssProp = kebab(prop);
      const unitless = typeof value === "number" && prop !== "fontWeight" ? `${value}px` : value;
      typeVars.push(decl(`text-${name}-${cssProp}`, unitless));
      lines.push(`  ${cssProp}: var(--text-${name}-${cssProp});`);
    }
    typeClasses.push(`.text-${name} {\n${lines.join("\n")}\n}`);
  }
}

const css = `/* ${tokens.name} — gerado de tokens.json por build-tokens.mjs. Não edite à mão. */
/* Fonte: ${tokens.meta?.source ?? "tokens.json"} */

@import url("${tokens.type.import}");

/* Tema "${primary}" (padrão) + tokens independentes de tema */
:root {
${colorFor(primary).join("\n")}

${fontFamilies.join("\n")}

${typeVars.join("\n")}

${["spacing", "radius", "shadow", "gradient", "motion"].map((f) => listFamily(f).join("\n")).join("\n\n")}
}

${others
  .map(
    (id) => `/* Tema "${id}": aplique em uma seção, não como modo escuro do sistema operacional. */
[data-theme="${id}"],
.section-${id} {
${colorFor(id).join("\n")}
}`,
  )
  .join("\n\n")}

/* Estilos de texto */
${typeClasses.join("\n\n")}
`;

writeFileSync(join(here, "tokens.css"), css);
console.log(`tokens.css gerado (${css.length} bytes)`);
