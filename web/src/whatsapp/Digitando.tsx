import estilos from "./Digitando.module.css";

/** Bolha "digitando…" do agente. Só existe na UI: o motor grava a resposta na hora. */
export function Digitando() {
  return (
    <div role="status" className={estilos.bolha}>
      <span className={estilos.pontos} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={estilos.oculto}>Agente digitando</span>
    </div>
  );
}
