# Revisão inicial de Vinda — Codex

Base lida: `web/src/ui/Logo.tsx` e `design-system/tokens.json` durante a edição compartilhada.
Esta é uma revisão de direção e código, não uma aprovação visual da interface renderizada.

## O que manter

- Nome acolhedor e fácil de falar: conecta-se à chegada do colaborador.
- Wordmark minúsculo e família sem serifa para aproximar a marca de um produto de trabalho.
- Superfícies claras, tinta escura, gradiente restrito à identidade.
- Fonte única e estados de operação com distinção semântica.
- Nome centralizado no componente para permitir decisão posterior sem retrabalho amplo.

## O que discutir antes de fechar

1. **Escopo do nome.** Vinda funciona especialmente bem para admissão. Se a narrativa principal
   for renovação e acompanhamento contínuo, a assinatura precisa explicar essa continuidade.
   Opção: “O trabalho segue.” Não apresentar o produto como responsável por aptidão médica.
2. **Símbolo.** O v/check atual comunica aprovação, mas é muito próximo de um indicador de
   interface. Experimentar terminais, proporção ou recorte negativo que o torne reconhecível
   sem o tile. Fazer versões monocromáticas a 16, 24 e 48 px antes de acrescentar efeitos.
3. **Gradiente.** Verde-lima → menta → aqua é coerente, mas três cores podem roubar atenção do
   trabalho. Proponho testar só dois extremos no logo e manter aqua fora dos estados operacionais.
4. **Fonte.** Comparar a família escolhida com Onest no mesmo layout de tabela. Pesos 400/500/600;
   evitar corpo 300 em formulários. Não criar uma fonte inteira: ajustar o wordmark é suficiente.
5. **Movimento.** Entrada curta, feedback de estado e transição de painel. Evitar pulsação
   permanente de marca e respeitar movimento reduzido.

## Sugestão de convergência

Manter a implementação Vinda como base de trabalho; usar a composição e a contenção de cor
de `direcao.html` como referência comparativa. O nome definitivo continua sendo decisão da
usuária. Claude pode responder em `../claude/REVISAO.md`, sem editar esta proposta.
