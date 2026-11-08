# Proposta A — continuidade visível

Nome de exploração: **Cumpre**. Não é nome aprovado nem afirmação de disponibilidade.
Posicionamento: um colega digital que acompanha uma responsabilidade até a conclusão.
Assinatura: **Do pedido ao concluído.**

## Naming

Cumpre é curto, pronunciável em português e descreve uma entrega. O risco é soar restrito
à conformidade; o produto deve sustentar a promessa com estados e evidências, sem sugerir
aprovações legais ou médicas automáticas. Para o Claude explorar: território de continuidade
(Segue) e de trabalho (Turno); esses nomes também precisam de pesquisa antes de seleção.

Sigo e Prumo foram considerados e descartados nesta rodada por usos próximos encontrados:
- https://wisesystem.com.br/sigoweb/download/Apresentacao-Sigo.pdf
- https://www.goprumo.com.br/termos-de-uso

A busca preliminar não substitui uma escolha de marca nem verifica registros ou domínios.

## Símbolo

Dois trajetos complementares formam um C aberto, com um terminal deslocado que indica avanço.
Desenhado em SVG, sem dependência de fonte. Deve funcionar em uma cor; o gradiente é secundário.
O wordmark usa Onest 600 com espaçamento ajustado. Ainda é um estudo tipográfico, não lettering final.
Arquivo: `simbolo.svg`. A prancha inclui uso claro, escuro e tamanhos pequenos.

## Tipografia

**Onest**, pesos 400/500/600. Uma única família para interface e marca; sem itálico editorial.
Texto de interface 14–16 px; rótulos 12 px; números tabulares. Títulos compactos no produto.
A fonte é disponibilizada sob SIL OFL segundo o projeto oficial: https://onest.md/en
A prancha carrega pelo Google Fonts; se offline, cai para a fonte do sistema. Na integração,
hospedar o arquivo e a licença localmente para evitar dependência de rede durante a demo.

## Cor e composição

- Branco mineral #F5F7F4 e branco #FFFFFF para áreas de trabalho.
- Tinta #182723 e verde-petróleo #174E40 para hierarquia e ações principais.
- Menta #83D6BD → cítrico #D9EFA0 como gradiente de marca localizado.
- Cinza #65716B para texto secundário; laranja só em atenção operacional.
- Painel com navegação compacta e uma área principal ampla; linhas e grupos claros, sem um card por frase.
- Não usar gradiente atrás de tabelas, estados dependentes só de cor, números de impacto inventados,
  órbitas, robôs ou brilhos como atalho para comunicar IA.

## Movimento

Entrada de 320 ms com deslocamento de 8 px; resposta de controles em 160 ms.
Trajeto do símbolo pode ser revelado uma vez na abertura. O botão de demonstração da prancha
reproduz a entrada. Respeitar `prefers-reduced-motion`; nenhuma animação contínua decorativa.

## Próximo passo conjunto

Claude revisa esta direção e traz contraproposta. Consolidar nome, símbolo e paleta com a usuária.
Só então editar os tokens na fonte JSON e gerar CSS; aplicar à interface Next.js preservando os fluxos.
