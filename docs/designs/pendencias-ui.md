# Pendências da UI (painel do RH + WhatsApp simulado)

Estado em 08/11/2026: as cinco telas do RH, o WhatsApp simulado e o roteiro da demo estão prontos e testados
com dados simulados (`web/`). Esta lista é o que falta para a UI ficar completa. Ver também
`docs/designs/admissao-ui.md` (decisões e roteiro) e `docs/designs/contrato-frontend-ia.md` (contrato com a IA).

## 1. Integração com o backend de IA (adiada)

- [ ] **Api assíncrona.** Todos os métodos da `Api` que leem ou gravam viram `Promise`. Os únicos que continuam
      síncronos são `resolver_midia` e `assinar`. `useConsulta` passa a devolver `{ dados, carregando, erro, tentar_de_novo }`
      e `useAcao` passa a devolver `{ executar, pendente, erro }`.
- [ ] **Rede simulada.** A `MockApi` atual vira `ServidorMock`, o "servidor" síncrono. Por cima dele fica uma
      `MockApi` com atraso e falhas configuráveis (`?rede=lenta|instavel|fora`), para desenhar e testar os estados de rede.
- [ ] **Estados de carregamento e erro.** Cada tela precisa de três estados:
      - erro na primeira carga, com "Tentar de novo";
      - aviso de "dados desatualizados" quando uma atualização falha;
      - botões em espera ("Aprovando…") e erro inline nas ações (escalações, nova admissão, barra demo).
- [ ] **WhatsApp com rede real.** Bolha "Enviando…" também para texto. Se o envio falhar, o texto volta ao campo
      com a mensagem de erro. O "digitando…" passa a identificar as mensagens novas pelo id, não pelo relógio.
- [ ] **Upload real.** Barra de progresso e falha de envio. O contrato com a IA precisa definir como o progresso é informado.
- [ ] **Atualização ao vivo.** Hoje as janelas se avisam pelo evento `storage`. Com o servidor real, o painel precisa
      ser avisado das mudanças, por polling ou por uma conexão aberta (SSE/WebSocket). Isso precisa ser alinhado
      no `contrato-frontend-ia.md`.
- [ ] **`HttpApi`** implementando a `Api` e trocada no `ApiProvider`.

## 2. Decisões em aberto do produto (PDF, p. 9) que mudam a UI

- [ ] **Editar catálogo e modelos.** O PDF chama essa área de "Configuração", mas hoje ela é só leitura (decisão do MVP).
      O ajuste é feito por admissão.
- [ ] **Documento personalizado.** O modelo de dados já aceita `descricao_personalizada`, mas o formulário de
      nova admissão só deixa adicionar documentos do catálogo.
- [ ] **Dados bancários:** por foto (como está) ou por formulário na conversa?
- [ ] **O colaborador pode tirar dúvidas gerais?** Hoje qualquer pergunta fora do escopo vai para o RH.
- [ ] **Cadência de cobrança e limite de 3 tentativas.** Já estão implementados como propostos; falta a validação do time.
- [ ] **Sistema de destino simulado.** Definir o formato do cadastro. Hoje o sistema gera um `id_externo` no formato `COL-…`.

## 3. Fora do PDF, mas um produto real precisa

- [ ] Login do RH e sessão.
- [ ] Vários usuários de RH e quem resolveu cada escalação.
- [ ] Busca e filtros na lista de admissões, quando houver muitas.

## 4. Ajustes pequenos (acessibilidade e validação)

- [ ] Linhas clicáveis da tabela não são anunciadas como link pelo leitor de tela (mouse e teclado funcionam).
- [ ] Abas de escalações sem navegação pelas setas do teclado.
- [ ] Links inline com área de toque abaixo de 40px.
- [ ] WhatsApp com mais de 13 dígitos é cortado em silêncio em vez de recusado.
- [ ] `role="group"` sobrando no `<dl>` do resumo.
