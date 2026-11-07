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
  1º envio do RG ilegível, 1º envio do comprovante emitido em março (> 90 dias), o resto válido. Conta os envios
  gravados do documento, então o reenvio depois de "Pedir de novo" não repete a recusa. Dicas no nome do arquivo
  forçam o resultado: `borrado`, `antigo`, `outro-nome`. Os dados extraídos passam pelas regras reais em TS
  (90 dias, dígito do CPF, validade da CNH, nome igual).
- Catálogo e modelos são só leitura no MVP; o ajuste é por admissão.
- Barra "Demo" discreta no rodapé do `/rh`: +24 h, metade do prazo, 2 dias antes do início, prazo estourado e
  reiniciar dados. Preset cujo alvo já passou fica desabilitado ("Já passou"). A cobrança manda no máximo um
  lembrete por admissão a cada avanço (o de nível mais alto devido).
- Celular e BarraDemo travam a admissão padrão na primeira leitura: ela não muda quando o status muda (concluir,
  escalar); só segue sozinha uma admissão criada depois. A escolha manual ganha. "Reiniciar dados" (em qualquer
  janela) sobe a `epoca` da Api e as duas telas voltam ao padrão; o celular tira o `?admissao=` da URL.
- Seed: Ana começa em 20 dias e Diego em 25 (os presets aplicados na admissão nova não estouram o prazo deles);
  Bruno em 2 (o "prazo em risco" do início da demo); Carla concluída.
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

## Roteiro da demo
Coberto por `web/src/api/demo.test.ts`.
1. `/rh` e `/whatsapp` em janelas separadas; "Reiniciar dados".
2. Painel: aviso de escalação e "Prazo em risco: Bruno". Abrir Escalações → Bruno (comprovante recusado 3 vezes) →
   "Aprovar manualmente" (a pill muda nas duas janelas).
3. Nova admissão: estagiária, modelo Estágio + Dados bancários, início em ~10 dias → o celular recebe as boas-vindas.
4. Celular: `rg-borrado.jpg` (recusa e explica) → `rg-frente.jpg` (aprovado; checklist muda no `/rh`).
5. `comprovante.jpg` → recusa "é de março…".
6. BarraDemo: +24 h, Metade do prazo, 2 dias antes → três níveis de lembrete no celular e alerta de prazo no painel.
7. Enviar o resto (`cpf.jpg`, `comprovante.jpg`, `matricula.jpg`, `banco.jpg`) → Concluída, verde, com o código no
   sistema de destino; o celular mostra a mensagem de conclusão.
