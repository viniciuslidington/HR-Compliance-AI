import estilos from "./layout.module.css";

export default function WhatsappLayout({ children }: LayoutProps<"/whatsapp">) {
  return (
    <section className={`section-dark ${estilos.cena}`}>
      {children}
    </section>
  );
}
