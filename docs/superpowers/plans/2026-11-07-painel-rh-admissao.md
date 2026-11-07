# Painel do RH + WhatsApp simulado — Plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar tarefa a tarefa. Passos com checkbox (`- [ ]`).

**Goal:** Construir, com dados simulados, o painel web do RH (cinco telas) e um WhatsApp simulado por onde a colaboradora envia documentos, prontos para a demo de 3 min e para ligar ao worker em Python depois.

**Architecture:** App Next.js (App Router) em `web/` com duas áreas abertas em janelas separadas (`/rh` e `/whatsapp`). A UI fala só com uma interface `Api`; hoje a implementação é `MockApi`, que roda no navegador (componentes `"use client"`), guarda as nove tabelas no `localStorage`, sincroniza as janelas pelo evento `storage` e roda um "motor do agente" puro em TypeScript (validação em código, leitor simulado, cobrança, escalação). A integração futura troca `MockApi` por `HttpApi`, que pode chamar route handlers do próprio Next (`app/api/*`) como ponte para o worker em Python, sem mexer nas telas.

**Tech Stack:** Next.js (App Router, TypeScript, versão estável mais recente no `create-next-app`), CSS Modules + CSS global sobre `design-system/tokens.css`, Vitest + `@vitejs/plugin-react` + Testing Library (jsdom), conforme o guia de testes do Next. npm (Node 26 instalado).

**Spec:** `docs/Agente de Admissão — Desenho do Produto (1).pdf` (9 páginas; arquivo do usuário, não commitar) + as decisões da seção "Decisões" abaixo. No início da Tarefa 1, salvar este plano em `docs/superpowers/plans/2026-11-07-painel-rh-admissao.md` e um resumo das decisões em `docs/designs/admissao-ui.md` (commitados).

## Context

O produto mudou de rumo para um **agente de admissão pelo WhatsApp** (o PDF de 07/11). O repositório só tem o worker em Python (biblioteca, sem servidor HTTP) e o design system; não existe frontend. O usuário quer construir a UI agora com mocks simples e integrar depois. **O foco é o painel do RH**; o lado da colaboradora é um WhatsApp simulado usado para enviar documentos e conversar.

## Decisões

Do usuário:
- Duas interfaces em **janelas separadas** na demo: `/rh` e `/whatsapp`. O que acontece em uma aparece na outra.
- UI com mocks agora; integração com o worker depois.
- Foco no RH; o WhatsApp simulado é o canal de upload.
- Framework: **Next.js**.

Minhas (podem ser revistas):
- App Router, pasta `web/`. A pasta vazia `mocks/employee-portal/` é removida.
- Tudo que lê dados é componente cliente (`"use client"`), porque o mock vive no `localStorage`; as `page.tsx` são finas e só repassam `params` para componentes de tela testáveis sem o roteador do Next.
- **Upload real de arquivo** no simulador (preview da imagem). O resultado vem de um **leitor simulado determinístico** que segue o roteiro: 1º RG → ilegível ("a foto cortou a data de nascimento"); 1º comprovante → emitido em março (> 90 dias); o resto, válido. Dicas no nome do arquivo forçam o resultado: `borrado`, `antigo`, `outro-nome`. Os dados extraídos passam pelas **regras reais em TS** (90 dias, dígito do CPF, validade da CNH, nome igual).
- **Catálogo e modelos só leitura** no MVP; o ajuste é por admissão.
- **Barra "Demo"** discreta no rodapé do `/rh`: +24 h, metade do prazo, 2 dias antes do início, prazo estourado, e reiniciar dados.
- Cor do status **Escalada**: `--orange-tint` de fundo + `--orange-deep` no texto (sem token novo). Concluída: `--success-tint` + ponto `--success`, texto `--ink`.
- `mensagem` ganha `autor?: 'agente' | 'rh'` (só no front) para separar as mensagens do RH das do agente; `Motivo` ganha `o_que_fazer`. Os dois ficam anotados para alinhar com o worker.

## Global Constraints

- Toda cor, fonte, espaço e raio vem de `design-system/tokens.css`; nunca editar `tokens.css` à mão (mudanças passam por `tokens.json` + `node design-system/build-tokens.mjs`).
- Regras de `design-system/BRAND.md`: laranja só como sinal (pontos, linhas de 2px, ícones), nunca de fundo; texto pequeno laranja sobre creme usa `--orange-deep`; bordas `--line` em vez de sombras; botões `--radius-pill`; cards `--radius-xl`; `--ink-subtle` é o mínimo para texto legível; `--success`/`--danger` nunca como texto sobre creme.
- Títulos em `--font-display` (Instrument Serif), corpo em `--font-sans` peso 300, rótulos/botões 500.
- Campos e enums em português snake_case sem acento, espelhando as tabelas do PDF e o worker (`worker/ia/documentos.py`).
- Status: admissão `criada | em_coleta | escalada | concluida`; documento `pendente | recebido | aprovado | recusado`; lembrete `leve | prazo | firme`; escalação `aberta | resolvida`.
- `src/domain/` não importa nada de React nem de Next (TypeScript puro, para poder virar pacote ou ser espelhado no worker).
- Componentes de tela não chamam `useRouter`/`useParams` direto: recebem `id` e callbacks de navegação por props da `page.tsx`.
- Nenhuma função do domínio chama `new Date()`: todas recebem `agora`. `agora() = Date.now() + relogio.deslocamento_ms`.
- Limite de tentativas: **3** falhas no mesmo documento → escala. Comprovante: **< 90 dias**.
- Modelos: **CLT padrão** = RG/CNH, CPF, comprovante, dados bancários; **Estágio** = RG/CNH, CPF, comprovante, declaração de matrícula.
- Toda recusa tem motivo + o que fazer, ex.: "o comprovante é de março; preciso de um emitido nos últimos 90 dias".

## Review Focus

1. **Duas janelas agindo quase juntas** (RH resolve escalação enquanto a colaboradora envia arquivo): nenhuma escrita se perde. → teste na Tarefa 7 (`mutacao relê o estado antes de aplicar`).
2. **Foto grande ou formato que o canvas não decodifica** (12 MB, HEIC, PDF): não trava; reduz ou usa placeholder e segue o fluxo. → teste na Tarefa 7 (`arquivos: fallback quando não decodifica`).
3. **Envio quando não há nada pendente** (admissão concluída ou tudo recebido): o agente responde que não falta nada; não cria envio órfão. → teste na Tarefa 4.
4. **Nova admissão com checklist vazio, data de início no passado ou WhatsApp inválido**: o formulário bloqueia com mensagem clara. → teste na Tarefa 9.
5. **Avançar o tempo várias vezes / reiniciar no meio**: lembretes não duplicam e o reset volta ao seed relativo ao relógio zerado. → testes nas Tarefas 6 e 7.

---

## Estrutura de arquivos (`web/`)

```
web/  package.json  next.config.ts  tsconfig.json  vitest.config.mts  vitest.setup.ts
  public/seed/                 SVGs fictícios dos envios do seed
  src/app/
    layout.tsx  globals.css    globals.css importa ../../../design-system/tokens.css, reset, tipografia
    page.tsx                   redirect('/rh')
    rh/layout.tsx              LayoutRh (navegação lateral + BarraDemo), envolve em ApiProvider
    rh/page.tsx                → ListaAdmissoes
    rh/admissoes/nova/page.tsx → NovaAdmissao
    rh/admissoes/[id]/page.tsx → DetalheAdmissao
    rh/escalacoes/page.tsx     → Escalacoes
    rh/catalogo/page.tsx       → CatalogoModelos
    whatsapp/layout.tsx  whatsapp/page.tsx → Telefone (seção .section-dark)
  src/domain/
    tipos.ts                   as 9 tabelas + enums + Motivo
    catalogo.ts                TIPOS_DOCUMENTO, MODELOS, MODELO_DOCUMENTO
    identificadores.ts         cpf_valido, digitos, normalizar (porta de worker/ia/documentos.py:37-71)
    datas.ts                   dias_entre, somar_horas, rotulo_relativo, formatar_data
    validacao/ qualidade.ts regras.ts consistencia.ts index.ts
    leitor_mock.ts             leitura simulada + dicas por nome de arquivo
    destino_mock.ts            cadastrar_colaborador → id_externo
    motor/ eventos.ts admissao.ts documentos.ts conversa.ts escalacoes.ts cobranca.ts index.ts
  src/store/ armazenamento.ts estado.ts sync.ts arquivos.ts
  src/api/   api.ts mock_api.ts contexto.tsx
  src/seed/seed.ts
  src/ui/    Button StatusPill Card Table Field Select Eyebrow ChecklistDocumentos Conversa ImagemEnvio (+ .css, .test.tsx)
  src/rh/    LayoutRh ListaAdmissoes NovaAdmissao DetalheAdmissao Escalacoes CatalogoModelos BarraDemo
  src/whatsapp/ Telefone SeletorContato BolhaMensagem Anexar Digitando
```

Testes ficam ao lado do arquivo (`*.test.ts(x)`). Comando: `cd web && npm test -- <arquivo>`.

---

### Task 1: Scaffold, tipos, catálogo, identificadores e datas

**Files:** Create `web/` (create-next-app), `web/src/app/{layout,page}.tsx`, `web/src/app/globals.css`, `web/src/domain/{tipos,catalogo,identificadores,datas}.ts` + testes. Modify `.gitignore` (adicionar `node_modules/` e `.superpowers/`). Delete `mocks/employee-portal/` (`rmdir`, vazia e não rastreada).

**Interfaces — Produces:**
- Tipos `Admissao`, `DocumentoAdmissao`, `EnvioDocumento`, `Mensagem` (com `autor?`), `Lembrete`, `Escalacao`, `TipoDocumento`, `Modelo`, `ModeloDocumento` com os campos do PDF (p. 7–8).
- `interface Motivo { codigo: string; texto: string; o_que_fazer: string; gravidade: 'recusa' | 'escalada' }`
- `type MotivoEscalacao = 'prazo_estourado' | 'tres_falhas' | 'inconsistencia' | 'suspeita_adulteracao' | 'fora_do_escopo'`
- `cpf_valido(cpf: string | null): boolean`, `normalizar(t: string): string`, `digitos(t: string | null): string`
- `dias_entre(a: string, b: string): number` (dias de calendário, datas `YYYY-MM-DD`), `somar_horas(iso: string, h: number): string`, `rotulo_relativo(data_inicio: string, agora: Date): string` ("em 3 dias", "hoje", "há 1 dia"), `formatar_data(iso): string` (dd/mm/aaaa).

- [ ] Gerar o projeto: `npx create-next-app@latest web --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm`. Adicionar `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`; script `"test": "vitest run"`.
- [ ] `vitest.config.mts`: plugins `react()` e `tsconfigPaths()`, `test.environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`.
- [ ] `globals.css` importa `../../../design-system/tokens.css`. Se o bundler recusar arquivo fora de `web/`, definir em `next.config.ts` `turbopack.root` (e `outputFileTracingRoot`) para a raiz do repositório. Fontes: manter o `@import` do Google Fonts que já está em `tokens.css` (não usar `next/font`, para não duplicar a fonte da verdade).
- [ ] Testes que falham: `cpf_valido` (válido `529.982.247-25` → true; dígito errado → false; `111.111.111-11` → false; com máscara → true); `normalizar('Ána  SOUZA') === 'ana souza'`; `dias_entre('2026-11-07','2026-11-10') === 3`; `rotulo_relativo` em virada de meia-noite e horário de verão.
- [ ] Implementar; rodar `npm test` → PASS.
- [ ] `app/page.tsx` redireciona para `/rh`; `rh/page.tsx` (fundo creme) e `whatsapp/page.tsx` (seção `.section-dark`) como cascas; `npm run build` passa e `tokens.css` entra no CSS gerado.
- [ ] Commit.

### Task 2: Validação em três camadas

**Files:** `web/src/domain/validacao/{qualidade,regras,consistencia,index}.ts` + `index.test.ts`.

**Interfaces — Consumes:** Task 1. **Produces:**
`validar_envio(i: { tipo: TipoDocumento; leitura: LeituraMock; admissao: Admissao; aprovados: DocumentoAdmissao[]; agora: Date }): { aprovado: boolean; motivos: Motivo[] }` — qualidade primeiro (se falhar, para), depois regras do tipo, depois consistência com os já aprovados. `LeituraMock` é definido aqui (tipo) e preenchido na Task 3: `{ qualidade: 'ok' | 'ilegivel' | 'tipo_errado'; detalhe_qualidade?: string; dados_extraidos: Record<string, string> }`.

- [ ] Testes que falham: `ilegivel` → recusa com `o_que_fazer` pedindo nova foto; comprovante de 91 dias → recusa cujo texto contém "é de março" (com `agora` em junho); 89 dias → aprovado; CNH vencida → recusa; CPF com dígito errado → recusa; nome do CPF ≠ nome do RG aprovado → motivo `inconsistencia`, gravidade `escalada`; titular bancário ≠ colaborador → recusa; declaração de matrícula > 90 dias → recusa.
- [ ] Implementar; PASS; commit.

### Task 3: Leitor simulado e sistema de destino mock

**Files:** `web/src/domain/leitor_mock.ts`, `destino_mock.ts` + testes.

**Produces:** `ler_documento_mock(i: { tipo_documento_id: string; nome_arquivo: string; admissao: Admissao; tentativa: number; agora: Date }): LeituraMock`; `cadastrar_colaborador(a: Admissao, docs: DocumentoAdmissao[]): { id_externo: string }`.

- [ ] Testes que falham: RG tentativa 1 → `ilegivel` com "a foto cortou a data de nascimento", tentativa 2 → ok; comprovante tentativa 1 → data em março, tentativa 2 → recente; dicas `borrado`, `antigo`, `outro-nome` mandam no resultado; `dados_extraidos.nome === admissao.nome` e o CPF gerado passa em `cpf_valido`; `id_externo` é determinístico para a mesma admissão.
- [ ] Implementar; PASS; commit.

### Task 4: Motor — ciclo da admissão e documentos

**Files:** `web/src/domain/motor/{eventos,admissao,documentos,conversa,index}.ts` + testes. Textos do agente todos em `conversa.ts`.

**Produces:**
```ts
type Evento =
 | { tipo: 'admissao_criada'; dados: NovaAdmissaoInput }
 | { tipo: 'arquivo_recebido'; admissao_id: string; nome_arquivo: string; arquivo_url: string }
 | { tipo: 'texto_recebido'; admissao_id: string; texto: string }
 | { tipo: 'tempo_avancado'; ate: string }
 | { tipo: 'escalacao_resolvida'; escalacao_id: string; acao: 'aprovar_manualmente' | 'pedir_de_novo' | 'falar_com_colaborador'; texto?: string }
 | { tipo: 'reset' };
interface NovaAdmissaoInput { nome: string; whatsapp: string; cargo: string; data_inicio: string; modelo_id: string;
  documentos: { tipo_documento_id: string | null; descricao_personalizada?: string }[] }
function aplicar(estado: Estado, evento: Evento, agora: Date): Estado   // pura
```
`Estado` (definido em `store/estado.ts`, criado aqui como tipo): todas as tabelas + `relogio: { deslocamento_ms: number }` + `rev: number`.

- [ ] Testes que falham: `admissao_criada` copia os documentos do modelo (Estágio = 4; + dados bancários = 5) e vai a `em_coleta` com boas-vindas listando documentos, `instrucao_colaborador` e prazo; arquivo vai ao primeiro documento `pendente`/`recusado`; recusa grava `motivo_recusa`, soma `tentativas`, volta a `pendente`, cria `envio_documento` e manda motivo + o que fazer; a 3ª falha no mesmo documento abre escalação `tres_falhas` e põe a admissão em `escalada`; texto com "salário", "benefício" ou "contrato" escala `fora_do_escopo` e responde que encaminhou ao RH; último documento aprovado → `concluida`, `concluida_em`, `id_externo` e mensagem de conclusão; **arquivo sem nada pendente → resposta "não falta nada", sem envio criado** (Review Focus 3).
- [ ] Implementar; PASS; commit.

### Task 5: Resolução de escalações

**Files:** `web/src/domain/motor/escalacoes.ts` + teste.

- [ ] Testes que falham: `aprovar_manualmente` aprova o documento e resolve; admissão volta a `em_coleta` ou vai a `concluida` se tudo estiver aprovado; `pedir_de_novo` zera o documento para `pendente` e o agente pede de novo; `falar_com_colaborador` cria mensagem de saída com `autor: 'rh'`; admissão sem escalação aberta sai de `escalada`. Cada escalação expõe `acao_sugerida` (texto) derivada do motivo.
- [ ] Implementar; PASS; commit.

### Task 6: Cobrança

**Files:** `web/src/domain/motor/cobranca.ts` + teste.

**Produces:** `executar_cobranca(estado: Estado, agora: Date): Estado` (pura, idempotente); `alerta_prazo(admissao, lembretes): boolean` (verdadeiro após o `firme`).

- [ ] Testes que falham: 24 h sem mensagem de entrada → `leve` listando o que falta; metade entre início da coleta e `data_inicio` → `prazo` com a data; `data_inicio − 2 dias` → `firme` + `alerta_prazo`; `data_inicio` passou incompleta → escala `prazo_estourado`; rodar duas vezes não duplica; `concluida` não recebe lembrete; resposta depois do `leve` reinicia as 24 h.
- [ ] Implementar; PASS; commit.

### Task 7: Store, sincronização, MockApi e seed

**Files:** `web/src/store/{armazenamento,estado,sync,arquivos}.ts`, `web/src/api/{api,mock_api,contexto}.tsx?`, `web/src/seed/seed.ts`, `web/public/seed/*.svg` + testes.

**Produces:**
```ts
interface Api {
  listar_admissoes(): AdmissaoResumo[]            // pendentes "4 de 5", rotulo_inicio, alerta_prazo
  resumo_status(): Record<StatusAdmissao, number>
  obter_admissao(id: string): AdmissaoDetalhe     // docs + tipo, envios, mensagens, lembretes, escalações
  criar_admissao(i: NovaAdmissaoInput): Admissao
  listar_escalacoes(f?: { status?: 'aberta' | 'resolvida' }): EscalacaoView[]
  resolver_escalacao(id: string, acao: AcaoEscalacao, texto?: string): void
  listar_catalogo(): TipoDocumento[]; listar_modelos(): ModeloComDocumentos[]
  enviar_texto(admissao_id: string, texto: string): void
  enviar_arquivo(admissao_id: string, arquivo: File): Promise<void>
  agora(): Date
  avancar_tempo(preset: 'mais_24h' | 'metade_prazo' | 'dois_dias_antes' | 'prazo_estourado', admissao_id: string): void
  resetar(): void
  assinar(cb: () => void): () => void
}
```
`contexto.tsx` (`"use client"`): `ApiProvider`, `useApi()`, `useConsulta(fn)` (via `useSyncExternalStore`). A UI nunca chama a Api fora desses hooks, para a troca por `HttpApi` (assíncrona) ficar barata.
- **Hidratação:** o servidor não tem `localStorage`. `getServerSnapshot` devolve `null` e as telas mostram um esqueleto até montar no cliente; a `MockApi` só é criada dentro de `useEffect`/no cliente. Nada de dado do mock é renderizado no servidor, para não haver erro de hidratação.

- Cada mutação relê o estado do armazenamento, aplica o evento, roda `executar_cobranca`, grava e notifica a própria janela (o evento `storage` só chega nas outras).
- Arquivos: canvas reduz para no máx. 1000 px, JPEG 0,7, chave própria `arquivo:<envio_id>`, `arquivo_url = "local:<id>"`; `QuotaExceededError` ou falha de decodificação → placeholder.
- Seed gerado a partir de `agora`: Ana Souza (Estágio, `em_coleta`, 4 de 5), Bruno Lima (CLT, `escalada`, 3 envios recusados do comprovante, início em 2 dias), Diego Rocha (Estágio, 5 de 5), Carla Mendes (CLT, `concluida`, com `id_externo`).

- [ ] Testes que falham (armazenamento em memória): ida e volta `criar_admissao` → `listar_admissoes`; evento `storage` simulado notifica assinantes; **mutação relê o estado antes de aplicar** (duas instâncias de `MockApi` sobre o mesmo armazenamento, uma resolve escalação, outra envia texto, nada se perde — Review Focus 1); `resetar` devolve o seed com relógio zerado (Review Focus 5); seed bate com os valores acima; presets de `avancar_tempo` calculam o deslocamento certo; **arquivos: fallback quando não decodifica** (Review Focus 2).
- [ ] Implementar; PASS; commit.

### Task 8: Componentes de UI compartilhados

**Files:** `web/src/ui/*` (+ `.css` e `.test.tsx`).

- [ ] Testes que falham: `StatusPill` mostra rótulo e classe de cada status (Criada, Em coleta, Escalada, Concluída; Pendente, Recebido, Aprovado, Recusado); `ChecklistDocumentos` mostra `motivo_recusa` e tentativas; `Conversa` ordena por `criada_em` e alinha entrada/saída, distinguindo `autor: 'rh'`.
- [ ] Implementar com tokens (sem valores fixos); PASS; commit.

### Task 9: Telas do RH (foco)

**Files:** `web/src/rh/*` + testes; `web/src/app/rh/**/page.tsx` e `rh/layout.tsx` (finos: leem `params`, criam callbacks com `useRouter().push` e renderizam o componente de tela). Antes de começar, carregar a skill `frontend-design:frontend-design` e seguir o checklist anti-"cara de IA" de `~/Documents/Cookbook/coding/prompting_for_frontend_aesthetics.ipynb`, dentro das regras do BRAND.md.

Telas (PDF p. 5–6):
1. **Lista de admissões (início):** resumo por status (números em `.text-stat`), tabela Colaborador / Modelo / Início / Pendentes / Status, botão "Nova admissão", aviso de escalações e de prazo em risco.
2. **Nova admissão:** nome, WhatsApp, cargo, data de início, modelo; checklist copiado do modelo com remover/adicionar do catálogo.
3. **Detalhe da admissão:** checklist com status, tentativas e motivo; dados extraídos; imagem enviada; lembretes; conversa completa (só leitura).
4. **Escalações:** motivo, ação sugerida, histórico do que foi coletado; ações aprovar manualmente / pedir de novo / falar com o colaborador (campo de texto).
5. **Catálogo e modelos:** só leitura; campos, regras e instrução de cada tipo; documentos de cada modelo.
+ **BarraDemo** no rodapé do layout.

- [ ] Testes que falham (Testing Library sobre `MockApi` com seed, sem roteador do Next): contagens do resumo batem e o aviso aponta para `/rh/escalacoes`; Nova admissão com Estágio + dados bancários chama `aoCriar(id)` e a admissão criada tem 5 documentos; **formulário bloqueia checklist vazio, data de início no passado e WhatsApp inválido** (Review Focus 4); "Aprovar manualmente" no Bruno troca a pill; BarraDemo "+24 h" põe um lembrete na conversa.
- [ ] Implementar; PASS; commit.

### Task 10: WhatsApp simulado

**Files:** `web/src/whatsapp/*` + teste; `web/src/app/whatsapp/{layout,page}.tsx` (lê `searchParams.admissao`).

- Moldura de celular; seletor de contato (padrão: a admissão `em_coleta` mais recente; `?admissao=<id>` fixa uma); botão de anexar com preview; campo de texto; "digitando…" só na UI (mensagens novas do agente aparecem após ~1,2 s; o motor grava na hora).

- [ ] Teste que falha: enviar `rg-borrado.jpg` mostra a bolha da imagem e depois a recusa do agente.
- [ ] Implementar; PASS; commit.

---

## Execução

Recomendo **subagent-driven** (um subagente por tarefa + revisor entre elas): são 10 tarefas encadeadas por interfaces (`Estado`, `Evento`, `Api`), e um nome errado numa tarefa cedo quebra as seguintes. A alternativa é **nativa** (eu executo tudo nesta sessão e um revisor confere o branch no fim), mais rápida e mais barata. Trabalho em branch própria (`feat/painel-rh-admissao`), não em `main`.

## Verificação ponta a ponta

1. `cd web && npm test` (tudo verde), `npm run lint` e `npm run build` (sem aviso de hidratação).
2. `npm run dev` (configurar `.claude/launch.json` com porta 3000); abrir `http://localhost:3000/rh` e `http://localhost:3000/whatsapp` em duas janelas do navegador embutido; "Reiniciar dados" na BarraDemo.
3. Percorrer o roteiro: cadastrar estagiária no "Estágio" + dados bancários (Detalhe mostra 5 pendentes; o celular recebe as boas-vindas) → RG borrado (agente explica e pede de novo; o 2º é aprovado e o checklist muda na outra janela) → comprovante antigo (recusa "é de março…") → +24 h, metade do prazo, 2 dias antes (três níveis de lembrete no celular e alerta de prazo no início do painel) → enviar o resto (status `concluida`, verde, com `id_externo`) → na escalação do Bruno, "Aprovar manualmente" (muda nas duas janelas).
4. Console sem erros; tamanho do `localStorage` após ~10 uploads abaixo de 5 MB; checar largura de celular (375 px) no `/rh`.
