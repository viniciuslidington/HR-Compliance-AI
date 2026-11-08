# Revisão do frontend e evolução da marca — 08/11/2026

Inspeção visual de `/rh` e `/marca` no navegador local. Avaliação focada na composição,
identidade e leitura em janela média; não é uma auditoria completa de todos os fluxos/dispositivos.

## Avaliação

A base está boa: Funnel trouxe personalidade, o contraste da tinta sobre papel é claro e os
estados combinam texto e cor. A hierarquia separa resumo, pendência e tabela. Manter esse trabalho.

O símbolo anterior era um check dentro de um tile. Comunicava aprovação, mas quase nenhuma
identidade exclusiva. O gradiente e o brilho carregavam a marca no lugar da forma.

## Ajustes implementados

- V em duas faixas assimétricas, com intervalo diagonal. Conceito de passagem e continuidade.
- Símbolo independente de tile e legível em uma cor. Variante lima → menta sobre grafite.
- Favicon adaptado à moldura, ativo vetorial independente e aplicações atualizadas em `/marca`.
- Logo imóvel durante o trabalho, com movimento discreto apenas no hover e respeito a movimento reduzido.
- Navegação passa para o topo até 960 px: em cerca de 793 px, a sidebar anterior consumia 240 px
  e a coluna de status ficava parcialmente fora da área visível. O ajuste devolve largura à tabela.

## O que ainda merece atenção

- Resumo “Escalada”, faixa de alerta e linha de prazo apresentam informação parcialmente repetida.
  Uma faixa única pode reservar mais espaço para a lista em uma próxima rodada.
- “Agente ativo no WhatsApp” deve refletir uma condição verificada; o texto fixo pode sugerir uma
  conexão real numa demonstração simulada. Não alterado neste trabalho de marca.
- As entradas em cascata e os pulsos continuam em outros componentes. Para um painel de trabalho,
  reduzir animações decorativas e reservar movimento para alterações de estado.
- Nome e marca continuam sendo uma direção de trabalho. Esta mudança evolui Vinda, sem reabrir o naming.

## Princípios usados

- Layout: dar espaço suficiente à informação essencial e adaptar a navegação à largura disponível.
- Ícones: forma reconhecível em escala pequena, significado consistente e dependência mínima de efeitos.
- Acessibilidade: rótulos sem depender só de cor; respeitar movimento reduzido.
- Tipografia: manter hierarquia e peso confortável em tabelas e formulários.

## Para o Claude

Revisar a silhueta, o intervalo diagonal e a proporção símbolo/wordmark. As demais mudanças de
fontes e tokens foram preservadas. Evitar reintroduzir check, tile obrigatório ou loop no logo.
Captura em `vinda-v2-preview.jpg`; ativo em `web/public/brand/vinda-simbolo.svg`.
Sem commit ou push.
