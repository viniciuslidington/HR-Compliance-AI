# Identidade visual — Codex + Claude

Atualizado por Codex em 08/11/2026. Trabalho local; não fazer commit ou push sem nova instrução.

## Pedido da usuária

Criar um novo nome, marca, identidade, logo e tipografia. Visual minimalista, clean, simples,
de startup tech, com gradientes, movimento e bom uso do espaço. Menos aparência de interface
genérica gerada por IA. Codex e Claude devem colaborar por este documento.

## Estado

- Nome ainda não escolhido. “Converge” é o contexto do hackathon, não uma marca aprovada.
- A interface atual principal está em `web/` (Next.js). Existe também a tela anterior em `worker/static/`.
- Os tokens atuais reproduzem uma referência da Tako. A nova identidade deve ser própria.
- Codex criou uma primeira proposta em `docs/brand/codex/`. Ainda não aplicada ao produto.
- Não houve resposta do Claude registrada neste documento até a criação desta entrada.

## Divisão proposta para evitar colisões

- Codex: proposta A, símbolo vetorial, composição de produto, tipografia e movimento em `codex/`.
- Claude: crítica independente, shortlist de nomes e proposta B em `claude/` (criar diretório).
- Cada agente edita apenas sua pasta. Neste arquivo, acrescentar entradas datadas sem apagar as anteriores.
- Não alterar `design-system/`, `web/` ou `worker/static/` para branding antes de consolidarmos a direção.
- Se houver outra divisão preferida, registrá-la aqui antes de editar arquivos compartilhados.

## Revisão solicitada ao Claude

1. Ler `codex/PROPOSTA.md` e abrir `codex/direcao.html`.
2. Criticar o nome provisório “Cumpre”: clareza, personalidade, pronúncia e espaço para expansão.
3. Propor até três alternativas com justificativa curta; registrar colisões encontradas, sem presumir disponibilidade.
4. Avaliar o símbolo em tamanho pequeno, a composição, a fonte Onest e a cor verde-petróleo.
5. Sugerir o que manter e o que mudar. Não é necessário implementar toda a interface ainda.
6. Registrar a resposta em `claude/REVISAO.md` e acrescentar uma entrada abaixo.

## Critérios para decisão conjunta

Marca pronunciável em português; símbolo legível a 16–24 px e monocromático; fonte legível
em tabelas; hierarquia clara; espaço útil no painel; gradientes localizados; movimento curto
com suporte a movimento reduzido; nenhum número fictício apresentado como dado real.

## Registro

### Codex — primeira proposta

Arquivo de trabalho: `codex/direcao.html`.
Nome de exploração: **Cumpre**. Conceito: **Do pedido ao concluído.**
Uma família tipográfica (Onest), branco mineral, tinta escura, verde-petróleo e gradiente
menta/cítrico em áreas de marca. O painel é uma composição estática de demonstração, sem APIs.
Aguardando crítica do Claude e escolha da usuária antes de consolidar o nome e aplicar os tokens.

### Codex — atualização após leitura dos arquivos compartilhados

Durante a preparação da proposta A, apareceram alterações em `design-system/` e `web/` com
marca **Vinda**, componente `Logo.tsx` e símbolo em v/check. Preservadas integralmente.
A divisão acima era uma proposta de coordenação, não uma instrução da usuária para desfazer
trabalho já realizado. Não reverti nem sobrepus a implementação de Vinda.

Revisão inicial em `codex/REVISAO-VINDA.md`. Sugestão: partir da implementação já feita,
decidir nome em conjunto e melhorar a singularidade do símbolo. Cumpre permanece como estudo
comparativo, não como mudança concorrente ao código do produto.

### Codex — revisão e evolução do símbolo (pedido da usuária, 08/11)

A usuária pediu avaliação do frontend e uma logo mais elaborada e criativa. Estou editando
`web/src/ui/Logo.tsx`, `Logo.module.css`, `web/src/app/icon.svg` e a seção do símbolo em `/marca`.
Direção: V em duas faixas dobradas, com recorte negativo e versão monocromática; retirar check
literal e tile como forma obrigatória. Ajuste pontual do breakpoint da navegação para dar espaço
à tabela em janelas médias. Preservar nome, fontes, paleta e demais alterações de frontend.
Tudo permanece local, sem commit/push.

### Codex — evolução aplicada e conferida

Logo v2 aplicado ao componente, favicon e guia `/marca`. Captura e revisão em
`codex/vinda-v2-preview.jpg` e `codex/REVISAO-FRONTEND-V2.md`. Nome e tipografia preservados;
novo símbolo em duas faixas, aplicações monocromáticas e sem loop decorativo. Navegação
adaptada a janelas médias para liberar a tabela. Alterações locais; nada enviado ao git remoto.

### Claude — revisão e landing (08/11)

Revisão em `claude/REVISAO.md`. A usuária pediu uma landing premium (escura, hero com vídeo de fundo
que ainda será produzido) e um símbolo na linha do logo da Linear (disco sólido com cortes diagonais),
sem copiá-lo. Proposta B, **Chegada**: disco em três faixas diagonais, com a de cima ainda entrando
(`claude/simbolo-chegada.svg`).
Divisão: Claude edita só `web/src/app/page.tsx` (vira a landing), `web/src/landing/*` e `claude/`.
`Logo.tsx`, `icon.svg`, `/marca`, `BRAND.md` e `LayoutRh` continuam com o Codex. A landing usa a
Chegada isolada em `web/src/landing/Chegada.tsx` até a usuária escolher o símbolo; depois disso, um só
símbolo no `Logo.tsx`.

### Claude — paleta alinhada ao pitch (08/11)

A usuária pediu cores alinhadas à apresentação "Agente de Admissão · Pitch Hackathon Tako". Tokens
(`design-system/tokens.json`) agora em creme `#eeebe7`, grafite `#0d0d0d` e laranja (`--orange`
`#ff4802`, `--orange-bright` `#ff5e00`, `--orange-deep` `#b33100`, `--orange-soft` `#ffb066`). Lima,
menta e água foram removidos. Para não quebrar o símbolo, troquei os stops `var(--lime)`/`var(--mint)`
por `var(--orange-soft)`/`var(--orange)` em `Logo.tsx` e as cores do `icon.svg`. Só cor; a forma
não mudou. Novo token `--success-ink` para o texto de "concluída".

### Codex — limpeza editorial da landing (novo pedido da usuária)

A usuária forneceu referência da Firstwork e pediu remover labels desnecessários para uma
apresentação clean e profissional. Vou editar `web/src/landing/Landing.tsx` e os estilos
relacionados: retirar selo do hero, provas repetidas, eyebrows de seção, números decorativos,
manifesto redundante e CTAs concorrentes. Manter logo, paleta atual, vídeo previsto e rótulos
funcionais dos documentos. Não substituir alterações de cor que estão em andamento.
Tudo local, sem commit/push.

### Claude — revisão de layout e UX do painel (08/11)

A usuária pediu um painel mais fluido e integrado, com menos espaço perdido. Vou editar
`web/src/rh/*` (LayoutRh, ListaAdmissoes, Escalacoes, DetalheAdmissao, NovaAdmissao, CatalogoModelos,
BarraDemo) e `web/src/ui/*` (Table, Card, StatusPill). Mudanças: largura fluida em vez de 1120px fixos,
glow sem corte, resumo e alertas em um bloco só, tabela com progresso e iniciais, barra demo fixa no
rodapé e eyebrows redundantes removidos. Não mexo em `Logo.tsx`, na landing do Codex nem no
`/marca`.

### Claude — fundo ASCII da landing e superfícies do painel (08/11)

- Landing: `web/src/landing/OndaAscii.tsx`, um canvas com linhas de onda em caracteres mono atrás de tudo
  o que vem depois do hero. A frente sobe do rodapé na transição do vídeo, a crista é laranja e há
  ondulação no cursor. Pausa fora da tela e desenha um quadro só com movimento reduzido. O hero
  ganhou uma costura em gradiente para o parallax não terminar num corte reto.
- Painel: os cards brancos puros viraram papel quente translúcido (`--surface-raised`) com
  `--shadow-surface` (fio de luz + sombra quente) e blur; linhas em tom quente; grão no fundo; segundo
  glow âmbar no canto oposto. Novo `--surface-solid` para modais.
