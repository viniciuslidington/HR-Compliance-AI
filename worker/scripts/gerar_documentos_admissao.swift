// Gera as fotos de documentos FICTÍCIOS da demo de admissão (macOS, AppKit + CoreImage).
// Todos levam a marca "DOCUMENTO FICTÍCIO — DEMO" e não têm validade legal.
// Uso (da raiz do repo): swift worker/scripts/gerar_documentos_admissao.swift [pasta_saida]
// Saída padrão: web/public/demo/
import AppKit
import CoreImage

let saida = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "web/public/demo"
try! FileManager.default.createDirectory(atPath: saida, withIntermediateDirectories: true)

// Pessoa da demo
let NOME = "RAFAEL COSTA MENDES"
let NOME_TITULO = "Rafael Costa Mendes"
let CPF = "529.982.247-25"
let NASCIMENTO = "14/03/1996"
let MAE = "ANA COSTA MENDES"
let PAI = "PAULO MENDES"

let W = 1400.0
let MARCA = "DOCUMENTO FICTÍCIO — DEMO"

// MARK: - Desenho

func cor(_ hex: UInt32, _ a: Double = 1) -> NSColor {
  NSColor(srgbRed: Double((hex >> 16) & 0xff) / 255, green: Double((hex >> 8) & 0xff) / 255,
          blue: Double(hex & 0xff) / 255, alpha: a)
}
let PRETO = cor(0x111111)
let CINZA = cor(0x555555)

func fonte(_ size: Double, _ bold: Bool) -> NSFont {
  bold ? NSFont.boldSystemFont(ofSize: size) : NSFont.systemFont(ofSize: size)
}

/// Texto com origem no canto superior esquerdo (contexto invertido). Retorna a largura.
@discardableResult
func texto(_ s: String, _ x: Double, _ y: Double, _ size: Double, bold: Bool = false, cor c: NSColor = PRETO) -> Double {
  let str = NSAttributedString(string: s, attributes: [.font: fonte(size, bold), .foregroundColor: c])
  str.draw(at: NSPoint(x: x, y: y))
  return str.size().width
}

func centro(_ s: String, _ y: Double, _ size: Double, bold: Bool = false, cor c: NSColor = PRETO, x0: Double = 0, largura: Double = W) {
  let str = NSAttributedString(string: s, attributes: [.font: fonte(size, bold), .foregroundColor: c])
  str.draw(at: NSPoint(x: x0 + (largura - str.size().width) / 2, y: y))
}

func caixa(_ x: Double, _ y: Double, _ w: Double, _ h: Double, fill: NSColor? = nil, stroke: NSColor? = nil, linha: Double = 2, raio: Double = 0) {
  let p = NSBezierPath(roundedRect: NSRect(x: x, y: y, width: w, height: h), xRadius: raio, yRadius: raio)
  if let f = fill { f.setFill(); p.fill() }
  if let s = stroke { s.setStroke(); p.lineWidth = linha; p.stroke() }
}

func linha(_ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double, _ c: NSColor = CINZA, _ w: Double = 2) {
  let p = NSBezierPath(); p.move(to: NSPoint(x: x1, y: y1)); p.line(to: NSPoint(x: x2, y: y2))
  c.setStroke(); p.lineWidth = w; p.stroke()
}

/// Campo de formulário: rótulo pequeno em cima, valor grande embaixo.
func campo(_ rotulo: String, _ valor: String, _ x: Double, _ y: Double, size: Double = 34, cor c: NSColor = PRETO) {
  texto(rotulo, x, y, 20, bold: true, cor: CINZA)
  texto(valor, x, y + 28, size, bold: true, cor: c)
}

/// Marca d'água diagonal clara + faixa sólida no rodapé.
func marcaDagua(_ ctx: CGContext, _ h: Double) {
  ctx.saveGState()
  let attrs: [NSAttributedString.Key: Any] = [.font: fonte(64, true), .foregroundColor: cor(0xC62828, 0.07)]
  let str = NSAttributedString(string: MARCA, attributes: attrs)
  var y = -200.0
  while y < h + 400 {
    ctx.saveGState()
    ctx.translateBy(x: -100, y: y)
    ctx.rotate(by: -.pi / 9)
    str.draw(at: NSPoint(x: 0, y: 0))
    str.draw(at: NSPoint(x: str.size().width + 120, y: 0))
    ctx.restoreGState()
    y += 330
  }
  ctx.restoreGState()
  faixaFicticio(h)
}

func faixaFicticio(_ h: Double) {
  caixa(0, h - 56, W, 56, fill: cor(0xC62828))
  centro("\(MARCA) · sem validade legal · gerado para teste", h - 44, 24, bold: true, cor: .white)
}

func renderizar(_ h: Double, fundo: NSColor = .white, _ desenho: (CGContext) -> Void) -> CGImage {
  let cs = CGColorSpace(name: CGColorSpace.sRGB)!
  let ctx = CGContext(data: nil, width: Int(W), height: Int(h), bitsPerComponent: 8, bytesPerRow: 0,
                      space: cs, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
  ctx.translateBy(x: 0, y: h); ctx.scaleBy(x: 1, y: -1)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: true)
  caixa(0, 0, W, h, fill: fundo)
  desenho(ctx)
  marcaDagua(ctx, h)  // por cima do conteúdo, clara o bastante para não atrapalhar a leitura
  NSGraphicsContext.restoreGraphicsState()
  return ctx.makeImage()!
}

func salvar(_ img: CGImage, _ nome: String) {
  let rep = NSBitmapImageRep(cgImage: img)
  let url = URL(fileURLWithPath: saida).appendingPathComponent(nome)
  try! rep.representation(using: .png, properties: [:])!.write(to: url)
  print("ok  \(url.path)")
}

func borrar(_ img: CGImage, sigma: Double) -> CGImage {
  let ci = CIImage(cgImage: img)
  let out = ci.clampedToExtent().applyingGaussianBlur(sigma: sigma).cropped(to: ci.extent)
  let borrada = CIContext().createCGImage(out, from: ci.extent)!
  // Redesenha a faixa de "fictício" nítida por cima: o documento fica ilegível, o aviso não.
  let h = Double(img.height)
  return renderizar(h) { ctx in
    ctx.saveGState(); ctx.translateBy(x: 0, y: h); ctx.scaleBy(x: 1, y: -1)
    ctx.draw(borrada, in: CGRect(x: 0, y: 0, width: W, height: h))
    ctx.restoreGState()
  }
}

// MARK: - Documentos

func rg() -> CGImage {
  renderizar(1000, fundo: cor(0xF4F1E8)) { _ in
    caixa(40, 40, W - 80, 880, fill: cor(0xE3EEDD), stroke: cor(0x2E5E3A), linha: 4, raio: 24)
    centro("REPÚBLICA FICTÍCIA DO BRASIL · ESTADO FICTÍCIO DE PERNAMBUCO", 70, 24, bold: true, cor: cor(0x2E5E3A))
    centro("INSTITUTO DE IDENTIFICAÇÃO FICTÍCIO", 104, 22, cor: cor(0x2E5E3A))
    centro("CARTEIRA DE IDENTIDADE", 140, 46, bold: true)
    linha(80, 210, W - 80, 210, cor(0x2E5E3A), 3)

    caixa(90, 250, 260, 330, fill: cor(0xC9D3C4), stroke: cor(0x2E5E3A))
    centro("FOTO", 395, 30, bold: true, cor: cor(0x6B7B66), x0: 90, largura: 260)

    let x = 400.0
    campo("REGISTRO GERAL", "12.345.678-9", x, 250, size: 44)
    campo("DATA DE EXPEDIÇÃO", "22/07/2014", x + 520, 250, size: 34)
    campo("NOME", NOME, x, 360, size: 40)
    texto("FILIAÇÃO", x, 465, 20, bold: true, cor: CINZA)
    texto(MAE, x, 493, 34, bold: true)
    texto(PAI, x, 537, 34, bold: true)
    campo("DATA DE NASCIMENTO", NASCIMENTO, x, 610, size: 38)
    campo("NATURALIDADE", "RECIFE/PE", x + 520, 610, size: 34)
    campo("CPF", CPF, x, 710, size: 34)
    campo("DOC. ORIGEM", "C.NASC. LV A-12 FL 34", x + 520, 710, size: 28)

    linha(90, 860, 520, 860, PRETO, 2)
    texto("ASSINATURA DO DIRETOR (FICTÍCIO)", 90, 868, 18, cor: CINZA)
  }
}

func cpf() -> CGImage {
  renderizar(900, fundo: cor(0xEEF3F8)) { _ in
    caixa(40, 40, W - 80, 760, fill: .white, stroke: cor(0x1F4E79), linha: 4, raio: 18)
    caixa(40, 40, W - 80, 120, fill: cor(0x1F4E79), raio: 18)
    caixa(40, 120, W - 80, 40, fill: cor(0x1F4E79))
    centro("SECRETARIA FICTÍCIA DA RECEITA", 62, 26, bold: true, cor: .white)
    centro("CADASTRO DE PESSOAS FÍSICAS — COMPROVANTE DE INSCRIÇÃO", 104, 30, bold: true, cor: .white)

    let x = 110.0
    campo("Nº DO CPF", CPF, x, 210, size: 56, cor: cor(0x1F4E79))
    campo("NOME", NOME, x, 340, size: 44)
    campo("DATA DE NASCIMENTO", NASCIMENTO, x, 470, size: 38)
    campo("SITUAÇÃO CADASTRAL", "REGULAR", x + 620, 470, size: 38)
    campo("DATA DA INSCRIÇÃO", "02/05/2008", x, 590, size: 34)
    campo("CÓDIGO DE CONTROLE", "A1B2.C3D4.E5F6.0000", x + 620, 590, size: 30)
    texto("Comprovante emitido para fins de demonstração. Não consultar em órgão real.", x, 720, 22, cor: CINZA)
  }
}

func comprovante(emissao: String, referencia: String, vencimento: String) -> CGImage {
  renderizar(1500) { _ in
    caixa(0, 0, W, 170, fill: cor(0xF2A900))
    texto("⚡", 60, 30, 90)
    texto("COMPANHIA ENERGÉTICA FICTÍCIA", 170, 40, 44, bold: true)
    texto("CNPJ 00.000.000/0001-91 · Atendimento 0800 000 0000 (fictício)", 170, 100, 24)

    centro("CONTA DE ENERGIA ELÉTRICA", 210, 42, bold: true)

    caixa(60, 290, W - 120, 330, stroke: CINZA, linha: 2, raio: 12)
    campo("TITULAR", NOME_TITULO, 100, 320, size: 40)
    campo("ENDEREÇO DA UNIDADE CONSUMIDORA", "Rua da Aurora, 325 - Boa Vista, Recife/PE", 100, 420, size: 36)
    campo("CEP", "50050-000", 100, 520, size: 30)
    campo("UNIDADE CONSUMIDORA", "7001234567", 520, 520, size: 30)
    campo("CLASSE", "Residencial B1", 960, 520, size: 30)

    caixa(60, 660, W - 120, 160, fill: cor(0xFFF4D6), stroke: cor(0xF2A900), linha: 3, raio: 12)
    campo("DATA DE EMISSÃO", emissao, 100, 690, size: 48)
    campo("REFERÊNCIA", referencia, 560, 690, size: 40)
    campo("VENCIMENTO", vencimento, 980, 690, size: 40)

    texto("DEMONSTRATIVO DE CONSUMO", 60, 870, 28, bold: true)
    let cols = [60.0, 560, 860, 1140]
    let cab = ["Descrição", "Quantidade", "Tarifa (R$)", "Valor (R$)"]
    caixa(60, 920, W - 120, 56, fill: cor(0xEEEEEE))
    for (i, c) in cab.enumerated() { texto(c, cols[i] + 20, 932, 26, bold: true) }
    let itens = [["Consumo de energia", "182 kWh", "0,78", "141,96"],
                 ["Contribuição iluminação pública", "1", "12,40", "12,40"],
                 ["Bandeira tarifária verde", "182 kWh", "0,00", "0,00"]]
    for (r, item) in itens.enumerated() {
      let y = 990.0 + Double(r) * 56
      for (i, v) in item.enumerated() { texto(v, cols[i] + 20, y, 26) }
      linha(60, y + 48, W - 60, y + 48, cor(0xDDDDDD), 1)
    }
    caixa(60, 1180, W - 120, 90, fill: cor(0x111111), raio: 10)
    texto("TOTAL A PAGAR", 100, 1205, 36, bold: true, cor: .white)
    texto("R$ 154,36", 1050, 1200, 44, bold: true, cor: cor(0xF2A900))
    texto("Código de barras: 83600000001-5 54360000000-0 00000000000-0 00000000000-0 (fictício)", 60, 1310, 22, cor: CINZA)
  }
}

func banco(titular: String, cpfMascarado: String) -> CGImage {
  renderizar(1100, fundo: cor(0xF5F3FA)) { _ in
    caixa(0, 0, W, 130, fill: cor(0x4B2A85))
    texto("Banco Fictício S.A.", 60, 38, 46, bold: true, cor: .white)
    texto("Internet Banking · Minha conta", 920, 52, 26, cor: cor(0xE0D6F5))

    texto("Dados da conta", 80, 180, 48, bold: true)
    texto("Use estes dados para receber transferências e salário.", 80, 245, 26, cor: CINZA)

    caixa(80, 310, W - 160, 610, fill: .white, stroke: cor(0xD6CCEA), linha: 2, raio: 20)
    let x = 130.0
    let linhas: [(String, String)] = [("Banco", "Banco Fictício S.A. (código 999)"),
                                      ("Agência", "1234"),
                                      ("Conta corrente", "98765-4"),
                                      ("Titular", titular),
                                      ("CPF do titular", cpfMascarado)]
    for (i, (r, v)) in linhas.enumerated() {
      let y = 340.0 + Double(i) * 112
      texto(r, x, y, 24, bold: true, cor: CINZA)
      texto(v, x, y + 32, 40, bold: true)
      if i < linhas.count - 1 { linha(x, y + 98, W - 130, y + 98, cor(0xEEEAF5), 2) }
    }
    caixa(980, 380, 300, 70, fill: cor(0x4B2A85), raio: 35)
    centro("Copiar dados", 398, 28, bold: true, cor: .white, x0: 980, largura: 300)
    texto("Capturado em 08/11/2026 às 09:42", 80, 955, 22, cor: CINZA)
  }
}

func matricula() -> CGImage {
  renderizar(1350) { _ in
    caixa(0, 0, W, 150, fill: cor(0x7A1F2B))
    centro("UNIVERSIDADE FICTÍCIA DE PERNAMBUCO", 38, 44, bold: true, cor: .white)
    centro("Secretaria Acadêmica · Recife/PE", 98, 26, cor: cor(0xF3DADD))

    centro("DECLARAÇÃO DE MATRÍCULA", 220, 50, bold: true)

    let x = 110.0
    let corpo = ["Declaramos, para os devidos fins, que o(a) estudante",
                 "abaixo identificado(a) está regularmente matriculado(a)",
                 "nesta instituição no semestre letivo 2026.2."]
    for (i, l) in corpo.enumerated() { texto(l, x, 330 + Double(i) * 46, 32) }

    caixa(x - 20, 490, W - 2 * x + 40, 430, stroke: CINZA, linha: 2, raio: 12)
    campo("NOME", NOME, x + 20, 515, size: 40)
    campo("CPF", CPF, x + 20, 615, size: 34)
    campo("INSTITUIÇÃO", "Universidade Fictícia de Pernambuco", x + 20, 705, size: 36)
    campo("CURSO", "Engenharia Elétrica", x + 20, 805, size: 36)
    campo("PERÍODO", "7º período · noturno", x + 620, 805, size: 32)

    campo("DATA", "01/10/2026", x, 970, size: 40)
    texto("Recife, 01 de outubro de 2026.", x + 420, 1000, 30)
    linha(x + 420, 1130, W - x, 1130, PRETO, 2)
    texto("Secretaria Acadêmica (assinatura fictícia)", x + 420, 1140, 24, cor: CINZA)
  }
}

func aso() -> CGImage {
  renderizar(1250) { _ in
    caixa(40, 40, W - 80, 1110, stroke: PRETO, linha: 3)
    centro("ATESTADO DE SAÚDE OCUPACIONAL (ASO)", 80, 46, bold: true)
    centro("Clínica de Medicina do Trabalho Fictícia · Recife/PE", 145, 26, cor: CINZA)
    linha(80, 200, W - 80, 200, PRETO, 2)

    let x = 100.0
    campo("TIPO DE EXAME", "Admissional", x, 230, size: 36)
    campo("EMPREGADOR", "Empresa Contratante Fictícia Ltda", x + 520, 230, size: 32)
    campo("NOME", NOME, x, 340, size: 40)
    campo("CPF", CPF, x, 450, size: 36)
    campo("FUNÇÃO", "Técnico Eletricista", x + 520, 450, size: 36)
    campo("RISCOS AVALIADOS", "Eletricidade (NR-10) · Trabalho em altura (NR-35)", x, 560, size: 32)

    caixa(x - 10, 670, W - 2 * x + 20, 130, fill: cor(0xE6F4EA), stroke: cor(0x1E7B34), linha: 3, raio: 10)
    texto("RESULTADO:", x + 20, 702, 44, bold: true)
    texto("APTO", x + 320, 696, 56, bold: true, cor: cor(0x1E7B34))

    campo("DATA DO EXAME", "15/10/2026", x, 840, size: 40)
    linha(x + 520, 960, W - 100, 960, PRETO, 2)
    texto("Médico examinador", x + 520, 830, 20, bold: true, cor: CINZA)
    texto("Dra. Helena Prado", x + 520, 860, 36, bold: true)
    texto("CRM-PE 12345", x + 520, 905, 32, bold: true)
    texto("assinatura e carimbo (fictícios)", x + 520, 970, 22, cor: CINZA)
  }
}

func certificado(norma: String, titulo: String, carga: String, conclusao: String, extenso: String) -> CGImage {
  renderizar(1100, fundo: cor(0xFBF8EF)) { _ in
    caixa(30, 30, W - 60, 980, stroke: cor(0x8A6D1F), linha: 6)
    caixa(46, 46, W - 92, 948, stroke: cor(0x8A6D1F), linha: 2)
    centro("CERTIFICADO DE TREINAMENTO", 90, 52, bold: true)
    centro("\(norma) — \(titulo)", 165, 34, bold: true, cor: cor(0x8A6D1F))

    centro("Certificamos que", 250, 30)
    centro(NOME, 295, 50, bold: true)
    centro("CPF \(CPF)", 365, 32)
    centro("concluiu com aproveitamento o treinamento \(norma) descrito acima.", 420, 28)

    let x = 140.0
    texto("Carga horária: \(carga) horas", x, 500, 38, bold: true)
    texto("Data de conclusão: \(conclusao)", x, 560, 38, bold: true)
    texto("Responsável técnico: Eng. Marcos Lima CREA-PE 54321", x, 640, 30)
    texto("Emissor: Escola de Segurança Fictícia Ltda CNPJ 12.345.678/0001-95", x, 690, 30)

    texto("Recife, \(extenso).", x, 790, 28)
    linha(820, 880, W - 140, 880, PRETO, 2)
    texto("Eng. Marcos Lima · CREA-PE 54321", 820, 890, 24, cor: CINZA)
  }
}

// MARK: - Geração

let rgImg = rg()
salvar(rgImg, "rg.png")
salvar(borrar(rgImg, sigma: 16), "rg-borrado.png")
salvar(cpf(), "cpf.png")
salvar(comprovante(emissao: "20/10/2026", referencia: "10/2026", vencimento: "05/11/2026"), "comprovante.png")
salvar(comprovante(emissao: "15/03/2026", referencia: "03/2026", vencimento: "30/03/2026"), "comprovante-antigo.png")
salvar(banco(titular: NOME_TITULO, cpfMascarado: "***.982.247-**"), "banco.png")
salvar(banco(titular: "Mariana Alves Costa", cpfMascarado: "***.418.903-**"), "banco-outro-titular.png")
salvar(matricula(), "matricula.png")
salvar(aso(), "aso.png")
let NR10 = "Segurança em Instalações e Serviços em Eletricidade"
let NR35 = "Trabalho em Altura"
salvar(certificado(norma: "NR-10", titulo: NR10, carga: "40", conclusao: "10/09/2026", extenso: "10 de setembro de 2026"), "nr10.png")
salvar(certificado(norma: "NR-35", titulo: NR35, carga: "8", conclusao: "12/09/2026", extenso: "12 de setembro de 2026"), "nr35.png")
salvar(certificado(norma: "NR-35", titulo: NR35, carga: "8", conclusao: "05/06/2024", extenso: "5 de junho de 2024"), "nr35-vencido.png")
salvar(certificado(norma: "NR-10", titulo: NR10, carga: "16", conclusao: "10/09/2026", extenso: "10 de setembro de 2026"), "nr10-carga-baixa.png")
