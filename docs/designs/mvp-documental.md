# MVP reformulado: admissão e renovação documental em setores regulados

7 de novembro de 2026 · Plano do agente documental para documentos regulados (ASO, NR-10, NR-35), com renovação.

**O problema em uma frase:** em construção e energia, um documento vencido tira a pessoa de campo (sem NR-35 em dia,
ninguém sobe em altura), e hoje o DP ou o SESMT descobre isso numa planilha e passa semanas cobrando, lendo e conferindo
documentos à mão.

**Slide:** "O sistema avisa que vai vencer. Ninguém renova. A gente renova."

---

## Decisões de 07/11 (após o desenho "Agente de Admissão" do Marcelo)

| Tema | Decisão |
|---|---|
| Escopo de documentos | Continua setorial: ASO, NR-10, NR-35. Documentos genéricos (RG, CPF, comprovante) ficam fora do MVP |
| Canal com o colaborador | **WhatsApp Web simulado**: uma tela de chat no próprio app, sem Meta, sem número e sem modelo de mensagem aprovado. O agente fala por uma interface de canal; WhatsApp real é outra implementação depois |
| Renovação | Entra no MVP: aviso com antecedência, cobrança, documento novo lido e conferido, card P0 de impedimento |
| Do desenho do Marcelo, entra | Escalar quando o mesmo documento falha 3 vezes; régua de cobrança com intensidade crescente até o prazo; tela de escalações no painel do RH; sistema de destino mock |

## 1. Por que agora faz mais sentido como agente

**Recorte de mercado.** Admissão digital genérica já tem concorrente agêntico: a Gupy anuncia contratação agêntica no
WhatsApp e validação de documentos por IA com especialistas humanos. Não competimos nisso. Ferramentas de SST alertam
vencimentos de ASO e treinamentos, mas o alerta para aí. **Entramos na exigência setorial e na renovação conduzida até o
fim.**

## 2. Recorte do MVP

- **Setor:** construção e energia, funcionários próprios. Terceiros (a contratante homologando prestadoras) é a expansão.
- **Admissão:** só a parte setorial. A matriz do cargo define o que precisa estar válido antes do primeiro dia.
- **Renovação:** contínua, a partir do vencimento de cada documento.
- **Impedimento:** documento vencido gera um fato ("impedido para trabalho em altura desde 03/12"), um card P0 e o aviso
  ao gestor. O agente não mexe em escala, não suspende e não desconta.

### Matriz de exigências da demo (playbook por cargo)

Periodicidades são parâmetros do cliente. Os valores abaixo são referência para a demo e **precisam ser validados com o
SESMT** antes de qualquer uso real.

| Cargo | Documento | Conferência em código | Validade (referência) | Renovar com antecedência |
|---|---|---|---|---|
| Eletricista de manutenção | ASO apto para eletricidade e altura | Apto, funções citadas, data, CRM do médico | Conforme PCMSO (demo: 12 meses) | 30 dias |
| | NR-10 básico | Nome e CPF do cadastro, carga ≥ 40h, emissor com CNPJ, responsável técnico | Reciclagem bienal | 45 dias |
| | NR-35 | Nome e CPF, carga ≥ 8h, emissor, responsável técnico | Periódico bienal | 45 dias |
| Montador de andaime | ASO apto para altura | Idem | Conforme PCMSO | 30 dias |
| | NR-35 | Idem | Periódico bienal | 45 dias |
| Auxiliar administrativo (controle) | ASO apto | Idem | Conforme PCMSO | 30 dias |

**A validade é calculada pelo código** (data de realização + periodicidade da matriz). Nunca é lida do documento pelo
modelo.

## 3. Como o agente lê um documento

Validado na hora 0 com a chave da equipe:

1. **Transcrever (modelo de visão).** `Qwen/Qwen3-VL-32B-Instruct` leu um certificado NR-35 fictício com precisão em
   cerca de 9 s, mas devolve texto corrido, sem respeitar a chamada de ferramenta. A transcrição vira evidência do caso.
2. **Extrair (modelo de texto).** O modelo de texto, que faz chamada de ferramenta nativa
   (`deepseek-ai/DeepSeek-V4.1-Flash-1017` na validação de hoje), extrai os campos em schema a partir da transcrição.
3. **Conferir (código).** Cada valor extraído precisa aparecer na transcrição (guarda de fidelidade). Depois vêm as
   regras: nome e CPF batem com o cadastro, CPF válido, carga horária mínima, data de realização até hoje, CNPJ do
   emissor válido, responsável técnico presente.
4. **Decidir (código + playbook).** Tudo confere: aceita (v1 com aprovação humana; v2 por autonomia conquistada).
   Algo falha: recusa com motivo específico e pede reenvio. Ilegível ou suspeito: escala.

`google/gemma-3-27b-it` está no catálogo, mas exige conectar o Hugging Face na conta do Featherless.

## 4. Autonomia

| Nível | Ações |
|---|---|
| Faz sozinho | Pedir documento pelo portal, ler, conferir, recusar com motivo, lembrar, avisar vencimento, abrir card de impedimento |
| Com aprovação (v1) | Aceitar documento e registrar validade |
| Autonomia conquistada (v2) | Aceitar sozinho quando todas as conferências passam e o emissor tem histórico de aceite sem edição (por exemplo, 40 de 40 em 90 dias) |
| Encaminha | Documento ilegível, suspeito, divergência de identidade, ASO "inapto" ou com restrição |
| Nunca | Bloquear escala, suspender, descontar, dispensar, opinar sobre aptidão médica |

## 5. Proteção de dados

- **ASO é dado de saúde (sensível).** O agente guarda só: apto ou inapto, funções liberadas, data e CRM do médico. A
  transcrição completa de um ASO não fica no contexto do caso; fica só o arquivo original em armazenamento restrito, com
  hash.
- Nada de diagnóstico, exame ou CID em mensagem, card ou relatório.
- Antecedentes criminais estão fora deste recorte.
- Demo só com documentos fictícios gerados para teste.

## 6. A demo

Empresa fictícia de manutenção elétrica; hoje é 07/11/2026.

| Ato | O que acontece | O que prova |
|---|---|---|
| 1 · Admissão do Pedro, eletricista | O agente pede pelo portal os documentos da matriz. Pedro envia foto do ASO (apto), da NR-10 (40h) e de uma NR-35 de 2023. O agente lê, aceita as duas primeiras e **recusa a NR-35**: "realizada em 15/08/2023, vencida pela periodicidade bienal; envie o certificado do periódico". Pedro envia o novo; matriz completa, card "pronto para iniciar" | Leitura real de documento e recusa com motivo |
| 2 · Renovação do Carlos | A NR-35 do Carlos foi feita em 03/12/2024 e vence em 03/12/2026. O agente avisa com 45 dias, oferece a turma, lembra; Carlos não responde | Proatividade, sem ninguém pedir |
| 3 · Impedimento | Na véspera, o card vira **P0: "Carlos fica impedido de trabalhar em altura a partir de 03/12"**, atribuído pela fila ao analista com menor carga, e o gestor é avisado | O agente sabe para quem devolver |
| 4 · Autonomia conquistada | O histórico mostra 40 de 40 certificados do emissor "Treinamentos Exemplo" aceitos sem edição. O estratégico sugere a v2; o DP ativa; o próximo certificado desse emissor é aceito sozinho | Os dois agentes e o contrato entre eles |

## 7. O que reaproveita do código atual (`worker/ia`)

| Módulo | Destino |
|---|---|
| `llm.py`, `conteudo.py`, `config.py` | Reaproveitados; `llm.py` ganha chamada com imagem para transcrição |
| `playbook.py` | Reaproveitado; schema ganha a matriz de exigências por cargo |
| `fila.py`, `card.py` | Reaproveitados; urgência passa a vir da data de impedimento |
| `proximo_passo.py`, `redacao.py`, `relatorio.py` | Reaproveitados com novos modelos de mensagem |
| `estrategico.py`, `compilador.py` | Reaproveitados; a categoria vira "emissor × tipo de documento" |
| Novo: `documentos.py` | Transcrever, extrair, conferir; validade calculada pela matriz |

## 8. Divisão em 3 partes

| Parte | Escopo |
|---|---|
| **1 · Cadastro, documentos sintéticos e estratégico** | Cadastro de funcionários e cargos, matriz, documentos fictícios (imagens e PDFs) para os atos, histórico sintético de aceites, detector de autonomia conquistada |
| **2 · Worker** | Leitura de documentos (`documentos.py`), máquina de estados do caso, agenda de vencimentos e lembretes, fila e cards, outbox de eventos |
| **3 · Telas** | Portal do funcionário (envio de foto e conversa), painel do DP com fila de cards e matriz por pessoa, tela de playbooks e autonomia |

## 9. Riscos e hora 0

- **Visão:** Qwen3-VL não respeita chamada de ferramenta; manter o desenho em dois passos. Medir leitura em fotos de
  celular (inclinadas, com sombra), não só em imagens limpas.
- **Gemma:** se quiser comparar, conectar o Hugging Face na conta do Featherless.
- **Periodicidades:** validar a matriz com alguém de SESMT antes do pitch.
- **Fraude documental:** o MVP detecta inconsistência (nome, CPF, datas, emissor), não falsificação. Dizer isso no pitch.
- **Concorrência:** Gupy na admissão genérica; fornecedores de SST no alerta de vencimento. O diferencial precisa
  aparecer no palco: leitura, recusa com motivo e renovação conduzida até o fim.
