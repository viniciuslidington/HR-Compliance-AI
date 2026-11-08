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

| Recorte | Valor | Conta |
|---|---|---|
| TAM admissão | **R$ 665 mi/ano** | 26,6 mi admissões CLT × R$ 25 (faixa R$ 399 mi a R$ 1,06 bi com R$ 15 a R$ 40) |
| SAM admissão (alto giro) | **R$ 453 mi/ano** | 18,1 mi admissões em comércio, alimentação, transporte, serviços administrativos, saúde e educação × R$ 25 |
| Renovação | A pesquisar | Trabalhadores com documento que vence × preço mensal |

O preço de R$ 25 é hipótese: nenhum concorrente publica preço por admissão. O TAM conta admissões, não empresas.

## 6. Modelo de negócio (hipótese)

- **Admissão:** por admissão concluída, R$ 15 a R$ 40 (ponto central R$ 25). Para uma empresa de 1.000 empregados com
  50% de rotatividade, cerca de R$ 1,04 por colaborador por mês, abaixo do piso público de suítes de RH.
- **Renovação:** assinatura por colaborador monitorado por mês. Receita recorrente durante todo o vínculo. Preço a pesquisar.
- **Custo variável:** cerca de R$ 1,92 por admissão no cenário base (margem ≈ 92% a R$ 25). O risco de margem é a
  escalação humana e a mensageria, não os tokens.
- **Cliente inicial:** média empresa de alto giro (varejo, alimentação, serviços, terceirização, 100 a 3.000 empregados),
  programas de estágio no pico sazonal e empresas com cargos regulados (manutenção elétrica, construção).
- **Canal:** venda direta primeiro; escritórios contábeis para PMEs e integrações com folha depois.

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
| "Qual o tamanho do mercado?" | R$ 665 mi/ano de TAM só em admissão CLT, com a conta visível; a renovação é receita recorrente por cima |
| "E a economia unitária?" | Menos de R$ 2 de custo variável por admissão, margem de ~92% a R$ 25 |
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
