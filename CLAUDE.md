## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Setup requires [bun](https://bun.sh) (`brew install bun` on macOS).

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.
Use `~/.claude/skills/gstack/...` for gstack file paths.

## Design system

Toda UI usa os tokens de `design-system/` (ver `design-system/README.md`). Use as variáveis de
`design-system/tokens.css` em vez de cores, fontes, espaçamentos ou raios fixos no código, e siga as regras de
`design-system/BRAND.md`. Para mudar um token, edite `design-system/tokens.json` e rode
`node design-system/build-tokens.mjs`; nunca edite `tokens.css` à mão.
