# Contrato entre o front (painel do RH + WhatsApp simulado) e o backend real

Escopo: o front é UX e dados de mentira. A IA, o motor de regras e a persistência são de outra frente.
Este documento diz o que o front espera. Hoje tudo isso é entregue pela `MockApi` (`web/src/api/mock_api.ts`).

## Regra de ouro

A UI só fala com a `Api` (`web/src/api/api.ts`), e só por dois hooks de `web/src/api/contexto.tsx`:
`useConsulta(api => ...)` para ler e `useAcao()` para mutar. Nenhuma tela importa `MockApi`, `domain/` ou
`localStorage`. Trocar o mock pelo backend real é implementar `HttpApi` e mudar uma linha no `ApiProvider`.
Hoje a `Api` é síncrona (`listar_admissoes(): AdmissaoResumo[]`) e `useConsulta` também. A `HttpApi` real vai exigir que
os retornos da `Api` virem `Promise<...>` e que `useConsulta`/`useAcao` sejam adaptados (por exemplo, um cache alimentado
por buscas assíncronas, com estados de carregando e erro). As telas não mudam, porque só usam os hooks.
`useConsulta(fn, deps)`: `fn` pode ser inline; passe em `deps` os valores que ela captura (ex.: um id). O resultado
mantém a mesma referência enquanto a revisão e as `deps` não mudam.

## O que será substituído

`web/src/domain/motor`, `web/src/domain/validacao` e `web/src/domain/leitor_mock.ts` são o dublê da IA e das
regras: leitura de documentos, validação (90 dias, dígito do CPF, validade da CNH, nome igual), textos do agente,
cobrança por lembretes e escalações. Serão trocados pelo worker. `domain/tipos.ts` (as 9 tabelas do PDF) e
`domain/catalogo.ts` são o vocabulário comum e devem ser mantidos em sincronia com `worker/ia/documentos.py`.

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
- `EscalacaoView`: `{ escalacao, admissao, documento | null, tipo | null, acao_sugerida, acoes_permitidas[] }`.
  Sem documento (ex.: prazo estourado), só `falar_com_colaborador`.
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
| `avancar_tempo(preset, admissao_id)` | preset | só no mock (barra Demo); a `HttpApi` pode não implementar |
| `resetar()` | - | só no mock |
| `assinar(cb)` | callback | função de cancelar; deve disparar quando QUALQUER janela mudar o estado (no real: polling, SSE ou WebSocket) |

Efeitos esperados de cada mutação (o backend faz, o front só reflete): registrar mensagem de entrada, ler e validar o
arquivo, aprovar ou recusar com motivo + o que fazer, escalar na 3ª falha, concluir quando faltar zero
(cadastrar no sistema de destino e preencher `id_externo`), e rodar a cobrança (lembretes `leve` após 24 h sem
resposta, `prazo` na metade do prazo, `firme` a 2 dias do início, escalação `prazo_estourado` depois do início).

## Campos só do front, a alinhar com o worker

- `Mensagem.autor?: 'agente' | 'rh'`: separa mensagens digitadas pelo RH (`falar_com_colaborador`) das do agente.
- `Motivo.o_que_fazer`: toda recusa traz motivo + o que fazer ("o comprovante é de março; preciso de um emitido
  nos últimos 90 dias").
- `EnvioDocumento.motivo_codigo?`: código do motivo da recusa (ex.: `inconsistencia`), usado para decidir a escalação.

## Mídia

O mock guarda imagens reduzidas (JPEG, até 1000 px) no navegador e as referencia como `local:<id>`; exemplos do seed
ficam em `/seed/*.svg`. No real, `Mensagem.midia_url` e `EnvioDocumento.arquivo_url` podem ser URLs de verdade;
a UI sempre passa por `resolver_midia`.
