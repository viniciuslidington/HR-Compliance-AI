# Pendências da UI (painel do RH + WhatsApp simulado)

Estado em 08/11/2026: as cinco telas do RH, o WhatsApp simulado e o roteiro da demo estão prontos e testados
(`web/`), já sobre o servidor do Next e a leitura real do worker. Esta lista é o que falta para a UI ficar completa. Ver também
`docs/designs/admissao-ui.md` (decisões e roteiro) e `docs/designs/contrato-frontend-ia.md` (contrato com a IA).

## 1. Integração com o backend de IA

Feito em 08/11/2026 (detalhes em `contrato-frontend-ia.md`):

- [x] **`HttpApi`** implementando a `Api` e escolhida por padrão no `ApiProvider` (`NEXT_PUBLIC_API_MODO=mock` volta
      ao `localStorage`). O estado vive no servidor do Next e é gravado no disco do worker.
- [x] **Mutações assíncronas.** As mutações da `Api` podem devolver `Promise`. As consultas seguem síncronas, sobre a
      cópia local do estado, então `useConsulta` não mudou.
- [x] **Atualização ao vivo.** Polling de `/api/estado` a cada 1,5 s, com ETag (304 quando nada mudou). Painel e
      WhatsApp em aparelhos diferentes veem o mesmo estado.
- [x] **Upload real.** A foto vai para `/api/arquivo`; a IA do worker lê (`POST /leitura`) e as regras do front decidem.
      Com o modelo fora do ar, o agente diz "não consegui ler agora" e a tentativa não conta.

Falta:

- [ ] **Estados de carregamento e erro detalhados.** Hoje só existe o esqueleto da primeira carga (com nova tentativa
      a cada 2 s). Cada tela ainda precisa de:
      - erro na primeira carga, com "Tentar de novo";
      - aviso de "dados desatualizados" quando o polling falha;
      - botões em espera ("Aprovando…") e erro inline nas ações (escalações, nova admissão, barra demo). Hoje a falha
        de uma mutação só vai para o console.

      Para desenhar e testar esses estados: atraso e falhas configuráveis na `HttpApi` (`?rede=lenta|instavel|fora`).
- [ ] **WhatsApp com rede real.** Bolha "Enviando…" também para texto. Se o envio falhar, o texto volta ao campo
      com a mensagem de erro. O "digitando…" passa a identificar as mensagens novas pelo id, não pelo relógio.
- [ ] **Barra de progresso do upload.** A leitura leva de 10 a 30 s (a primeira, fria, até ~30 s) e a tela não mostra
      progresso nem falha de envio.
- [ ] **Texto do colaborador pelo LLM.** O texto livre ainda é interpretado pelo motor do front (`domain/motor`), não
      pelo LLM do worker.
- [ ] **Rate limit nas rotas públicas do Next** (`/api/acao`, `/api/arquivo`). Qualquer um com a URL pode criar
      admissões e mandar fotos para a IA.

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
