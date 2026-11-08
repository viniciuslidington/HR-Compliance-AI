import type { ButtonHTMLAttributes } from "react";
import { classes_botao, type TamanhoBotao, type VarianteBotao } from "./classes_botao";

export type ButtonProps = {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variante = "primario", tamanho = "md", className, type = "button", ...resto }: ButtonProps) {
  return <button type={type} className={classes_botao(variante, tamanho, className)} {...resto} />;
}
