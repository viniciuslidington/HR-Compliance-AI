# vinda

A vinda é um protótipo de agente de admissão para equipes de RH e departamento pessoal, desenvolvido para o Hacka-converge. O sistema acompanha a entrega de documentos, identifica pendências e ajuda a equipe a tratar recusas e escalações.

O painel de RH e o WhatsApp simulado compartilham o estado da admissão. A IA pode ler imagens e orientar a conversa; as regras de validação e as decisões sobre documentos são executadas pelo sistema. O canal de WhatsApp é uma simulação, sem integração com a plataforma real.

## Conheça o projeto

- **Painel de RH** (`/rh`): criação e acompanhamento de admissões.
- **WhatsApp simulado** (`/whatsapp`): conversa e envio de documentos pelo colaborador.
- **Escalações** (`/rh/escalacoes`): pendências encaminhadas para a equipe.
- **Catálogo** (`/rh/catalogo`): configuração dos documentos e modelos disponíveis.
- **Worker**: API em Python para leitura de documentos, conversa e persistência quando configurada.

## Executar localmente

### Interface com dados simulados

É necessário ter Node.js 22 e npm instalados:

```bash
cd web
npm ci
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Sem configurar o worker, o servidor usa estado em memória e leitura simulada. Os dados em memória não sobrevivem à reinicialização do servidor.

Para experimentar, crie uma admissão em `/rh` e abra `/whatsapp` em outra aba. Imagens fictícias para a demonstração estão em `web/public/demo/`. O [roteiro completo](docs/HANDOFF.md#roteiro-e2e-da-demo) inclui exemplos de documentos aceitos e recusados.

### Worker e leitura com IA

Para executar o worker, instale Python 3.12 ou superior e [uv](https://docs.astral.sh/uv/). Em outro terminal:

```bash
cd worker
uv sync
cp .env.example .env
```

Preencha `FEATHERLESS_API_KEY` em `worker/.env` e, se necessário, ajuste os modelos de texto e visão. Depois inicie a API:

```bash
uv run uvicorn api:app_do_ambiente --factory --reload
```

A documentação interativa da API fica em [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). Para conectar a interface ao worker local, inicie o Next em outro terminal:

```bash
cd web
WORKER_URL=http://127.0.0.1:8000 npm run dev
```

Se `API_TOKEN` estiver definido no worker, informe o mesmo valor como `WORKER_TOKEN` ao iniciar a interface. A chave da Featherless e os tokens devem permanecer fora do repositório.

Com o worker configurado, `LEITOR=mock` mantém a leitura de anexos simulada; `NEXT_PUBLIC_API_MODO=mock` usa o modo de desenvolvimento com dados no navegador. Mais detalhes sobre configuração, endpoints e fluxos estão no [README do worker](worker/README.md).

## Testes e verificações

```bash
# Interface
cd web
npm test
npm run lint
npm run build
```

```bash
# Worker, em outro terminal ou a partir da raiz
cd worker
uv run pytest
```

Os testes de inferência real dependem de `FEATHERLESS_API_KEY`; sem a chave, são ignorados. Para ver os fluxos do agente no terminal com inferência real, execute `uv run python scripts/fluxos.py todos` dentro de `worker/`.

## Estrutura

- `web/` — aplicação Next.js, painel, simulador e regras da admissão.
- `worker/` — API FastAPI, agentes, leitura de documentos e testes.
- `contracts/` — matrizes de exigências por cargo e dados de exemplo.
- `design-system/` — tokens e guia visual da marca.
- `docs/` — documentação de produto, arquitetura e demonstração.
- `render.yaml` — configuração dos serviços para deploy no Render.

Para alterar tokens visuais, edite `design-system/tokens.json` e execute `node design-system/build-tokens.mjs` a partir da raiz. Consulte o [design system](design-system/README.md) e o [contrato entre frontend e IA](docs/designs/contrato-frontend-ia.md) para mais detalhes.
