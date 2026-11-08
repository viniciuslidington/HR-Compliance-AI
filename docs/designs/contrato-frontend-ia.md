# Contrato entre o front (painel do RH + WhatsApp simulado) e o backend real

Escopo: o que o front espera e como ele chega na IA. Estado em 08/11/2026: o painel já roda sobre um servidor
de verdade (o do Next) e lê as fotos com a IA do worker. Com `NEXT_PUBLIC_API_MODO=mock`, volta o modo antigo, com
tudo no `localStorage` do navegador (`MockApi`, `web/src/api/mock_api.ts`).

## Regra de ouro

A UI só fala com a `Api` (`web/src/api/api.ts`), e só por dois hooks de `web/src/api/contexto.tsx`:
`useConsulta(api => ...)` para ler e `useAcao()` para mutar. Nenhuma tela importa `MockApi`, `HttpApi`, o motor
(`domain/motor`, `domain/validacao`, `domain/leitor_mock`), `store/`, `servidor/` ou `localStorage`. De `domain/` as
telas importam apenas tipos (`domain/tipos`) e formatadores puros de data (`domain/datas`).
As consultas da `Api` continuam síncronas (`listar_admissoes(): AdmissaoResumo[]`), porque leem uma cópia local do
estado. As mutações podem devolver `Promise` (`criar_admissao`, `resolver_escalacao`, `enviar_texto`,
`avancar_tempo`, `resetar`; `enviar_arquivo` sempre devolve).
`useConsulta(fn, deps)`: `fn` pode ser inline; passe em `deps` os valores que ela captura (ex.: um id). O resultado
mantém a mesma referência enquanto a revisão e as `deps` não mudam.

## Arquitetura atual

```
navegador (HttpApi) ──/api/*──► servidor do Next (Servico + MockApi) ──token──► worker (FastAPI)
                                                                               ├─ /front/kv/{chave}  estado e mídia
                                                                               └─ /leitura           IA lê a foto
```

| Peça | Arquivo | O que faz |
|---|---|---|
| `HttpApi` | `web/src/api/http_api.ts` | Guarda a última cópia do estado e responde as consultas com uma `MockApi` interna. Mutações vão por POST e trazem o estado novo. Polling de `/api/estado` a cada 1,5 s com ETag |
| `ApiProvider` | `web/src/api/contexto.tsx` | Usa a `HttpApi` por padrão; `NEXT_PUBLIC_API_MODO=mock` volta ao `localStorage` |
| `Servico` | `web/src/servidor/servico.ts` | Roda a `MockApi` (motor puro de `web/src/domain`) no servidor, sobre um estado único que o RH e o WhatsApp compartilham. Uma mutação por vez; cada uma grava no worker e ganha uma nova versão |
| Cliente do worker | `web/src/servidor/worker.ts` | `PersistenciaWorker` (`/front/kv`) e `LeitorWorker` (`/leitura`). O token nunca vai para o navegador |

Rotas do Next (o navegador só fala com elas):

| Rota | Entrada | Saída |
|---|---|---|
| `GET /api/estado` | `If-None-Match` opcional | estado (JSON) com `ETag`; `304` se não mudou |
| `POST /api/acao` | `{ metodo, args }`, com `metodo` em `criar_admissao`, `resolver_escalacao`, `enviar_texto`, `avancar_tempo`, `resetar` | `{ versao, estado, retorno }` |
| `POST /api/arquivo` | multipart: `admissao_id`, `nome_arquivo`, `previa` (JPEG de até 1000 px, para exibir) e `imagem` (até 2000 px, para a IA) | `{ versao, estado }` |
| `GET /api/midia/{id}` | uuid | a prévia gravada |

Variáveis do servidor do Next:

| Variável | Efeito |
|---|---|
| `WORKER_URL` | URL base do worker. Sem ela: estado em memória e leitor simulado (dev local) |
| `WORKER_TOKEN` | O `API_TOKEN` do worker. Fica só no servidor |
| `LEITOR=mock` | Opcional: mantém o leitor simulado, mas continua gravando no worker |

Rotas novas do worker (todas com `Authorization: Bearer <API_TOKEN>`):

- `GET/PUT /front/kv/{chave}`: tabela `front_kv` no SQLite do disco do worker. Chaves `estado` (o JSON inteiro) e
  `midia:<uuid>` (cada prévia).
- `POST /leitura`: multipart com `arquivo` (PNG, JPEG ou WebP, até 10 MB) e `candidatos`, lista JSON
  `[{ id, nome, campos }]` com os documentos ainda pendentes ou recusados. `ia/leitura_generica.py`: a visão
  transcreve, o modelo de texto diz qual candidato é (`outro` vira `tipo_errado`), se está legível e copia os campos.
  Todo campo precisa de respaldo literal na transcrição (data AAAA-MM-DD presente no texto, dígitos dos campos
  numéricos presentes); o que não tiver é descartado e listado em `problemas_fidelidade`. `503` quando o modelo
  está fora do ar.

Resposta de `/leitura`, que o servidor do Next converte em `LeituraExterna` (`web/src/domain/motor/eventos.ts`):

```ts
interface LeituraExterna {
  tipo_documento_id: string | null; // qual candidato é; null se não for nenhum
  qualidade: "ok" | "ilegivel" | "tipo_errado";
  detalhe_qualidade?: string; // ex.: "a foto cortou a data de nascimento"
  dados_extraidos: Record<string, string>; // chaves = campos_extracao do tipo; datas AAAA-MM-DD
}
// o worker manda também problemas_fidelidade e duracao_ms, que o front ignora
```

Quem aprova ou recusa continua sendo o motor do front (`web/src/domain/validacao`), com as regras do catálogo.
Se o worker responder `503` (ou não responder em 110 s), o agente diz "não consegui ler o documento agora" e a
tentativa não conta. Arquivo que não é foto (ex.: PDF) volta como `ilegivel`. Sem documento pendente, o worker
não é chamado.

`domain/tipos.ts` (as 9 tabelas do PDF) e `domain/catalogo.ts` são o vocabulário comum. `domain/motor` ainda decide
os textos do agente, a cobrança por lembretes, as escalações e interpreta o texto livre do colaborador.

## Catálogo

| Id | Campos lidos | Regras (`web/src/domain/validacao/regras.ts`) |
|---|---|---|
| `rg_cnh` | nome, numero, data_nascimento, filiacao, validade_cnh | legivel, frente_e_verso, cnh_dentro_validade |
| `cpf` | nome, numero | cpf_digito_valido, nome_igual_rg |
| `comprovante_residencia` | titular, endereco, data_emissao | emitido_menos_90_dias |
| `dados_bancarios` | banco, agencia, conta, titular | titular_igual_colaborador |
| `declaracao_matricula` | nome, instituicao, curso, data | nome_igual_rg, data_recente |
| `aso` | nome, cpf, data_realizacao, resultado | legivel, nome_igual_rg, aso_apto, valido_12_meses |
| `nr10` | nome, data_realizacao, carga_horaria, responsavel_tecnico | legivel, nome_igual_rg, carga_minima_40h, valido_24_meses |
| `nr35` | nome, data_realizacao, carga_horaria, responsavel_tecnico | legivel, nome_igual_rg, carga_minima_8h, valido_24_meses |

Modelos: `clt_padrao` (RG/CNH, CPF, comprovante, dados bancários), `estagio` (RG/CNH, CPF, comprovante, matrícula)
e `eletricista`, "Eletricista (NR-10 e NR-35)" (os quatro do CLT mais ASO, NR-10 e NR-35).

## Enums (snake_case, sem acento)

- `StatusAdmissao`: `criada | em_coleta | escalada | concluida`
- `StatusDocumento`: `pendente | recebido | aprovado | recusado`
- `NivelLembrete`: `leve | prazo | firme`
- `StatusEscalacao`: `aberta | resolvida`
- `MotivoEscalacao`: `prazo_estourado | tres_falhas | inconsistencia | suspeita_adulteracao | fora_do_escopo`
- `Direcao`: `entrada | saida`; `ResultadoEnvio`: `aprovado | recusado`
- `AcaoEscalacao`: `aprovar_manualmente | pedir_de_novo | falar_com_colaborador`
- `PresetTempo` (só demo): `mais_24h | metade_prazo | dois_dias_antes | prazo_estourado`

Datas: ISO 8601 em string; `data_inicio` é `YYYY-MM-DD`. Regras: 3 falhas no mesmo documento escalam;
comprovante com menos de 90 dias; após recusa o documento volta a `pendente` com `motivo_recusa` e `tentativas`.

## DTOs

- `AdmissaoResumo`: `{ admissao, modelo_nome, pendentes, total, rotulo_inicio, alerta_prazo, escalacoes_abertas }`.
  "4 de 5" é `pendentes` de `total`. `rotulo_inicio` é texto pronto ("em 3 dias"). Ordem: escaladas primeiro,
  depois `data_inicio`.
- `AdmissaoDetalhe`: `{ admissao, modelo_nome, documentos: { documento, tipo | null, envios[] }[], mensagens[] (em ordem),
  lembretes[], escalacoes[] }`. `null` se o id não existe.
- `EscalacaoView`: `{ escalacao, admissao, documento | null, tipo | null, acao_sugerida, acoes_permitidas[],
  ultimas_mensagens[], ultimo_envio_url | null }`. Sem documento (ex.: prazo estourado), só `falar_com_colaborador`.
  `ultimas_mensagens` são as 3 últimas mensagens da admissão (em ordem); `ultimo_envio_url` é o `arquivo_url` do
  último envio do documento da escalação (passe por `resolver_midia`), `null` sem documento ou sem envio. Assim a
  tela de escalações não precisa de um `obter_admissao` por cartão.
- `ModeloComDocumentos`: `{ modelo, tipos[] }`. Catálogo e modelos são só leitura no MVP.
- `Admissao`, `DocumentoAdmissao`, `EnvioDocumento`, `Mensagem`, `Lembrete`, `Escalacao`, `TipoDocumento`:
  exatamente como em `domain/tipos.ts`.

## Métodos da `Api`

| Método | Entrada | Saída |
|---|---|---|
| `listar_admissoes()` | - | `AdmissaoResumo[]` |
| `resumo_status()` | - | contagem por `StatusAdmissao` |
| `obter_admissao(id)` | id | `AdmissaoDetalhe \| null` |
| `criar_admissao(i)` | `NovaAdmissaoInput` (nome, whatsapp, cargo, data_inicio, modelo_id, checklist `documentos[]`) | `Admissao` (já `em_coleta`; o agente manda as boas-vindas) |
| `listar_escalacoes(f?)` | `{ status? }` | `EscalacaoView[]` (abertas primeiro) |
| `resolver_escalacao(id, acao, texto?)` | `texto` obrigatório em `falar_com_colaborador` | void |
| `listar_catalogo()` / `listar_modelos()` | - | `TipoDocumento[]` / `ModeloComDocumentos[]` |
| `enviar_texto(admissao_id, texto)` | texto do colaborador | void (o agente responde) |
| `enviar_arquivo(admissao_id, arquivo)` | `File` (foto/PDF) | `Promise<void>` (o agente lê, valida e responde) |
| `resolver_midia(url)` | `midia_url` | URL que um `<img>` entende (no real: URL assinada ou a própria) |
| `agora()` | - | `Date` do sistema |
| `alvo_preset(preset, admissao_id)` | preset | `Date \| null`: para onde o preset levaria o relógio, sem mexer nele; `null` se a admissão não existe ou o alvo já passou (a barra Demo desabilita o botão com "Já passou"). Na `HttpApi`, calculado na cópia local |
| `avancar_tempo(preset, admissao_id)` | preset | barra Demo; na `HttpApi` roda no servidor e vale para todas as janelas |
| `resetar()` | - | barra Demo; grava o seed com `epoca` = anterior + 1 (na `HttpApi`, no servidor) |
| `epoca()` | - | `number`: 0 no seed, sobe a cada `resetar`. As telas guardam a última vista e, quando muda (reset em qualquer janela), descartam a escolha de contato/admissão. Na `HttpApi` vem do estado do servidor |
| `assinar(cb)` | callback | função de cancelar; dispara quando QUALQUER janela mudar o estado (na `HttpApi`: polling de `/api/estado` a cada 1,5 s) |

Efeitos esperados de cada mutação (o backend faz, o front só reflete): registrar mensagem de entrada, ler e validar o
arquivo, aprovar ou recusar com motivo + o que fazer, escalar na 3ª falha, concluir quando faltar zero
(cadastrar no sistema de destino e preencher `id_externo`), e rodar a cobrança (lembretes `leve` após 24 h sem
resposta, `prazo` na metade do prazo, `firme` a 2 dias do início, escalação `prazo_estourado` depois do início).
A cobrança manda no máximo UM lembrete por admissão a cada execução: o de nível mais alto devido (firme > prazo > leve);
os níveis pulados contam como enviados (um salto grande de relógio gera só o firme, e nada depois o duplica).

## Campos só do front, a alinhar com o worker

- `Mensagem.autor?: 'agente' | 'rh'`: separa mensagens digitadas pelo RH (`falar_com_colaborador`) das do agente.
- `Motivo.o_que_fazer`: toda recusa traz motivo + o que fazer ("o comprovante é de março; preciso de um emitido
  nos últimos 90 dias").
- `EnvioDocumento.motivo_codigo?`: código do motivo da recusa (ex.: `inconsistencia`), usado para decidir a escalação.

## Mídia

No modo `mock`, as imagens reduzidas (JPEG, até 1000 px) ficam no navegador como `local:<id>`. Na `HttpApi`, a
prévia é gravada no worker (`midia:<uuid>`) e servida em `/api/midia/<uuid>`; a imagem maior vai só para a leitura
e não é guardada. Exemplos do seed ficam em `/seed/*.svg`. A UI sempre passa por `resolver_midia`.
