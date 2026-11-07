# worker · camada de IA

Camada de IA dos agentes de DP, conforme o [plano final](../docs/designs/plano-final-agentes-dp.md).
O LLM aparece só onde há texto livre ou redação. Tudo o que muda registro, decide permissão ou gera
número é código determinístico.

## Rodar

```bash
cd worker
uv sync
uv run pytest
```

Inferência real: copie `.env.example` para `.env` (fora do git) e preencha `FEATHERLESS_API_KEY` e,
se quiser, `FEATHERLESS_MODEL` (padrão `Qwen/Qwen3-32B`). Depois:

```bash
uv run python scripts/rodar_agentes.py   # roda as histórias da demo no Featherless e confere cada decisão
```

Validado em 24/11 (simulado) com `deepseek-ai/DeepSeek-V4.1-Flash-1017`: 9 chamadas, todas com chamada de
ferramenta nativa, de 1,3 a 5,4 s cada.

## Módulos (`ia/`)

| Módulo | O que faz | LLM? |
|---|---|---|
| `llm.py` | Cliente Featherless (API OpenAI), ferramenta forçada, parser de chamada devolvida como texto, remoção de `<think>`, trace por chamada. `estruturar()` só aceita saída que valida no modelo Pydantic | sim |
| `conteudo.py` | Marca texto de participante como não confiável e neutraliza marcadores forjados | não |
| `interpretacao.py` | Classifica a resposta do funcionário. O código decide: data errada ou horário incoerente pedem esclarecimento; discordância, tema sensível e trecho sem âncora no texto escalam | sim |
| `playbook.py` | Schema C4, catálogo fechado de ações, teto de política e validação (ação fora do catálogo, autonomia acima do teto, autoaplicação sem contestação, gatilho sobreposto) | não |
| `autonomia.py` | Autoaplicação pelo playbook ativo, limitada pelo art. 58 §1º da CLT (até 5 min por marcação e 10 min por dia) | não |
| `proximo_passo.py` | O LLM propõe a próxima ação; o backend aceita só as permitidas pelo estado e pelo playbook. Duas recusas ou modelo fora do ar escalam | sim |
| `redacao.py` | Mensagens a partir de modelos fixos; a reescrita do LLM só é usada se todo horário e data citados existirem nos fatos e não houver R$ | sim |
| `relatorio.py` | Relatório de exceção: estrutura, evidências e responsável vêm do caso; o LLM escreve só o resumo, sob o mesmo guarda | sim |
| `compilador.py` | Português do DP para rascunho de playbook validado; versão e id definidos pelo código. `simular_playbook()` conta o que a versão teria fechado sozinha | sim |
| `fila.py` | Fila do DP: urgência P0 (fechamento em até 24h ou mexe em pagamento), P1 (até 72h), P2; atribuição à menor carga ponderada entre elegíveis (presença, escopo da empresa, limite), round robin no empate, reatribuição de P0 não aceito em 2h com aviso à liderança | não |
| `card.py` | Card de decisão: título, linha "o que decidir" e resumo pelo LLM sob guarda de fidelidade; urgência, prazo, evidências e botões pelo código | sim |
| `matriz.py` | Matriz de exigências por cargo (`contracts/matrizes/`), validade calculada pela periodicidade, situação por pessoa: válido, a vencer, vencido (com data de impedimento) ou faltando | não |
| `documentos.py` | Leitura em dois passos (visão transcreve, texto extrai, cada campo conferido contra a transcrição), conferência em código (identidade, CPF e CNPJ com dígito, carga, responsável técnico, funções do ASO, validade) e decisão: aceitar sozinho, pedir aprovação, recusar com motivo ou escalar. Transcrição de ASO não é devolvida | sim |
| `config.py` | Lê `worker/.env` sem sobrescrever o ambiente | não |
| `estrategico.py` | Autonomia conquistada: elegibilidade (≥ 30 decisões, ≥ 95% na primeira proposta, 0 reaberturas), v+1 no teto da política e sugestão em que todo número vem do achado | sim |

## Anexos (`infra/anexos.py`)

- **Bucket:** arquivos originais imutáveis, chave `<tenant>/anexos/<sha256>` ou `<tenant>/sensivel/<sha256>` para ASO.
  `BucketLocal` no hackathon; um bucket S3-compatível implementa a mesma interface (`salvar`, `ler`) no deploy.
- **Banco:** `RepositorioAnexos` (SQLite no hackathon, PostgreSQL com RLS por tenant no piloto). Recebimento
  idempotente por hash, resultado da leitura e da conferência, aprovação humana e `validades_vigentes()`, que
  alimenta `situacao_matriz()`. A transcrição de ASO nunca é gravada.

Leitura real de certificados: `uv run pytest tests/test_documentos_vivo.py -s` (visão `Qwen/Qwen3-VL-32B-Instruct`,
configurável em `FEATHERLESS_VISION_MODEL`). Certificados fictícios de teste em `tests/fixtures/`, gerados por
`scripts/gerar_certificado_ficticio.swift` (macOS).

## Contratos usados

- `contracts/playbooks/marcacao_impar.v1.yaml` e `.v2.yaml`: os playbooks da demo.
- `contracts/playbook.schema.json`: o C4, gerado por `scripts/exportar_schema_playbook.py`.

## O que ainda não está aqui

Máquina de estados persistente, agenda de jobs, outbox de eventos (C5), API C2 e clientes do ponto de
teste (C1). Esta camada expõe funções puras para o runtime do worker chamar.
