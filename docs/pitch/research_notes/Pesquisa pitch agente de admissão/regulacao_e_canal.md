# Regulação brasileira e canal WhatsApp para o Agente de Admissão

> Notas de pesquisa para o pitch (data de referência: 07/11/2026). Escopo: (a) obrigações e prazos legais que tornam a admissão
> crítica no tempo; (b) restrições da LGPD ao tratar esses documentos com IA; (c) regras e adoção do WhatsApp Business Platform.
> Ao final de cada bloco há inferências (argumento "por que agora" e riscos com mitigação). Fontes primárias preferidas; fontes
> secundárias marcadas como tal.

## 1. eSocial: prazos do S-2200 / S-2190 / S-2300 e multas (CLT arts. 41, 47, 47-A)

### Takeaway
Para empregado CLT, o registro no eSocial (S-2200, ou o S-2190 preliminar) tem de ser transmitido **até o fim do dia anterior ao
início do trabalho**; sem isso o empregado está "não registrado" e a multa é de **R$ 3.000 por empregado** (art. 47 CLT), mais
R$ 600 por empregado se faltarem dados do registro (art. 47-A). Para estagiário o evento é o S-2300, com prazo mais folgado (dia 15
do mês seguinte), mas a falta de documentos do estágio gera vínculo de emprego (ver seção 2).

### Cited Findings
- **S-2200 (empregados):** "para empregados, o prazo é até o dia imediatamente anterior ao do início da prestação dos serviços".
  Se a empresa optar por enviar o S-2190 (ou em admissão por transferência), o S-2200 passa a ter prazo "até o dia 15 (quinze) do mês
  subsequente ao da sua ocorrência, ou antes da transmissão de qualquer outro evento não periódico relativo a esse empregado".
  Temporários (Lei 6.019/1974): 5 dias úteis após o início. — [MOS eSocial S-1.3, consolidado até NO S-1.3 08.2026, publicado em 25/02/2026, p. ~208](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf)
- **S-2190 (Registro Preliminar de Trabalhador):** evento **opcional**, "alternativamente ao envio do evento S-2200", com
  "informações básicas do vínculo"; prazo "até o final do dia imediatamente anterior ao do início da prestação do serviço pelo
  empregado admitido"; é "imprescindível complementar as informações da admissão para regularizar o registro". — [MOS eSocial S-1.3, p. ~205](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf)
- Fontes secundárias antigas citam "dia 7 do mês seguinte" para o S-2200 após S-2190; o MOS vigente diz **dia 15**. Usar o MOS. — [Busca: Senior/Alterdata/VRI (secundárias)](https://www.vriconsulting.com.br/guias/guiasIndex.php?idGuia=797); confirmado por [MOS S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf)
- Se a contratação não se concretizar, o S-2190 deve ser excluído; S-2190 sem S-2200 correspondente impede o fechamento da competência (secundária). — [Alterdata, ajuda S-2190](https://ajuda.alterdata.com.br/dpbase/esocial-o-que-e-o-evento-s-2190-e-quando-sera-gerado-no-esocial-63591188.html)
- **S-2300 (estagiário e TSVE):** "deve ser transmitido até o dia 15 (quinze) do mês subsequente ao do início da prestação de
  serviços/estágio [...] ou antes da transmissão de qualquer outro evento não periódico"; o MOS define o S-2300 para trabalhadores
  sem vínculo "e a estagiários" (código 901); para estagiários "não é obrigatório o envio dos eventos de SST". — [MOS eSocial S-1.3, p. ~288-289](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf)
- **Versão vigente do eSocial:** leiaute/manual **S-1.3**, "aprovada pela Portaria Conjunta RFB/MPS/MTE nº 13 de 25/06/2024 – DOU de 28/06/2024"; consolidação publicada em 25/02/2026. (A série "S-1.x" é a do chamado eSocial simplificado.) — [MOS eSocial S-1.3, capa](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf)
- **CLT art. 41:** "Em todas as atividades será obrigatório para o empregador o registro dos respectivos trabalhadores, podendo ser
  adotados livros, fichas ou sistema eletrônico"; parágrafo único exige qualificação civil/profissional e dados da admissão. — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **CLT art. 47 (red. Lei 13.467/2017):** empregador que mantiver empregado não registrado "ficará sujeito a multa no valor de R$
  3.000,00 (três mil reais) por empregado não registrado", acrescido de igual valor em cada reincidência; o § 1º (R$ 800 para ME/EPP)
  aparece na compilação como alterado/revogado pela MP 905/2019, que caducou — tratar o valor para ME/EPP como ponto a confirmar. — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **CLT art. 47-A:** se não forem informados os dados do parágrafo único do art. 41, "multa de R$ 600,00 (seiscentos reais) por
  empregado prejudicado". — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **CLT art. 29 (red. Lei 13.874/2019):** "O empregador terá o prazo de 5 (cinco) dias úteis para anotar na CTPS [...] a data de
  admissão, a remuneração e as condições especiais"; arts. 29-A/29-B (Lei 14.438/2022): R$ 3.000 por empregado (R$ 800 ME/EPP) e
  R$ 600 por empregado em infrações de anotação. — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **CTPS Digital:** art. 14 da CLT (red. Lei 13.874/2019): "A CTPS será emitida [...] preferencialmente em meio eletrônico"; art.
  13: CTPS "é obrigatória para o exercício de qualquer emprego". — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **Registro eletrônico = eSocial:** Portaria MTP 671/2021 (art. 14 e seguintes) disciplina o registro de empregados; com a Portaria
  MTP 4.198/2022 o uso do eSocial é obrigatório para o registro eletrônico (vedados outros meios para quem já está obrigado). O
  mesmo regulamento reforça a CTPS Digital (secundárias, resumos da norma). — [FINDES, Informe Portaria 4.198/2022](https://findes.com.br/wp-content/uploads/2022/12/Informe-Estrategico-–-Portaria-MTP-no-4.198_2022-–-Alteracoes-na-Portaria-MTP-no-671_2021.pdf); [FINDES, Informe Portaria 671/2021](https://findes.com.br/wp-content/uploads/2021/11/Informe-Estrategico-–-Portaria-MTP-n-671_2021-Registro-de-empregados-e-anotacoes-na-carteira-de-trabalho.pdf); [texto compilado MTE](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/PDFINn2de8denovembrode2021compilado29.12.2022.pdf)

### Inferences
- O "relógio" da admissão CLT é **D-1 do primeiro dia de trabalho**: o RH precisa ter, até a véspera, ao menos os dados do S-2190
  (preliminar) e, se não usar o S-2190, todos os dados do S-2200. Isso transforma a coleta de documentos em tarefa com prazo legal
  duro, não em "boa prática" — argumento central para a cobrança escalonada do agente (seção 7 do desenho do produto) e para o
  alerta "2 dias antes do início".
- O S-2190 é a "válvula de escape" legal: o agente pode priorizar coletar primeiro o mínimo do S-2190 (CPF, data de nascimento,
  data de admissão — confirmar campos no leiaute) e o resto até o dia 15 do mês seguinte. Isso dá um argumento de produto:
  "garantimos o registro preliminar no prazo mesmo com documento pendente".
- Custo de erro facilmente quantificável no pitch: 10 admissões/mês sem registro tempestivo = exposição de R$ 30.000 por
  fiscalização (art. 47), sem contar reincidência e o art. 47-A.
- Para o modelo "Estágio" da demo, o argumento de prazo eSocial é mais fraco (S-2300 até dia 15 do mês seguinte); o argumento forte
  ali é o risco de caracterização de vínculo empregatício (seção 2). O pitch deve deixar essa distinção clara para não errar diante
  de especialistas.

### Gaps
- Não confirmei, no leiaute S-1.3, a lista exata de campos obrigatórios do S-2190 (o MOS diz apenas "informações básicas").
- Não confirmei se o § 2º do art. 47 (infração "constitui exceção ao critério da dupla visita") segue vigente — não li essa parte
  da página do Planalto.
- Status atual do valor reduzido para ME/EPP no art. 47 (§ 1º) é ambíguo na compilação (MP 905 caducada); confirmar com advogado.
- Não encontrei dados oficiais sobre volume de autos de infração por falta de registro (art. 47) para dimensionar o risco.

## 2. CLT e Lei do Estágio: o que pode e o que não pode ser exigido na admissão

### Takeaway
O empregador deve registrar o empregado com qualificação civil e dados da admissão (art. 41), mas é **crime** exigir teste/atestado
de gravidez ou esterilização (Lei 9.029/1995) e, salvo previsão legal ou natureza da função, exigir certidão de antecedentes
criminais gera dano moral presumido (TST, IRR Tema 1). No estágio, matrícula e frequência atestadas pela instituição de ensino e o
termo de compromisso tripartite são **requisitos**; faltando-os, há vínculo de emprego (Lei 11.788/2008, art. 3º, § 2º).

### Cited Findings
- **Lei 9.029/1995, art. 1º:** proíbe "qualquer prática discriminatória e limitativa para efeito de acesso à relação de trabalho"
  por sexo, origem, raça, cor, estado civil, situação familiar, deficiência, reabilitação profissional, idade, entre outros. — [Lei 9.029/1995, Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9029.htm)
- **Lei 9.029/1995, art. 2º:** constitui crime "a exigência de teste, exame, perícia, laudo, atestado, declaração ou qualquer outro
  procedimento relativo à esterilização ou a estado de gravidez"; pena de detenção de 1 a 2 anos e multa. — [Lei 9.029/1995, Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9029.htm)
- **Lei 9.029/1995, art. 4º:** dispensa discriminatória dá direito a dano moral e opção entre reintegração com ressarcimento ou
  remuneração em dobro do período de afastamento. — [Lei 9.029/1995, Planalto](https://www.planalto.gov.br/ccivil_03/leis/l9029.htm)
- **CLT art. 373-A, IV** (vedação de exigir atestado ou exame para comprovação de esterilidade ou gravidez na admissão) e **art. 442-A**
  (vedação de exigir experiência prévia superior a 6 meses na mesma atividade) — dispositivos conhecidos da CLT; não re-li o trecho
  nesta sessão (a página tem 500 mil caracteres). — [CLT, Planalto](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- **Antecedentes criminais (TST, IRR Tema 1, RR-243000-58.2013.5.13.0023):** a exigência "não é legítima e caracteriza lesão moral"
  salvo quando "amparada em expressa previsão legal ou justificar-se em razão da natureza do ofício ou do grau especial de fidúcia";
  dano *in re ipsa*, mesmo que o candidato não seja contratado. Julgado em 20/04/2017; trânsito em julgado 07/03/2024 (secundárias
  + acórdão). — [TST, Tema 01 (PDF)](https://www.tst.jus.br/documents/10157/24627054/Tema01.pdf/04a50887-88e5-a950-c717-63439a9f6d3c); [Acórdão no TRT-3](https://portal.trt3.jus.br/internet/jurisprudencia/incidentes-suscitados-irr-iac-arginc-tst/downloads/rr-243000-58_2013_5_13_0023.pdf); [Migalhas](https://www.migalhas.com.br/quentes/257691/tst-fixa-teses-sobre-dano-moral-por-exigencia-de-certidao-de-antecedentes-criminais)
- **Lei 11.788/2008, art. 3º:** estágio não cria vínculo se houver (I) "matrícula e freqüência regular do educando [...] atestados
  pela instituição de ensino", (II) "celebração de termo de compromisso entre o educando, a parte concedente do estágio e a
  instituição de ensino" e (III) compatibilidade entre atividades e o termo. **§ 2º:** o descumprimento "caracteriza vínculo de
  emprego do educando com a parte concedente". — [Lei 11.788/2008, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm)
- **Lei 11.788/2008, art. 7º:** a instituição de ensino celebra o termo de compromisso e exige relatório de atividades "em prazo não
  superior a 6 (seis) meses". **Art. 9º:** a concedente deve contratar seguro contra acidentes pessoais, entregar termo de realização
  do estágio ao fim e manter à disposição da fiscalização documentos que comprovem a relação de estágio. **Art. 11:** máximo de 2
  anos na mesma concedente (exceto PcD). **Art. 15:** reincidente fica "impedida de receber estagiários por 2 (dois) anos". — [Lei 11.788/2008, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm)

### Inferences
- O catálogo de documentos configurável pelo RH (seção 3 do desenho) precisa de **trava de conformidade**: o produto deve impedir (ou
  alertar fortemente) a inclusão de exames de gravidez/esterilização, e exigir justificativa ao incluir certidão de antecedentes
  criminais. Isso é um diferencial vendável ("o agente não deixa você pedir o que a lei proíbe").
- O "documento personalizado" em aberto (seção 11 do desenho) é exatamente onde mora esse risco; se entrar no MVP, deve vir com
  lista de bloqueio.
- No modelo "Estágio", a declaração de matrícula/frequência e o termo de compromisso assinado pelas três partes são os documentos
  críticos; o agente deve tratá-los como bloqueantes do início, e a renovação da declaração (frequência regular contínua) e o
  relatório semestral (art. 7º) são gatilhos naturais para o pilar de renovação.

### Gaps
- Não há lista legal fechada dos documentos que o empregador "pode" pedir; ela decorre dos campos do registro (art. 41, Portaria
  671/2021, leiaute S-2200). Não extraí a lista de campos do leiaute.
- Não pesquisei jurisprudência sobre exigência de consulta de crédito (SPC/Serasa) — comumente tida como discriminatória, mas sem
  fonte nesta pesquisa.

## 3. LGPD aplicada a documentos de admissão tratados com IA

### Takeaway
A base legal principal é **cumprimento de obrigação legal** (art. 7º, II — registro, eSocial) e **execução de contrato/procedimentos
preliminares** (art. 7º, V), sem necessidade de consentimento; dados sensíveis (biometria) só nas hipóteses do art. 11 (inclusive
prevenção à fraude em identificação e autenticação). Pontos de atenção para IA: minimização (art. 6º, III), revisão de decisões
automatizadas (art. 20), transferência internacional a provedores de LLM fora do Brasil (Res. CD/ANPD 19/2024 — cláusulas-padrão
obrigatórias desde 23/08/2025; UE adequada desde 26/01/2026), e a ANPD priorizando IA e biometria na agenda 2025-2026 e na
fiscalização 2026-2027.

### Cited Findings
- **Bases legais (art. 7º):** II — "para o cumprimento de obrigação legal ou regulatória pelo controlador"; V — "quando necessário
  para a execução de contrato ou de procedimentos preliminares relacionados a contrato". — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Dado sensível (art. 5º, II):** inclui "dado genético ou biométrico, quando vinculado a uma pessoa natural" (além de origem racial,
  saúde etc.). — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Art. 11, II:** sensível sem consentimento para (a) obrigação legal; (d) exercício regular de direitos, inclusive em contrato; (g)
  "garantia da prevenção à fraude e à segurança do titular, nos processos de identificação e autenticação de cadastro em sistemas
  eletrônicos", resguardados os direitos do art. 9º. — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Necessidade (art. 6º, III):** "limitação do tratamento ao mínimo necessário para a realização de suas finalidades". — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Retenção (art. 16):** dados "serão eliminados após o término de seu tratamento", autorizada a conservação, entre outros, para
  cumprimento de obrigação legal ou regulatória. — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Decisões automatizadas (art. 20):** o titular "tem direito a solicitar a revisão de decisões tomadas unicamente com base em
  tratamento automatizado" que afetem seus interesses. — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **RIPD (art. 38):** a ANPD pode exigir relatório de impacto; a própria ANPD indica avaliar RIPD em tratamento de alto risco (já
  citado na proposta estratégica §7.3, fonte [14] — conferido que o art. 38 existe e a página da ANPD é a referência correta). — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm); [ANPD, RIPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd)
- **Sanções (art. 52, II):** multa de até 2% do faturamento no Brasil, limitada a R$ 50 milhões por infração. — [LGPD, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Transferência internacional:** art. 33 permite transferir para países com proteção adequada e por outros mecanismos (cláusulas
  contratuais etc.). A **Resolução CD/ANPD nº 19/2024** (ago/2024) regulamentou o tema e deu 12 meses para incorporar as cláusulas-padrão
  contratuais (CPC) — prazo encerrado em **23/08/2025**; o texto das CPC deve ser incorporado sem alterações; cláusulas específicas são
  mecanismo residual (secundárias, escritórios). — [Lefosse](https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/); [Mayer Brown, 29/08/2025](https://www.mayerbrown.com/pt/insights/publications/2025/08/end-of-grace-period-implementation-of-brazils-standard-contractual-clauses-in-international-transfers-of-personal-data); [Migalhas: fiscalização ANPD](https://www.migalhas.com.br/quentes/449475/envio-de-dados-ao-exterior-esta-no-radar-fiscalizatorio-da-anpd)
- **Adequação mútua Brasil–UE:** Resolução CD/ANPD nº 32, de 26/01/2026, reconhece UE/EEE como adequados; a Comissão Europeia adotou a
  decisão recíproca na mesma época (fontes divergem entre 26 e 27/01/2026); reavaliação em 4 anos. — [Cescon Barrieu](https://cesconbarrieu.com.br/decisao-de-adequacao-reciproca-entre-brasil-e-uniao-europeia-implicacoes-para-fluxos-transfronteiricos-de-dados/); [ANPD, ata CD 01/2026](https://www.gov.br/anpd/pt-br/assuntos/deliberacoes-do-conselho-diretor-1/circuitos-deliberativos-ano-2026/cd-01-2026-ata.pdf)
- **Agenda Regulatória ANPD 2025-2026** (Res. 23/2024; atualizada pela Res. 31, de 22/12/2025): **dados biométricos** em fase 1
  (tomada de subsídios 02/06–01/08/2025, 84 contribuições; justificativa: erros e efeitos discriminatórios); **IA** com atenção a
  "parâmetros interpretativos para o art. 20" e aplicação da LGPD ao treinamento/uso de IA; "tratamento de alto risco" também na agenda. — [ANPD, Agenda 2025-2026](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-agenda-regulatoria-2025-2026); [ANPD, balanço 1º sem. 2026](https://www.gov.br/anpd/pt-br/assuntos/regulacao/agenda-regulatoria-1/agenda-regulatoria-2025-2026/balanco-agenda-regulatoria-2025-2026-01-2026.pdf/@@display-file/file); [Participa+Brasil, TS biometria](https://www.gov.br/participamaisbrasil/ts-dados-biometricos)
- **Fiscalização 2026-2027:** IA e tecnologias emergentes entre os 4 temas prioritários do Mapa de Temas Prioritários 2026-2027. — [ANPD, Mapa de Temas Prioritários 2026-2027](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026)
- **Caso de biometria:** ANPD determinou suspensão do tratamento biométrico para registro de frequência em escolas da rede pública do
  Paraná (SEED/PR) por uso excessivo frente a meios menos invasivos (via balanço da agenda). — [ANPD, balanço 2º sem. 2025](https://www.gov.br/anpd/pt-br/assuntos/regulacao/agenda-regulatoria-1/agenda-regulatoria-2025-2026/balanco-agenda-regulatoria-2025-2026-02-2025.pdf/@@display-file/file)
- **Retenção trabalhista (referência):** prescrição de créditos trabalhistas de 5 anos, até 2 anos após o fim do contrato (CF art. 7º,
  XXIX) — justifica conservação de documentos do vínculo além do término. — [Constituição, Planalto](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm)
- **Proposta estratégica §7.3 (reuso):** os controles mínimos ali (minimização, perfis de acesso, retenção definida, registro de
  acesso, isolamento de tenants, papel controlador/operador, RIPD) são compatíveis com os artigos acima e reutilizáveis. — [docs/HR_Compliance_AI_Proposta_Estrategica_Startup.md, §7.3](../../../HR_Compliance_AI_Proposta_Estrategica_Startup.md)

### Inferences
- **Papéis:** a empresa cliente é controladora; o Agente de Admissão é operador; o provedor de LLM e a Meta (WhatsApp) são
  suboperadores/terceiros — o contrato com o cliente deve prever isso (DPA).
- **Foto de documento ≠ automaticamente dado biométrico.** A foto do RG/CNH vira dado biométrico sensível quando é processada para
  reconhecimento facial (ex.: selfie vs. foto da CNH, como no Datavalid). Enquanto o MVP só faz OCR/extração, a base é art. 7º II/V;
  ao ligar biometria (roadmap Datavalid), entra o art. 11 II "g" (prevenção à fraude) e o tema prioritário da ANPD — exigir RIPD.
- **Minimização na prática:** coletar só o que o S-2200/S-2300 e o contrato exigem; não guardar a imagem bruta além do necessário
  se o dado estruturado basta (ou guardar com retenção definida ligada à prescrição trabalhista); mascarar CPF/conta em logs e prompts.
- **Art. 20 e "recusa de documento":** o agente recusar um comprovante ("emitido há mais de 90 dias") é decisão automatizada de baixo
  impacto, mas escalar/encerrar uma admissão não é. O desenho "LLM extrai, regras em código, RH decide nas escalações" é a mitigação
  certa: toda decisão com efeito sobre a contratação passa por humano, com motivo explicado e canal de contestação.
- **LLM estrangeiro:** usar API de LLM nos EUA exige CPC da Res. 19/2024 no contrato com o provedor (ou provedor/região com
  adequação, p.ex. UE). Alternativa: inferência hospedada em região Brasil, se disponível no provedor (não verificado).
- **Por que agora (LGPD):** o regime de transferência internacional ficou definido (CPC obrigatórias desde 23/08/2025; UE adequada
  desde jan/2026) e a ANPD anunciou IA e biometria como prioridades — quem nasce com conformidade embutida tem vantagem de venda
  em setores regulados.

### Gaps
- Não encontrei guia da ANPD específico para dados nas relações de trabalho (2025-2026); só materiais de entidades privadas (FIESP,
  OAB-DF) anteriores.
- Não encontrei sanção da ANPD dirigida especificamente a tratamento de dados de RH/admissão.
- Não verifiquei se a nova Carteira de Identidade Nacional (CIN) traz campos potencialmente sensíveis (ex.: tipo sanguíneo,
  condições de saúde) — se trouxer, a extração deve descartá-los.
- Não verifiquei disponibilidade de inferência de LLMs comerciais em região Brasil.

## 4. PL 2338/2023 (marco legal da IA): status e enquadramento de RH como alto risco

### Takeaway
Aprovado pelo Senado em 10/12/2024, o PL 2338/2023 **segue sem votação na Câmara** em novembro de 2026: situação "Aguardando Parecer
do(a) Relator(a) na Comissão Especial sobre Inteligência Artificial". O texto do Senado classifica como **alto risco** sistemas de IA
para recrutamento, triagem, avaliação de candidatos, promoções e desligamentos, mas exclui usos como tecnologia intermediária ou
tarefa processual restrita — onde a coleta/validação de documentos tende a se encaixar.

### Cited Findings
- Situação na Câmara: "Aguardando Parecer do(a) Relator(a) na Comissão Especial sobre Inteligência Artificial (PL 2338/23)"; últimas
  movimentações são apensações (01/09/2026 apensado o PL 3060/2026; entradas de 27/10/2026 são apensações a outros PLs). — [Câmara, ficha de tramitação PL 2338/2023](https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262)
- Aprovação no plenário do Senado em 10/12/2024. — [Brasil de Fato, 10/12/2024](https://www.brasildefato.com.br/2024/12/10/senado-aprova-pl-da-inteligencia-artificial)
- Relator na Câmara: dep. Aguinaldo Ribeiro (PP-PB); indicação de votação só após as eleições de outubro de 2026 (secundárias, não
  confirmadas em fonte oficial). — [Merovian](https://merovian.app/blog/pl-2338-marco-legal-da-inteligencia-artificial); [CBRdoc](https://blog.cbrdoc.com.br/marco-legal-da-ia-tera-votacao-final-em-2026/)
- Texto do Senado: lista de finalidades de alto risco inclui recrutamento, triagem, filtragem e avaliação de candidatos, decisões sobre
  promoções e cessação de relações de trabalho; versão posterior afasta o alto risco quando a IA é "tecnologia intermediária que não
  influencia ou determina resultado ou decisão" ou executa "tarefa processual restrita". Alto risco implica avaliação de impacto
  algorítmica e medidas contra viés; multa até R$ 50 milhões ou 2% do faturamento. — [Texto do PL 2338/2023 (Câmara, avulso)](https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3106629&filename=Avulso+PL+2338%2F2023); [Senado, texto](https://legis.senado.leg.br/sdleg-getter/documento?dm=9347622)

### Inferences
- O Agente de Admissão **não seleciona candidatos** (atua após a decisão de contratar) e as regras de validação são determinísticas;
  defensável como "tarefa processual restrita" fora do alto risco. Mas qualquer funcionalidade que recuse ou ranqueie pessoas (ex.:
  "suspeita de adulteração" que bloqueia a contratação) aproxima do alto risco — manter decisão humana nessas escalações.
- Para o pitch: "nascemos em conformidade com o texto do Senado (humano no circuito, log auditável, explicação de cada recusa)", sem
  afirmar que a lei está em vigor.

### Gaps
- Não confirmei o número exato do artigo/inciso de alto risco na versão aprovada pelo Senado (fontes citam arts. 14 ou 17).
- Não há data marcada para votação na Câmara.

## 5. WhatsApp Business Platform: templates, janela de 24 h, preços, política de IA e limites

### Takeaway
Mensagens de iniciativa da empresa fora da janela de atendimento de 24 h só podem ser **templates aprovados** (marketing, utilidade,
autenticação); a cobrança é **por mensagem** desde 01/07/2025, com utilidade/autenticação no Brasil em torno de **US$ 0,0068** por
mensagem. Desde **01/10/2026** utilidade dentro da janela aberta passou a ser cobrada e mensagens de serviço acima de 1.000/mês por
número também. A política da Meta proíbe provedores de IA de propósito geral (termos, seção 4.7), mas permite IA incidental à tarefa
de negócio — e no Brasil o CADE mantém medida preventiva contra a restrição. **Risco crítico:** a Política de Mensagens proíbe pedir
que pessoas informem números de documento de identidade e de contas financeiras.

### Cited Findings
- **Templates:** são "the only type of message that can be sent to WhatsApp users outside of a customer service window"; revisão
  automática, "Review can take up to 24 hours"; cada template deve ser categorizado como "authentication, marketing, or utility";
  há limite por usuário para templates de marketing. — [Meta, Template fundamentals](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview)
- **Modelo de preço:** desde 01/07/2025 a cobrança é por mensagem entregue (não por conversa), por categoria e país do destinatário;
  categoria "service" = respostas não-template dentro da janela de 24 h (inclui respostas de IA); janela gratuita de até 7 dias para
  quem chega por anúncio click-to-WhatsApp; tiers de volume só para utilidade e autenticação. — [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- **Mudanças 2026:** 01/07/2026 — faturamento em BRL para empresas elegíveis no Brasil (contas não-BRL migram até 30/06/2027) e lançamento
  do "Meta Business Agent" (cobrado por token, US$ 2,00/milhão, ~4–5 centavos de dólar/mensagem); **01/10/2026 — mensagens de utilidade em
  janela aberta passam a ser cobradas e mensagens de serviço acima da franquia de 1.000/mês por número passam a ser cobradas**; o Brasil
  não estava entre os mercados com mudança de tarifa listada. — [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- **Tarifa Brasil:** a página de preços da Meta dá ~0,68 centavo de dólar (US$ 0,0068) por mensagem de utilidade/autenticação para o
  Brasil. Marketing ~US$ 0,0625 (secundária). Valores em BRL de terceiros divergem (ex.: marketing R$ 0,3217 e utilidade/autenticação
  R$ 0,0350 segundo ChatMaxima, jul/2026; outros sites dão valores maiores) — usar o rate card oficial em CSV/PDF da Meta. — [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing); [Whautomate (secundária)](https://whautomate.com/whatsapp-business-api-pricing-brazil); [ChatMaxima (secundária)](https://chatmaxima.com/whatsapp-api-pricing/brazil/)
- **Limites de envio:** novos portfólios começam com 250 usuários únicos fora da janela em 24 h móveis; sobem para 2.000 (verificação
  do negócio ou 2.000 entregas de qualidade em 30 dias) e depois 10 mil, 100 mil e ilimitado automaticamente; limite compartilhado por
  todo o portfólio. — [Meta, Messaging limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- **Mídia:** imagem JPEG/PNG até 5 MB; documento (PDF, DOC etc.) até 100 MB; recebidos de clientes até 100 MB; IDs de mídia em webhooks
  de entrada expiram em 7 dias; URLs de mídia expiram em 5 minutos. — [Meta, Cloud API Media](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media)
- **Política de IA (Termos da Plataforma, seção 4.7 "Fornecedores de IA", atualizada em 23/09/2026):** fornecedores de IA/LLM são
  "estritamente proibidos" de usar a plataforma para oferecer essas tecnologias "quando elas forem a funcionalidade principal (em vez
  de incidental ou auxiliar)"; o cliente pode manter um provedor de IA como Provedor de Soluções, mas os dados da plataforma não podem
  ser usados para "treinar ou melhorar" modelos de terceiros (fine-tuning para uso exclusivo permitido). — [Meta Terms for WhatsApp Business Platform](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform)
- Contexto: a regra entrou para novos usuários em 15/10/2025 e para todos em 15/01/2026; mirava ChatGPT, Perplexity, Luzia etc.;
  bots de atendimento/vendas/notificação seguem permitidos. — [TechCrunch, 18/10/2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform); [respond.io](https://respond.io/blog/whatsapp-ai-chatbot-policy)
- **CADE (Brasil):** a Superintendência-Geral adotou medida preventiva em jan/2026 (denúncia de Luzia e Zapia, nov/2025) obrigando a
  Meta a permitir chatbots de IA de terceiros; houve suspensão judicial temporária depois revertida; o Tribunal do CADE manteve a
  medida por unanimidade em 04/03/2026 e, em abril/2026, manteve multa diária (R$ 250 mil, segundo Tecnoblog) por descumprimento
  ligado à cobrança de mensagens de chatbots a partir de 11/03/2026; inquérito em curso. — [CNN Brasil](https://www.cnnbrasil.com.br/economia/negocios/cade-mantem-medida-preventiva-que-obriga-meta-a-permitir-chatbots-de-ia-no-whatsapp/); [Tecnoblog, multa diária](https://tecnoblog.net/noticias/cade-mantem-multa-diaria-de-r-250-mil-contra-meta/); [Mercado & Consumo, 23/04/2026](https://mercadoeconsumo.com.br/23/04/2026/noticias/cade-mantem-multa-diaria-contra-a-meta-no-caso-envolvendo-uso-de-chatbots-de-ia-no-whatsapp/)
- **Política de Mensagens do WhatsApp Business (atualizada 23/09/2026):** exige "opt-in permission from the recipient" antes de contatar;
  automação exige "prompt, clear, and direct escalation paths" a humano (inclui transferência para agente humano na conversa);
  e determina: "Não divulgue nem peça às pessoas que divulguem números completos de cartão de pagamento individual", estendendo a
  vedação a números de contas financeiras, **números de documentos de identidade** e outras informações confidenciais, sem exceção
  explícita no texto. Também veda solicitar dados de saúde onde a lei aplicável proíbe. — [WhatsApp Business Messaging Policy (pt-BR)](https://whatsappbusiness.com/pt-br/policy/)

### Inferences
- **Fluxo da cobrança cabe nas regras:** o primeiro contato e os lembretes (24 h, metade do prazo, D-2) são templates de **utilidade**
  (ligados a uma transação em curso — a admissão), não marketing; custo ~US$ 0,007 cada. Uma admissão com ~6 templates + conversa
  em janela custa centavos de dólar — irrelevante frente à multa de R$ 3.000.
- **Opt-in:** o cadastro pelo RH deve registrar a autorização do colaborador para contato no WhatsApp (ex.: aceite na carta-oferta)
  — sem isso, viola a política.
- **Escalação humana** já está no desenho (seção 7) e coincide com exigência da política — usar como argumento.
- **Risco nº 1 do canal:** a vedação literal a pedir "números de documentos de identidade" e "contas financeiras" bate de frente com
  coletar RG/CPF/dados bancários por mensagem. Mitigações: (a) coletar documentos e dados bancários num **link seguro** (web upload
  próprio, autenticado por token de uso único) enviado pelo WhatsApp, usando o chat só para orientar e cobrar; (b) nunca pedir que o
  número seja digitado no chat e nunca ecoar números no chat; (c) confirmar com a Meta/BSP antes do piloto. Dados bancários como
  formulário (decisão em aberto na seção 11) devem ir para o link seguro, não para o chat.
- **Política de IA:** o agente é IA "incidental/auxiliar" a uma tarefa de negócio (admissão), não assistente de propósito geral — fora
  da proibição da seção 4.7. Manter o escopo fechado (a decisão em aberto "o colaborador pode tirar dúvidas gerais?" deve ser "só do
  processo") reforça isso. Não usar dados do WhatsApp para treinar modelos de terceiros.
- **Operação:** baixar e armazenar a mídia logo ao receber (URLs expiram em 5 min; IDs em 7 dias); fotos de celular podem passar de
  5 MB se enviadas como imagem — tratar envio como documento (até 100 MB). Para piloto com muitas admissões, verificar o negócio cedo
  (limite inicial de 250 usuários/24 h).
- **Custo pós-01/10/2026:** como utilidade dentro da janela agora é cobrada, o custo cresce com o número de templates; preferir
  respostas livres (serviço) dentro da janela quando possível — atenção à franquia de 1.000 mensagens de serviço/mês por número.

### Gaps
- Não obtive a tabela oficial em BRL do rate card da Meta para o Brasil (links CSV/PDF não abertos); só o valor em USD de
  utilidade/autenticação e valores de terceiros.
- Não encontrei interpretação oficial da Meta sobre se a vedação a "números de documentos de identidade" se aplica ao envio de foto
  de documento, nem lista de exceções para setores como RH; não verifiquei como concorrentes brasileiros que usam WhatsApp lidam com isso.
- Desfecho do inquérito do CADE após abril/2026 não encontrado.

## 6. Penetração e uso do WhatsApp no Brasil

### Takeaway
O Brasil tem 185 milhões de usuários de internet (out/2025) e o WhatsApp é o app mais presente na tela inicial dos smartphones
(64,8% em jun/2026, vs. 53% em 2025); 58% dos usuários estão em grupos de trabalho e 82% já falaram com empresas pelo app — o
colaborador já está lá, sem baixar app nem criar senha.

### Cited Findings
- 185 milhões de usuários de internet e 150 milhões de identidades ativas em redes sociais no Brasil (out/2025, Kepios). — [DataReportal, Digital 2026: Brazil](https://datareportal.com/reports/digital-2026-brazil)
- WhatsApp na tela inicial de 64,8% dos smartphones brasileiros (Super Panorama Mobile Time/Opinion Box, jun/2026), ante 53% na edição
  de 2025; é o app mais popular por esse critério. — [Mobile Time, 09/06/2026](https://www.mobiletime.com.br/noticias/09/06/2026/whatsapp-super-panorama/)
- Pesquisa Opinion Box (jun/2025, 1.126 usuários): 94% em ao menos um grupo; 58% em grupos de trabalho; 73% usam também no computador;
  82% já se comunicaram com empresas pelo app; 58% gostariam de separar uso pessoal e profissional. — [Canaltech, 16/07/2025](https://canaltech.com.br/apps/o-que-os-brasileiros-mais-fazem-no-whatsapp-segundo-pesquisa/)

### Inferences
- Argumento de canal: o "app de admissão" exige download, login e senha; o WhatsApp tem adoção praticamente universal e já é usado
  para trabalho. O dado "58% querem separar pessoal e profissional" é contraponto honesto — mitigado por um número oficial
  verificado da empresa e escopo fechado da conversa.

### Gaps
- Não encontrei número oficial atual de usuários do WhatsApp no Brasil (Meta) nem % de internautas que usam o app em fonte primária
  (sites terceiros citam 150–160 milhões sem fonte verificável).
- Não encontrei pesquisa sobre uso do WhatsApp especificamente por RH/DP para comunicação com colaboradores.

## 7. Serpro Datavalid (roadmap de autenticidade)

### Takeaway
O Datavalid valida dados biográficos e biometria (facial e digitais) contra bases oficiais — inclusive a foto da CNH —, prova de vida
passiva e o QR Code da CNH; cobra por validação, sem assinatura, com desconto progressivo. Preço público vigente não encontrado; a
referência pública mais recente (antiga) é ~R$ 0,80 por validação cadastral e ~R$ 1,68 por biometria facial na faixa até 999 consultas.

### Cited Findings
- Nova versão (11/06/2024): validação biográfica e biométrica (facial e digital), prova de vida facial passiva, leitura/validação do QR
  Code da CNH, digital com score por dedo; "não existe assinatura mensal", pagamento por validação com descontos progressivos; +1,53
  bilhão de validações e ~14,2 milhões de possíveis fraudes evitadas. — [Serpro, nova versão do Datavalid](https://serpro.gov.br/menu/noticias/noticias-2024/nova-versao-do-datavalid)
- Preço citado por reportagem (~4 anos): R$ 0,80 por validação cadastral, R$ 1,68 por biometria facial (até 999 consultas); MPDFT
  representou ao TCU questionando o uso de dados da CNH pelo Serpro; Serpro nega irregularidade. — [Tecnoblog](https://tecnoblog.net/noticias/mpdft-acusa-serpro-usar-dados-cnh-sem-autorizacao/)
- Loja oficial (preços): [Serpro Store, Datavalid](https://www.store.serpro.gov.br/datavalid) — retornou HTTP 403 nesta pesquisa.

### Inferences
- Custo de autenticidade forte por admissão fica na casa de R$ 1–3 (cadastral + facial), compatível com cobrança por admissão.
- Ligar biometria facial muda o enquadramento LGPD (dado sensível, art. 11 II "g") e entra no tema prioritário da ANPD — exige RIPD.

### Gaps
- Preço vigente em 2026 não verificado (loja bloqueou acesso; documentação da API com erro de certificado).

## 8. Síntese: "por que agora" e riscos de compliance com mitigação

### Takeaway
"Por que agora": prazo legal duro (D-1 do início, R$ 3.000/empregado) + canal universal e barato (WhatsApp Cloud API com cobrança
por mensagem, ~US$ 0,007 por lembrete) + LLMs multimodais capazes de ler documentos + regras de dados e IA ficando claras em 2025-2026
(CPC da ANPD, adequação UE, CADE mantendo IA de terceiros no WhatsApp no Brasil, PL 2338 pendente com RH no alto risco).

### Cited Findings
- Prazo e multa do registro — [MOS eSocial S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf); [CLT arts. 41, 47, 47-A](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- Preço por mensagem e mudanças de 01/07/2025, 01/07/2026 e 01/10/2026 — [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
- CPC obrigatórias desde 23/08/2025 — [Lefosse](https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/); adequação UE jan/2026 — [Cescon Barrieu](https://cesconbarrieu.com.br/decisao-de-adequacao-reciproca-entre-brasil-e-uniao-europeia-implicacoes-para-fluxos-transfronteiricos-de-dados/)
- IA e biometria prioritárias na ANPD — [ANPD, Mapa de Temas 2026-2027](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026)
- CADE manteve medida preventiva (04/03/2026) — [CNN Brasil](https://www.cnnbrasil.com.br/economia/negocios/cade-mantem-medida-preventiva-que-obriga-meta-a-permitir-chatbots-de-ia-no-whatsapp/)
- PL 2338 aguardando parecer na Câmara — [Câmara](https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262)
- Proposta estratégica, "Por que agora?": os bullets ali (3,6 milhões de casos novos na Justiça do Trabalho em 2024; autuação MTE de
  out/2026; EC 141/2026 e fim da escala 6×1) tratam de jornada/litígio, **não de admissão**; não foram re-verificados nesta pesquisa e
  só devem ser reaproveitados como contexto geral de compliance trabalhista. — [docs/HR_Compliance_AI_Proposta_Estrategica_Startup.md](../../../HR_Compliance_AI_Proposta_Estrategica_Startup.md)

### Inferences
**Riscos de compliance e mitigações (para slide de "riscos"):**

| # | Risco | Fonte | Mitigação no produto |
|---|---|---|---|
| 1 | Pedir números de RG/CPF/conta pelo chat viola a Política do WhatsApp (bloqueio do número) | [Política WhatsApp](https://whatsappbusiness.com/pt-br/policy/) | Upload e dados bancários via link seguro próprio; chat só orienta e cobra; nunca ecoar números; validar com BSP/Meta |
| 2 | Contatar sem opt-in | [Política WhatsApp](https://whatsappbusiness.com/pt-br/policy/) | Aceite de contato por WhatsApp registrado no cadastro pelo RH/carta-oferta |
| 3 | Ser visto como "IA de propósito geral" (seção 4.7) | [Termos Meta](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform) | Escopo fechado ao processo de admissão; recusar perguntas fora do escopo e escalar |
| 4 | Admissão sem registro até D-1 (R$ 3.000/empregado) | [CLT art. 47](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm); [MOS](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-08-2026.pdf) | Cobrança escalonada ancorada em D-1; coletar primeiro o mínimo do S-2190; alerta ao RH em D-2 |
| 5 | Estágio sem matrícula atestada/termo de compromisso vira vínculo de emprego | [Lei 11.788 art. 3º](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm) | Declaração e termo tripartite como bloqueantes; controle de validade e do limite de 2 anos |
| 6 | RH configurar documento proibido (gravidez, esterilização) ou injustificado (antecedentes) | [Lei 9.029](https://www.planalto.gov.br/ccivil_03/leis/l9029.htm); [TST Tema 1](https://www.tst.jus.br/documents/10157/24627054/Tema01.pdf/04a50887-88e5-a950-c717-63439a9f6d3c) | Lista de bloqueio no catálogo; justificativa obrigatória para antecedentes |
| 7 | Excesso de coleta/retenção | [LGPD arts. 6º III, 16](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Coletar só campos do registro/contrato; retenção vinculada à prescrição; descartar campos sensíveis extraídos |
| 8 | Transferência internacional ao provedor de LLM sem CPC | [Res. 19/2024 via Lefosse](https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/) | CPC no contrato com provedor; preferir região adequada (UE) ou Brasil; sem retenção/treino pelo provedor |
| 9 | Decisão automatizada contestável (art. 20) | [LGPD art. 20](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Regras determinísticas explicadas; humano decide escalações e qualquer bloqueio; trilha de auditoria |
| 10 | Biometria (Datavalid) sem RIPD | [LGPD art. 11](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm); [ANPD RIPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd) | Só no roadmap, com base art. 11 II "g", RIPD e opção não biométrica |
| 11 | Enquadramento futuro como IA de alto risco (PL 2338) | [Câmara](https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262) | Não selecionar nem ranquear pessoas; humano no circuito; logs para avaliação de impacto |
| 12 | Perda de mídia (URLs 5 min, IDs 7 dias) e custo pós-01/10/2026 | [Meta Media](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media); [Meta Pricing](https://developers.facebook.com/docs/whatsapp/pricing) | Download imediato para storage criptografado; preferir respostas na janela; monitorar custo por admissão |

### Gaps
- Não verifiquei os números da seção "Por que agora?" da proposta estratégica (fora do escopo de admissão).
- Falta confirmação jurídica (advogado trabalhista/LGPD) dos enquadramentos inferidos acima, especialmente risco 1 e o art. 47 § 1º.
