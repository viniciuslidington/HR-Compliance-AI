# Labor Compliance AI

**Estudo estratégico | HR Tech Brasil**

Uma plataforma agêntica para contextualizar vínculos, detectar inconsistências e investigar evidências trabalhistas

Proposta de startup · Produto, mercado, competição e arquitetura do MVP


| PILAR 01 | PILAR 02 | PILAR 03 |
| --- | --- | --- |
| **EMPLOYEE INTELLIGENCE** — Contexto histórico e multissistema do vínculo | **COMPLIANCE DETECTION** — Verificações contínuas e regras auditáveis | **INVESTIGATION & EVIDENCE** — Investigação explicável e dossiê de evidências |



> **TESE DE PRODUTO**
>
> Uma camada independente de auditoria operacional que não substitui os sistemas de RH, ponto e folha: reconcilia suas informações, identifica obrigações potencialmente descumpridas e encaminha casos verificáveis para resolução humana.


**Versão 1.0** | Pesquisa pública consolidada em 7 de novembro de 2026 | Uso: alinhamento de startup e hackathon

Nota: este documento reúne análise de negócio e informações regulatórias, mas não substitui parecer jurídico, consultoria de SST ou avaliação de segurança e proteção de dados.

# Resumo executivo

A proposta é criar uma startup B2B de tecnologia trabalhista focada em prevenção de não conformidades. Empresas já armazenam contratos, marcações de ponto, escalas, rubricas de folha e eventos de RH, porém o contexto costuma estar dividido entre departamentos e ferramentas. A oportunidade é investigar inconsistências que atravessam essas fontes antes do fechamento da folha, de uma fiscalização ou do agravamento de uma violação de direitos.


> **PROPOSTA EM UMA FRASE**
>
> Transformar dados fragmentados de RH e DP em casos de compliance trabalhista contextualizados, investigados e fundamentados, com trilha de evidências e plano de correção.


## Os três pilares

| **Pilar**                    | **Função de negócio**                                                    | **Entrega concreta**                                      |
|------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------------|
| 1\. Employee Intelligence    | Reconstrói o contexto do vínculo, com datas, fontes e regras aplicáveis. | Employee Compliance Context.                              |
| 2\. Compliance Detection     | Compara fatos e obrigações por verificações determinísticas.             | Alerta rastreável e triagem de possível não conformidade. |
| 3\. Investigation & Evidence | Busca causas e evidências, reduz falso positivo e formaliza o caso.      | Dossiê + encaminhamento para revisão e regularização.     |

## Por que agora?

- Em 2024, a Justiça do Trabalho registrou 3.599.940 casos novos; esse número não equivale ao mercado pagante potencial, mas demonstra relevância institucional da litigiosidade \[1\].

- Em outubro de 2026, fiscalização do MTE divulgou 32.148 horas extras registradas e não pagas a 3.497 trabalhadores, em uma companhia fiscalizada; o caso ilustra uma divergência auditável entre ponto e folha, respeitado o direito de defesa \[2\].

- A EC 141/2026 foi promulgada em 16/10/2026; sua transição da escala 6×1 cria necessidade de analisar contratos, jornadas, CCTs, escalas e parâmetros de folha \[3\]\[4\].

- A solução encontra concorrentes reais: Senior, Sólides, TOTVS, PontoCorp e Tako já automatizam partes do problema; logo, diferenciação depende de integração, evidência e resolução, não da palavra “IA” \[8\]–\[12\].

## Posicionamento e limites

O produto deve auditar obrigações da empresa e fatos documentados da relação de trabalho. Não deve criar um score de “propensão do colaborador a processar a empresa”, inferir saúde, classificar pessoas como problemáticas ou usar denúncias para decisões desfavoráveis. A promessa comercial deve ser mensurável: menos horas de investigação, melhor rastreabilidade e regularização mais rápida — não “zerar processos trabalhistas”.

## Hipóteses que ainda dependem de prova

Precisamos validar: (a) frequência real das divergências nos clientes; (b) custo e tempo da investigação atual; (c) capacidade de obter dados suficientes; (d) melhoria incremental sobre fornecedores já contratados; e (e) disposição a pagar por um produto complementar. Não há, nesta fase, TAM, receita prevista, CAC ou redução percentual de litígios empiricamente demonstrados.

# 1. Problema de mercado e gargalos operacionais

## 1.1 O que os dados públicos sustentam

O CNJ, com base em informações do TST, divulgou que foram recebidos 4.090.375 processos em 2024 quando somados casos novos e recursos; isoladamente, os casos novos totalizaram 3.599.940. Não se devem somar esses indicadores, nem considerá-los exclusivamente como falhas de folha \[1\]. No relatório do TST para 2024, horas extras, verbas rescisórias, insalubridade, multa de 40% do FGTS e danos morais figuraram entre os assuntos recorrentes do primeiro grau \[5\].

O caso de fiscalização divulgado pelo MTE em 26/10/2026 oferece evidência operacional adicional: a apuração indicou extrapolações de jornada, repousos insuficientes e horas extras registradas e não pagas. A inspeção resultou em autos sujeitos a defesa; o estudo não presume decisão definitiva nem transfere automaticamente seus achados a outras empresas \[2\].

## 1.2 Onde o fluxo de DP rompe

| **Macroprocesso**           | **Descontinuidade típica**                                             | **Sinal auditável**                                                   |
|-----------------------------|------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Admissão/mudança contratual | Cadastro, contrato e sistema de folha evoluem em momentos distintos.   | Jornada ou remuneração divergente entre contrato e cadastro.          |
| Ponto e escalas             | Escala planejada, marcação original e justificativas ficam em silos.   | Descanso insuficiente; jornada executada diferente da prevista.       |
| Fechamento de folha         | Cortes de competência, compensações e rubricas exigem conciliação.     | Horas apuradas sem rubrica, compensação ou justificativa equivalente. |
| Instrumentos coletivos      | Enquadramento sindical e vigência são difíceis de manter consistentes. | Regra geral aplicada indevidamente a vínculo com CCT específica.      |
| FGTS/eSocial                | Declarações, bases e comprovantes não são a mesma evidência.           | Evento transmitido, mas quitação não comprovada.                      |
| Rescisão/férias             | Prazos e cálculos dependem de histórico íntegro do vínculo.            | Pendências próximas ao prazo ou valores inconsistentes.               |

## 1.3 Quem sente a dor e quem compra

Usuários diários: analistas de DP, administradores de ponto, operações e gestores de escala. Revisores especializados: jurídico trabalhista, compliance, contabilidade e SST. Compradores econômicos potenciais: diretor de RH, CFO e liderança de operações com quadro intensivo em mão de obra. O piloto deve identificar qual área possui orçamento, qual possui dados e qual consegue autorizar remediações; essas pessoas nem sempre são a mesma.

# 2. Visão de produto e processo de negócio

A startup não precisa implementar folha ou sistema de controle de ponto. Ela deve funcionar como uma camada transversal de confiabilidade: conecta fontes existentes, cria contexto, executa verificações e abre um Compliance Case quando há divergência que requer investigação. O caso tem vida própria até a confirmação de correção, descarte fundamentado ou encaminhamento a especialista.

## 2.1 Fluxo ponta a ponta

| **Etapa**             | **Ação da plataforma**                                                      | **Saída / checkpoint**                            |
|-----------------------|-----------------------------------------------------------------------------|---------------------------------------------------|
| 01 · Ingestão         | Recebe exportações ou APIs de HRIS, ponto, folha e regras legais.           | Dados identificados por origem, período e versão. |
| 02 · Contextualização | Consolida vínculo, contrato, unidade, escala, norma e evidência disponível. | Employee Compliance Context.                      |
| 03 · Detecção         | Aplica verificações determinísticas e identifica exceções.                  | Finding com regra, período e dados de entrada.    |
| 04 · Triagem          | Deduplica ocorrências e classifica impacto operacional e urgência objetiva. | Compliance Case.                                  |
| 05 · Investigação     | Agente busca marcações, rubricas, compensações e regras.                    | Dossiê com evidências e lacunas.                  |
| 06 · Revisão humana   | DP/jurídico valida fatos e interpretação.                                   | Aprovar, corrigir, descartar ou escalar.          |
| 07 · Regularização    | Encaminha ações autorizadas e recebe confirmação dos sistemas.              | Log de remediação.                                |
| 08 · Revalidação      | Reexecuta verificação após correção.                                        | Caso resolvido, pendente ou reaberto.             |

## 2.2 Objeto principal: Compliance Case

A unidade central do produto deve ser o caso de compliance, e não uma notificação solta. O caso contém tipo de obrigação, vínculo ou unidade afetada, competência, regra aplicada, severidade operacional, estado de investigação, evidências imutáveis, conclusão, responsável, ação recomendada, aprovação e verificação posterior. O caso distingue explicitamente: indício; irregularidade confirmada; falso positivo; falta de dados; e exceção juridicamente fundamentada.


> **DEFINIÇÃO DA PROPOSTA**
>
> System of Record: RH/folha/ponto do cliente. System of Control: nossa plataforma. System of Action: workflow humano e integrações autorizadas para corrigir e comprovar o resultado.


# 3. Pilar 01 — Employee Intelligence

## 3.1 O problema que resolve

Sem contexto temporal confiável, uma regra correta pode gerar conclusão errada. Um trabalhador pode ter mudado de unidade, categoria, escala, salário ou instrumento coletivo entre dois meses. O mesmo identificador pode aparecer com formatos diferentes em sistemas distintos. Arquivos podem registrar valores ajustados depois do fechamento, enquanto o contrato original traz outro histórico. Employee Intelligence existe para reconstruir o “estado conhecido do vínculo” em cada período, não para analisar a personalidade ou suposta litigiosidade de indivíduos.

## 3.2 A proposta funcional

O serviço importa, resolve identidade e estrutura fatos relevantes ao contrato de trabalho. Para cada informação, mantém três dimensões: valor, período de validade e proveniência. Quando as fontes se contradizem, o sistema não escolhe silenciosamente uma “verdade”; apresenta conflito de dados, fonte preferencial por campo e necessidade de validação. Isso cria uma base de decisões auditáveis para as verificações seguintes.

## 3.3 Domínio de dados

| **Entidade canônica** | **Campos mínimos para o MVP**                                     | **Por que importa**                                          |
|-----------------------|-------------------------------------------------------------------|--------------------------------------------------------------|
| EmploymentLink        | ID interno, empregador/CNPJ, admissão, situação do vínculo        | Delimita obrigações por empregador e intervalo.              |
| ContractVersion       | Cargo, função, salário, jornada, início/fim da vigência           | Permite reconstituir condições na competência.               |
| ScheduleAssignment    | Escala, turnos, folgas, unidade, vigência                         | Liga o plano de operação ao vínculo.                         |
| TimeEntry             | Data/hora, origem, tipo da marcação, justificativas               | Preserva fatos brutos e ajustes rastreáveis.                 |
| PayrollEvent          | Competência, rubrica, quantidade, valor e status                  | Dá base para reconciliação sem confundir valor com quitação. |
| CollectiveAgreement   | Instrumento, categoria, território, vigência, cláusulas validadas | Determina variações normativas aplicáveis.                   |
| SourceEvidence        | Origem, carimbo de tempo, hash, arquivo/registro, versão          | Suporta auditabilidade e replay.                             |

## 3.4 O que o agente faz e o que deve ser determinístico

- Agente: ajuda a mapear colunas de CSV heterogêneos, explicar inconsistências cadastrais e solicitar arquivos faltantes.

- Serviços determinísticos: normalizam datas/horários, conciliam identificadores, validam tipos e deduplicam eventos por chaves verificáveis.

- Revisão humana: resolve conflito de CNPJ, de enquadramento sindical, de contratos e qualquer alteração que afete direitos ou cálculos.

## 3.5 Diferenciação e riscos

Diferencial pretendido: visão histórica e independente de fornecedor, preservando referência a cada sistema original. O produto pode operar mesmo quando a empresa usa um software para ponto e outro para folha. Essa neutralidade, no entanto, cria um custo de integração significativo e precisa começar por poucas fontes padronizadas. Métrica essencial: cobertura de vínculos com dados suficientes para cada regra, separada do número de vínculos simplesmente importados.


> **CRITÉRIO DE ACEITE DO MVP — PILAR 1**
>
> Com três CSVs sintéticos (colaboradores/contratos, ponto e folha), reconstruir a competência de um vínculo, apontar campos ausentes e demonstrar a origem de cada informação sem inventar dados.


# 4. Pilar 02 — Compliance Detection

## 4.1 O problema que resolve

Ponto, banco de horas e folha geram dados operacionais, mas a conformidade exige comparar fatos com regras aplicáveis e correlacionar sistemas. Uma informação correta isoladamente pode esconder divergência: a marcação de ponto registra horas extras, porém o sistema de folha não apresenta remuneração nem compensação reconhecida. O motor deve encontrar essas diferenças sem emitir sentenças jurídicas automáticas.

## 4.2 Camadas do motor de regras

| **Camada**             | **Papel**                                                             | **Exemplo**                                          |
|------------------------|-----------------------------------------------------------------------|------------------------------------------------------|
| Regra normativa        | Traduz obrigação legal validada para condição testável, com vigência. | Descanso interjornada conforme regime aplicável.     |
| Regra de reconciliação | Compara semântica de dados entre origens.                             | Horas extras apuradas versus rubricas/compensações.  |
| Regra prospectiva      | Compara escala planejada com regra que passará a vigorar.             | Adequação à EC 141/2026 por data de transição.       |
| Regra de qualidade     | Impede conclusões quando faltam dados essenciais.                     | Competência incompleta, ponto sem marcações válidas. |

## 4.3 Como uma regra deve ser modelada

Uma regra executável deveria conter pelo menos: identificador; título; fundamento e referência oficial; versão; início e eventual fim de vigência; população de vínculos à qual se aplica; dados de entrada obrigatórios; predicado verificável; exceções; tratamento de conflito; severidade operacional; e conjunto de testes. O jurídico aprova a interpretação; engenharia garante o cálculo reprodutível. O LLM não decide sozinho o resultado numérico.

## 4.4 Exemplo A — jornada e horas extras

Exemplo didático: a apuração de ponto identifica 12 horas extras em outubro; a folha recebida contém 8 horas de rubricas explicitamente mapeadas. A diferença preliminar é de 4 horas, mas não constitui, por si, prova de não pagamento. O motor precisa verificar data de corte, banco de horas, pagamentos em competência subsequente, retificações e equivalência das rubricas. Se faltar documentação de compensação, cria uma investigação com status “evidência insuficiente”; se houver inconsistência demonstrada, encaminha regularização.

## 4.5 Exemplo B — transição da escala 6×1

A EC 141/2026 foi publicada em 16/10/2026. Em termos gerais, prevê dois dias de repouso semanal remunerado a partir de dois meses da publicação, jornada normal máxima de 42 horas após dois meses e 40 horas após mais doze meses, sem redução salarial. Há regimes compensatórios por negociação coletiva e exceções especificadas no próprio texto: portanto, “seis dias consecutivos” não deve ser tratado automaticamente como infração universal \[3\]\[4\].

| **Marco**              | **Referência para simulação**                                   | **Atenção de implementação**                                   |
|------------------------|-----------------------------------------------------------------|----------------------------------------------------------------|
| Até a primeira etapa   | Avaliar regra vigente e projetar adequação futura.              | Não marcar a nova regra como descumprida antes da vigência.    |
| A partir de 16/12/2026 | 42h semanais e dois dias de repouso, conforme regime aplicável. | Verificar instrumento coletivo, compensações e jornada diária. |
| A partir de 16/12/2027 | 40h semanais, conforme disposições aplicáveis.                  | Revalidar contratos, escala, payroll e exceções.               |

No MVP, trataríamos a escala como “pendência de adequação” quando o contrato futuro entra em conflito com a nova regra, e não como “empregado de alto risco”. Regras especiais e exceções não cobertas pelo protótipo devem resultar em análise humana, nunca em falso “100% compliant”.

## 4.6 Diferenciação e fronteiras

O mercado já possui detecção de incidentes de ponto. Senior documenta interjornada, intrajornada e limites de horas extras, enquanto Sólides e PontoCorp listam verificações preventivas \[9\]\[10\]\[11\]. A oportunidade defensável não é adicionar mais um contador de irregularidades, e sim unir regras temporalmente versionadas, reconciliação entre fornecedores e abertura automática de um caso com caminho claro de investigação.


> **CRITÉRIO DE ACEITE DO MVP — PILAR 2**
>
> Executar um conjunto pequeno de regras testadas sobre dados sintéticos, explicar o motivo de cada finding com inputs e versão da regra, distinguir “indício” de “confirmado” e bloquear conclusões se faltar contexto.


# 5. Pilar 03 — Investigation & Evidence

## 5.1 O problema que resolve

Um alerta não é uma investigação. Na operação real, o analista precisa abrir diversas telas, consultar histórico contratual, examinar ajustes, entender a CCT, conferir rubricas de folha e pedir documentos ao gestor. O terceiro pilar usa um agente com ferramentas delimitadas para reduzir esse esforço, organizar a busca e produzir um dossiê reproduzível. Este é o principal elemento agêntico da proposta e, potencialmente, o seu diferencial mais perceptível ao comprador.

## 5.2 Ferramentas autorizadas do agente

| **Ferramenta**           | **Operação permitida**                                | **Controle obrigatório**                                |
|--------------------------|-------------------------------------------------------|---------------------------------------------------------|
| get_employee_context     | Recuperar vínculo e versões de contrato/escala.       | Escopo pelo tenant e finalidade.                        |
| get_time_evidence        | Consultar marcações, ajustes, ausências e origem.     | Proveniência íntegra e minimização.                     |
| get_payroll_evidence     | Consultar rubricas e competências mapeadas.           | Distinguir cálculo, folha e pagamento efetivo.          |
| get_applicable_rule      | Recuperar regra aprovada, fonte e vigência.           | Nunca substituir interpretação validada por inferência. |
| request_missing_evidence | Criar tarefa para solicitar documento ao responsável. | Sem coletar categorias excessivas de dados.             |
| build_case_dossier       | Gerar relatório estruturado e links para evidências.  | Referência verificável e versão do modelo.              |
| recommend_remediation    | Preparar opções e próximos passos.                    | Sem alteração contratual automática.                    |

## 5.3 Método de investigação

> 1\. Formular hipóteses concorrentes: erro de apuração, compensação válida, mapeamento de rubrica, alteração posterior, falta de documento ou possível descumprimento.
>
> 2\. Executar consultas às ferramentas com justificativa de necessidade e registrar as respostas relevantes, sem reproduzir dados pessoais desnecessários.
>
> 3\. Confrontar hipótese com evidências; não tratar ausência de registro como prova automática de ausência de pagamento.
>
> 4\. Exibir fatores que contradizem a conclusão preliminar, exceções aplicáveis e perguntas pendentes.
>
> 5\. Construir dossiê com classificação operacional: confirmado, não confirmado, falso positivo, inconclusivo ou escalado ao jurídico.
>
> 6\. Encaminhar para responsável e guardar resultado da revisão; após correção, reexecutar a regra que originou o caso.

## 5.4 Anatomia do dossiê

| **Elemento**          | **Conteúdo mínimo**                                                              |
|-----------------------|----------------------------------------------------------------------------------|
| Identificação         | ID, tipo, unidade/empregador, vínculo ou equipe, competência e data de abertura. |
| Questão investigada   | Qual obrigação precisa ser verificada e por quê.                                 |
| Evidências            | IDs dos registros, origem, timestamps, hash/versão e vínculo com o fato.         |
| Fundamento normativo  | Regra versionada, fonte e vigência; exceções não resolvidas.                     |
| Análise e limitações  | Diferenças verificadas, hipóteses descartadas e dados faltantes.                 |
| Conclusão operacional | Status fundamentado, sem declarar decisão jurídica definitiva.                   |
| Ação e responsável    | Remediação proposta, aprovação, prazo e validação do resultado.                  |

## 5.5 Por que isso pode ser defensável

A barreira competitiva não está em adicionar um chatbot. Está em construir um histórico confiável de como certos conflitos entre fontes foram investigados, quais evidências são suficientes, onde os dados falham e como diferentes regras afetam cada cenário. Isso melhora a qualidade do workflow e do controle de evidências; não autoriza usar dados de empregados para perfis de comportamento ou decisões discriminatórias.


> **CRITÉRIO DE ACEITE DO MVP — PILAR 3**
>
> Diante da divergência 12h versus 8h, o agente deve verificar pelo menos duas hipóteses alternativas, produzir dossiê com três referências de origem, reconhecer evidência ausente e pedir revisão humana, sem modificar a folha.


# 6. Panorama competitivo: o que já existe

O benchmarking abaixo compara capacidades anunciadas em páginas públicas de produtos e documentação consultadas em 7/11/2026. Não é auditoria técnica, teste hands-on nem prova de ausência de recursos. “Não comprovado publicamente” significa apenas que a evidência consultada não permitiu confirmar a capacidade descrita.

| **Fornecedor**    | **Capacidade pública relevante**                                                                                          | **Confronto direto com nossa tese**                                                                                                     |
|-------------------|---------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------|
| Tako              | Contexto unificado de colaboradores, folha contínua, fundamentos legais, agente Otto e motor determinístico \[8\].        | Solução forte no sistema integrado; precisamos demonstrar vantagem como auditor independente de ERPs/fornecedores e dossiê transversal. |
| Senior HCM        | Incidentes configuráveis de ponto: interjornada, intrajornada, limite de extras; gestão de ocorrências \[9\].             | Não podemos vender apenas detecção de jornada; precisamos provar melhor investigação multissistema.                                     |
| TOTVS RM / Meu RH | “Pontos de atenção” no espelho de ponto, incluindo marcações faltantes e horas extras autorizadas/não autorizadas \[10\]. | Valor potencial na reconciliação com fontes externas e nos fundamentos/efeitos da divergência.                                          |
| Sólides           | Monitoramento configurável de inconsistências de ponto, interjornada, horas extras e fechamento \[11\].                   | Precisamos reduzir esforço pós-alerta, não repetir painéis de inconsistência.                                                           |
| PontoCorp         | Auditoria anunciada de 16 regras CLT, score de compliance, escalas e alertas \[12\].                                      | Concorrente direto do recorte de jornada; posição proposta é investigação independente, sem score individual de litígio.                |

## 6.1 Onde não devemos tentar competir

Não vale disputar no hackathon profundidade de cálculo de folha, hardware/REP, gestão completa de escalas, aplicação integral da CLT ou cobertura de milhares de CCTs. São produtos e domínios maduros que exigem integração, manutenção jurídica e infraestrutura consideráveis. Um protótipo que prometa todos esses recursos terá baixa credibilidade.

## 6.2 Matriz da diferenciação pretendida

| **Critério de diferenciação**                  | **Já existe no mercado?**                                        | **Nossa aposta**                                           |
|------------------------------------------------|------------------------------------------------------------------|------------------------------------------------------------|
| Alertas de interjornada / extras               | Sim, em múltiplos fornecedores.                                  | Não usar como diferencial isolado.                         |
| Regras legais explicáveis                      | Sim, em parte; Tako enfatiza rastreabilidade.                    | Explicação com fontes e versão em ambiente independente.   |
| Auditoria multissistema                        | Depende do produto e integrações; não presumir inexistência.     | Conectores e reconciliação com modelos canônicos.          |
| Agente investigador com hipóteses e evidências | Não comprovamos cobertura equivalente nos materiais consultados. | Validar em demos competitivas; transformar em MVP central. |
| Correção verificada no workflow                | Fornecedores já têm tratamentos operacionais.                    | Dossiê + aprovação + replay da regra no pós-correção.      |

## 6.3 O possível moat

Quatro ativos podem produzir diferenciação cumulativa: (i) conectores confiáveis e normalização semântica entre fornecedores; (ii) catálogo de regras temporais com validação jurídica; (iii) biblioteca de padrões de investigação e fontes de evidência; e (iv) workflow de resolução com dados de qualidade e de falso positivo. Cada ativo depende de execução e adoção real; nenhum é um monopólio ou barreira comprovada neste estágio.

# 7. Arquitetura proposta e governança

## 7.1 Separação por responsabilidades

| **Componente**          | **Tecnologia/lógica**                                       | **Motivo**                                               |
|-------------------------|-------------------------------------------------------------|----------------------------------------------------------|
| Conectores e importação | CSV + adaptadores, validação de esquema, jobs idempotentes. | Retirar o escopo de integração do agente conversacional. |
| Employee Context Store  | Banco relacional temporal; referências às fontes.           | Consultas consistentes e isolamento por cliente.         |
| Rule Registry           | Regras versionadas, fontes normativas, testes e aprovação.  | Reprodução dos resultados.                               |
| Detection Engine        | Código determinístico/eventos e jobs periódicos.            | Precisão em datas, horários e cálculos.                  |
| Case Manager            | Máquina de estados, SLA, responsáveis e histórico.          | Continuidade operacional e handoff.                      |
| Investigator Agent      | LLM com ferramentas read-only e output tipado.              | Busca dinâmica de evidência e síntese explicável.        |
| Audit & Security        | RBAC/ABAC, criptografia, logs, retenção, auditoria.         | Proteção de dados e governança empresarial.              |

## 7.2 Estados de Compliance Case

Detected → Investigating → Awaiting Review → Remediation Planned → In Remediation → Verification → Resolved. Saídas alternativas: False Positive, Insufficient Evidence, Escalated to Legal e Reopened. Cada transição deve registrar ator, motivo, horário e evidência. Casos com impacto financeiro ou alteração contratual não podem executar writes sem aprovação contextual.

## 7.3 Controles mínimos de LGPD

A finalidade deve ser cumprimento de obrigações e proteção de direitos dos trabalhadores, não vigilância individual ou triagem de propensão ao litígio. Empregar minimização, perfis de acesso separados (DP, jurídico, SST), retenção definida, registro de acesso, isolamento de tenants e avaliação do papel controlador/operador. A ANPD recomenda avaliar RIPD em hipóteses de tratamento de alto risco, especialmente quando dados sensíveis e decisões com impacto significativo se combinam \[14\].

Na primeira versão, excluir dados médicos, transcrição de conversas privadas, denúncias nominativas e avaliações de personalidade. Não produzir rankings de empregados “arriscados”. Uma análise coletiva de jornada pode apontar padrões de sobrecarga por processo ou unidade, sem criar rótulos sobre pessoas.

## 7.4 Gestão de mudanças legais

Legislação e convenções variam ao longo do tempo. O catálogo precisa guardar texto de origem, interpretação validada, vigência, exceções e testes. Fontes iniciais: Constituição/EC 141 \[4\], CLT, eSocial \[6\], Sistema Mediador \[7\] e normas técnicas pertinentes. A NR-1 passou a incorporar explicitamente riscos psicossociais relacionados ao trabalho no GRO a partir de maio de 2026, mas esse domínio deve permanecer fora do MVP por exigir metodologia de SST e cuidados extras com dados \[13\].

# 8. MVP do hackathon: uma demonstração vertical

## 8.1 Escopo

O produto mínimo deve demonstrar integralmente os três pilares em um único fluxo: auditoria de jornada e conciliação ponto × folha, com uma visualização prospectiva de adequação à EC 141/2026. Não é necessário ter integração real com eSocial, cálculo completo de rubricas ou edição de contratos. Dados sintéticos são suficientes e mais seguros para demonstração.

| **Incluir no MVP (P0)**                                                          | **Não incluir nesta etapa**                               |
|----------------------------------------------------------------------------------|-----------------------------------------------------------|
| Upload de 3 CSVs: contratos, ponto e folha.                                      | APIs de todos os fornecedores; integração eSocial real.   |
| Modelo canônico com proveniência e validação de dados.                           | Histórico completo de todos os vínculos e CCTs do Brasil. |
| Três regras objetivas: interjornada, extras x folha, adequação futura à jornada. | Motor amplo de todas as verbas trabalhistas.              |
| Agente que investiga 1 divergência e produz dossiê estruturado.                  | Agente que efetua alteração autônoma da folha.            |
| Dashboard de casos, status e revisão humana.                                     | Previsão judicial ou cálculo de chance de processo.       |

## 8.2 Roteiro de demonstração

> 1\. Abrir empresa sintética com 100 vínculos; importar contratos, ponto e folha e mostrar cobertura de dados.
>
> 2\. Rodar auditoria; encontrar uma divergência de 4h entre ponto e rubrica da folha e uma escala que exige adaptação futura à nova regra.
>
> 3\. Abrir o caso; demonstrar o agente usando ferramentas para consultar contrato, marcações, rubricas e regra vigente.
>
> 4\. Mostrar duas hipóteses testadas (compensação em banco; rubrica de pagamento correspondente) e registrar a falta ou presença de evidência.
>
> 5\. Gerar dossiê com rastreabilidade, situação inconclusiva/confirmada conforme os dados da demo, e recomendação ao DP.
>
> 6\. Realizar correção simulada sob aprovação e reprocessar a regra, encerrando o caso quando a divergência foi de fato sanada.

## 8.3 Indicadores de sucesso do hackathon e piloto

| **Métrica**                   | **Definição**                                                 | **Uso**                                     |
|-------------------------------|---------------------------------------------------------------|---------------------------------------------|
| Cobertura auditável           | Vínculos com dados suficientes / vínculos relevantes.         | Evita falsos “todos analisados”.            |
| Precisão do finding           | Casos confirmados / casos revisados.                          | Mede falso positivo e utilidade da triagem. |
| Tempo de investigação         | Minutos de análise manual vs. assistida em casos comparáveis. | Valida economia operacional.                |
| Qualidade de evidência        | % de dossiês com fontes, regra e lacunas explícitas.          | Valida confiança e auditoria.               |
| Resolução antes do fechamento | Pendências regularizadas antes de marco operacional.          | Demonstra valor preventivo.                 |

## 8.4 Critérios de “demo pronta”

A demonstração estará pronta se: importar dados sem erro silencioso; detectar casos sintéticos esperados; justificar cada alerta com valores e regra; mostrar quando não há informação suficiente; citar pelo menos duas fontes de evidência por caso; realizar handoff humano; e revalidar a correção de um caso. Não usar “taxa de acurácia 99%” sem experimento de validação independente.

# 9. Estratégia de entrada e modelo de negócio

## 9.1 Cliente inicial

Hipótese de ICP: empresas brasileiras com 100 a 3.000 empregados, operações em turnos, múltiplas unidades e fornecedores distintos de ponto e folha. Varejo alimentar, serviços operacionais, logística e indústria são candidatos para entrevistas, porque a gestão de escala e horas representa um processo frequente. Esse recorte é hipótese estratégica e não segmentação validada por pesquisa primária.

## 9.2 Estratégia de aquisição

Wedge: diagnóstico de adequação de jornada após EC 141/2026, acompanhado de auditoria de ponto × folha. Land: importar dados e demonstrar achados verificáveis em uma ou duas unidades. Expand: oferecer auditoria recorrente, férias, rescisão, FGTS e instrumentos coletivos. A tese é que uma mudança legal com prazo cria motivo de compra inicial, enquanto a rotina de investigação sustenta a retenção.

## 9.3 Monetização a testar

Modelo exploratório: implantação/configuração + assinatura por faixas de vínculos efetivamente auditados e módulos de processo. Custos de conectores ou regras específicas podem ser separados. Não fixamos preço sem descobrir a economia operacional real, o esforço de implantação, a alternativa atual e a disposição a pagar. Evitar monetizar por volume bruto de alertas, pois incentivaria falsos positivos.

## 9.4 Perguntas de customer discovery

- Em uma competência recente, quantas horas a equipe gastou investigando divergências entre ponto e folha?

- Quais situações são resolvidas no sistema atual e quais exigem exportação ou múltiplas telas?

- Quem valida a CCT aplicável e como suas versões são atualizadas nas regras de jornada?

- O que acontece com um incidente que está aberto quando a folha precisa fechar?

- Qual prova documental seria necessária para o jurídico confiar em um dossiê produzido por IA?

- Qual orçamento e contrato suportariam um piloto de auditoria independente dos sistemas atuais?

# 10. Riscos, dependências e decisões

| **Risco**                              | **Consequência**                           | **Mitigação no design**                                               |
|----------------------------------------|--------------------------------------------|-----------------------------------------------------------------------|
| Regra jurídica incorreta ou incompleta | Falso positivo/negativo; decisão indevida. | Aprovação jurídica, versões, testes e estado inconclusivo.            |
| Dados incompletos ou conflitantes      | Conformidade aparente sem evidência.       | Métricas de cobertura, source-of-truth por campo, lacunas explícitas. |
| LLM alucinar norma ou prova            | Dossiê não confiável.                      | Ferramentas fechadas, IDs de evidência, verificações tipadas.         |
| Já existir solução no cliente          | Baixa disposição a pagar.                  | Pilotos comparativos de tempo e qualidade de resolução.               |
| Resistência de integração              | Custo alto de onboarding.                  | CSV primeiro; conectores priorizados por ICP.                         |
| Uso para vigilância laboral            | Risco LGPD e dano ao trabalhador.          | Proibir scores individuais e decisões adversas automáticas.           |
| Escopo excessivo de hackathon          | MVP incompleto.                            | Um fluxo de ponta a ponta, três regras, uma investigação profunda.    |


> **DECISÃO DE PRODUTO RECOMENDADA**
>
> Aprovar os três pilares como arquitetura lógica da startup e demonstrar no hackathon um único processo vertical: conciliação de jornada, folha e adequação futura de escalas. O foco competitivo deve ser investigação comprovável e resolução, não o número de agentes ou de dashboards.


# 11. Próximos passos recomendados

> 1\. Definir o contrato de importação dos três CSVs e os identificadores estáveis por vínculo, competência e empresa.
>
> 2\. Escrever o esquema de LegalRule/ComplianceCase e três regras com casos normais, exceções e resultados esperados.
>
> 3\. Construir a ferramenta de investigação com leitura estritamente delimitada dos dados e saída tipada de dossiê.
>
> 4\. Validar o fluxo com 3–5 profissionais de DP/jurídico por entrevistas qualitativas, sem usar dados reais no hackathon.
>
> 5\. Preparar benchmark hands-on dos concorrentes: verificar se suas funcionalidades já resolvem o mesmo caso e em quanto tempo.
>
> 6\. Definir métricas de piloto antes de prometer impacto financeiro ou redução de litígios.

# Fontes e referências

Referências públicas consultadas em 7/11/2026. A fonte de cada afirmação factual relevante está indicada no corpo do documento. Materiais de fornecedores descrevem capacidades anunciadas e não constituem validação independente.

**\[1\] CNJ / TST — Julgamentos na Justiça do Trabalho superaram 4 milhões em 2024 (dados de casos novos e recursos).**  
https://www.cnj.jus.br/julgamentos-na-justica-do-trabalho-superaram-4-milhoes-em-2024/

**\[2\] MTE — Sabesp é autuada em 116 infrações trabalhistas após fiscalização (26/10/2026).**  
https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2026/outubro/sabesp-e-autuada-em-116-infracoes-trabalhistas-apos-fiscalizacao-sobre-programas-de-desligamento/

**\[3\] Senado — Congresso promulga o fim da escala 6×1 (16/10/2026); estimativa de 14,9 milhões em escala 6×1.**  
https://www12.senado.leg.br/noticias/materias/2026/10/16/congresso-promulga-o-fim-da-escala-6x1-e-aposentadoria-de-agentes-de-saude

**\[4\] Câmara — Emenda Constitucional nº 141, de 16/10/2026, publicação original.**  
https://www2.camara.leg.br/legin/fed/emecon/2026/emendaconstitucional-141-16-outubro-2026-800062-publicacaooriginal-181622-pl.html

**\[5\] TST — Relatório Geral da Justiça do Trabalho 2024 (assuntos recorrentes na 1ª instância).**  
https://www.tst.jus.br/documents/18640430/34512629/RGJT2024.pdf/7f5ecde5-24ee-25c0-bf00-6e3d0b426827?t=1751303940403

**\[6\] eSocial — Documentação técnica e manual web geral; evento S-2206.**  
https://www.gov.br/esocial/pt-br/empresas/manual-web-geral

**\[7\] MTE — Registro de Convenções e Acordos Coletivos; Sistema Mediador.**  
https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/mediacao/registro-de-convencoes-e-acordo-coletivo-de-trabalho

**\[8\] Tako — Payroll & People Ops / visão de produto (informação autodeclarada).**  
https://tako.ai/pt/products/payroll/

**\[9\] Senior — Gestão de incidentes de ponto e incidentes configuráveis (documentação).**  
https://documentacao.senior.com.br/gestao-de-pessoas-hcm/6.10.4/informacoes-adicionais/rotinas/gpo/gestao-incidentes-ponto/

**\[10\] TOTVS — Pontos de Atenção no espelho de ponto, Meu RH / RM.**  
https://centraldeatendimento.totvs.com/hc/pt-br/articles/4446293438743-RH-RM-Meu-RH-Pontos-de-Aten%C3%A7%C3%A3o-no-espelho-de-ponto

**\[11\] Sólides — Configurações e inconsistências de ponto; fechamento.**  
https://ajuda.solides.com.br/hc/pt-br/articles/34520511975821-Configura%C3%A7%C3%B5es-gerais-de-ponto-quais-s%C3%A3o-e-como-ajust%C3%A1-las

**\[12\] PontoCorp — Score de risco trabalhista e auditoria preventiva CLT (informação autodeclarada).**  
https://www.pontocorp.com/funcionalidades/auditoria-risco-trabalhista-ia

**\[13\] MTE — Norma Regulamentadora nº 1; atualização do GRO em 26/05/2026.**  
https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1

**\[14\] ANPD — Relatório de Impacto à Proteção de Dados Pessoais, critérios de alto risco.**  
https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd

**\[15\] MTE — FGTS Digital e recolhimentos em processos trabalhistas a partir de 01/05/2026.**  
https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital

**\[16\] CNJ — Justiça em Números 2026, ano-base 2025 (panorama do Judiciário, não apenas Justiça do Trabalho).**  
https://www.cnj.jus.br/justica-em-numeros-2026-estoque-de-processos-cai-em-ano-de-maior-demanda-da-serie-historica/
