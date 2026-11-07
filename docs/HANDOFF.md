# Handoff · HR-Compliance-AI (hackathon Hacka-converge)

Estado em 07/11/2026. Para quem continuar: leia este arquivo, depois [mvp-documental.md](designs/mvp-documental.md)
(o plano vigente) e [worker/README.md](../worker/README.md).

## O produto, em uma frase

Em construção e energia, um documento vencido tira a pessoa de campo (sem NR-35 em dia, ninguém sobe em altura).
O agente pede, lê, confere, recusa com motivo, cobra a renovação e, se a pessoa não renovar, abre um card P0 de
impedimento para o DP. Slide: "O sistema avisa que vai vencer. Ninguém renova. A gente renova."

## Decisões fechadas (não reabrir sem falar com o time)

| Tema | Decisão |
|---|---|
| Setor e documentos | Construção e energia, funcionários próprios. ASO, NR-10, NR-35. Documentos genéricos (RG, CPF, comprovante) fora do MVP |
| Canal | WhatsApp Web **simulado** (sem Meta). Por ora o time pediu um utilitário de terminal para ver os fluxos; front cru ainda não existe |
| Renovação | No MVP: aviso → lembrete → lembrete firme → impedimento (card P0) |
| Papel do LLM | Só transcreve, extrai, redige. Validade, regras, decisão, fila e números são código. Todo campo extraído precisa aparecer na transcrição (guarda de fidelidade) |
| Dado de saúde | ASO vai para o prefixo `sensivel/` do bucket; a transcrição de ASO nunca é gravada nem exibida |
| Do desenho do Marcelo, entra | Escalar na 3ª recusa seguida do mesmo documento; régua com intensidade crescente; tela de escalações; sistema de destino mock |
| Fluxo de git | O usuário quer commit e push **direto na main**, sem PR |

## O que já existe

Tudo em `worker/` (Python 3.12, `uv`). 162 testes, incluindo testes com inferência real que só rodam com chave.

| Peça | Arquivo | Estado |
|---|---|---|
| Leitura em dois passos (visão transcreve, texto extrai) + conferência + decisão | `ia/documentos.py` | Pronto, validado com inferência real |
| Matriz por cargo | `ia/matriz.py`, `contracts/matrizes/*.yaml` | Pronto (periodicidades são referência; validar com SESMT) |
| Régua de renovação | `ia/regua.py` | Pronto |
| Orquestrador (etapas observáveis, escala na 3ª recusa, card P0 no impedimento) | `ia/orquestrador.py` | Pronto, **mas a API ainda não usa** |
| Fila (P0–P2, menor carga + round robin, SLA 2h) e card de decisão | `ia/fila.py`, `ia/card.py` | Pronto; fila e mensagens ficam em memória no orquestrador |
| Bucket por hash + banco SQLite (anexos, lembretes, falhas seguidas) | `infra/anexos.py` | Pronto |
| API FastAPI (saúde, pessoas, matriz, upload, aprovação; token nas escritas) | `api.py` | No ar no Render |
| Utilitário de fluxos no terminal | `scripts/fluxos.py` | Pronto: `admissao`, `renovacao`, `escalacao`, `todos` |
| Camada de ponto (pivô anterior) | `ia/interpretacao.py`, `ia/autonomia.py`, `scripts/rodar_agentes.py` | Congelada; não usar no MVP |

### Rodar

```bash
cd worker && uv sync && uv run pytest
uv run python scripts/fluxos.py admissao        # de dentro de worker/
uv run --project worker python worker/scripts/fluxos.py renovacao   # da raiz do repo
```

Chave em `worker/.env` (fora do git; modelo em `worker/.env.example`). Nunca pedir nem colar a chave no chat.

### Deploy

- Render, Blueprint `render.yaml` na raiz (validado contra o schema oficial), serviço `hr-compliance-worker`,
  disco persistente em `/var/data`, plano Starter.
- URL: https://hr-compliance-worker.onrender.com (`/saude`, `/docs` para o Swagger).
- Variáveis: `FEATHERLESS_API_KEY` (segredo), `API_TOKEN` (já rotacionado uma vez), `FEATHERLESS_MODEL` e
  `FEATHERLESS_VISION_MODEL` = `deepseek-ai/DeepSeek-V4.1-Flash-1017`, `HOJE=2026-11-07`, `DADOS_DIR=/var/data`.
- Push na main dispara deploy automático; cada deploy derruba o serviço por alguns segundos (instância única com disco).

## Próximos passos, em ordem

1. **Ligar a API ao orquestrador.** Hoje `POST /pessoas/{id}/documentos` usa `processar_documento` direto; trocar por
   `AgenteDocumental.receber_documento`, devolvendo as etapas. Persistir fila, cards e mensagens no SQLite (hoje em
   memória). Criar `POST /regua/rodar?dia=AAAA-MM-DD` (dia simulado) e `GET /fila`, `GET /pessoas/{id}/mensagens`.
2. **Front cru servido pela própria API** (sem framework, tokens de `design-system/` conforme CLAUDE.md): pessoas e
   matriz com cores; envio de documento com a linha do tempo de etapas; mensagens ao colaborador; fila do DP com
   cards e aprovação; controle de dia simulado com botão "rodar régua".
3. **Sistema de destino mock**: endpoint que recebe a admissão concluída no formato do evento S-2200 do eSocial.
4. **Autonomia conquistada para documentos**: ligar `ia/estrategico.py` ao histórico de aceites por emissor e
   alimentar `EMISSORES_AUTONOMOS` (hoje só por variável de ambiente).
5. Pitch: ensaiar com os três fluxos; aquecer o modelo antes de subir ao palco.

## Armadilhas já pagas

- **Qwen3-VL-32B no Featherless descarta a imagem** (~59 tokens de entrada) e devolve lixo. DeepSeek-V4.1-Flash lê
  imagem (4/4) e faz chamada de ferramenta com imagem; Qwen3-VL-8B e Qwen2.5-VL-72B também leram certo.
- **Sempre mandar instrução em texto junto com a imagem**; só imagem fez modelos degenerarem.
- **Clientes OpenAI com `max_retries=0`**: o padrão (2) multiplicava esperas e travava o upload no Render.
- **Primeira chamada fria**: ~15 s de transcrição + 15 s de extração; depois ~7 s + 3 s.
- **Modelos Gemma no Featherless são gated** (exigem conectar o Hugging Face na conta).
- **O Render não sobrescreve variável existente** quando o `render.yaml` muda; alterar no painel.
- **Fixtures**: certificados fictícios em `worker/tests/fixtures/`, gerados por `scripts/gerar_*_ficticio.swift`
  (macOS). CNPJ válido de teste: `12.345.678/0001-95` (o `-90` é inválido e a conferência recusa).
- Comandos do worker rodam de dentro de `worker/` ou com `uv run --project worker`.

## Prompt sugerido para o próximo agente

> Leia `docs/HANDOFF.md` do repositório HR-Compliance-AI e siga o passo 1 dos próximos passos: ligar a API ao
> orquestrador e persistir fila, cards e mensagens, com testes primeiro (TDD, como o resto do `worker/`). Rode
> `uv run pytest` em `worker/` antes e depois. Commit e push direto na main ao terminar, sem PR.
