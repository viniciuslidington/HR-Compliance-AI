import type { Motivo, TipoDocumento } from "../tipos";
import type { LeituraMock } from "./index";

/** Camada 1: o arquivo é legível e é o documento certo? */
export function validar_qualidade(tipo: TipoDocumento, leitura: LeituraMock): Motivo[] {
  if (leitura.qualidade === "ilegivel") {
    const detalhe = leitura.detalhe_qualidade ? `, ${leitura.detalhe_qualidade}` : "";
    return [
      {
        codigo: "ilegivel",
        texto: `não consegui ler o documento${detalhe}`,
        o_que_fazer: "mande uma nova foto, bem nítida, com o documento inteiro aparecendo",
        gravidade: "recusa",
      },
    ];
  }
  if (leitura.qualidade === "tipo_errado") {
    return [
      {
        codigo: "tipo_errado",
        texto: `esse arquivo não parece ser o documento que pedi (${tipo.nome})`,
        o_que_fazer: `mande o documento certo: ${tipo.nome}`,
        gravidade: "recusa",
      },
    ];
  }
  return [];
}
