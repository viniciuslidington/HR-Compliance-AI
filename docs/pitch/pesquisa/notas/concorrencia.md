# Concorrência em admissão digital e coleta de documentos (foco Brasil)

> Notas de pesquisa para o pitch do Agente de Admissão. Pesquisa feita em 07/11/2026 em páginas de produto, imprensa e agregadores. Não testamos nenhum produto nem falamos com vendedores ou clientes. "Não encontrado" significa que não achamos evidência pública, não que o recurso não exista. Métricas de fornecedor não têm metodologia pública. Quando a data de uma página não aparece, indicamos "consultado em 07/11/2026".
>
> Reaproveitado dos documentos internos (não refeito): seção 6 da Proposta Estratégica. A seção 6 trata de ponto e jornada (Tako, Senior, TOTVS, Sólides, PontoCorp), não de admissão. Dela fica só que a Tako tem um "agente Otto" e um motor determinístico. Não encontramos evidência de que a Tako faça admissão.

## 1. Quem oferece admissão digital no Brasil e como (canal, captura, validação, cobrança, eSocial, preço, clientes, funding)

### Takeaway
O mercado brasileiro de admissão digital é maduro e quase todo baseado em **link, portal ou app com upload**, mais OCR ou IA para conferir dados e assinatura eletrônica. O WhatsApp entrou em 2025–2026 como canal de convite e notificação (Gupy) e, no caso da **Flash** (fev. e mai./2026), como canal de coleta conversacional com IA. Nenhum player publica preço de admissão: todos vendem "sob consulta", em planos por nível ou por número de colaboradores.

### Cited Findings

**Gupy Admissão** (maior player visível de admissão; parte de uma plataforma de recrutamento e seleção)
- Agentes de IA analisam os documentos digitalizados e os campos preenchidos pelo pré-colaborador. Nome, CPF e NIS são comparados com a qualificação cadastral do eSocial, e inconsistências geram alerta e pedido de correção. A validação combina IA e "time de especialistas". O "serviço especializado de validação automática" só existe no plano Enterprise. Consultado em 07/11/2026 — [Gupy — software de admissão digital](https://gupy.io/software-de-admissao-digital)
- Canais: convite por WhatsApp sem login, plataforma web sem senha e templates de e-mail e WhatsApp. Há notificações automáticas de documentos pendentes, prazos e status, e o RH "pode cobrar documentos automaticamente". Integrações: folha (padrão ou customizada), ERP, GED, ASO, DocuSign e vale-transporte. Consultado em 07/11/2026 — [Gupy — software de admissão digital](https://gupy.io/software-de-admissao-digital)
- Métricas do fornecedor, sem período nem metodologia: −55% no tempo de admissão, SLA de 120 min para validar os documentos, −20% no custo, mais de 800 mil admissões. Casos: Tahto, Petz (contratação de 32 para 18 dias), Pmweb e Ailos. A página diz "+4.000 empresas", sem separar quais usam o Admissão. Consultado em 07/11/2026 — [Gupy — software de admissão digital](https://gupy.io/software-de-admissao-digital)
- Fluxo descrito no blog (post de 28/09/2022, com nova data de 30/10/2026): o candidato faz o upload, a IA analisa, um documento inconsistente é rejeitado e o candidato é notificado. SLA de revisão de até 120 min — [Gupy blog — validação automática](https://www.gupy.io/blog/validacao-automatica-documentos)
- Segundo o aviso de privacidade da admissão, a IA verifica se os dados preenchidos batem com o documento anexado e se o arquivo é do tipo pedido. O WhatsApp é usado como canal "conforme habilitado pela Empresa Cliente". Resumo da ferramenta de busca; página não lida na íntegra — [Gupy — aviso de privacidade admissão](https://www.gupy.io/aviso-de-privacidade-admissao)
- Preço: não é público. Os planos Scale e Enterprise são vendidos por demonstração. **WhatsApp, integrações e SSO são "complemento pago"**. O Scale permite até 2 contratos eletrônicos e o Enterprise até 8. Consultado em 07/11/2026 — [Gupy — preços](https://www.gupy.io/precos)
- Funding e M&A: R$ 500 mi (~US$ 93 mi) liderados por SoftBank e Riverwood em 31/01/2022 — [Euronews](https://www.euronews.com/next/2022/01/31/gupy-funding). Comprou a Kenoby, sua principal concorrente — [Mondaq](https://www.mondaq.com/brazil/corporate-and-company-law/1164866/portal-beyond-the-law-announces-acquisition-of-kenoby-shares-by-gupy) — e a Niduu (2022) — [Startupi](https://startupi.com.br/tags/niduu/)

**Flash** (benefícios e RH; o player mais próximo da nossa tese — ver seção 2)
- 02/02/2026: lançou uma admissão "por fluxo conversacional com IA no WhatsApp" para a etapa pós-oferta. O sistema inicia o contato, pede os documentos e responde ao recebê-los. Em segundo plano, a IA **verifica a legibilidade** e **preenche os dados** no sistema da Flash. Segurança: a conversa é apagada após 24 h, o upload usa URL assinada e os arquivos passam por checagem de conteúdo malicioso. A empresa usa modelos da Anthropic, Google e OpenAI. Não foram divulgados métricas nem clientes — [Canaltech, 02/02/2026](https://canaltech.com.br/mercado/flash-aposta-em-ia-no-whatsapp-para-agilizar-a-admissao-em-empresas-brasileiras/)
- 21/05/2026 (post da Head de Produto): o candidato recebe pelo WhatsApp a lista de documentos e responde com fotos ou PDFs, "sem login, sem link externo, sem aplicativo novo". Os arquivos caem no perfil do candidato, onde o RH vê status e pendências, e **o RH valida**. O post usa a WhatsApp Business API e aponta o risco de mandar documentos ao WhatsApp pessoal do recrutador. Não menciona cobrança automática, explicação de recusa nem eSocial — [Flash — novidades de produto, 21/05/2026](https://flashapp.com.br/novidades-de-produto/coleta-documentos-whatsapp-admissao)
- Funding: Série D de R$ 150 mi em 19/08/2026 (Battery Ventures e Kevin Efrusy, com entrada da Endeavor Catalyst), destinada a "novas soluções e inteligência artificial". Mais de R$ 800 mi captados no total, receita +100% em 2025 e plano de retomar M&A — [Startups.com.br](https://startups.com.br/negocios/hrtech/flash-fecha-serie-d-de-r-150m-para-ser-lider-em-beneficios-ate-2030/); [Bloomberg Línea](https://www.bloomberglinea.com.br/startups/rodadas-da-semana-flash-capta-r-150-milhoes-para-acelerar-expansao/)

**Unico (unico people / Admissão Digital + unico check)**
- Portfólio: biometria facial, assinatura eletrônica e "admissão digital com assinatura eletrônica" (artigo de 2023) — [Na Prática](https://napratica.org.br/unico-transformando-o-futuro-da-tecnologia-com-mais-diversidade-equidade-e-inclusao). O Acesso RH virou "unico people" em 2020 — [MobileTime](https://www.mobiletime.com.br/tag/acesso-digital/)
- Valida dados e documentos junto ao eSocial e aos Correios. A empresa fala em admissão em 43 min e mais de 15 mil admissões por mês. A matéria não tem data visível e provavelmente é de 2021–2022, ou seja, o número é antigo — [NeoFeed](https://neofeed.com.br/startups/na-idtech-unico-quem-ve-cara-ve-assinatura/)
- Na Hypera Pharma, o colaborador assina pelo celular com selfie (validação biométrica) — [MundoRH](https://mundorh.com.br/hypera-pharma-utiliza-tecnologia-da-unico-para-agilidade-e-seguranca-no-processo-de-admissao-de-novos-colaboradores). O Unico Sign só funciona com o Unico People — [Unico devcenter](https://devcenter.unico.io/unico-sign)
- A plataforma IDCloud da Unico envia notificações por WhatsApp, SMS e e-mail. Isso é genérico e não confirma um fluxo de admissão por WhatsApp — [Unico IDCloud — métodos de integração](https://devcenter.unico.io/idcloud/en/getting-started/integration-methods)
- Porte: unicórnio em ago./2021 (R$ 625 mi, SoftBank e General Atlantic) — [Brazil Journal](https://braziljournal.com/unico-ja-vale-us-1-bi-em-rodada-com-softbank-e-general-atlantic/). Série D de US$ 100 mi (Goldman Sachs), valuation de US$ 2,6 bi (abr./2022) — [Bloomberg Línea](https://www.bloomberglinea.com.br/2022/04/13/investidores-disseram-nao-ele-pivotou-e-agora-sua-startup-vale-us-26-bilhoes/). Mais de 1,5 bi de verificações de identidade em 2025, +84% de volume (jun./2026) — [Biometric Update](https://www.biometricupdate.com/202606/unico-reports-84-growth-in-idv-volume-as-global-expansion-accelerates)

**Senior Sistemas (Admissão Digital + SARA)**
- A Admissão Digital tem OCR que lê as imagens e compara com os campos digitados. O RH confere na aba "Em validação". A empresa fala em economizar "até 70% de tempo". Consultado em 07/11/2026 — [Senior — documentação, Validação por OCR](https://documentacao.senior.com.br/seniorxplatform/manual-do-usuario/hcm/admissao-digital/validacao-ocr)
- A Senior diz que o OCR com IA reduz a validação de 5 min para 1,5 min por documento. Resumo da busca; página não lida na íntegra — [Senior — IA e OCR no RH](https://www.senior.com.br/noticias/como-a-ia-e-ocr-podem-trazer-maior-agilidade-nos-processos-do-rh)
- Há conectores para "assinatura eletrônica via SMS/WhatsApp" na Admissão Digital. Só vimos o título da página nos resultados da busca — [Senior — configuração dos conectores](https://documentacao.senior.com.br/seniorxplatform/manual-do-usuario/hcm/admissao-digital/configuracao-dos-conectores)
- 22/08/2025: a SARA, assistente multiagente feita com IBM watsonx Orchestrate, roda em WhatsApp, Teams, Slack e portal. **A coleta e validação de documentos na Admissão Digital pela SARA é anunciada no futuro ("ainda estará disponível")**. Porte: receita de R$ 975,9 mi em 2024 e mais de 13 mil clientes — [Baguete, 22/08/2025](https://www.baguete.com.br/noticias/senior-orquestra-agentes-de-ia-com-ibm)
- A SARA no WhatsApp tem "escopo padrão" não customizável e se conecta só a sistemas Senior — [Senior — SARA no WhatsApp, FAQ](https://documentacao.senior.com.br/sara-no-whatsapp/perguntas-frequentes.htm)

**Sólides (Tangerino, Gestão)** — foco em PMEs
- O módulo de admissão reúne os arquivos e permite "deferimento ou indeferimento" de cada documento (revisão humana). A assinatura por WhatsApp está no módulo de GED, não no de admissão — [Sólides — demo módulo admissão](https://solides.com.br/lp/demonstracao-modulo-admissao/); [Sólides — demo GED](https://solides.com.br/lp/demonstracao-ged/)
- O preço não é público — [G2 — Sólides RH pricing](https://www.g2.com/products/solides-rh/pricing)

**Convenia** (DP para PMEs)
- Admissão "100% online": um link é enviado para o colaborador preencher o cadastro, enviar documentos e assinar. Há kanban de admissões, checklist de documentos e integração com ponto. A própria empresa não divulga preço — [Convenia blog — software de admissão](https://blog.convenia.com.br/software-de-admissao/)
- Funding conhecido: follow-on do Criatec 2 (provavelmente 2020; valor não divulgado), com ~1,5 mil clientes na época — [Startupi](https://startupi.com.br/convenia-startup-especializada-na-automatizacao-do-departamento-pessoal-das-empresas-recebe-aporte/)

**Caju** — o Caju Ciclos ganhou assinatura digital voltada à admissão e gestão de documentos trabalhistas (data incerta, ~2024). Não encontramos coleta via WhatsApp nem IA — [Finsiders](https://finsidersbrasil.com.br/giro-noticias/caju-ciclos-simplifica-gestao-de-documentos-para-rhs/)

**Tako** — folha com agentes (LLMs + "repositórios de regras formais"), Série A de R$ 100 mi em 30/07/2025. Clientes: Warren, Tractian, SouSmile. A matéria não fala em admissão nem em WhatsApp — [Startupi, 30/07/2025](https://startupi.com.br/tako-levanta-r-100-milhoes-agentes-de-ia/)

**Bots de WhatsApp para RH (genéricos)**
- A Yaky, bot que recebe e valida documentos pelo WhatsApp com perguntas programadas, é citada em matéria de 2019. É um precedente de fluxo roteirizado, sem LLM. Resumo da busca — [MundoRH](https://mundorh.com.br/conheca-3-aplicativos-que-usam-inteligencia-artificial-para-otimizar-o-rh)
- Blip: os cases encontrados são de outros setores (Energisa, Volkswagen, Stellantis), nenhum de admissão ou RH — [Baguete — tag Blip](https://www.baguete.com.br/category/tags/blip)

### Inferences
- *(Inferência)* O padrão dominante no Brasil é "**portal + OCR + humano confere**": Senior (aba "Em validação"), Sólides (deferir ou indeferir), Gupy (IA + especialistas, SLA de 120 min) e Flash (RH valida). O agente é vendido como acelerador da conferência, não como dono do processo.
- *(Inferência)* A validação de Gupy e Unico vai além do que o MVP planeja: a Gupy faz qualificação cadastral no eSocial (Nome, CPF, NIS) e a Unico faz biometria facial e checagem nos Correios. No pitch, não devemos dizer que "ninguém valida". O diferencial deve ser **explicar e resolver no canal**, não validar.
- *(Inferência)* O modelo de preço comum é plano por nível, sob consulta, com add-ons. A Gupy cobra o WhatsApp à parte, o que indica que o canal ainda é tratado como acessório pelo incumbente.
- *(Inferência)* Gupy, Flash e Unico estão presos às próprias plataformas (recrutamento, benefícios, identidade). Um agente que cadastra em **qualquer** sistema de destino tem posição de "camada neutra", mas precisa provar integrações.

### Gaps
- Não pesquisamos a fundo nem achamos evidência específica de admissão para **Feedz, Pontomais, TOTVS RH (Meu RH), Dootax, Qulture, Contabilizei, Pipefy (templates) e Zenvia**. A TOTVS tem conteúdo sobre admissão digital ([TOTVS blog](https://www.totvs.com/blog/negocios/admissao-digital/)), que não lemos. A Kenoby foi absorvida pela Gupy.
- Não confirmamos o "Bom dia RH": a busca não trouxe nenhum produto com esse nome.
- Nenhum fornecedor publica preço por admissão ou por colaborador. Para estimar, só com cotação.
- Faltam dados recentes (2025–2026) de volume de admissões da Unico People. O dado de 15 mil por mês é antigo.

## 2. Algum player já usa um agente de IA que conversa no WhatsApp, explica a recusa e cobra sozinho? (evidência datada)

### Takeaway
**Sim, parcialmente — a Flash (02/02/2026) é o concorrente direto mais próximo.** Ela coleta pelo WhatsApp com IA, checa legibilidade e preenche o cadastro. A Gupy (2026) chama sua jornada de "contratação agêntica no WhatsApp", mas na etapa de admissão envia um link e uma mensagem que "não recebe respostas". Não encontramos evidência pública de um player brasileiro que **explique a recusa de forma específica no chat, cobre com escalonamento autônomo, aplique regras de consistência entre documentos e só escale ao RH por exceção**. Lá fora, a Superdash chega perto.

### Cited Findings
- **Flash, 02/02/2026:** conversa iniciada pelo sistema no WhatsApp, IA checa legibilidade e preenche dados — [Canaltech](https://canaltech.com.br/mercado/flash-aposta-em-ia-no-whatsapp-para-agilizar-a-admissao-em-empresas-brasileiras/). **Flash, 21/05/2026:** o RH "valida os documentos" e "identifica pendências". Não há menção a cobrança automática nem à explicação do motivo da recusa — [Flash](https://flashapp.com.br/novidades-de-produto/coleta-documentos-whatsapp-admissao)
- **Gupy, página "Contratação agêntica no WhatsApp" (2026; prazo de exemplo 30/03/2026):** agentes fazem triagem e pré-entrevista (áudio ou texto), agendamento com lembrete 2 h antes e carta-oferta pelo WhatsApp. Na etapa "Admissão Digital", o candidato recebe a lista de documentos e um **link para envio**, e a mensagem de exemplo diz "Esta mensagem é informativa e não recebe respostas". A empresa fala em −20% no tempo de envio de documentos (caso Tania Bulhões) — [Gupy — jornada WhatsApp](https://www.gupy.io/lm/menu-site/jornada-whatsapp-contratacao)
- **Gupy Admissão:** a recusa de documento existe (rejeição + notificação), mas acontece dentro da plataforma, com SLA de até 120 min e participação humana — [Gupy blog](https://www.gupy.io/blog/validacao-automatica-documentos); [Gupy — admissão](https://gupy.io/software-de-admissao-digital)
- **Senior SARA, 22/08/2025:** envio e validação de documentos na admissão anunciados como recurso futuro — [Baguete](https://www.baguete.com.br/noticias/senior-orquestra-agentes-de-ia-com-ibm)
- **Superdash:** agente de IA no WhatsApp que pede documentos, tira dúvidas, **valida contra critérios do cliente, pede reenvio explicando o motivo** e faz follow-up por ligação ou WhatsApp quando o cliente some. O público é fintechs, bancos, NBFCs e empresas de consumo, não RH. O post de lançamento aparece como "1 ano atrás" quando consultado em 2026 — [Product Hunt — Superdash](https://www.producthunt.com/p/document-collection-by-superdash/document-collection-by-superdash)

### Inferences
- *(Inferência)* "Admissão pelo WhatsApp com IA" **já não é novidade no Brasil** desde fev./2026, com a Flash (Série D de R$ 150 mi em ago./2026, dinheiro voltado a IA). O pitch não pode se apoiar em "ninguém faz WhatsApp". Deve se apoiar em **autonomia até o fim**: o agente é dono da pendência, explica o erro específico ("comprovante emitido há 120 dias; precisa ser de até 90"), cobra com cadência própria, aplica regras determinísticas entre documentos (CPF com dígito verificador válido, nome igual no RG e no CPF, titular da conta) e o RH só vê exceções.
- *(Inferência)* As lacunas que observamos nos materiais públicos dos incumbentes:
  1. explicação de recusa no próprio chat (a Flash não descreve, a Gupy recusa na plataforma);
  2. cobrança autônoma com escalonamento (a Gupy tem notificações e "cobrança automática" acionada pelo RH; a Flash não descreve);
  3. escalação por exceção, como 3 falhas, prazo em risco ou suspeita de adulteração (ninguém descreve);
  4. independência do sistema de destino (todos são plataformas fechadas).

  Não está provado que esses recursos não existam: é falta de evidência pública.
- *(Inferência)* A Superdash mostra que o padrão "coleta + validação + reenvio explicado + follow-up no WhatsApp" é vendável em serviços financeiros. Há pelo menos um precedente de produto, o que reduz o risco de "ninguém quer isso" e aumenta a pressão de quem chega rápido.
- *(Inferência)* Um risco competitivo realista: Gupy ou Flash adicionarem resposta conversacional à etapa de admissão. O WhatsApp e a IA já estão nos dois produtos.

### Gaps
- Não vimos demonstração em vídeo nem teste do fluxo da Flash. Não sabemos se o agente explica o motivo da recusa nem se cobra sozinho.
- Não confirmamos o país nem a data exata de lançamento da Superdash (a citação a NBFCs sugere Índia — inferência).

## 3. Referências internacionais (posicionamento breve)

### Takeaway
Lá fora, onboarding de RH também é sobretudo **portal, e-mail com link e tarefas com upload e e-sign** (BambooHR, Workday). A camada de autonomia com canais de mensagem aparece em agentes de coleta horizontais (Superdash). A verificação de identidade (Persona, Onfido, Stripe Identity) é uma camada separada, vendida por verificação.

### Cited Findings
- **BambooHR:** o colaborador recebe por e-mail um link para assinar documentos. Tarefas podem exigir upload obrigatório ("não consegue concluir a tarefa até enviar o documento"), com limite de 20 MB por arquivo e relatórios de status do que foi assinado e do que está pendente. I-9/E-Verify via Mitratech — [BambooHR — e-signatures](https://www.bamboohr.com/hr-software/electronic-signatures/); [BambooHR help — upload](https://bamboohr.screenstepslive.com/m/53922/l/587915-upload-a-document-or-file)
- **Workday:** a etapa Generate Document gera o documento para o colaborador revisar, reconhecer e assinar no onboarding — [Workday docs](https://doc.workday.com/admin-guide/en-us/human-capital-management/recruiting/onboarding-experience/steps--set-up-workday-docs-for-onboarding-.html)
- **Rippling e Deel:** não encontramos anúncio oficial de agente de coleta por WhatsApp. As descrições de "coleta de documentos compliant" da Deel vêm de agregadores — [People Managing People](https://peoplemanagingpeople.com/fr/tools/deel-vs-rippling-fr/) (fonte de baixa confiabilidade)
- **Verificação de identidade:** Persona tem plano de entrada de US$ 250/mês (contrato de 12 meses) e taxas por verificação não publicadas; Onfido (hoje Entrust) custa ~US$ 1,50–3 por verificação; Stripe Identity, US$ 1,50 por verificação. Todos os números vêm de agregadores, de mai. a jun./2026 — [xpay — Persona](https://www.xpay.sh/saas-pricing/persona/); [Finexer — Onfido](https://blog.finexer.com/onfido-pricing/); [apiscout](https://apiscout.dev/blog/best-identity-verification-apis-2026)
- **Humand** (argentina, frontline): Série A de US$ 66 mi em 23/02/2026 (Kaszek, Goodwater, YC), ~150 mil usuários no Brasil (Magalu, MRV). A matéria não fala em admissão — [Startups.com.br, 23/02/2026](https://startups.com.br/negocios/rodada-de-investimento/meses-apos-chegar-no-brasil-humand-levanta-us-66m/)

### Inferences
- *(Inferência)* Persona, Onfido e Unico Check são complementares, não substitutos: podem ser a API de autenticidade que o desenho do produto deixou para depois (o Serpro Datavalid tem o mesmo papel). O custo de US$ 1,50–3 por verificação ajuda a dimensionar o custo unitário.

### Gaps
- Não aprofundamos Sapling/Kallidus, HireRight nem as funções de IA da Deel e da Rippling em 2026.

## 4. Rodadas e M&A em HR tech no Brasil (2024–2026) como sinal de interesse de investidores

### Takeaway
Há capital relevante entrando em HR tech no Brasil em 2025–2026, com a narrativa explícita de "IA e agentes": Flash (R$ 150 mi, ago./2026), Tako (R$ 75 mi em nov./2024 e R$ 100 mi em jul./2025), Humand (US$ 66 mi, fev./2026) e InHire (R$ 50 mi, ago./2025). Há também sinais de consolidação: Flash quer retomar M&A, Gupy comprou Kenoby e Niduu, HR Path comprou GDT Brasil.

### Cited Findings
- **Flash:** Série D de R$ 150 mi em 19/08/2026 (Battery, Kevin Efrusy, Endeavor Catalyst), para IA, expansão comercial e possivelmente M&A — [Startups.com.br](https://startups.com.br/negocios/hrtech/flash-fecha-serie-d-de-r-150m-para-ser-lider-em-beneficios-ate-2030/); [Startupi](https://startupi.com.br/flash-capta-r-150-milhoes-em-serie-d/)
- **Tako:** Série A de R$ 100 mi em 30/07/2025 (Ribbit Capital, segundo resumo da busca) — [Startupi](https://startupi.com.br/tako-levanta-r-100-milhoes-agentes-de-ia/); [Baguete](https://www.baguete.com.br/noticias/tako-capta-r-100-milhoes). Rodada anterior de R$ 75 mi em nov./2024 — [Baguete](https://www.baguete.com.br/noticias/tako-do-fundador-da-doghero-capta-r-75-mi)
- **Humand:** US$ 66 mi em 23/02/2026 — [Startups.com.br](https://startups.com.br/negocios/rodada-de-investimento/meses-apos-chegar-no-brasil-humand-levanta-us-66m/)
- **InHire** (recrutamento): R$ 50 mi, com notícia de 21/08/2025 (CV Idexo) — [LexLegal](https://lexlegal.com.br/?p=32903)
- **Start Carreiras:** R$ 13 mi (Graphene Ventures), 14/04/2025 — [Baguete](https://www.baguete.com.br/noticias/start-carreiras-capta-r-13-milhoes)
- **HR Path:** concluiu a compra da GDT Brasil em 2026, segundo resumo da busca — [TI Inside, 10/07/2026](https://tiinside.com.br/en/10/07/2026/hr-path-recebe-investimento-de-quase-us-1-bilhao/)
- **Senior:** meta de chegar a R$ 5 bi de receita até 2033 (receita de R$ 975,9 mi em 2024) — [Baguete](https://www.baguete.com.br/noticias/senior-orquestra-agentes-de-ia-com-ibm)
- **Unico:** mais de 1,5 bi de verificações em 2025 (+84%) — [Biometric Update, jun./2026](https://www.biometricupdate.com/202606/unico-reports-84-growth-in-idv-volume-as-global-expansion-accelerates)

### Inferences
- *(Inferência)* Para o VC, o sinal é duplo: **há apetite** por HR tech com IA no Brasil, **mas** os incumbentes recém-capitalizados (Flash, Gupy, Tako) podem copiar a funcionalidade. Daí a necessidade de mostrar um foco que eles não priorizam: admissão de alto volume e autonomia até o cadastro em qualquer sistema.

### Gaps
- Não confirmamos rodadas de Gupy, Sólides, Caju ou Convenia em 2024–2026. A última rodada pública da Gupy que achamos é de jan./2022.
- Não verificamos o novo aporte do H.I.G. e da HIX na LG lugar de gente, nem a "Comp, US$ 17,25 mi" (a data e a origem da Comp não ficaram claras).
- Não consultamos relatórios consolidados de Distrito, Sling Hub ou Crunchbase sobre HR tech no Brasil.

## 5. Do que os usuários reclamam nas ferramentas de admissão (Reclame Aqui, G2, Capterra, lojas de app)

### Takeaway
A evidência pública de reclamações **específicas de admissão** é escassa: o Reclame Aqui concentra queixas de candidatos sobre recrutamento, não sobre o DP. O argumento de dor mais citável vem dos próprios fornecedores: o risco de documentos no WhatsApp pessoal do recrutador (Flash), a revisão humana com SLA de horas (Gupy) e o OCR que ainda exige conferência humana (Senior).

### Cited Findings
- A Gupy tem selo RA1000 e nota 9,1/10 nos últimos 6 meses no Reclame Aqui. As queixas que aparecem são de falta de retorno em vagas e CPF já usado por terceiros, segundo resumo da busca — [Reclame Aqui — Gupy](https://www.reclameaqui.com.br/empresa/gupy/). A Gupy ganhou o Prêmio Reclame Aqui 2025 em "Emprego e RH" — [Gupy blog](https://www.gupy.io/blog/gupy-vence-premio-reclame-aqui)
- Há uma reclamação no Reclame Aqui com o título "Erro no sistema impede a conclusão de processos seletivos via QR Code e WhatsApp". O conteúdo não foi acessado (HTTP 403) — [Reclame Aqui](https://www.reclameaqui.com.br/gupy/erro-no-sistema-impede-a-conclusao-de-processos-seletivos-via-qr-code-e-whatsapp_iVN6KkJqXkS2SRwv/)
- A Flash descreve a dor do "WhatsApp informal": CPF, RG e comprovante enviados ao WhatsApp pessoal do recrutador ficam "fora do controle da empresa" e "sem processo de descarte definido" (21/05/2026) — [Flash](https://flashapp.com.br/novidades-de-produto/coleta-documentos-whatsapp-admissao)
- Os fluxos de incumbentes ainda dependem de conferência humana: na Senior, a aba "Em validação" do RH; na Sólides, deferir ou indeferir documento a documento; na Gupy, IA + especialistas com SLA de até 120 min — [Senior](https://documentacao.senior.com.br/seniorxplatform/manual-do-usuario/hcm/admissao-digital/validacao-ocr); [Sólides](https://solides.com.br/lp/demonstracao-modulo-admissao/); [Gupy](https://www.gupy.io/blog/validacao-automatica-documentos)
- Em outros setores, há reclamações de recusa de documento por motivo pouco claro e sem reenvio imediato (ex.: QR Code parcialmente coberto). Serve só como análogo da dor de "recusa sem explicação" — [Reclame Aqui — caso Fatal Model](https://www.reclameaqui.com.br/fatal-model/cadastro-recusado-por-erro-no-envio-de-documento-solicitacao-de-reanalise_j2lyHcdVwR7ElAan/)

### Inferences
- *(Inferência)* O argumento de lacuna mais defensável no pitch não é "as ferramentas são ruins". É que **elas param na pendência**: recusam ou sinalizam, e alguém (RH ou candidato) precisa descobrir o porquê e correr atrás. O agente fecha esse ciclo.
- *(Inferência)* O WhatsApp informal persiste porque o candidato não quer instalar app nem criar login. A Flash e a Gupy reconhecem isso ao vender "sem login, sem link, sem app".

### Gaps
- Não conseguimos extrair reviews de G2, Capterra ou lojas de app sobre módulos de admissão (Gupy Admissão, Unico People, Convenia, Sólides). Os agregadores não trouxeram avaliações por módulo, e o Reclame Aqui bloqueou o acesso (403).
- Para o pitch, a melhor evidência de dor provavelmente virá de customer discovery (entrevistas com DP), não de reviews públicos.
