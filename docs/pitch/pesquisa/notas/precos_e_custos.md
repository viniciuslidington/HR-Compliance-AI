# Preços de mercado e custo por admissão

Pesquisa de 08/11/2026 para definir os [planos de assinatura](../../tese-de-negocio.md#planos-de-assinatura). Complementa a nota
[modelo_de_negocio.md](modelo_de_negocio.md), que usava R$ 25 por admissão como hipótese sem fonte.

## 1. Quanto o mercado cobra

### Sistemas de RH com admissão (preço por colaborador por mês)

| Produto | Preço | O que inclui | Fonte |
|---|---|---|---|
| Convenia Ágil | **R$ 14** por colaborador/mês | Diretório, admissão, desligamento, relatórios | [Convenia, página de planos](https://www.convenia.com.br/planos-convenia) (oficial) |
| Convenia Integrado | **R$ 16** por colaborador/mês | Ágil + férias, benefícios, holerites, portal do colaborador | Idem |
| Convenia, complementos | R$ 4 por colaborador/mês cada | Ponto, assinatura eletrônica, folha etc. | Idem |
| Sólides | A partir de **R$ 1,90** por colaborador/mês | Plano de entrada; admissão digital fica em pacote de DP | [Sólides, planos](https://solides.com.br/planos-e-precos/) (oficial; valores atuais não aparecem na página) |
| Factorial | US$ 7 a 8 por usuário/mês | Suíte de RH | [G2](https://www.g2.com/products/factorial/pricing), [Capterra](https://www.capterra.com/p/168685/Factorial-HR-Software/) (agregadores) |
| Pontotel | R$ 5 a 30+ por colaborador/mês | Ponto e DP | Comparativo de terceiros, não oficial |
| Gupy Admissão | **Não publica** | Validação automática de documentos só no Enterprise; WhatsApp é complemento pago | [Gupy, preços](https://www.gupy.io/precos) (oficial) |

**Leitura:** a admissão é vendida dentro de suítes, cobrada por colaborador ativo. A referência oficial mais clara é a
Convenia: R$ 14 por colaborador/mês por um pacote em que a admissão é um de quatro módulos. Ninguém publica preço por
admissão.

### Controle de vencimentos e SST (referência para a renovação)

| Produto | Preço | O que inclui | Fonte |
|---|---|---|---|
| Bevart (software de SST) | R$ 99/mês até 20 vidas · R$ 163 (100) · R$ 373 (500) · R$ 548 (1.000) · R$ 1.548 (5.000) | PGR, PCMSO, ASO, NR-10, NR-35; calcula vencimento e envia convocação por e-mail e WhatsApp | [Bevart](https://bevart.com.br/) (oficial) |
| Planilhas de controle de ASO e treinamento | R$ 148, pagamento único | Controle manual de vencimentos | [Soft Excel](https://www.softexcelplanilhas.com/product-page/planilha-de-controle-de-aso-atestado-de-sa%C3%BAde-ocupacional) |

**Leitura:** um sistema completo de SST custa de **R$ 0,31 a R$ 1,63 por vida por mês**, caindo com o volume. Ele
avisa e convoca, mas não lê nem confere o documento novo. A renovação conduzida precisa ficar nessa faixa.

### Validação de autenticidade

Serpro Datavalid: R$ 0,80 por validação cadastral e R$ 1,68 por biometria (preço de 2019, faixa de até 999 consultas).
Ver [modelo_de_negocio.md](modelo_de_negocio.md), Q2.

## 2. Quanto custa para nós

### Leitura de documento (medida)

Medição em 08/11/2026 com o fluxo `admissao` do worker (`scripts/fluxos.py`), inferência real no Featherless com
`deepseek-ai/DeepSeek-V4.1-Flash-1017`: **4 documentos, 8 chamadas (4 de visão), 13.928 tokens, zero erros.**
Cerca de **3.500 tokens por documento**, somando transcrição e extração.

Preço do modelo: US$ 0,30 por milhão de tokens de entrada e US$ 1,20 por milhão de saída na API da DeepSeek
([pricepertoken](https://pricepertoken.com/pricing-page/model/deepseek-deepseek-v4.1-flash),
[Requesty](https://www.requesty.ai/models/deepseek/deepseek-v4.1-flash)). O Featherless cobra por crédito no plano
pay-as-you-go ([Featherless, planos](https://featherless.ai/docs/plans)); o preço por token desse modelo lá não foi
confirmado. Conta conservadora: todos os tokens ao preço de saída.

| Item | Conta | Custo |
|---|---|---|
| Uma leitura de documento | 3.500 × US$ 1,20 / 1 mi | ≈ US$ 0,004 (≈ R$ 0,02) |

### Por admissão (estimativa sobre a medição)

Premissas: 5 documentos com 50% de reenvio (7,5 leituras), 20 turnos de conversa de cerca de 1.500 tokens cada, câmbio
de R$ 5,21, e entre 5 e 20 mensagens de template de utilidade no WhatsApp.

| Item | Conta | Custo |
|---|---|---|
| LLM | (7,5 × 3.500 + 20 × 1.500) ≈ 56 mil tokens × US$ 1,20 / 1 mi | ≈ R$ 0,35 (teto) |
| WhatsApp | 5 a 20 templates de utilidade a US$ 0,0068 ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), via BSPs) ou R$ 0,08 ([Hyperleap](https://hyperleap.ai/whatsapp-pricing-calculator-brazil)) | R$ 0,18 a R$ 1,60 |
| **Total variável** | | **≈ R$ 0,50 a R$ 2,00** |

O relatório estimava R$ 1,92 com Sonnet na leitura; com o modelo que usamos hoje, o custo fica **perto de R$ 1** no
cenário médio. A mensageria pesa mais que o LLM. Não estão incluídos: margem do BSP (R$ 0,01 a R$ 0,30 por mensagem),
revisão humana de exceções e infraestrutura.

### Por colaborador em renovação

Premissas: 2 documentos com validade por colaborador, renovados a cada 12 a 24 meses (cerca de 1,5 renovação por ano),
cada uma com 1,5 leitura e 4 mensagens (aviso, lembrete, lembrete firme, confirmação).

| Item | Conta | Custo |
|---|---|---|
| Por renovação | 1,5 × R$ 0,02 + 4 × R$ 0,04 a R$ 0,08 | ≈ R$ 0,19 a R$ 0,35 |
| Por colaborador por mês | 1,5 renovação/ano ÷ 12 | **≈ R$ 0,02 a R$ 0,05** |

## 3. Quanto vale para o cliente

Custo-hora de um analista de DP: R$ 34,36 com encargos (salário médio de R$ 4.203,53, fator de encargos de 1,8 sem
fonte verificada; ver relatório, seção 12.5). Cada **30 minutos** poupados por admissão valem **R$ 17**. A economia de
1,5 a 3 horas por admissão citada no relatório é hipótese a validar no piloto.

## 4. Conclusões para o preço

1. **R$ 25 por admissão era caro.** Numa empresa de 1.000 empregados, dá R$ 1,04 por colaborador/mês só pela admissão,
   perto do piso inteiro da Sólides e cerca de 7% da Convenia Ágil completa.
2. **A faixa defensável é R$ 7 a R$ 10 por admissão.** Fica abaixo de 30 minutos de analista (R$ 17), mantém margem
   bruta acima de 80% com o nosso custo medido e coloca o produto entre R$ 0,30 e R$ 0,60 por colaborador/mês numa
   empresa de alto giro: uma fração de uma suíte.
3. **A renovação deve custar cerca de R$ 0,50 por colaborador/mês.** Fica dentro da faixa de um sistema de SST completo
   (R$ 0,31 a R$ 1,63 por vida) e tem margem acima de 90%, porque o custo é de centavos.
4. **A margem depende da mensageria e da escalação, não do LLM.** Usar menos templates (respostas dentro da janela de
   24 h) e medir a taxa de escalação no piloto.

## Lacunas

- Preço por token do DeepSeek-V4.1-Flash no Featherless (o custo acima usa o preço da DeepSeek).
- Tabela oficial da Meta em BRL para utilidade (fontes divergem entre US$ 0,0068 e R$ 0,08).
- Turnos de conversa e reenvios reais por admissão: medir no piloto.
- Preço de admissão de Gupy, Unico e Sólides: só por cotação.
