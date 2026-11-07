// Gera um ASO FICTÍCIO em PNG para testes (macOS). Sem diagnóstico: só o que a matriz confere.
// Uso: swift scripts/gerar_aso_ficticio.swift <saida.png> <NOME> <cpf> <funcao> <dd/mm/aaaa>
import AppKit
let a = CommandLine.arguments
let (saida, nome, cpf, funcao, data) = (a[1], a[2], a[3], a[4], a[5])
let w = 1100.0, h = 800.0
let img = NSImage(size: NSSize(width: w, height: h))
img.lockFocus()
NSColor.white.setFill(); NSRect(x: 0, y: 0, width: w, height: h).fill()
NSColor.black.setStroke(); let b = NSBezierPath(rect: NSRect(x: 30, y: 30, width: w-60, height: h-60)); b.lineWidth = 2; b.stroke()
func t(_ s: String, _x: Double, _ y: Double, _ size: Double, bold: Bool = false) {
  let f = bold ? NSFont.boldSystemFont(ofSize: size) : NSFont.systemFont(ofSize: size)
  NSAttributedString(string: s, attributes: [.font: f, .foregroundColor: NSColor.black]).draw(at: NSPoint(x: _x, y: y))
}
t("ATESTADO DE SAÚDE OCUPACIONAL (ASO)", _x: 220, 700, 32, bold: true)
t("Tipo de exame: Admissional", _x: 70, 630, 22)
t("Empregador: Manutenção Elétrica Exemplo Ltda · CNPJ 12.345.678/0001-95", _x: 70, 590, 20)
t("Trabalhador: \(nome)", _x: 70, 540, 22)
t("CPF: \(cpf)", _x: 70, 505, 22)
t("Função: \(funcao)", _x: 70, 470, 22)
t("Atividades avaliadas: Trabalho com eletricidade (NR-10); Trabalho em altura (NR-35)", _x: 70, 420, 20)
t("Conclusão: APTO para a função e para as atividades acima.", _x: 70, 360, 24, bold: true)
t("Data do exame: \(data)", _x: 70, 300, 22)
t("Médico examinador: Dra. Helena Prado · CRM-SP 123456", _x: 70, 240, 22)
t("(documento fictício para teste)", _x: 70, 120, 16)
img.unlockFocus()
let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: saida))
