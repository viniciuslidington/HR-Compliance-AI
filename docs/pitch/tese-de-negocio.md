# Tese de negócio

8 de novembro de 2026 · Documento de referência para o pitch e para o critério "viabilidade de virar negócio".

**Pitch:** *Admissão que se resolve sozinha. E documentos que continuam em dia.*

## 1. A tese em uma frase

Um agente que é dono da pendência documental do trabalhador, da admissão ao último dia de vínculo: pede, lê, confere,
recusa com motivo, cobra, escala só as exceções e, quando um documento vence, cobra a renovação até ele estar válido de novo.

## 2. Como o produto funciona

| Camada | O que é | Exemplo |
|---|---|---|
| **Catálogo base** | Documentos genéricos de qualquer admissão, que o agente já sabe ler e conferir, cada um com campos, regras em código e instrução para o colaborador | RG/CNH, CPF, comprovante de residência, dados bancários, declaração de matrícula |
| **Modelos da empresa** | O cliente monta seus modelos de admissão por cargo ou tipo de contrato: parte do catálogo base e acrescenta os documentos específicos do seu negócio | "CLT padrão", "Estágio"; numa empresa de energia, "Eletricista" = básicos + ASO + NR-10 + NR-35 |
| **Agente de admissão** | Conduz a coleta pelo WhatsApp até o cadastro no sistema de destino; o RH só vê as exceções | Recusa "o comprovante é de março; preciso de um emitido nos últimos 90 dias" |
| **Renovação** | Documentos com validade voltam a ser cobrados antes de vencer; se ninguém renova, o DP recebe um card de impedimento | CNH, matrícula do estagiário a cada semestre; na empresa de energia, NR-35 bienal e ASO periódico |

O agente não decide o checklist, ele executa o que a empresa configurou. Não decide contratação, não bloqueia escala e
não aprova sozinho um documento suspeito.

## 3. Problema

- **Volume:** 26,6 milhões de admissões CLT em 2025, cerca de 73 mil por dia, sobre um estoque de 48,5 milhões de
  vínculos (MTE, Novo Caged). No comércio, cerca de 25 admissões por vaga líquida criada: a dor é reposição contínua.
- **Prazo legal:** o registro do empregado no eSocial (S-2200) vence na véspera do primeiro dia; sem ele, multa de
  R$ 3.000 por empregado (CLT, art. 47).
- **Trabalho manual:** documentos chegam ilegíveis, incompletos ou vencidos, e o RH vira cobrador. Times de RH têm em
  média duas pessoas e acumulam o DP em 61% a 68% das empresas (pesquisa Sólides).
- **Depois da admissão o problema continua:** documentos com validade vencem. Sem NR-35 em dia, ninguém sobe em altura;
  estágio sem matrícula atestada vira vínculo de emprego (Lei 11.788, art. 3º, § 2º). Ferramentas de SST avisam o
  vencimento, mas o alerta para aí.

## 4. Diferencial

O mercado de admissão digital segue um padrão: portal ou link com upload, OCR ou IA para conferir, e um humano que valida.

| Concorrente | O que faz | O que não mostra publicamente |
|---|---|---|
| Flash | Coleta com IA pelo WhatsApp desde 02/02/2026; Série D de R$ 150 mi | O RH valida os documentos; sem cobrança autônoma nem explicação da recusa |
| Gupy | IA + especialistas com SLA de até 120 min; confere com o eSocial | Validação dentro da plataforma, com humano; WhatsApp como complemento pago |
| Senior, Sólides | OCR com conferência pelo RH, documento a documento | Agente que conduz a coleta |
| Ferramentas de SST | Alertam vencimento de ASO e treinamentos | Ninguém conduz a renovação até o documento novo estar válido |

Nosso diferencial são quatro coisas juntas:

1. **Modelos por cargo, com os documentos de cada negócio.** A empresa acrescenta ao catálogo base o que o seu setor
   exige (ex.: NR-35 numa empresa de energia), e o mesmo agente lê e confere tudo com regras em código.
2. **Autonomia até o fim.** Explica a recusa no chat, cobra com intensidade crescente e escala só as exceções.
3. **Renovação durante o vínculo.** A admissão é o começo do relacionamento, não o fim.
4. **Neutralidade de sistema.** Cadastra em qualquer folha ou ERP, não só no próprio.

Isso é ausência de evidência pública nos concorrentes, não prova de ausência. Nada impede um incumbente de copiar;
a aposta é foco, velocidade e o histórico de recusas por documento, emissor e motivo que o produto acumula.

## 5. Mercado

| Camada | Conta | Valor por ano |
|---|---|---|
| **Tamanho do problema** | 26,66 mi admissões × R$ 150 (contador) | **R$ 4,0 bilhões** |
| **TAM** | 26,66 mi admissões CLT em 12 meses × R$ 10 | **R$ 267 milhões** (R$ 187 mi a R$ 373 mi com R$ 7 a R$ 14) |
| **SAM** | 68,0% das admissões em setores de alto giro = 18,14 mi × R$ 10 | **R$ 181 milhões** (R$ 127 mi a R$ 254 mi) |
| **SOM (ano 3)** | 400 clientes pelos planos | **R$ 1,9 milhão** |

Fora do TAM: a renovação (cada 1 milhão de colaboradores monitorados a R$ 0,50/mês soma R$ 6 milhões por ano) e o
estágio, que não aparece no Caged.

### Volume

26.658.253 admissões CLT nos últimos 12 meses (ago/2025 a jul/2026), pelo
[Novo Caged, Sumário Executivo de jul/2026](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/estatisticas-trabalho/novo-caged/2026/julho/sumario-executivo_julho-de-2026.pdf).
Para o SAM, usamos a participação dos setores de alto giro em 2025: comércio, alimentação, transporte, serviços
administrativos, saúde e educação fizeram 18.100.778 das 26.599.698 admissões do ano, ou 68,0%
([Novo Caged, dez/2025](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/estatisticas-trabalho/novo-caged/2025/dezembro/sumario-executivo_-acumulado-e-dezembro-2025.pdf), Tabela 1).

### Como chegamos em R$ 10 por admissão

Ninguém publica preço por admissão de um agente como o nosso. Triangulamos quatro referências:

| Como a admissão é feita hoje | Preço por admissão | Fonte |
|---|---|---|
| Ferramenta de admissão: o colaborador preenche, o RH cobra e confere | R$ 2,49 a R$ 6 | [Admita Fácil](https://admita-facil.app.br/) (R$ 99 por 20 admissões; R$ 249 por 100), [IOB Abordo](https://iob.com.br/abordo/) (R$ 119,90 com 20 admissões, incluindo holerite) |
| **Nós: o agente pede, confere, recusa com motivo, cobra e escala** | **≈ R$ 10** | Nossos planos: de R$ 7,48 a R$ 11,46 por admissão realizada nos exemplos |
| 30 minutos de analista de DP | R$ 17 | Custo-hora de R$ 34,36 com encargos ([relatório](pesquisa/relatorio-admissao.md), seção 12.5) |
| Contador fazendo a admissão | R$ 150 | [FECONTABIL-RS](https://fecontabil.org.br/pdfs/Tabela_de_Honorarios.pdf), honorários mínimos 2026: "Admissão por empregado" = 1 UHC = R$ 150 |

Nos EUA a proporção é a mesma: US$ 7,95 por formulário de admissão feito no software e US$ 84,95 terceirizado
([Equifax Forms HQ](https://workforce.equifax.com/forms-hq-plans)).

Por que R$ 10:

1. **É o preço que cobramos.** Nos exemplos dos planos, a admissão realizada sai entre R$ 7,48 e R$ 11,46.
2. **Acima das ferramentas**, porque fazemos o trabalho que elas deixam para o RH: cobrar, explicar a recusa, escalar só
   as exceções e, depois, renovar.
3. **Abaixo do valor do trabalho removido:** menos que 30 minutos de analista e 15 vezes menos que o contador.
4. **Sensibilidade:** de R$ 7 (menor preço dos planos) a R$ 14.

Os R$ 150 do contador ficam como **tamanho do problema**, não como TAM: são um honorário mínimo de um estado, e nem
toda admissão é feita por contador.

### SOM, de baixo para cima

| Plano | Clientes no ano 3 | Admissões/mês (média) | Receita/mês | Receita/ano |
|---|---|---|---|---|
| Essencial | 250 | 10 | R$ 149 | R$ 447 mil |
| Profissional | 120 | 42 | R$ 520 (com excedentes e renovação) | R$ 749 mil |
| Corporativo | 30 | 200 | R$ 2.000 | R$ 720 mil |
| **Total** | **400** | ≈ 162 mil admissões/ano | | **≈ R$ 1,9 milhão** |

São 0,9% das admissões do SAM e 0,013% dos 3,0 milhões de empresas com empregados
([IBGE, CEMPRE 2024](https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/e1be87301fe780c6ccf8aeab200e71ea.pdf)).
O número de clientes e as médias de admissões são metas nossas.

### Se o investidor perguntar

> **"Quanto vale uma admissão?"** Com ferramenta, a empresa paga de R$ 2,50 a R$ 6 e o RH continua fazendo o trabalho.
> Com contador, paga R$ 150. Nós cobramos cerca de R$ 10: acima da ferramenta, porque o agente faz o trabalho, e 15
> vezes abaixo do contador. Nos EUA é a mesma proporção: US$ 8 no software, US$ 85 terceirizado.

> **"De onde vem o TAM?"** São 26,7 milhões de admissões CLT em 12 meses, pelo Novo Caged de julho de 2026, vezes
> R$ 10: R$ 267 milhões por ano. Se todas fossem feitas por contador, custariam R$ 4 bilhões. Esse é o tamanho do
> problema, e nós capturamos uma fração dele.

> **"E o SAM e o SOM?"** Os setores de alto giro fazem 68% das admissões: R$ 181 milhões. No ano 3, 400 clientes pelos
> nossos planos somam R$ 1,9 milhão, menos de 1% das admissões do SAM, sem contar a renovação.

> **"Por que não cobrar R$ 150, como o contador?"** O contador também faz a folha, o eSocial e responde pelo cliente.
> Nós tiramos a parte manual da coleta e da conferência. R$ 10 nos coloca na faixa de software e facilita a compra,
> inclusive para o próprio contador revender.

## 6. Modelo de negócio

Tudo o que é preço ou meta é hipótese até o piloto e as cotações confirmarem a disposição a pagar. Pesquisa de preços e
custo medido em [pesquisa/notas/precos_e_custos.md](pesquisa/notas/precos_e_custos.md).

### Business Model Canvas

#### Visão geral

| Parcerias-chave | Atividades-chave | Proposta de valor | Relacionamento | Segmentos de clientes |
|---|---|---|---|---|
| BSP do WhatsApp (Meta) · Provedores de LLM · Sistemas de folha e ERP · Escritórios contábeis e BPOs de DP · Validação de autenticidade (Serpro Datavalid, Unico) | Manter catálogo e regras atualizados com a lei · Operar o agente · Integrar com folhas · Medir acurácia · Vender e conduzir pilotos | Admissão que se resolve sozinha: o agente pede, lê, confere, recusa com motivo, cobra e cadastra · Documentos em dia durante o vínculo · O RH só vê exceções | Piloto acompanhado · Autoatendimento no painel · Sucesso do cliente com métricas mensais | Médias empresas de alto giro · Programas de estágio · Empresas com cargos regulados · Escritórios contábeis e BPOs de DP |
| | **Recursos-chave** | | **Canais** | |
| | Agente (leitura em dois passos, regras em código) · Catálogo e regras versionadas · Histórico de recusas por documento e motivo · Conhecimento de CLT, eSocial e LGPD | | Venda direta · Escritórios contábeis · Integrações com folha (marketplaces) · Conteúdo sobre eSocial e admissão | |

| Estrutura de custos | Fontes de receita |
|---|---|
| LLM (visão e texto) · Mensagens do WhatsApp · Infraestrutura e armazenamento com LGPD · Revisão humana de exceções e suporte · Vendas · Desenvolvimento · Jurídico e compliance | Assinatura mensal com franquia de admissões · Admissões excedentes · Renovação por colaborador monitorado · Complementos (autenticidade, integração) · Implantação no plano Corporativo |

#### 1. Segmentos de clientes

| Segmento | Por que tem a dor | Papel |
|---|---|---|
| **Médias empresas de alto giro** (varejo, alimentação, serviços, terceirização, 100 a 3.000 empregados) | Comércio fez cerca de 25 admissões por vaga líquida criada em 2025; RH com média de duas pessoas acumulando o DP | Cliente principal |
| **Programas de estágio** | Pico sazonal (o CIEE projetou 68,2 mil vagas até fev/2026); matrícula vence a cada semestre e, sem ela, o estágio vira vínculo de emprego | Entrada rápida, com renovação natural |
| **Empresas com cargos regulados** (energia, construção, manutenção) | Documento vencido tira a pessoa de campo (sem NR-35, ninguém sobe em altura) | Maior valor por colaborador na renovação |
| **Escritórios contábeis e BPOs de DP** | Fazem a admissão de dezenas de PMEs com equipe enxuta | Canal para PMEs e cliente com volume |

Quem usa: RH e DP no painel; o novo colaborador pelo WhatsApp. Quem compra: liderança de RH/DP ou operações.

#### 2. Proposta de valor

**Para o RH e o DP**
- Para de correr atrás de documento: o agente pede, cobra e explica cada recusa.
- Só vê exceções: 3 recusas seguidas, prazo em risco, suspeita ou pergunta fora do escopo.
- Cada empresa monta seus modelos por cargo, acrescentando ao catálogo base os documentos do seu negócio.
- Documentos que vencem voltam a ser cobrados; se ninguém renova, recebe um card de impedimento.

**Para a empresa**
- Cadastro pronto antes da véspera do início, o prazo do eSocial (multa de R$ 3.000 por empregado sem registro).
- Menos risco de trabalhador em campo com documento vencido.
- Funciona com a folha que a empresa já usa.

**Para o colaborador**
- Tudo pelo WhatsApp, sem app novo; quando algo é recusado, sabe exatamente o que corrigir.

#### 3. Canais

| Fase | Canal |
|---|---|
| Aquisição | Venda direta para RH e DP; indicação de escritórios contábeis; conteúdo sobre eSocial, admissão e LGPD |
| Avaliação | Piloto de 30 dias com métricas medidas (ver planos) |
| Entrega | Painel web para o RH; WhatsApp para o colaborador |
| Expansão | Integrações com sistemas de folha; marketplaces de RH (hipótese) |

#### 4. Relacionamento com clientes

- **Piloto acompanhado:** configuração dos modelos junto com o cliente e relatório de antes e depois.
- **Autoatendimento:** o RH cria admissões, ajusta modelos e resolve escalações sozinho no painel.
- **Sucesso do cliente:** relatório mensal com tempo até o cadastro, taxa de recusa por motivo, escalações e renovações
  feitas antes do vencimento.

#### 5. Fontes de receita (hipótese; preços em [Planos de assinatura](#planos-de-assinatura))

| Fonte | Natureza |
|---|---|
| Assinatura mensal com franquia de admissões | Recorrente |
| Admissões acima da franquia | Variável, cresce com a dor |
| Renovação por colaborador monitorado | Recorrente durante todo o vínculo |
| Complementos: validação de autenticidade, integração com folha | Por uso ou por implantação |
| Implantação no plano Corporativo | Pontual |

#### 6. Recursos-chave

- **O agente:** leitura em dois passos (modelo de visão transcreve, modelo de texto extrai), guarda de fidelidade e regras
  em código. Já existe no worker.
- **Catálogo e regras versionadas:** campos, validações e instruções de cada documento.
- **Histórico de recusas** por documento, emissor e motivo: melhora o produto com o uso e é difícil de copiar.
- **Conhecimento de domínio:** CLT, eSocial, Lei do Estágio, LGPD, normas regulamentadoras.
- **Equipe** de produto, IA e operação.

#### 7. Atividades-chave

- Manter catálogo e regras alinhados com a legislação.
- Operar o agente e medir a acurácia de leitura (meta: falso aceite zero).
- Construir e manter integrações com sistemas de folha.
- Revisar exceções quando o cliente contratar esse apoio.
- Vender e conduzir pilotos.

#### 8. Parcerias-chave

| Parceiro | Para quê |
|---|---|
| BSP do WhatsApp (Meta) | Envio de mensagens, templates de utilidade, número verificado |
| Provedores de LLM | Leitura e redação; contrato com cláusulas-padrão da ANPD ou região adequada |
| Sistemas de folha e ERP | Destino do cadastro; canal de venda |
| Escritórios contábeis e BPOs de DP | Canal para PMEs |
| Serpro Datavalid, Unico | Validação de autenticidade (complemento) |
| Clínicas de SST e centros de treinamento | Encaminhar a renovação de ASO e NRs (hipótese, a validar) |

#### 9. Estrutura de custos

| Custo | Ordem de grandeza |
|---|---|
| LLM + WhatsApp por admissão | ≈ R$ 0,50 a R$ 2,00, perto de R$ 1 no cenário médio (≈ 3.500 tokens medidos por documento) |
| Renovação por colaborador | ≈ R$ 0,02 a R$ 0,05 por mês |
| Mensagem de utilidade do WhatsApp | ≈ US$ 0,0068 cada no Brasil |
| Validação de autenticidade (se contratada) | ≈ R$ 2,48 por pessoa (preço do Serpro de 2019) |
| Revisão humana e suporte | Principal risco de margem; depende da taxa de escalação |
| Infraestrutura, armazenamento e segurança | Fixo, cresce com o volume |
| Vendas, desenvolvimento, jurídico | Fixo |

Fontes dos números: [pesquisa/notas/precos_e_custos.md](pesquisa/notas/precos_e_custos.md) e
[pesquisa/relatorio-admissao.md](pesquisa/relatorio-admissao.md), seção 12.5.

### Planos de assinatura

#### De onde vêm os números

| Referência | Valor | Como usamos |
|---|---|---|
| Convenia Ágil (diretório, admissão, desligamento, relatórios) | R$ 14 por colaborador/mês | Teto: a admissão é um de quatro módulos de um pacote desse preço |
| Sólides, plano de entrada | A partir de R$ 1,90 por colaborador/mês | Nosso preço tem de ficar bem abaixo disso por colaborador |
| Bevart, software de SST com vencimento de ASO e NRs | R$ 0,31 a R$ 1,63 por vida/mês | Faixa para a renovação |
| Nosso custo por admissão (medido + estimado) | R$ 0,50 a R$ 2,00, perto de R$ 1 no cenário médio | Piso; margem bruta acima de 80% |
| Nosso custo de renovação | R$ 0,02 a R$ 0,05 por colaborador/mês | Margem acima de 90% |
| Valor para o cliente | R$ 17 a cada 30 min de analista poupados | O preço por admissão fica abaixo disso |

**Resultado:** a admissão sai por **R$ 7 a R$ 10** cada, e a renovação por **R$ 0,50 por colaborador/mês**. Numa
empresa de alto giro, o total fica entre R$ 0,30 e R$ 0,60 por colaborador/mês, uma fração do que se paga por uma suíte.

#### Princípios

1. **Cobrar pelo que resolve a dor.** A unidade é a admissão concluída, não o reenvio nem a mensagem.
2. **Receita previsível.** Mensalidade com franquia de admissões; o que passa da franquia é cobrado por admissão.
3. **Renovação recorrente.** Por colaborador monitorado por mês, enquanto durar o vínculo.
4. **Entrada sem atrito.** Um plano grátis para quem admite pouco; o custo dele é de poucos reais por mês.

#### Planos

| | **Grátis** | **Essencial** | **Profissional** | **Corporativo** |
|---|---|---|---|---|
| Para quem | Pequenas empresas, teste | Empresas com poucas admissões | Médias empresas de alto giro | Grandes operações, vários CNPJs |
| Mensalidade | R$ 0 | **R$ 149** | **R$ 449** | A partir de R$ 1.500 |
| Admissões incluídas por mês | 3 | 15 | 60 | Negociado |
| Preço efetivo por admissão | — | R$ 9,93 | R$ 7,48 | Negociado |
| Admissão excedente | — | R$ 9 | R$ 7 | Negociado |
| Catálogo base (RG/CNH, CPF, comprovante, dados bancários, matrícula) | ✓ | ✓ | ✓ | ✓ |
| Modelos de admissão | 1 | 3 | Ilimitados | Ilimitados |
| Documentos específicos da empresa (ex.: ASO, NR-10, NR-35) | — | — | ✓ | ✓ |
| Agente no WhatsApp: coleta, recusa com motivo, cobrança, escalação | ✓ | ✓ | ✓ | ✓ |
| Cadastro no sistema de destino | Exportação | Exportação | Integração com 1 sistema de folha | Integrações sob medida |
| Renovação de documentos | — | R$ 0,50 por colaborador/mês | **100 colaboradores incluídos**; acima, R$ 0,50 | Negociado |
| Usuários de RH | 1 | 2 | Ilimitados | Ilimitados, com login corporativo (SSO) |
| Relatório mensal de métricas | — | — | ✓ | ✓ |
| Suporte | Central de ajuda | E-mail | E-mail e chat | Gerente de conta e SLA |

**Anual:** 2 meses grátis no pagamento anual.

#### Complementos

| Complemento | Preço | Por quê |
|---|---|---|
| Validação de autenticidade (Serpro Datavalid ou biometria) | R$ 4 por admissão | Custo de cerca de R$ 2,48 por pessoa (preço do Serpro de 2019) |
| Revisão humana das exceções pela nossa equipe | Sob consulta | É o principal risco de margem; só com preço próprio |
| Integração adicional com folha | Sob consulta | Cada sistema tem esforço diferente |

#### Escritórios contábeis e BPOs de DP

Pacote pré-pago de **50 admissões por R$ 350** (R$ 7 cada), usado entre todos os clientes do escritório, com painel
separado por cliente. Renovação a R$ 0,40 por colaborador/mês. É o canal para as PMEs (hipótese).

#### Piloto

**30 dias no plano Profissional, sem custo, até 20 admissões**, com os modelos configurados junto com o cliente.
No fim, relatório de antes e depois: tempo de RH por admissão, tempo do convite ao cadastro, taxa de recusa por motivo,
reenvios e escalações.

#### Exemplos de conta

| Cliente | Uso por mês | Plano | Paga por mês | Por colaborador/mês |
|---|---|---|---|---|
| Empresa com 20 empregados | 1 a 2 admissões | Grátis | R$ 0 | R$ 0 |
| Rede de lojas com 300 empregados | ≈ 13 admissões | Essencial | R$ 149 | R$ 0,50 |
| Varejo com 1.000 empregados e 50% de giro | ≈ 42 admissões | Profissional | R$ 449 | R$ 0,45 |
| Empresa de energia com 200 eletricistas | 8 admissões; 200 em renovação (ASO, NR-10, NR-35) | Profissional | R$ 449 + 100 × R$ 0,50 = R$ 499 | R$ 2,50 |

Comparação: a Convenia Ágil custaria R$ 14.000 por mês para os mesmos 1.000 empregados (com outros módulos). O software
de SST da Bevart custa entre R$ 163 (100 vidas) e R$ 373 (500 vidas) e não conduz a renovação até o documento novo.

#### Margem estimada

| Plano (franquia cheia) | Receita | Custo variável (médio · teto) | Margem bruta variável (médio · teto) |
|---|---|---|---|
| Essencial | R$ 149 | 15 × R$ 1 = R$ 15 · 15 × R$ 2 = R$ 30 | 90% · 80% |
| Profissional (100 em renovação) | R$ 449 | 60 × R$ 1 + 100 × R$ 0,05 = R$ 65 · 60 × R$ 2 + R$ 5 = R$ 125 | 86% · 72% |
| Renovação avulsa | R$ 0,50 | R$ 0,02 a R$ 0,05 | 90% a 96% |
| Grátis | R$ 0 | até 3 × R$ 2 = R$ 6 por conta | Custo de aquisição |

Não inclui margem do BSP do WhatsApp, revisão humana nem infraestrutura. O que mais mexe na margem é o número de
mensagens de template por admissão e a taxa de escalação.

#### A validar

- [ ] Disposição a pagar: apresentar esta tabela a 3 a 5 empresas no piloto.
- [ ] Preço por token do modelo no Featherless e tabela oficial da Meta em BRL.
- [ ] Turnos de conversa, reenvios e mensagens reais por admissão (medir no piloto).
- [ ] Cotação de Gupy, Unico e Sólides como empresa de 500 funcionários.
- [ ] Franquias: quantas admissões por mês os clientes-alvo fazem.

## 7. Por que a IA é confiável aqui

- O LLM só transcreve, extrai e redige. Validade, regras, decisão, fila e números são código.
- Todo campo extraído precisa aparecer na transcrição (guarda de fidelidade); CPF e CNPJ passam por dígito verificador.
- O texto da imagem entra marcado como não confiável e o LLM não tem ferramenta de aprovar: prompt injection na foto no
  máximo produz uma extração errada que as regras pegam.
- O agente não promete detectar fraude: sinal de suspeita escala para um humano.
- ASO é dado de saúde: a transcrição nunca é gravada nem exibida.

## 8. Restrições já mapeadas

- **WhatsApp:** a política proíbe pedir números de identidade e de conta no chat. Documentos e dados bancários vão por
  link seguro de uso único; o chat orienta e cobra. Confirmar com o BSP antes do piloto.
- **Estágio:** usa o S-2300 (prazo até o dia 15 do mês seguinte). O argumento para estágio é o risco de vínculo de
  emprego, não o prazo do eSocial.
- **Catálogo:** exigir teste de gravidez é crime (Lei 9.029/1995) e antecedentes criminais sem justificativa gera dano
  moral. O produto deve bloquear o primeiro e exigir justificativa no segundo (ainda não implementado).
- **LGPD:** bases legais de obrigação legal e procedimentos preliminares de contrato; humano revisa toda decisão que
  afeta a contratação (art. 20).

## 9. A demo, com a verdade do dia

- O painel do RH e o WhatsApp simulado (`web/`) mostram catálogo, modelos, coleta, recusa, cobrança e escalação, com
  **leitor simulado**.
- A leitura com IA é **real** no worker, hoje com o exemplo da empresa de energia (ASO, NR-10, NR-35), incluindo a
  renovação e o card de impedimento.
- Dizer isso antes que um especialista pergunte.

## 10. Métricas do piloto

"Seremos os primeiros a medir": tempo de RH por admissão antes e depois, taxa de recusa por documento e motivo, reenvios,
taxa de escalação, tempo do convite ao cadastro, documentos renovados antes do vencimento e falso aceite (meta: zero).

## 11. Perguntas prováveis da banca

| Pergunta | Resposta |
|---|---|
| "A Flash já não faz isso?" | Faz a coleta pelo WhatsApp; o próprio post dela diz que o RH valida. Nós conduzimos até o cadastro, com modelos por cargo, e continuamos depois, na renovação |
| "Qual o tamanho do mercado?" | 26,7 mi admissões por ano × R$ 10 = R$ 267 mi de TAM; feitas por contador, custariam R$ 4 bi. A renovação é receita recorrente por cima |
| "E a economia unitária?" | Medimos ~3.500 tokens por documento; a admissão custa perto de R$ 1 e é vendida a R$ 7–10. Margem bruta variável acima de 70% mesmo no pior caso |
| "O que impede um incumbente de copiar?" | Nada estrutural hoje. Foco, renovação e o histórico de recusas por documento e motivo |
| "Qual a acurácia?" | Ainda não medida no nosso conjunto; por isso o número lido só passa se bater dígito verificador, datas e os outros documentos. Meta do piloto: falso aceite zero |
| "E prompt injection na foto?" | O LLM não tem ferramenta de aprovar; a decisão é código e o texto da imagem entra como não confiável |
| "Isso é permitido no WhatsApp?" | IA incidental a uma tarefa de negócio é permitida; números de documento e conta vão por link seguro |
| "Por que agora?" | Prazo D-1 com multa clara, WhatsApp com cobrança por mensagem em reais, LLMs que leem documentos e regras de dados e IA definidas entre 2025 e 2026 |

## 12. O que falta pesquisar

- [ ] Tamanho da renovação: quantos trabalhadores têm documento que vence (NR-10, NR-35, CNH profissional, estagiários).
- [ ] Preço praticado por software de SST ou de gestão de documentos por colaborador.
- [ ] Concorrentes de SST no Brasil que alertam vencimento: nomes, preços, se cobram ou só avisam.
- [ ] Penalidade por trabalhador sem treinamento ou ASO válido (NR-28) e casos de embargo.
- [ ] Itens pendentes do relatório: Caged oficial de setembro/2026, leitura do BSP sobre fotos de documento, teste da Flash.

## Fontes

- Evidência completa com links: [pesquisa/relatorio-admissao.md](pesquisa/relatorio-admissao.md) e as notas em
  [pesquisa/notas/](pesquisa/notas/).
- Desenho do produto: [produto/desenho-admissao.md](produto/desenho-admissao.md).
