import estilos from "./layout.module.css";

export default function WhatsappLayout({ children }: LayoutProps<"/whatsapp">) {
  return (
    <section className={`section-dark ${estilos.cena}`}>
      <header className={estilos.topo}>
        <h1 className={`text-caption ${estilos.titulo}`}>WhatsApp simulado</h1>
        <p className={`text-caption ${estilos.dica}`}>
          Dica: nomes de arquivo com borrado, antigo ou outro-nome forçam uma recusa.
        </p>
      </header>
      {children}
    </section>
  );
}
