// Gera um certificado de treinamento FICTÍCIO em PNG para testes (macOS).
// Uso: swift scripts/gerar_certificado_ficticio.swift <saida.png> <NORMA> <titulo> <NOME> <cpf> <carga_h> <dd/mm/aaaa> <data por extenso>
import AppKit
let a = CommandLine.arguments
let (saida, norma, titulo, nome, cpf, carga, data, extenso) = (a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8])
let w = 1100.0, h = 750.0
let img = NSImage(size: NSSize(width: w, height: h))
img.lockFocus()
NSColor(calibratedRed: 0.98, green: 0.97, blue: 0.93, alpha: 1).setFill(); NSRect(x: 0, y: 0, width: w, height: h).fill()
NSColor.darkGray.setStroke(); let b = NSBezierPath(rect: NSRect(x: 25, y: 25, width: w-50, height: h-50)); b.lineWidth = 4; b.stroke()
func t(_ s: String, _ y: Double, _ size: Double, bold: Bool = false) {
  let f = bold ? NSFont.boldSystemFont(ofSize: size) : NSFont.systemFont(ofSize: size)
  let str = NSAttributedString(string: s, attributes: [.font: f, .foregroundColor: NSColor.black])
  str.draw(at: NSPoint(x: (w - str.size().width)/2, y: y))
}
t("CERTIFICADO DE TREINAMENTO", 640, 40, bold: true)
t("\(norma) · \(titulo)", 590, 28)
t("Certificamos que \(nome), CPF \(cpf),", 500, 24)
t("concluiu o treinamento de \(titulo) (\(norma)),", 465, 24)
t("com carga horária de \(carga) horas, realizado em \(data).", 430, 24)
t("Instrutor: Marcos Lima · Responsável técnico: Eng. Paula Reis, CREA-SP 5061234567", 340, 18)
t("Treinamentos Exemplo Ltda · CNPJ 12.345.678/0001-95 (documento fictício para teste)", 300, 16)
t("São Paulo, \(extenso)", 200, 20)
img.unlockFocus()
let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: saida))
