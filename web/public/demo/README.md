# Documentos fictícios da demo

Fotos **fictícias** (marca "DOCUMENTO FICTÍCIO — DEMO", sem validade legal) para a demo ponta a ponta do agente de
admissão. Todas são do candidato **Rafael Costa Mendes**, CPF 529.982.247-25, nascido em 14/03/1996 (filiação Ana
Costa Mendes / Paulo Mendes), exceto onde indicado. Data de "hoje" na demo: **08/11/2026**.

Para regenerar (macOS, da raiz do repo): `swift worker/scripts/gerar_documentos_admissao.swift`

| Arquivo | Documento | Resultado esperado do agente |
|---|---|---|
| `rg.png` | Carteira de Identidade, RG 12.345.678-9 | Aprovado |
| `rg-borrado.png` | O mesmo RG com desfoque forte | Recusado: imagem ilegível, pedir nova foto |
| `cpf.png` | Comprovante de inscrição no CPF | Aprovado |
| `comprovante.png` | Conta de luz, Rua da Aurora, 325 - Boa Vista, Recife/PE, emitida em 20/10/2026 | Aprovado |
| `comprovante-antigo.png` | A mesma conta, emitida em 15/03/2026 | Recusado: "o comprovante é de março", precisa ser recente |
| `banco.png` | Dados da conta: Banco Fictício S.A., ag. 1234, conta 98765-4, titular Rafael | Aprovado |
| `banco-outro-titular.png` | A mesma conta com titular Mariana Alves Costa | Recusado: conta em nome de outra pessoa |
| `matricula.png` | Declaração de matrícula, Universidade Fictícia de Pernambuco, Engenharia Elétrica, 01/10/2026 | Aprovado |
| `aso.png` | ASO admissional de 15/10/2026, APTO, Dra. Helena Prado CRM-PE 12345 | Aprovado |
| `nr10.png` | Certificado NR-10, 40 horas, concluído em 10/09/2026 | Aprovado |
| `nr35.png` | Certificado NR-35, 8 horas, concluído em 12/09/2026 | Aprovado |
| `nr35-vencido.png` | Certificado NR-35, 8 horas, concluído em 05/06/2024 | Recusado: venceu em 05/06/2026 (validade de 24 meses) |
| `nr10-carga-baixa.png` | Certificado NR-10 com 16 horas | Recusado: 16h < 40h exigidas |

Os certificados NR trazem também o responsável técnico (Eng. Marcos Lima CREA-PE 54321) e o emissor (Escola de
Segurança Fictícia Ltda, CNPJ 12.345.678/0001-95).
