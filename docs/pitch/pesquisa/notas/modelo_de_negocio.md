# Modelo de negócio, preço e go-to-market do Agente de Admissão (Brasil)

> Notas de pesquisa para o pitch (banca com associate de VC). Data de referência: 07/11/2026.
> **Câmbio usado:** US$ 1 = **R$ 5,21**. É a PTAX de venda de 28/09/2026 (R$ 5,2132), a cotação datada mais recente que encontrei — [Renova Invest](https://renovainvest.com.br/dolar-hoje/). A PTAX de novembro/2026 não foi encontrada. Se o câmbio estiver em ~R$ 5,40, os custos em US$ ficam cerca de 4% maiores, o que não muda as conclusões.
> Tudo marcado **[ESTIMATIVA]** é cálculo nosso, com a conta à mostra. **[HIPÓTESE]** é premissa ainda não validada.
>
> **Relação com o doc estratégico** (`docs/HR_Compliance_AI_Proposta_Estrategica_Startup.md`, seção 9). O doc foi escrito para o produto anterior (auditoria de jornada, ponto × folha). Lá o ICP é "100 a 3.000 empregados, operações em turnos, múltiplas unidades", e a monetização proposta é "implantação/configuração + assinatura por faixas de vínculos efetivamente auditados", com o alerta de "evitar monetizar por volume bruto de alertas". Para o Agente de Admissão:
> (i) o ICP de turnos e varejo continua válido, porque são os mesmos setores de alta rotatividade (ver Q4);
> (ii) a unidade de valor natural passa a ser a **admissão concluída**, não o vínculo auditado;
> (iii) o alerta do doc vale por analogia: **não cobrar por mensagem nem por documento**, porque isso puniria reenvios, que são justamente o trabalho que o agente absorve.
> O doc não traz preços nem custos, então nada nele contradiz estes números.

## Q1. Como as ferramentas brasileiras de RH/admissão cobram? (preços públicos)

### Takeaway
O mercado brasileiro cobra quase sempre **por colaborador ativo por mês (PEPM)** dentro de suítes, com "preço sob consulta" para o módulo de admissão. O único piso público confiável é o da Sólides, **a partir de R$ 1,90/colaborador/mês**. Nenhum dos fornecedores pesquisados (Unico People, Gupy, Convenia, Caju, Feedz, Pontomais, Tangerino) publica preço por admissão. A Unico tem modelo transacional em outra linha de produto. Isso abre espaço para um **preço por admissão concluída**, simples de comparar com o custo do analista.

### Cited Findings
- **Sólides:** "planos a partir de R$ 1,90/mês por colaborador". O Betterteam cita planos básicos a R$ 1,90 e avançados a partir de R$ 14,90/mês — [Sólides – planos e preços](https://solides.com.br/planos-e-precos/); [Betterteam](https://www.betterteam.com/br/sólides-portal-de-vagas)
- **Sólides:** a página de planos atual não mostra valores em R$. A "Admissão Digital" aparece incluída no pacote "Ponto + Jornada do DP" e, na tabela de funcionalidades, há colunas marcadas como "Avulso", sem preço. Há banner de "50% OFF na mensalidade de novos planos" — [Sólides – planos e preços](https://solides.com.br/planos-e-precos/)
- **Sólides (benefícios):** Plano Gestão R$ 16,90 e Estratégico R$ 24,90 por colaborador/mês; Essencial gratuito. É a linha de benefícios, não a de admissão — [Sólides – benefícios](https://solides.com.br/beneficios/)
- **Convenia** não publica preços no site ("é necessário entrar em contato"). O B2B Stack mostra "R$ 0,00 – Mensal" como preço inicial, dado pouco confiável — [B2B Stack – Convenia](https://www.b2bstack.com.br/product/convenia/funcionalidades); [B2B Stack – comparativo](https://www.b2bstack.com.br/compare/percival-vs-convenia)
- **Caju:** um agregador cita "a partir de R$ 9,90 por colaborador/mês", mas o módulo Pessoas (com admissão 100% digital) aparece como "preço sob consulta" — [FitGap – Caju](https://us.fitgap.com/products/029968/caju)
- **Pontomais:** comparativos mostram "preço inicial R$ 60,00 mensal" ou "a partir de 69/mês", sem dizer se é por empresa ou por colaborador — [B2B Stack – Pontomais vs Tangerino](https://www.b2bstack.com.br/compare/pontomais-vs-tangerino); [GetApp – Pontomais](https://www.getapp.com/hr-employee-management-software/a/pontomais)
- **Tangerino** lançou módulo de admissão digital, sem preço público. O B2B Stack mostra "R$ 0,00 – Mensal" como plano inicial — [Exame](https://exame.com/negocios/hrtech-tangerino-lanca-ferramenta-para-otimizar-processo-de-admissao); [B2B Stack](https://www.b2bstack.com.br/compare/tangerino-vs-pontomais)
- **Gupy Admissão:** não encontrei preço público nem modelo de cobrança do módulo — [busca sem resultado; ver Gupy](https://www.gupy.io/blog/aporte-500-milhoes-gupy)
- **Unico People (Admissão Digital):** a empresa afirma reduzir o processo para 43 minutos, validar dados com eSocial e Correios e ter "mais de 15 mil admissões por mês" na plataforma. O preço não é público. A NeoFeed descreve que a Unico "ganha por transação" na solução de assinatura (outra linha de produto) — [NeoFeed](https://neofeed.com.br/startups/na-idtech-unico-quem-ve-cara-ve-assinatura/)

### Inferences
- **[ESTIMATIVA] Conversão entre modelos.** Uma empresa de 1.000 empregados com 50% de rotatividade anual faz cerca de 500 admissões/ano [HIPÓTESE de rotatividade; ver Q4 para comércio e serviços ≥ 50%]. A **R$ 25 por admissão**, paga 500 × 25 = R$ 12.500/ano, ou seja, 12.500 / 12 / 1.000 = **R$ 1,04 por colaborador/mês**. Isso fica abaixo do piso público da Sólides (R$ 1,90 PEPM). O preço por admissão fica "invisível" ao lado de uma suíte PEPM e cresce com a dor (quem contrata mais paga mais).
- **Estrutura sugerida para o pitch [HIPÓTESE]:**
  1. **Preço por admissão concluída** (faixa R$ 15–40), com pacote mínimo mensal.
  2. Setup opcional para a integração com folha/ERP.
  3. Add-on de validação de autenticidade (Datavalid ou biometria), repassado com margem.
  4. Para escritórios contábeis, preço por pacote de admissões do escritório.
- O módulo de admissão dos incumbentes é vendido dentro de suítes. O agente pode entrar como **camada sobre a suíte**, sem disputar a troca de sistema.

### Gaps
- Nenhum preço público de admissão (por admissão ou PEPM do módulo) para Unico People, Gupy, Convenia, Caju, Feedz, Pontomais ou Senior. Só cotação comercial resolveria. Sugestão: pedir demo/cotação como "empresa de 500 funcionários" antes do pitch.
- Não verifiquei se há taxa de setup nos incumbentes.
- Senior e Feedz: sem dado de preço encontrado.

## Q2. Benchmarks de preço por verificação de identidade/documento no Brasil

### Takeaway
O único preço público por consulta encontrado é o do **Serpro Datavalid**: **R$ 0,80 por validação cadastral** e **R$ 1,68 por biometria facial**, na faixa de até 999 consultas. É um dado de **2019**, e o preço cai com o volume. Unico Check e idwall não publicam preço. Isso define a ordem de grandeza: **R$ 1–3 por pessoa** para validar autenticidade, um custo que pode ser repassado como add-on.

### Cited Findings
- **Datavalid:** "validação cadastral custa R$ 0,80 e a biometria facial R$ 1,68, na faixa de até 999 consultas", com preço unitário decrescente por volume. Matéria de 19/06/2019 — [Tecnoblog](https://tecnoblog.net/noticias/mpdft-acusa-serpro-usar-dados-cnh-sem-autorizacao/)
- O gov.br informa que o custo mensal do Datavalid "depende da faixa de preços conforme o volume de consumo", publicada na Loja Serpro — [gov.br – Datavalid](https://www.gov.br/pt-br/servicos/obter-solucao-digital-para-validacao-de-identidade-datavalid)
- Um processo de dispensa de licitação de 2025 no Senado (consulta CPF) anexa a "tabela padrão" do Serpro e afirma que o preço é uniforme entre contratações. Os valores não aparecem no trecho recuperado — [Senado – transparência](https://www12.senado.leg.br/transparencia/resolveuid/b4b9c34d10f14340bf185d0d91cfba20)
- **Datavalid v5** foi anunciado em 2026 (notícia do Serpro), sem preço no resultado — [Serpro](https://www.serpro.gov.br/menu/noticias/noticias-2026/datavalid-v5)
- **Unico Check:** não há tabela pública. A biometria é gratuita para a pessoa física, e o B2B é por proposta. Mais de 735 milhões de autenticações entre 2018 e set/2023. Em 2026, a Unico passou a oferecer biometria IDCloud a empresas menores via Didit — [Startups.com.br](https://startups.com.br/idtech/com-solucao-100-precisa-unico-mira-novos-mercados/); [Biometric Update](https://www.biometricupdate.com/202609/unico-opens-idcloud-biometrics-to-smaller-brazilian-businesses-through-didit)

### Inferences
- **[ESTIMATIVA]** Add-on de autenticidade por admissão: R$ 0,80 + R$ 1,68 = **R$ 2,48** (preço de 2019, faixa ≤ 999). É um teto conservador, porque o volume reduz o valor e o preço pode ter sido reajustado desde então.
- No MVP o agente não depende disso, porque o Datavalid está fora do escopo (seção 10 do desenho). No pitch, a validação de autenticidade vira **add-on pago, com margem**.

### Gaps
- Tabela vigente (2026) da Loja Serpro para Datavalid não foi obtida; o valor de 2019 é o único público citável.
- idwall e Unico Check: sem preço público por consulta.

## Q3. Custo unitário por admissão e margem bruta

### Takeaway
O custo variável por admissão é baixo: **cerca de R$ 0,25 (cenário enxuto) a ~R$ 2 (cenário base)**, e **~R$ 5,40 com validação Datavalid**. O custo é dominado pelo LLM de visão (com Sonnet) ou pelas mensagens WhatsApp (com Haiku). A **R$ 25 por admissão**, a margem bruta variável fica entre **~78% e ~99%**. Ainda não estão incluídos o custo humano de escalação, o BSP e a infraestrutura.

### Cited Findings — WhatsApp Business Platform
- A cobrança é **por mensagem entregue** (desde 01/07/2025), por categoria (marketing, utility, authentication, service) e país do destinatário. Mensagens enviadas pelo usuário não são cobradas — [Meta – WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- **Mudanças de 01/10/2026:**
  - templates *utility* enviados dentro da janela de atendimento aberta **deixaram de ser gratuitos**;
  - mensagens *service* voltaram a ser cobradas, com **1.000 mensagens de service grátis por mês por número**, sem acúmulo;
  - o Brasil não está entre os 40 mercados com tarifa alterada nessa data;
  - o Brasil tem *tiers* de volume para utility e authentication;
  - contas no Brasil podem ser faturadas em BRL desde 01/07/2026.
  — [Meta – WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- **Brasil, utility/authentication: US$ 0,0068 por mensagem** (0,68 ¢, citado na própria página da Meta) — [Meta – WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- **Brasil, marketing: ~US$ 0,0625** por mensagem, segundo terceiros. Volume discount só se aplica a utility e authentication — [EngageLab](https://www.engagelab.com/blog/whatsapp-business-api-pricing); [Chatfuel](https://sdk.chatfuel.com/blog/whatsapp-business-api-pricing)
- **Valores conflitantes:** um BSP brasileiro publica R$ 0,04–0,05 (utility) e R$ 0,31–0,38 (marketing), provavelmente com margem do BSP. A Go4whatsup lista R$ 0,045 para utility, mas a própria página diz que as tarifas seriam da Índia, então não é confiável — [Whautomate](https://whautomate.com/whatsapp-business-api-pricing-brazil); [Go4whatsup](https://go4whatsup.com/brazil/whatsapp-business-api-pricing/)

### Cited Findings — LLM de visão (Anthropic, preços oficiais)

**Preços por milhão de tokens (US$)**

| Modelo | Entrada | Saída | Leitura de cache |
| --- | --- | --- | --- |
| Claude Sonnet 5.5 | $2 | $10 | $0,10 |
| Claude Sonnet 5 | $2 | $10 | — (*) |
| Claude Haiku 5.5 (prompts ≤ 100k tokens) | $0,10 | $0,50 | $0,01 |
| Claude Haiku 4.5 | $1 | $5 | — |
| Claude Opus 5.5 | $4 | $20 | — |

(*) O preço de US$ 2/US$ 10 do Sonnet 5, anunciado como introdutório, virou o preço padrão.

- **Batch API: 50% de desconto** em entrada e saída — [Anthropic – Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- **Tokens por imagem:** `⌈largura/28⌉ × ⌈altura/28⌉`.
  - Tier padrão: lado máximo de 1.568 px e no máximo 1.568 tokens.
  - Tier alta resolução ("Claude 4.7 and later models"): lado máximo de 2.576 px e no máximo 4.784 tokens.
  - Exemplos: 1000×1000 = 1.296 tokens; 1920×1080 = 1.560 (padrão) ou 2.691 (alta resolução); foto 4K = 1.560 ou 4.784.
  - O doc dá o exemplo: "a 1000×1000 imagem custa ~US$ 1,30 por mil imagens" no Haiku 4.5.
  — [Anthropic – Vision](https://platform.claude.com/docs/en/build-with-claude/vision)
- Modelos 4.7 e posteriores usam um tokenizer que gera ~30% mais tokens para o mesmo texto — [Anthropic – Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### Cálculo [ESTIMATIVA] — custo variável por admissão

**Premissas [HIPÓTESE]:**
- 8 documentos com 50% de reenvio, totalizando **12 chamadas de extração**.
- Cada chamada processa 1 foto de celular (pior caso no tier de alta resolução: **4.784 tokens**), mais ~2.000 tokens de prompt e esquema, gerando ~500 tokens de saída.
- A conversa tem **20 turnos do agente**, com ~4.000 tokens de entrada e ~200 de saída cada, sem cache.
- O WhatsApp tem **20 mensagens do agente** cobradas como utility (pior caso pós-out/2026). No cenário enxuto, são só 3 templates (abertura e 2 cobranças), com as respostas de service dentro da franquia de 1.000/mês.
- Câmbio R$ 5,21.

| Item | Enxuto | Base | Alto |
| --- | --- | --- | --- |
| Extração (12 chamadas) | Haiku 5.5: 12 × (6.784 × 0,10/1M + 500 × 0,50/1M) = 12 × US$ 0,00093 = **US$ 0,011** | Sonnet 5.5: 12 × (6.784 × 2/1M + 500 × 10/1M) = 12 × US$ 0,0186 = **US$ 0,223** | igual à base: **US$ 0,223** |
| Conversa (20 turnos) | Haiku 5.5: 20 × (4.000 × 0,10/1M + 200 × 0,50/1M) = **US$ 0,010** | Haiku 5.5: **US$ 0,010** | Sonnet 5.5: 20 × (4.000 × 2/1M + 200 × 10/1M) = **US$ 0,200** |
| WhatsApp | 3 × 0,0068 = **US$ 0,020** | 20 × 0,0068 = **US$ 0,136** | 20 × 0,0068 = **US$ 0,136** |
| Datavalid (cadastral + biometria) | — | — | **R$ 2,48** |
| **Total** | US$ 0,041 ≈ **R$ 0,21** | US$ 0,369 ≈ **R$ 1,92** | US$ 0,559 ≈ R$ 2,91 + R$ 2,48 = **R$ 5,39** |

- **Armazenamento:** 12 imagens × ~2 MB ≈ 24 MB por admissão. Em object storage, o custo é da ordem de **centavos por ano** e desprezível frente aos itens acima. A tarifa exata não foi verificada nesta pesquisa (ver Gaps).
- **Alavancas de redução:**
  - prompt caching do esquema e do system prompt, com cache hit do Sonnet 5.5 a US$ 0,10/M, ou seja, 5% da entrada;
  - Batch API (−50%) para revalidações não urgentes;
  - reduzir a imagem para o tier padrão (~1.560 tokens), o que corta o custo de extração em ~60%.

**Margem bruta variável [ESTIMATIVA]** = (preço − custo) / preço

| Preço por admissão | Enxuto (R$ 0,21) | Base (R$ 1,92) | Alto (R$ 5,39) |
| --- | --- | --- | --- |
| R$ 15 | 98,6% | 87,2% | 64,1% |
| R$ 25 | 99,2% | 92,3% | 78,4% |
| R$ 40 | 99,5% | 95,2% | 86,5% |

### Inferences
- O argumento para o VC: o custo de IA e de mensageria é **< R$ 2 por admissão** no cenário base. A margem de software (>85%) se sustenta mesmo usando o modelo Sonnet para extração. O que pode corroer a margem é o **custo humano de escalação** (se nós operarmos parte da revisão) e o **suporte/implantação**, não os tokens.
- Mudar a categoria das mensagens importa: um template classificado como *marketing* custa ~9× mais que *utility* (0,0625 / 0,0068). Mensagens de cobrança de documento devem ser templates **utility**.

### Gaps
- Tarifa oficial da Meta em BRL para o Brasil, e tarifa de *service* pós-01/10/2026 acima da franquia: estão no CSV/PDF de rate card, que não foi lido.
- Margem de BSP (Twilio, Gupshup, Blip etc.) não incluída. Pode adicionar de R$ 0,01 a R$ 0,30 por mensagem, segundo a faixa conflitante acima.
- Preço de storage (S3/GCS) não verificado nesta sessão.
- Número real de turnos e reenvios por admissão: [HIPÓTESE], a medir no piloto.

## Q4. Segmentos de cliente inicial: dor e ciclo de venda

### Takeaway
Três candidatos:
1. **Programas de estágio e agentes de integração (CIEE/Nube)**: picos sazonais, conjunto de documentos simples e igual ao da demo ("Estágio").
2. **Contratantes de alto volume (varejo, serviços, call center, terceirizadas)**: a maior dor, com rotatividade de ~50%+, mas ciclo enterprise e incumbentes presentes (Unico, Gupy).
3. **Escritórios contábeis que fazem DP para PMEs**: cerca de 80–100 mil organizações contábeis, cada uma com baixo volume por cliente, mas que funcionam como canal.

**Recomendação [INFERÊNCIA]:** como **beachhead**, empresas de médio porte de varejo, serviços e terceirização (ICP do doc estratégico, 100–3.000 empregados) **ou** programas de estágio com pico sazonal. Escritórios contábeis entram como **canal**, não como primeiro cliente direto.

### Cited Findings
- **Rotatividade por setor (DIEESE, séries até 2009):** comércio e serviços com taxas "próximas ou superiores a 50%", acima da média do mercado formal. Em 2009: comércio 58%, serviços 54%, construção 108% (taxas brutas) — [DIEESE](https://www.dieese.org.br/livro/2011/livroRotatividade11/92.html); [Centrais sindicais / Sindmetal](https://sindmetal.org.br/wp-content/uploads/2012/09/proostas-das-centrais-_rotatividade.pdf)
- **Call centers** estão entre os setores de maior rotatividade citados pelo DIEESE e pelo governo, sem percentual na fonte — [Bem Paraná](https://www.bemparana.com.br/trabalho-negocios/de-100-trabalhadores-55-nao-ficam-um-ano-no-emprego-diz-dieese/)
- **Recorte regional 2026 (Campinas):** comércio 31,6%, serviços 30,1%, construção 42,2% — [Correio da Manhã](https://www.correiodamanha.com.br/nacional/sao-paulo/campinas/2026/08/amp/310374-campinas-tem-2-maior-rotatividade-de-trabalho-desde-2020.html)
- **Atacado (ago/2026):** "aumento de custo para reter mão de obra preocupa gestores do comércio atacadista" — [Mercado & Consumo](https://mercadoeconsumo.com.br/20/08/2026/supermercados/aumento-de-custo-para-reter-mao-de-obra-preocupa-gestores-do-comercio-atacadista/)
- **CIEE:**
  - 239.159 jovens ativos (151.575 em estágio, 87.584 em aprendizagem), segundo reportagem de mai/2026;
  - "290 mil contratos de estágio e aprendizagem administrados" até nov/2025 (+7% vs 2024);
  - projeção de **68,2 mil vagas sazonais até fev/2026**.
  — [Mais Goiás](https://www.maisgoias.com.br/brasil/economia/numero-de-estagiarios-no-pais-cresce-238-no-primeiro-trimestre/); [Portal Tela](https://www.portaltela.com/noticias/economia/2025/12/03/ciee-abre-68-mil-vagas-de-estagio-e-aprendizagem-ate-fevereiro/)
- **Organizações contábeis:**
  - "quase 100 mil" organizações contábeis formalizadas em 2024 (estimativa de autor independente com base no Sistema CFC/CRCs);
  - outra fonte cita "mais de 80 mil escritórios";
  - balanço social antigo do CFC: 65.148 escritórios e sociedades ativos; 69.380 organizações contábeis em 2008;
  - 529.168 profissionais com registro ativo (dez/2024).
  - O número oficial atual está no painel "Quantos Somos" do CFC (não lido).
  — [Roberto Dias Duarte](https://www.robertodiasduarte.com.br/relatorio-executivo-evolucao-das-organizacoes-contabeis-no-brasil-1995-2024/); [Diário do Comércio – Tangerino](https://diariodocomercio.com.br/negocios/hr-tech-tangerino-unifica-rotinas-do-dp-em-jornada-unica/); [CFC – Balanço Social 2008](https://cfc.org.br/wp-content/uploads/2020/09/BS_2008_red.pdf); [Jornal Empresas & Negócios](https://jornalempresasenegocios.com.br/wp-content/uploads/2024/12/pagina_08_ed-5234.pdf)
- **Terceirizadas:** existe comparação do DIEESE entre atividades terceirizadas e contratadas diretamente, usada para argumentar maior rotatividade nas terceirizadas. O número não foi extraído — [Fundação Perseu Abramo / DIEESE](https://fpabramo.org.br/notas-fpa-politica-social-407-2/)

### Inferences
- **Contratantes de alto volume (varejo, serviços, call center, terceirizadas):**
  - Dor: altíssima. Com rotatividade ≥ 50%, o volume anual de admissões é igual a metade ou mais do quadro.
  - Ciclo: médio a longo (TI, jurídico/LGPD, integração com folha). Os incumbentes (Unico, com "15 mil admissões/mês", e Gupy) já atendem esse perfil.
  - É o maior ticket.
- **Programas de estágio:**
  - Dor: concentrada em picos (68 mil vagas em ~3 meses só no CIEE), com documentos simples e repetitivos (RG, CPF, comprovante, declaração de matrícula), o que encaixa no MVP.
  - Os agentes de integração (CIEE, Nube) administram centenas de milhares de contratos, então funcionam como **cliente ou canal único com alto volume**.
  - Ciclo provavelmente curto se o piloto for limitado a uma campanha sazonal [HIPÓTESE].
- **Escritórios contábeis:**
  - Dor: média e difusa (poucas admissões por PME cliente, mas somadas em milhares por escritório). Escritório pequeno tem baixa disposição a pagar.
  - Ciclo de venda curto (decisor único).
  - Melhor como **canal de distribuição para PMEs** (ver Q5).
- **Ciclo de venda mais curto, dor alta:** empresa de médio porte (100–1.000 empregados) de varejo, alimentação ou serviços, sem módulo de admissão em suíte, que ainda faz a admissão por WhatsApp pessoal do analista [HIPÓTESE a validar em entrevistas].

### Gaps
- Taxa de rotatividade nacional atualizada por setor (CAGED 2025/2026) e específica de call center: não encontrada.
- Número de admissões/ano por setor (Novo CAGED): fora do que foi coletado aqui, e possivelmente coberto por outra nota (12.1).
- Volume do Nube: não pesquisado.
- Evidência pública de duração de ciclo de venda por segmento: não encontrada.

## Q5. Canais de distribuição

### Takeaway
Escritórios contábeis já são um **canal ativo** de HR techs e fintechs de folha no Brasil: Tangerino, ContaAzul e a parceria GRTS Digital + Aleve. A própria Unico abriu canal para PMEs via a parceira Didit em 2026. Parcerias com ERP/folha (Senior, TOTVS, Domínio/Thomson Reuters, Alterdata) fazem sentido porque o "sistema de destino" do agente é a folha. Não encontrei, porém, programas públicos de marketplace com termos.

### Cited Findings
- **Tangerino** declara querer unir RH, DP e escritórios contábeis numa plataforma, com integração aos principais softwares de folha e à "Central do Contador", e cita "mais de 80 mil escritórios no Brasil" — [Diário do Comércio](https://diariodocomercio.com.br/negocios/hr-tech-tangerino-unifica-rotinas-do-dp-em-jornada-unica/)
- **GRTS Digital + Aleve:** parceria para levar IA trabalhista a PMEs **via escritórios contábeis** (alega 99% de acurácia na folha em 2025, segundo a própria parceria) — [Diário do Comércio](https://diariodocomercio.com.br/negocios/parceria-leva-ia-trabalhista-pmes-escritorios-contabeis/)
- **ContaAzul** lançou folha de pagamento integrada ao contas a pagar, voltada a clientes e contadores parceiros. Mantém diretório de "contador parceiro certificado" — [Jornal Contábil](https://jornalcontabil.com.br/noticia/conta-azul-lanca-solucao-de-folha-de-pagamento/); [ContaAzul – encontre contador](https://contaazul.com/encontre-contador/contadores/m-e-m-contabilidade-e-consultoria-empresarial-ltda/)
- **Unico** abriu a biometria IDCloud a empresas menores **por meio da parceira Didit** (2026) — [Biometric Update](https://www.biometricupdate.com/202609/unico-opens-idcloud-biometrics-to-smaller-brazilian-businesses-through-didit)
- **Sólides** tem programa de "Aliança" com redes de franquia (ex.: Casa do Construtor), um canal via franqueadoras — [Sólides – Aliança Casa do Construtor](https://solides.com.br/alianca/casa-do-construtor/)
- **Senior** oferece assistente de IA (Sara) integrável a ponto e benefícios. Sólides e Senior são citadas como opções de folha para escritórios e empresas — [Jornal Contábil](https://jornalcontabil.com.br/noticia/quais-os-melhores-sistemas-de-folha-de-pagamento-veja-5-opcoes/)
- **Consolidação via M&A:**
  - a **Gupy** captou R$ 500 milhões (SoftBank LatAm, Riverwood) para consolidar o setor e comprou a Kenoby;
  - a **Sólides** captou R$ 530 milhões (Warburg Pincus) e comprou a Tangerino.
  — [Startups.com.br](https://startups.com.br/noticias/gupy-levanta-r-500-mi-na-maior-rodada-para-uma-startup-fundada-por-mulheres-na-america-latina/); [Startupi](https://startupi.com.br/tags/niduu/)

### Inferences
- **Sequência de canais sugerida [HIPÓTESE]:**
  1. **Venda direta** a 3–5 médias empresas de alto volume ou a um programa de estágio (prova de valor e caso de uso).
  2. **Canal contábil:** o escritório revende ou usa o agente para as admissões dos clientes PME, com *revenue share* ou preço de atacado por pacote de admissões. Há ~80–100 mil organizações contábeis.
  3. **Integração/marketplace com folha** (Domínio, Alterdata, Senior, TOTVS) para entregar o cadastro final e virar *add-on* do ERP.
- A consolidação (Gupy e Sólides comprando concorrentes) indica **saída por M&A** plausível para um módulo de admissão agêntico. Os compradores naturais são suítes que vendem PEPM e não têm agente conversacional.

### Gaps
- Termos de programas de parceiros/marketplace de Senior, TOTVS, Domínio (Thomson Reuters) e Alterdata: não pesquisados nesta rodada.
- Caso documentado com números de HR tech brasileira que cresceu majoritariamente via contadores: não encontrado. Os exemplos acima são de estratégia declarada, não de resultado.

## Q6. Valor e ROI: "R$ X economizados por admissão"

### Takeaway
O salário de um analista de DP no Brasil fica em torno de **R$ 3.200–4.200/mês** (melhor dado: média de R$ 4.203,53 na pesquisa da Convenia). Isso dá **~R$ 19/h de salário base** e **~R$ 34/h com encargos** [ESTIMATIVA]. Com 1,5–3 h economizadas por admissão [HIPÓTESE], a economia fica em **R$ 50–100 por admissão**, cerca de **2–4× um preço de R$ 25**. O número de horas por admissão ainda não tem fonte pública e é o ponto mais fraco do argumento.

### Cited Findings
- **Analista de DP (pesquisa Convenia, >2.700 profissionais):** média de **R$ 4.203,53** no meio da carreira. O ano de referência não está claro; o agregador indica 2023 — [Blog Convenia](https://blog.convenia.com.br/recursos-humanos-salario-e-carreira/)
- **Cargos vizinhos com base no CAGED:**
  - Chefe de Departamento de Pessoal (CBO 4101-05): média de **R$ 4.045,02**, faixa de R$ 2.349,22 a R$ 7.474,19, dados de 06/2025 a 05/2026;
  - Gerente de DP: média de R$ 5.180,30 (8.308 na amostra) e R$ 5.249,98 para 43 h/semana.
  — [Salario.com.br – Chefe de DP](https://www.salario.com.br/profissao/chefe-de-departamento-de-pessoal-cbo-410105); [Salario.com.br – Gerente de DP](https://www.salario.com.br/profissao/gerente-de-departamento-pessoal-cbo-142210/)
- **Assistente de DP:** R$ 2.500/mês, com 28 salários informados — [InfoJobs](https://www.infojobs.com.br/assistente-de-departamento-pessoal/salarios)
- **Coordenador de DP:** média de R$ 5.313/mês (Indeed, atualizado em out/2026) — [Indeed](https://br.indeed.com/salaries/coordenador-de-departamento-pessoal-Salaries)
- **Benchmark de tempo do incumbente:** a Unico afirma reduzir a admissão digital para **43 minutos** (claim do fornecedor) — [NeoFeed](https://neofeed.com.br/startups/na-idtech-unico-quem-ve-cara-ve-assinatura/)

### Inferences
- **[ESTIMATIVA] Custo-hora do analista de DP:**
  - Salário base: R$ 4.200 / 220 h (jornada mensal de 44 h semanais) = **R$ 19,09/h**.
  - Com encargos e benefícios (fator **1,8×** [HIPÓTESE; costuma-se usar 1,7–2,0× no Brasil, sem fonte verificada nesta pesquisa]): 19,09 × 1,8 = **R$ 34,36/h**.
- **[ESTIMATIVA] Economia por admissão:**
  - 1,5 h × R$ 34,36 = **R$ 51,54**;
  - 2 h × R$ 34,36 = **R$ 68,72**;
  - 3 h × R$ 34,36 = **R$ 103,08**.
- **Frase de pitch (condicional):** "Cada admissão custa ~R$ 70 de tempo de analista correndo atrás de documento. Cobramos R$ 25 e custamos < R$ 2." Isso deve ser falado como **hipótese a validar no piloto**, não como fato.
- Valores não contabilizados (upside): dias de início adiado do colaborador e retrabalho de cadastro. A multa por S-2200 fora de prazo pertence à nota de regulação (12.2).

### Gaps
- Nenhuma fonte pública independente sobre **horas de RH por admissão** ou **taxa de documentos ilegíveis/incompletos**. Isso é crítico para o ROI e precisa de entrevistas ou medição em piloto.
- Página do salario.com.br específica de "Analista de Departamento Pessoal" (CBO) não foi localizada (404).
- Fator de encargos trabalhistas sem fonte verificada nesta sessão.

## Q7. Tamanho de mercado e comparáveis de funding/valuation (2024–2026)

### Takeaway
O capital continua indo para HR tech no Brasil, com movimento de consolidação.
- 2024: HR techs brasileiras captaram **R$ 590 milhões**.
- Fev/2026: a **Comp** levantou **R$ 100 milhões em Série A (Khosla)** com tese de "serviços de RH com IA".
- Gupy (R$ 500 milhões) e Sólides (R$ 530 milhões) usaram rodadas grandes para comprar concorrentes.
- A Unico chegou a ser avaliada em **US$ 2,6 bilhões**.

Não encontrei estimativa recente e confiável de TAM em R$ para software de admissão/RH no Brasil.

### Cited Findings
- **HR techs brasileiras captaram R$ 590 milhões em 2024** (Liga Ventures + GoGood, base Startup Scanner) — [Fusões & Aquisições](https://fusoesaquisicoes.com/hr/hrtechs-captaram-r-590-milhoes/); [IT Forum](https://itforum.com.br/?p=9610370)
- **Comp:** R$ 100 milhões em Série A liderada pela Khosla Ventures (fev/2026). Expande de remuneração para "serviços completos de RH" com modelo *forward deployed* (executivos de RH + engenheiros de IA) — [Baguete](https://www.baguete.com.br/noticias/comp-levanta-r-100-milhoes)
- **Gupy:** R$ 500 milhões (SoftBank Latin America, Riverwood, Endeavor Catalyst), a maior rodada de HR tech brasileira, seguida da compra da Kenoby. É de 2021, e a data exata não foi confirmada nas fontes desta busca — [Startups.com.br](https://startups.com.br/noticias/gupy-levanta-r-500-mi-na-maior-rodada-para-uma-startup-fundada-por-mulheres-na-america-latina/); [Gupy](https://www.gupy.io/blog/aporte-500-milhoes-gupy)
- **Sólides:** aporte de R$ 530 milhões da Warburg Pincus, seguido da aquisição da Tangerino — [Startupi](https://startupi.com.br/tags/niduu/)
- **InHire:** ~R$ 50 milhões (DGF), ago/2025 — [Lex Legal](https://lexlegal.com.br/?p=32903); [Baguete](https://www.baguete.com.br/noticias/inhire-capta-recursos-com-dgf)
- **Humand** (origem argentina): US$ 66 milhões com Kaszek e Marcos Galperin. A empresa projeta +174% de faturamento no Brasil (data não confirmada) — [Bloomberg Línea](https://www.bloomberglinea.com.br/startups/humand-capta-us-66-mi-e-atrai-kaszek-e-marcos-galperin-como-investidores/)
- **Unico:** avaliada em US$ 2,6 bilhões (2022). Rodada anterior com SoftBank e General Atlantic a valuation de US$ 1 bilhão — [Bloomberg Línea](https://www.bloomberglinea.com/2022/04/13/investors-said-no-to-a-brazilian-entrepreneur-he-pivoted-now-his-startup-is-worth-26b/); [Brazil Journal](https://braziljournal.com/unico-ja-vale-us-1-bi-em-rodada-com-softbank-e-general-atlantic/)
- **Contagem de HR techs (Distrito, dados antigos):** 373 startups de RH (2020) e 356 (HRTech Report 2021). Investimento de US$ 3,6 bilhões em 20 anos — [Distrito](https://www.distrito.me/blog/hrtechs-crescimento); [Forbes Brasil](https://forbes.com.br/forbes-tech/2020/06/exclusivo-estudo-mapeia-rh-techs-do-brasil-e-aponta-enorme-potencial-de-crescimento/)

### Inferences
- **Narrativa para o VC:** (i) HR tech brasileira tem compradores estratégicos ativos (Gupy, Sólides); (ii) investidores de ponta (Khosla na Comp) estão financiando "RH operado por IA" no Brasil em 2026; (iii) a Unico prova que admissão digital e identidade sustentam empresa bilionária, mas o produto dela é formulário + biometria, não agente conversacional que cobra pendências.
- **[ESTIMATIVA] TAM bottom-up a montar** (depende do número de admissões/ano do Novo CAGED, de outra nota): TAM ≈ admissões formais/ano × R$ 25. Por exemplo, se forem ~25 milhões de admissões/ano [número a confirmar na nota 12.1], o TAM seria 25M × R$ 25 = **~R$ 625 milhões/ano**. É ilustrativo, não citável até confirmar o CAGED.

### Gaps
- Nenhum relatório recente (2024–2026) com tamanho de mercado de HR tech/admissão no Brasil em R$ foi encontrado. Os relatórios da Distrito são de 2020–2022.
- Valuations recentes (2025–2026) de Gupy, Sólides e Convenia: não públicos nas fontes encontradas.
- Datas exatas das rodadas de Gupy, Sólides e Humand não confirmadas nas páginas de tag consultadas.
