import estilos from "./Button.module.css";

export type VarianteBotao = "primario" | "secundario" | "discreto";
export type TamanhoBotao = "md" | "sm";

export function classes_botao(variante: VarianteBotao, tamanho: TamanhoBotao, extra?: string) {
  return [
    "text-label",
    estilos.botao,
    estilos[variante],
    tamanho === "sm" ? estilos.sm : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}
