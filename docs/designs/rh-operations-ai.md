# RH Operations AI

**Analista digital de resolução de pendências de ponto**

Documento revisado · 7 de novembro de 2026 · Escopo de produto e hackathon

Status: proposta consolidada para construção. Não representa funcionalidades já implementadas ou mercado validado. Substitui, para este MVP, as propostas de auditoria de passivo trabalhista, admissão genérica e mobilização de equipes.

## 1. Resumo executivo

Empresas já possuem sistemas de ponto, folha e cadastro. Ainda assim, funcionários, gestores e DP precisam trocar mensagens, buscar informações, justificar ocorrências e conferir ajustes antes do fechamento. O produto assume uma parte delimitada desse trabalho.

**Proposta em uma frase:** um analista digital que identifica pendências de ponto, investiga o contexto, entra em contato com o responsável, executa a regularização permitida e verifica o resultado; quando não consegue concluir, entrega um relatório de exceção acionável.

O agente trabalha por eventos e prazos. Não depende de uma pessoa abrir um chat para cada ocorrência. A conversa é uma ferramenta para obter informações e conduzir uma ação.

**Missão do primeiro worker:** conduzir pendências de marcação e justificativa até sua resolução verificável no sistema de ponto, antes do prazo operacional de fechamento.

O MVP não calcula folha, não decide se alguém deve receber uma verba, não prevê processos judiciais e não declara conformidade integral com a CLT.

## 2. Os três pilares preservados

### Pilar 01 — Employee Intelligence

Reconstruir o contexto operacional do vínculo: quem é o funcionário, qual empregador e unidade, quem é o gestor, qual escala e período, quais marcações existem e quais ajustes ou solicitações já foram registrados.

Cada fato deve ter origem, versão e período. Divergências entre fontes permanecem explícitas. O agente não escolhe silenciosamente um horário, uma identidade ou uma escala quando os dados se contradizem.

**Entrega:** contexto do caso com fatos rastreáveis e lacunas identificadas.

### Pilar 02 — Compliance Detection

Aplicar verificações determinísticas sobre os dados e regras operacionais aprovadas. No MVP, o foco é detectar marcação incompleta, justificativa pendente e ajuste aprovado ainda não refletido no sistema.

O nome do pilar preserva a estrutura original; seu escopo inicial é controle operacional para fechamento. Uma pendência não equivale automaticamente a infração, falta injustificada ou desconto autorizado.

**Entrega:** ocorrência com motivo, dados de entrada, regra versionada, prazo e caminho de tratamento permitido.

### Pilar 03 — Investigation, Execution & Evidence

Evoluir o pilar original de investigação e evidências para assumir também a execução. O agente consulta fontes, seleciona um procedimento permitido, contata o responsável, trata a resposta, solicita aprovação quando necessária, atualiza o destino autorizado e verifica o resultado.

**Entrega:** pendência resolvida com evidência ou relatório de exceção com ação e responsável definidos.

**Mudança central em relação ao documento anterior:** o agente deixa de ter apenas ferramentas de consulta e recomendação. Passa a possuir ferramentas de comunicação e escrita controlada. Relatório é uma saída de exceção, não a entrega obrigatória de todos os casos.

## 3. Problema, comprador e posicionamento

A hipótese comercial é que uma parte material do esforço de fechamento consiste em perseguir informações, aprovações e confirmações, mesmo quando o sistema de ponto já detecta a ocorrência.

Usuários: DP, administradores de ponto e gestores de equipe. Participantes: funcionários que precisam fornecer informações ou justificativas. Comprador potencial: liderança de RH/DP ou operações.

Cliente inicial a validar: empresa com operação distribuída, centenas de funcionários e vários gestores aprovadores. A hipótese de porte é aproximadamente 300–2.000 funcionários, condicionada ao volume real de pendências. Não é uma conclusão sobre tamanho de mercado. PMEs menores podem fazer sentido por meio de BPO, desde que a configuração se reaproveite entre clientes.

**Posicionamento:** operar sobre o ponto e a folha que o cliente continuará usando, reduzindo o trabalho manual entre as pessoas e os sistemas.

A referência da Moveworks é a resolução de demandas por integrações e ações; a da Firstwork é a continuidade operacional entre sistemas e etapas. Ambas são referências de modelo, não prova de exclusividade. Tako e fornecedores de ponto já oferecem automações relevantes. A vantagem pretendida precisa ser comprovada na quantidade de trabalho concluído e no custo de atender o cliente. [1–4]

## 4. O que significa “o agente vê, pensa e resolve”

### Vê o gap

Recebe uma ocorrência do sistema ou encontra uma pendência por verificação programada. Antes de abrir trabalho novo, confere se já existe um caso para o mesmo vínculo, data e tipo.

### Analisa e escolhe a próxima ação

Consulta o contexto e identifica o que falta para avançar. Pode perceber, por exemplo, que uma justificativa já existe, que uma aprovação está pendente ou que é necessário pedir ao funcionário uma informação específica.

O agente escolhe entre procedimentos e ferramentas permitidos. Registra fatos consultados, procedimento escolhido e uma justificativa operacional curta. Não é necessário expor raciocínio interno do modelo.

### Entra em contato por iniciativa própria

Quando a política configurada permitir, inicia contato com o funcionário ou gestor pelo canal autorizado. Identifica-se como assistente da empresa, informa a ocorrência e pede apenas o dado necessário.

Exemplo: “No seu ponto de terça-feira, há entrada registrada às 08h e saída ainda não registrada. Você pode informar o horário efetivo de saída ou indicar se não trabalhou nesse período? Sua resposta será encaminhada para validação conforme o procedimento da empresa.”

O horário não é sugerido como se já tivesse acontecido. O funcionário pode discordar da ocorrência ou apontar erro na fonte.

### Executa e verifica

Transforma a resposta em uma proposta estruturada, solicita a aprovação exigida, registra o tratamento no sistema e consulta o resultado. Mensagem enviada, resposta recebida e solicitação aceita pela API não são sinônimos de resolução.

### Produz uma entrega nova quando necessário

Se não consegue avançar, gera um relatório específico daquele caso a partir das evidências. Cria uma tarefa no fluxo do responsável e acompanha seu aceite. O relatório contém o que ocorreu, o que foi tentado, o que falta e quem precisa decidir.

**O agente pode gerar uma solicitação, resumo de aprovação, tarefa de exceção ou relatório. Não cria uma norma, uma evidência, um parecer jurídico ou uma ferramenta nova por conta própria.**

## 5. Autonomia definida por ação

### Executa sem aprovação individual, dentro da política previamente configurada

- Consultar dados e documentos necessários ao caso.
- Identificar e deduplicar ocorrências.
- Abrir e atualizar o caso.
- Contatar participantes pelos canais e horários permitidos.
- Pedir esclarecimentos, acompanhar respostas e enviar lembrete limitado.
- Criar solicitações de ajuste e pedidos de aprovação.
- Registrar justificativa sem efeito financeiro somente quando o sistema e a política permitirem esse registro automático, preservando autoria e origem.
- Criar relatório e tarefa de exceção.
- Consultar novamente o sistema para confirmar o resultado.

### Executa após aprovação contextual

Aplicar ajuste de ponto que exige validação do gestor ou DP. A aprovação deve identificar funcionário, data, valores anteriores e propostos, motivo e evidências. Se a proposta mudar, a aprovação anterior não vale para a nova versão.

No fluxo principal do hackathon, qualquer mudança de horário depende dessa aprovação. A resposta do funcionário fornece informação; não funciona como aprovação universal da alteração.

### Encaminha para tratamento especializado

Disputa sobre jornada, desconto ou remuneração; conflito de identidade; interpretação de norma coletiva; competência fechada que exige procedimento especial; dados insuficientes; pedido fora de escopo; ou suspeita de documento inconsistente que não pode ser resolvida com os fatos disponíveis.

### Não executa neste MVP

Pagamento, desconto, alteração de salário ou contrato, dispensa, medida disciplinar, fechamento da folha e envio ao eSocial. Também não substitui marcações originais nem transforma silêncio do funcionário em confissão, concordância ou autorização.

O desenho permite autonomia nas tarefas rotineiras sem exigir aprovação para cada mensagem. Decisões que afetam registros e direitos seguem as autorizações específicas.

## 6. Fluxo principal e estados do caso

1. **Detectado:** regra ou evento identifica ocorrência.
2. **Em investigação:** agente consulta contexto e evidências.
3. **Aguardando funcionário:** pergunta específica foi enviada.
4. **Aguardando aprovação:** proposta está pronta para o responsável.
5. **Em execução:** aprovação válida e ação autorizada em andamento.
6. **Em verificação:** consulta ao destino confirma o efeito da ação.
7. **Resolvido:** critério objetivo satisfeito e evidência registrada.

Estados adicionais: aguardando sistema externo; exceção escalada; descartado com fundamento; reaberto. O caminho pode pular contato com o funcionário se a informação já estiver disponível e suficiente.

Escalar conclui o encaminhamento do agente, mas não resolve a pendência de negócio. O painel continua mostrando a ocorrência aberta e o novo responsável. Uma resposta posterior pode retomar o caso.

Se o envio de uma atualização ficar sem confirmação, consultar o destino antes de tentar novamente. Não repetir escritas às cegas. Eventos repetidos e reinícios não devem duplicar mensagens, ajustes ou tarefas.

**Régua inicial de contato:** uma solicitação e um lembrete antes do encaminhamento, com horários, prazo e destinatários configurados pela empresa. A demonstração comprime o relógio e informa essa simulação.

## 7. Entregas concretas

### Resolução verificada

Registro anterior, informação recebida, aprovação, ação executada, identificação da operação no destino e leitura posterior que comprova o resultado. Esse é o produto principal.

### Solicitação de aprovação pronta para decidir

Resumo factual, ajuste proposto, origem da informação e opções de aprovar, recusar ou pedir esclarecimento. O gestor não precisa reconstruir todo o caso.

### Relatório de exceção e tarefa

Documento gerado para a situação concreta, com:

- Identificação e competência, respeitando o acesso do destinatário.
- Ocorrência e prazo operacional.
- Evidências consultadas e fatos confirmados.
- Contatos, tentativas e respostas relevantes.
- Motivo de não resolução e informação ainda ausente.
- Próxima ação, responsável, prazo e link para o caso.

Exemplo: “Saída não registrada em 03/11. Funcionário informou horário diferente do indicado pelo gestor. Nenhuma alteração aplicada. Necessária conferência pelo DP antes do fechamento.”

### Resumo de fechamento

Consolidação das ocorrências resolvidas, aguardando aprovação, bloqueadas por sistema e escaladas. Distinguir caso com escrita verificada de caso descartado por já estar regular. Não usar uma taxa agregada que esconda essas diferenças.

## 8. Escopo do hackathon

Uma empresa sintética, uma unidade, uma competência, um perfil de jornada validado e 20 funcionários. Três cenários plantados demonstram o mesmo worker:

**A. Resolução completa:** falta uma marcação; o agente pergunta ao funcionário, recebe resposta, obtém aprovação do gestor, registra o ajuste e confirma o ponto atualizado.

**B. Investigação sem alteração:** o sistema recebeu uma ocorrência antiga, mas já existe ajuste válido. O agente consulta a versão atual e descarta o alerta com referência, sem novo contato ou escrita.

**C. Exceção:** a resposta do funcionário contradiz outra fonte, ou não chega no prazo. O agente não altera o ponto; gera relatório e tarefa para o DP, mantendo a pendência aberta.

Não incluir conciliação monetária ponto × folha nesta primeira entrega. A proximidade do fechamento dá prioridade às pendências; o produto ainda não afirma que a folha está correta ou pronta para pagamento.

### Integrações e honestidade da demonstração

O sistema de ponto de demonstração deve ser um serviço separado com API funcional, dados sintéticos, versões e histórico. A escrita ocorre de verdade nesse serviço, identificado na interface como sistema de teste. Isso comprova execução técnica; não comprova compatibilidade com um fornecedor comercial.

Meta mínima de integração externa: um canal real de mensagens em ambiente e destinatários de teste, com envio e recebimento associados ao caso. WhatsApp é o canal pretendido, condicionado a credenciais e acesso disponíveis. Se for necessário substituir por caixa de mensagens interna, declarar a integração externa como não demonstrada.

No caso de um canal cuja resposta não autentica suficientemente a pessoa, usar link autenticado para confirmar os dados. Não identificar um vínculo apenas pelo nome escrito em uma mensagem.

Relatório e tarefa são criados no próprio produto. Integração adicional com ferramenta externa de tarefas é expansão, não dependência do fluxo principal.

### Roteiro de palco

1. Abrir o painel próximo ao fechamento e iniciar uma sincronização.
2. Mostrar a ocorrência surgindo e o agente consultando o contexto.
3. Mostrar a mensagem iniciada pelo agente no canal de teste.
4. Responder como funcionário; o agente estrutura a solicitação de ajuste.
5. Aprovar como gestor; mostrar a escrita e a leitura de confirmação no ponto.
6. Exibir o caso resolvido com evidências.
7. Abrir o cenário de exceção e mostrar o relatório e a tarefa gerados automaticamente.

O momento central da demonstração é a mudança confirmada no sistema após contato e aprovação. O relatório mostra que o agente também sabe encerrar sua tentativa com um encaminhamento útil.

## 9. Arquitetura e ferramentas

Frontend com três vistas: fila do DP, solicitação do funcionário e aprovação do gestor. Backend com API, banco relacional, agenda persistente e worker de execução. No hackathon, uma instância e SQLite são suficientes para o recorte; os trabalhos precisam sobreviver a reinícios.

Featherless permanece como provedor escolhido para o LLM. Validar no início o modelo disponível, extração estruturada e chamadas de ferramentas. Saídas textuais do modelo não podem ser executadas como comandos. Qualquer formato alternativo deve passar pelo mesmo esquema e pela mesma política de autorização.

**Ferramentas de consulta:** recuperar contexto, escala, marcações, ajustes e regra operacional aprovada.

**Ferramentas de ação:** abrir caso, enviar solicitação, criar pedido de aprovação, registrar tratamento autorizado, consultar status do destino, gerar relatório, criar tarefa e agendar próxima verificação.

O LLM interpreta respostas e seleciona ações permitidas. Código controla regras, prazos, permissões, transições, idempotência, cálculos e aceitação do resultado. Um resumo explicável registra por que cada ação foi escolhida e a quais fatos se refere.

A política de aprovação é aplicada pelo backend, não por instrução ao modelo. Ferramentas de escrita exigem contexto do caso e autorização válida; o modelo não pode se conceder acesso.

Documentos e mensagens são dados não confiáveis. Instruções recebidas de um participante não alteram permissões, destinatários ou regras do sistema.

## 10. Evidências, acesso e proteção de dados

O caso mantém referências às fontes, versões, horários, identidade dos participantes, texto relevante das respostas, aprovações e resultados das ferramentas. Preservar registros originais e histórico de tratamentos.

Cada funcionário vê somente suas solicitações. Gestores veem a equipe autorizada e o DP vê o escopo concedido. Notificações externas usam o mínimo de informação e encaminham a um ambiente autenticado quando necessário.

Não incluir diagnósticos, prontuários, denúncias ou avaliações de personalidade neste MVP. Uma resposta fora de escopo não deve alimentar automaticamente o contexto geral do funcionário.

No hackathon, usar exclusivamente dados sintéticos e contas de teste. No piloto real, definir finalidade, acessos, retenção, relação com fornecedores e procedimento de contestação antes de operar.

## 11. Critérios de aceite

- Uma ocorrência inicia o trabalho sem comando no chat.
- O agente consulta a fonte atual antes de contatar ou alterar.
- A resposta do participante retoma o caso correto.
- O ajuste permanece bloqueado enquanto faltar aprovação exigida.
- A aprovação se refere à versão exata executada.
- Uma escrita produz mudança efetiva no sistema de teste e é confirmada por leitura posterior.
- Um caso com conflito ou silêncio gera relatório e tarefa sem se tornar “resolvido”.
- Eventos duplicados e reinícios não repetem ações já confirmadas.
- Falha de ferramenta não produz confirmação falsa de sucesso.
- As evidências permitem reconstruir as ações, aprovações e resultados.

Testar os três cenários do MVP e as falhas críticas: resposta associada a pessoa errada, aprovação expirada por mudança da proposta, timeout de escrita e reentrega de evento. Métricas sintéticas demonstram funcionamento controlado; não equivalem a resultado em produção.

## 12. Plano de construção

**48 horas, duas ou três pessoas — estimativa de trabalho:**

- Horas 0–4: definir esquema, política de aprovação, três cenários e credenciais; testar modelo e canal.
- Horas 4–14: implementar sistema de ponto de teste, casos, regras, ferramentas e bloqueios de escrita.
- Horas 10–24: implementar interpretação, comunicação, retomada por resposta e aprovação.
- Horas 20–34: integrar as três vistas, verificação, relatório e tarefa de exceção.
- Horas 34–42: testar falhas, duplicação e reinício; revisar mensagens e evidências.
- Horas 42–48: publicar ambiente de demonstração, testar o canal e ensaiar o roteiro.

**Corte de 24 horas:** manter uma regra de marcação incompleta, um sucesso e uma exceção. Cortar resumo de fechamento avançado e conectores extras. Não cortar aprovação, verificação e distinção entre exceção e resolução.

## 13. Validação de negócio e expansão

No piloto, medir: tempo manual por ocorrência, tempo até conclusão, número de intervenções humanas, taxa de reabertura, escritas incorretas e quantidade de pendências por tipo no fechamento. Separar espera pelo funcionário, gestor e sistema externo.

O benefício precisa superar implantação, integração e suporte. A primeira venda deve delimitar fornecedor de ponto, unidade, volume e procedimentos. Preço e porte definitivo dependem desse teste.

Expandir somente depois de provar a rotina inicial: outros tipos de pendência de ponto; conciliação com folha e banco de horas; depois benefícios e outras demandas de DP. Cada expansão exige critérios de decisão e conectores próprios.

NR-1, previsão de litígios, avaliação de performance e mentoria permanecem fora deste produto inicial.

**Pitch final:** “Nosso analista digital encontra as pendências de ponto, fala com funcionários e gestores e executa os tratamentos autorizados antes do fechamento. Ele confirma o resultado no sistema. Quando não consegue resolver, entrega ao DP a exceção investigada, com evidências e próxima ação.”

## Referências de posicionamento

1. Moveworks — ações e integrações: https://marketplace.moveworks.com/
2. Firstwork — execução sobre sistemas existentes: https://www.firstwork.com/
3. Tako — escopo anunciado para agentes de RH: https://tako.ai/pt/
4. TOTVS — pontos de atenção no espelho de ponto: https://centraldeatendimento.totvs.com/hc/pt-br/articles/4446293438743-RH-RM-Meu-RH-Pontos-de-Aten%C3%A7%C3%A3o-no-espelho-de-ponto

Essas referências ajudam a posicionar o produto. Não comprovam ausência de concorrência nem os resultados comerciais da proposta. Regras legais específicas não são codificadas neste documento; a configuração de produção exige validação aplicável ao cliente.
