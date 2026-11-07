# Plano final: agentes de DP com playbooks

7 de novembro de 2026 · Consolida o handoff "Arquitetura dos agentes de DP" (@Joao), a proposta [RH Operations AI](rh-operations-ai.md) e as decisões do office hours.

**O problema em uma frase:** o sistema de ponto já aponta as pendências antes do fechamento, mas fechar cada uma ainda depende de alguém do DP perseguir funcionário e gestor e conferir se o ajuste entrou; é esse trabalho entre pessoas e sistemas que o produto assume.

**Slide:** "O ponto aponta a pendência; ninguém fecha. A gente fecha."

---

## 1. Decisões fechadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Canal com o funcionário | **Portal** (thread por caso, texto livre). WhatsApp fica para o piloto | Tira o risco de fonte externa; quem responde está logado, então a identidade está resolvida |
| Resposta do funcionário | Texto livre, com atalhos opcionais que passam pelo mesmo interpretador | Se for formulário, o LLM perde a função e o "por que IA" cai |
| Agentes | Dois: **operacional** (resolve casos) e **estratégico** (propõe novas versões de playbook a partir do histórico) | Separação do handoff; um nunca chama o outro |
| Unidade de configuração | **Playbook** escrito pelo DP, versionado, que só escolhe e restringe ações do catálogo | Conhecimento do DP vira configuração reutilizável sem abrir porta para novas permissões |
| Autonomia | **Conquistada**: o histórico sugere, um humano ativa a nova versão do playbook | Autonomia baseada em evidência, não em palpite |
| Teto legal da autoaplicação | Diferença de até 5 min em relação à escala, sem gerar hora extra (CLT art. 58 §1º) | Primeira regra automática com âncora legal |
| Estratégico no hackathon | **Um momento**: autonomia conquistada criando a v2 do playbook ao vivo. Brief em R$ vira slide | O cold start impede um brief real em 48h; o ciclo completo cabe em 60 s |
| Histórico para o estratégico | 3 meses sintéticos, **declarados como sintéticos** na tela | Honestidade da demo |

**Integração externa de mensagens não demonstrada nesta versão.** Essa frase vai no slide.

## 2. Agente operacional

**Missão:** levar cada pendência de ponto até uma resolução verificada no sistema de destino antes do fechamento, ou até uma exceção investigada com responsável.

**Loop por caso**

1. Recebe um evento: ocorrência do ponto, verificação agendada ou mensagem no portal.
2. Carrega o caso e o contexto atual; nunca age sobre um snapshot antigo.
3. O LLM propõe a próxima ação **entre os passos permitidos pelo playbook ativo para o estado atual**.
4. O backend valida a proposta contra o schema, o teto da política, o playbook e o estado. Se recusar, registra e volta ao passo 3 ou escala.
5. A ferramenta executa; o resultado vira evidência.
6. O backend aplica a transição e agenda a próxima verificação.

**Precedência:** teto da política do cliente > playbook ativo > proposta do LLM.

**LLM versus código**

| Responsabilidade | LLM | Código |
|---|---|---|
| Interpretar a resposta do funcionário | Sim | Valida o schema de saída |
| Redigir mensagem | Sim, a partir do modelo do playbook | Escolhe destinatário e horário |
| Escolher a próxima ação | Propõe | Decide se é permitida |
| Compilar playbook escrito em português | Sim (bônus no hackathon) | Valida schema, catálogo e teto |
| Regras, prazos, transições, idempotência | Não | Sim |
| Redigir relatório de exceção | Sim | Anexa evidências e responsável |

**Garantias** (do handoff): deduplicação por vínculo + data + tipo; toda escrita leva `idempotency_key`; agenda persistente em tabela de jobs; régua de 1 pedido e 1 lembrete; erro nunca vira sucesso; escrita sem confirmação consulta o status antes de tentar de novo.

**Resolvido só depois que uma leitura do sistema de ponto confirma o efeito.**

## 3. Playbooks

### Princípio

> **Um playbook só escolhe e restringe; nunca concede.** Ele usa ações do catálogo fechado e opera abaixo do teto da política. Uma ação fora do catálogo (pagamento, desconto, eSocial) é recusada na validação, porque a ferramenta não existe.

### Ciclo de vida

1. **Rascunho.** O DP escreve em YAML ou em português; nesse caso o LLM compila para o schema.
2. **Validação.** Schema, ações do catálogo, condições de autonomia dentro do teto da política, sobreposição de gatilho com outro playbook ativo (recusada sem prioridade explícita).
3. **Simulação** contra o histórico: "esta versão teria fechado 32 de 40 casos de outubro; 3 teriam escalado".
4. **Ativação** por um admin do cliente. Gera nova versão imutável.
5. **Execução.** Casos novos usam a versão ativa; casos em andamento terminam na versão em que começaram.

O agente estratégico entra no passo 1: ele **propõe rascunhos**, nunca ativa.

### Exemplo (C4)

```yaml
playbook: marcacao_impar
versao: 1
gatilho: { ocorrencia: R1, dia_util: true, feriado: false }
fatos_necessarios: [escala_do_dia, marcacoes, ajustes_existentes]
passos:
  - id: conferir_ajuste_existente
    acao: get_adjustments
    se_existir_ajuste_valido: descartar_com_fundamento
  - id: perguntar_funcionario
    acao: send_request
    destinatario: funcionario
    modelo: pendencia_marcacao
  - id: montar_proposta
    acao: create_proposal
  - id: decidir
    acao: create_approval_request
    aprovador: gestor_direto
  - id: aplicar
    acao: apply_adjustment
  - id: verificar
    acao: get_destination_status
autonomia:            # v1: nenhuma autoaplicação
  autoaplicar_quando: null
regua: { lembrete_apos: 4h_uteis, escalar: D-1_do_corte }
escalar_quando: [conflito_de_fontes, silencio_apos_regua, tema_saude, competencia_fechada]
resolvido_quando: espelho_mostra_marcacao_incluida
```

A **v2**, criada pela autonomia conquistada, muda só este bloco:

```yaml
autonomia:
  autoaplicar_quando:
    informado_pelo_proprio_funcionario: true
    diferenca_max_minutos_vs_escala: 5     # teto: CLT art. 58 §1º
    gera_hora_extra: false
  apos_autoaplicar: { notificar: gestor_direto, janela_contestacao: 24h }
```

## 4. Agente estratégico (recorte do hackathon)

- **Entrada:** só eventos de domínio e agregados (C5). Nunca mensagens brutas nem fatos individuais.
- **Detector "autonomia conquistada"** (SQL, não LLM): para cada categoria de ajuste e aprovador, em 90 dias, com ≥ 30 decisões, ≥ 95% aprovadas na primeira proposta e zero reaberturas, sugere uma nova versão do playbook com a categoria autoaplicável. Os limites são configuráveis pelo cliente.
- **Papel do LLM:** redigir a sugestão em linguagem de negócio a partir dos números da consulta. Não calcula nada.
- **Saída:** um rascunho de playbook via C2. Um humano ativa.
- **Fora do hackathon (slide):** brief mensal com hora extra estrutural, gargalo de aprovação, padrões de risco e carga da operação em R$.

## 5. Roteiro da demo

Empresa fictícia, 20 funcionários, fechamento em 25/11. Contato pelo portal; o relógio é comprimido e a tela avisa.

| Ato | O que acontece | O que prova |
|---|---|---|
| 1 · Marina (17/11, saída esquecida) | O agente pergunta no portal; ela responde "saí 17:04"; pelo playbook v1, a gestora aprova; o ponto é corrigido e conferido | O fluxo completo com humano no portão |
| 2 · Autonomia conquistada | O painel mostra 3 meses (sintéticos) mais a aprovação da Marina: a gestora aprovou 48 de 49 casos de "saída esquecida até 5 min" sem alteração. O estratégico sugere a v2; o DP simula e ativa | Os dois agentes e o contrato entre eles |
| 3 · Rafael (23/11, saída esquecida) | Responde "17:03". A v2 aplica sozinha, confere no ponto e avisa a gestora com 24h para contestar. **Zero toque humano** | Ponta a ponta, com a versão do playbook que autorizou |
| 4 · Joana (19/11) | Responde "18:30": fora da tolerância, vai para a gestora, que diz "17:00". Conflito: nenhuma escrita, relatório e tarefa para o DP | O limite visível |
| Fila do DP | Carlos aparece como "descartado com fundamento" (o ajuste já existia); o feriado de 20/11 não gerou nada | Sabe quando não agir |

**Métrica de palco:** porcentagem de casos fechados sem toque humano além da aprovação, cada um rastreável até a versão do playbook.

## 6. Divisão em 3 partes paralelas

| Parte | Pastas | Escopo | Pronta quando |
|---|---|---|---|
| **1 · Ponto de teste, seeds e estratégico** | `/ponto-teste`, `/estrategico` | Cadastro, calendário, marcações imutáveis, espelho versionado, tratamentos idempotentes (`Idempotency-Key`, `If-Match`), feed de ocorrências R1–R3 com reenvio duplicado e velho, injeção de falha `FAIL_NEXT_WRITE=timeout`, seed dos 5 cenários + gabarito, **histórico sintético de 3 meses**, detector de autonomia conquistada que consome C5 e grava rascunho via C2 | Seed carrega; controle e feriado geram zero ocorrências; escrita repetida não duplica; detector sugere a v2 sobre o histórico |
| **2 · Worker operacional** | `/worker` | Consumo do feed, deduplicação, máquina de estados, agenda persistente, **runtime de playbooks** com validador e teto de política, portão de aprovação por `proposta_hash`, autoaplicação com janela de contestação, interpretação no Featherless, relatório e tarefa, outbox de eventos (C5), API C2 | Atos 1, 3 e 4 passam contra os mocks, mais os testes de falha |
| **3 · Telas** | `/web` | Fila do DP com resumo de fechamento; portal do funcionário (thread); aprovação do gestor com contestação; tela de playbooks (versões, diff, simular, ativar); painel de autonomia conquistada; seletor de persona; SSE | As telas funcionam sobre as fixtures dos contratos |

### Contratos (em `/contracts`, congelados na hora 2; mudança só por PR aprovado pelos três)

**C1 · API do ponto** (Parte 1 publica, Parte 2 consome)
```
GET  /vinculos/{id}   GET /calendario/{competencia}   GET /espelho/{vinculo}/{data}
GET  /ocorrencias?cursor=   GET /tratamentos?vinculo=&data=   GET /tratamentos/{id}
POST /tratamentos  (Idempotency-Key, If-Match)        POST /demo/reset
```

**C2 · API do worker** (Parte 2 publica; Partes 1 e 3 consomem)
```
Casos       GET  /casos?estado=   GET /casos/{id}   GET /fechamento/resumo   GET /eventos (SSE)
Portal      GET  /portal/{pessoa_id}/casos
            GET  /portal/casos/{id}/mensagens   POST /portal/casos/{id}/mensagens {texto}
Aprovação   GET  /aprovacoes/pendentes?aprovador=   POST /aprovacoes/{proposta_hash} {decisao, comentario}
            POST /contestacoes/{caso_id} {motivo}
Playbooks   GET  /playbooks   GET /playbooks/{id}/versoes
            POST /playbooks/{id}/rascunhos {yaml | texto, origem: dp | estrategico}
            POST /playbooks/{id}/versoes/{v}/simular   POST /playbooks/{id}/versoes/{v}/ativar
Demo        POST /demo/sync   POST /demo/reset
```

**C4 · Schema de playbook**: o YAML da seção 3, com JSON Schema e catálogo fechado de ações.

**C5 · Eventos de domínio** (outbox; Parte 2 publica, Parte 1 consome via `GET /eventos-dominio?cursor=`)
```
{evento_id, tipo, caso_id, tenant_id, playbook_id, playbook_versao, categoria,
 aprovador_id, aprovado_na_primeira_proposta, ocorrido_em}
tipo ∈ case_opened | contact_sent | response_received | approval_decided |
       auto_applied | action_verified | case_escalated | case_resolved | case_contested
```

Também em `/contracts`: IDs do seed (V03 Rafael, V07 Marina, V12 Carlos, V15 Joana, V18 Paulo, G1, G2, DP), enums de estado, regras, motivos e interpretação, e um mock de cada API.

### Pontos de encontro

| Hora | Integração |
|---|---|
| 2 | Contratos congelados, mocks no repo |
| 14 | Worker contra o ponto de teste real (Marina e Carlos sem tela) |
| 24 | Worker com as telas: ato 1 de ponta a ponta |
| 30 | Estratégico consumindo C5 real: ato 2 |
| 36 | Atos 3 e 4, testes de falha |
| 42–48 | Demo publicada e ensaio |

## 7. Critérios de aceite (acrescentam aos da proposta)

- Playbook que usa ação fora do catálogo ou condição acima do teto é recusado na validação.
- Ativar a v2 não muda casos em andamento.
- Caso autoaplicado registra a versão do playbook que autorizou e abre a janela de contestação.
- Contestação reabre o caso e cria tarefa para o DP; nenhuma reversão automática no MVP.
- O estratégico nunca escreve em playbook ativo; só cria rascunho.
- O painel marca o histórico de 3 meses como sintético.

## 8. Riscos e decisões em aberto

- **Cliente inicial:** empresa final ou escritório contábil/BPO. Muda o modelo de tenant e o primeiro conector. Para BPO, a biblioteca de playbooks reaproveitada entre clientes é o fosso mais crível.
- **Primeiro fornecedor de ponto** e se ele permite escrita por API; senão, no piloto o agente prepara o ajuste e o DP lança.
- **Featherless:** confirmar na hora 0 a extração estruturada e as chamadas de ferramenta.
- **Validação de rotina de DP:** quem revisa playbooks e régua (consultor, parceiro ou BPO piloto).
- **Dados reais:** política de retenção do provedor de LLM, base legal, papéis de controlador e operador antes do piloto.
- **Riscos de mercado:** fornecedor de ponto lançar algo parecido; volume baixo de pendências; recusa de acesso de escrita; baixa taxa de resposta ao assistente; brief estratégico não gerar decisões.
