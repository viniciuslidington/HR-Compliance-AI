# Admissão: decisões da interface (painel do RH + WhatsApp simulado)

Resumo das decisões do painel construído em `web/` (Next.js, dados mock).

## Do usuário
- Duas interfaces em janelas separadas na demo: `/rh` e `/whatsapp`. O que acontece em uma aparece na outra.
- UI com mocks agora; a integração com o worker vem depois.
- Foco no RH; o WhatsApp simulado é o canal de upload.
- Framework: Next.js.

## Decisões de implementação (podem ser revistas)
- App Router, pasta `web/`. A pasta vazia `mocks/employee-portal/` foi removida.
- Tudo que lê dados é componente cliente, porque o mock vive no `localStorage`. As `page.tsx` são finas e só
  repassam `params` a componentes de tela testáveis sem o roteador.
- Upload real de arquivo no simulador, com preview. O resultado vem de um leitor simulado determinístico:
  1º RG ilegível, 1º comprovante emitido em março (> 90 dias), o resto válido. Dicas no nome do arquivo
  forçam o resultado: `borrado`, `antigo`, `outro-nome`. Os dados extraídos passam pelas regras reais em TS
  (90 dias, dígito do CPF, validade da CNH, nome igual).
- Catálogo e modelos são só leitura no MVP; o ajuste é por admissão.
- Barra "Demo" discreta no rodapé do `/rh`: +24 h, metade do prazo, 2 dias antes do início, prazo estourado e
  reiniciar dados.
- Status Escalada: fundo `--orange-tint` e texto `--orange-deep`. Concluída: `--success-tint` com ponto
  `--success` e texto `--ink`. Nenhum token novo.
- `mensagem` ganha `autor?: 'agente' | 'rh'` (só no front) e `Motivo` ganha `o_que_fazer`. Os dois ficam
  anotados para alinhar com o worker.

## Regras de produto
- 3 falhas no mesmo documento escalam. Comprovante de residência: menos de 90 dias.
- Modelos: CLT padrão (RG/CNH, CPF, comprovante, dados bancários); Estágio (RG/CNH, CPF, comprovante,
  declaração de matrícula).
- Toda recusa traz motivo e o que fazer.
- Design: só tokens de `design-system/tokens.css`; regras em `design-system/BRAND.md`.
