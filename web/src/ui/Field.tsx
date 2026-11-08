import { Children, cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import estilos from "./Field.module.css";

export interface FieldProps {
  rotulo: string;
  erro?: string;
  ajuda?: string;
  children: ReactNode;
}

export function Field({ rotulo, erro, ajuda, children }: FieldProps) {
  const id = useId();
  const id_ajuda = `${id}-ajuda`;
  const id_erro = `${id}-erro`;
  const filho = Children.only(children);
  const props_filho = isValidElement(filho) ? (filho.props as Record<string, unknown>) : {};
  const id_controle = typeof props_filho.id === "string" ? props_filho.id : id;
  const descricao =
    [props_filho["aria-describedby"], ajuda ? id_ajuda : null, erro ? id_erro : null]
      .filter((v): v is string => typeof v === "string" && v !== "")
      .join(" ") || undefined;
  const controle = isValidElement(filho)
    ? cloneElement(filho as ReactElement<Record<string, unknown>>, {
        id: id_controle,
        "aria-describedby": descricao,
        "aria-invalid": erro ? true : props_filho["aria-invalid"],
      })
    : filho;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id_controle} className={`text-label ${estilos.rotulo}`}>
        {rotulo}
      </label>
      {controle}
      {ajuda && (
        <p id={id_ajuda} className={`text-body-sm ${estilos.ajuda}`}>
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={id_erro} role="alert" className={`text-body-sm ${estilos.erro}`}>
          {erro}
        </p>
      )}
    </div>
  );
}
