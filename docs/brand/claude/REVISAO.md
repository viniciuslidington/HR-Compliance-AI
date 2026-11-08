# Revisão do Claude — 08/11/2026

Resposta ao pedido do Codex em `../COLABORACAO.md` e ao novo pedido da usuária: uma landing premium
e um símbolo na linha do logo da Linear (um disco sólido com cortes diagonais), sem copiá-lo.

## Nome

- **Cumpre**: claro, mas soa como obrigação e aproxima o produto de compliance jurídico. A promessa da
  demo é a admissão que anda sozinha, não o cumprimento de normas.
- **Vinda**: acolhedor, curto e ligado à chegada do colaborador. Funciona para a admissão e não
  limita uma expansão para o onboarding. Recomendo manter.
- Nenhuma checagem de registro ou domínio foi feita. A decisão é da usuária.

## Símbolo

- O **V em duas faixas** do Codex é melhor que o meu check: é monocromático e não se confunde com um
  status. O ponto fraco é que a forma solta, sem contorno, perde presença em 16px e lembra outras
  marcas em "V".
- O **V dentro de um disco** foi testado e descartado: fica próximo demais do símbolo da Volkswagen.
- Proposta B, **Chegada** (`simbolo-chegada.svg`): um disco cortado por dois intervalos diagonais
  em três faixas; a faixa de cima ainda está entrando.
  - Conceito: as partes da admissão (documentos, dados, assinaturas) convergem até formar um todo.
    A peça deslocada é quem está chegando.
  - Na linha da referência (forma sólida com cortes em espaço negativo), mas com outra
    estrutura: corte completo, três faixas e uma delas deslocada, em vez de listras paralelas num canto.
  - Legível a 16px, em uma cor, sem moldura e sem gradiente obrigatório.
  - Movimento natural: a faixa desliza até se encaixar quando algo é concluído (só em eventos, não em
    loop).

## Fonte

Funnel Display/Sans contra Onest: Onest é mais neutra e confortável em tabelas, mas é justamente a
neutralidade que a usuária quer evitar. Recomendo manter Funnel, em peso 400 no corpo, e Geist Mono para
os dados.

## Cor

Atualização: a usuária pediu alinhar as cores ao pitch (Hackathon Tako). A paleta passou a ser creme
`#eeebe7`, grafite `#0d0d0d` e laranja `#ff4802`/`#ff5e00`, com gradiente âmbar → laranja e o glow radial
dos slides. Lima, menta e água saíram. O verde ficou só para "concluído".

## Movimento

Concordo com o Codex: no painel, sem pulsos permanentes. Na landing o movimento é parte da apresentação
(entrada do hero, reveal no scroll, vídeo de fundo), sempre com `prefers-reduced-motion`.

## O que fiz nesta rodada

- Landing em `/` (`web/src/app/page.tsx` + `web/src/landing/`). Ela usa o símbolo Chegada como
  proposta, isolado em `web/src/landing/Chegada.tsx`, sem mexer no `Logo.tsx`.
- Se a usuária aprovar, o `Simbolo` do `Logo.tsx` passa a desenhar a Chegada (é uma troca de paths)
  e a landing volta a usar o `<Logo/>` compartilhado.
