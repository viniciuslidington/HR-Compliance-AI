# worker · camada de IA

Camada de IA dos agentes de DP.
O LLM aparece só onde há texto livre ou redação. Tudo o que muda registro, decide permissão ou gera
número é código determinístico.

## Rodar

```bash
cd worker
uv sync
uv run pytest
```

Inferência real: copie `.env.example` para `.env` (fora do git) e preencha `FEATHERLESS_API_KEY` e,
se quiser, `FEATHERLESS_MODEL` e `FEATHERLESS_VISION_MODEL`.

## Ver os fluxos rodando (`scripts/fluxos.py`)

Utilitário de terminal que roda os fluxos do agente com inferência real e mostra cada etapa: bucket,
transcrição, extração, fidelidade, conferência, decisão, tentativas, mensagem ao colaborador, fila,
card e matriz. O relógio é simulado e cada execução usa um banco novo.

```bash
uv run python scripts/fluxos.py admissao     # Pedro: NR-35 vencida recusada, ASO + NR-10 + NR-35 aprovados, pronto para iniciar
uv run python scripts/fluxos.py renovacao    # Carlos: aviso, lembrete; caminho A renova, caminho B fica impedido (card P0)
uv run python scripts/fluxos.py escalacao    # 3 recusas seguidas da NR-35 viram card na fila do DP
uv run python scripts/fluxos.py todos --detalhe
```

## API (`api.py`)

```bash
uv run uvicorn api:app_do_ambiente --factory --reload   # local, lê worker/.env
# Swagger em http://127.0.0.1:8000/docs
```

| Rota | O que faz | Token |
|---|---|---|
| `GET /` | Redireciona para o front da vinda (`FRONT_URL`); o worker não tem interface própria | não |
| `GET /fila` | Aprovações pendentes e cards do DP | não |
| `GET /pessoas/{id}/mensagens` | Conversa simulada do colaborador | não |
| `POST /regua/rodar?dia=AAAA-MM-DD` | Executa a régua na data simulada | sim |
| `GET /saude` | Status, data em uso e modelos configurados | não |
| `GET /pessoas` | Funcionários do seed (`contracts/seed/funcionarios.json`) | não |
| `GET /pessoas/{id}/matriz` | Situação documental: válido, a vencer, vencido, faltando | não |
| `POST /pessoas/{id}/documentos?tipo=nr35` | Upload (PNG, JPEG ou WebP, até 10 MB): bucket, leitura, conferência, decisão | sim |
| `GET /anexos/{id}` | Metadados, extração e decisão do anexo | não |
| `POST /anexos/{id}/aprovar` | Aprovação humana (`{"aprovador": "..."}`) | sim |
| `POST /leitura` | Leitura para o painel de admissão (`web/`): multipart com `arquivo` (PNG, JPEG ou WebP, até 10 MB) e `candidatos` (JSON `[{id, nome, campos}]`). Devolve `tipo_documento_id`, `qualidade`, `dados_extraidos`, `problemas_fidelidade`; `503` se o modelo estiver fora do ar | sim |
| `GET/PUT /front/kv/{chave}` | Estado e mídia do servidor do Next (tabela `front_kv` no SQLite). Chaves `estado` e `midia:<uuid>`, até 10 MB | sim |

Com `API_TOKEN` definido, as rotas de escrita exigem `Authorization: Bearer <API_TOKEN>`. Variáveis: `DADOS_DIR`
(bucket e banco), `HOJE` (congela a data da demo), `EMISSORES_AUTONOMOS` (CNPJs aceitos sem aprovação).

## Deploy no Render (hackathon)

O `render.yaml` na raiz (validado contra o schema oficial) sobe o worker com disco persistente em `/var/data`.
No painel: **New → Blueprint**, escolha o repositório, cole a `FEATHERLESS_API_KEY` quando pedir (o `API_TOKEN`
é gerado pelo Render) e confirme o plano Starter, necessário para o disco. Só o que está em `/var/data`
sobrevive a deploy e restart; o serviço fica com uma instância e cada deploy tem uma queda rápida.

## Módulos (`ia/`)

| Módulo | O que faz | LLM? |
|---|---|---|
| `llm.py` | Cliente Featherless (API OpenAI), ferramenta forçada, parser de chamada devolvida como texto, remoção de `<think>`, trace por chamada. `estruturar()` só aceita saída que valida no modelo Pydantic | sim |
| `conteudo.py` | Marca texto de participante como não confiável e neutraliza marcadores forjados | não |
| `redacao.py` | Guarda de fidelidade: um texto redigido pelo LLM só é usado se todo horário e data citados existirem nos fatos e não houver R$ | não |
| `relatorio.py` | Modelo de dados dos fatos de um caso escalado, usado pelo card de decisão | não |
| `fila.py` | Fila do DP: urgência P0 (fechamento em até 24h ou mexe em pagamento), P1 (até 72h), P2; atribuição à menor carga ponderada entre elegíveis (presença, escopo da empresa, limite), round robin no empate, reatribuição de P0 não aceito em 2h com aviso à liderança | não |
| `card.py` | Card de decisão: título, linha "o que decidir" e resumo pelo LLM sob guarda de fidelidade; urgência, prazo, evidências e botões pelo código | sim |
| `matriz.py` | Matriz de exigências por cargo (`contracts/matrizes/`), validade calculada pela periodicidade, situação por pessoa: válido, a vencer, vencido (com data de impedimento) ou faltando | não |
| `documentos.py` | Leitura em dois passos (visão transcreve, texto extrai, cada campo conferido contra a transcrição), conferência em código (identidade, CPF e CNPJ com dígito, carga, responsável técnico, funções do ASO, validade) e decisão: aceitar sozinho, pedir aprovação, recusar com motivo ou escalar. Transcrição de ASO não é devolvida | sim |
| `leitura_generica.py` | Leitura do painel de admissão: visão transcreve, texto diz qual documento pendente é (`outro` vira `tipo_errado`) e copia os campos; campo sem respaldo literal na transcrição é descartado. Quem decide é o motor de regras do `web/` | sim |
| `regua.py` | Régua de renovação: aviso ao entrar na janela, lembrete na metade, lembrete firme 2 dias antes, impedimento no vencimento; pula para a etapa mais urgente se rodar atrasado | não |
| `orquestrador.py` | Agente documental: encadeia as etapas e devolve cada uma com tempo e dados; escala na 3ª recusa seguida; régua gera card P0 no impedimento | indireto |
| `duvidas.py` | Responde "o que falta?", "por que recusou?" e "quando vence?" a partir da matriz e dos motivos registrados; reconhece por expressão regular e não expõe motivo de escalada. `POST /pessoas/{id}/mensagens` responde antes de chamar o LLM e não abre card | não |
| `config.py` | Lê `worker/.env` sem sobrescrever o ambiente | não |

## Anexos (`infra/anexos.py`)

- **Bucket:** arquivos originais imutáveis, chave `<tenant>/anexos/<sha256>` ou `<tenant>/sensivel/<sha256>` para ASO.
  `BucketLocal` no hackathon; um bucket S3-compatível implementa a mesma interface (`salvar`, `ler`) no deploy.
- **Banco:** `RepositorioAnexos` (SQLite no hackathon, PostgreSQL com RLS por tenant no piloto). Recebimento
  idempotente por hash, resultado da leitura e da conferência, aprovação humana e `validades_vigentes()`, que
  alimenta `situacao_matriz()`. A transcrição de ASO nunca é gravada.

Leitura real de certificados: `uv run pytest tests/test_documentos_vivo.py -s` (visão `deepseek-ai/DeepSeek-V4.1-Flash-1017`,
configurável em `FEATHERLESS_VISION_MODEL`). Certificados fictícios de teste em `tests/fixtures/`, gerados por
`scripts/gerar_certificado_ficticio.swift` (macOS).

## Contratos usados

- `contracts/matrizes/*.yaml`: matriz de exigências por cargo.
- `contracts/seed/funcionarios.json`: funcionários de exemplo.

### Interface

O worker é só API. A interface é o front da vinda (`web/`, serviço `vinda-web` no Render),
que usa `/leitura` e `/front/kv` com o token no servidor do Next.

Mensagens, cards e distribuição são preservados no SQLite. O canal é simulado, não envia WhatsApp.
A régua roda automaticamente uma vez por dia enquanto o servidor está ativo; `HOJE` também controla
o dia dessa execução. O destino registra eventos simulados de conclusão documental, não é uma integração
com o eSocial. O painel sugere autonomia por emissor e tipo a partir de 30 decisões humanas, com pelo
menos 95% aprovadas; o DP precisa ativá-la. A contagem usa decisões disponíveis no banco e não mede
reaberturas ou janela de tempo. A API não aceita PDF. Use os documentos fictícios de `tests/fixtures/` para a demonstração.


Inicie a admissão na tela para o agente pedir os documentos faltantes. Ao completar a matriz, ele
registra um evento simulado de conclusão. Respostas no chat são classificadas por IA; mensagens
ambíguas são encaminhadas ao DP e o texto recebido não é armazenado. Cards podem receber registro
de contato, pedido de reenvio ou conclusão manual.

### Acompanhamento e recuperação de análises

- Ao aceitar ou aprovar um documento válido, o agente encerra cards de anexos e impedimentos
  da mesma pessoa e tipo. O histórico registra o anexo que resolveu a pendência. Atendimentos
  genéricos de conversa continuam sob responsabilidade do DP.
- A fila oferece **Reprocessar** somente para indisponibilidade de leitura/extração, até três
  novas tentativas por anexo. O original e o identificador são mantidos. Recusas por conteúdo
  e documentos aceitos não podem ser reprocessados. Histórico: `GET /anexos/{id}/tentativas`;
  execução protegida pelo token: `POST /anexos/{id}/reprocessar`.
- Uma resposta como “vou enviar NR-35 amanhã” agenda um compromisso persistente. São aceitos
  hoje, amanhã, DD/MM/AAAA ou AAAA-MM-DD, até 90 dias à frente. Datas/documentos ambíguos
  geram esclarecimento. O texto livre continua sem ser armazenado.
- A régua cobra uma única vez na data combinada, tanto no acionamento manual quanto automático.
  Um documento conferido aguardando aprovação suspende a cobrança; o aceite conclui o compromisso.
  A régua de vencimento permanece ativa, independentemente da promessa. Consulte em
  `GET /pessoas/{id}/compromissos`. Para testar, use a data `HOJE` como referência e avance a régua.
