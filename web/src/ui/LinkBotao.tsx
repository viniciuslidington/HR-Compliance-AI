import Link from "next/link";
import type { ComponentProps } from "react";
import { classes_botao, type TamanhoBotao, type VarianteBotao } from "./classes_botao";

export type LinkBotaoProps = {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
} & ComponentProps<typeof Link>;

export function LinkBotao({ variante = "primario", tamanho = "md", className, ...resto }: LinkBotaoProps) {
  return <Link className={classes_botao(variante, tamanho, className)} {...resto} />;
}
