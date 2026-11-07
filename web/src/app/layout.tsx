import type { Metadata } from "next";
import { ApiProvider } from "../api/contexto";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente de Admissão",
  description: "Painel do RH e WhatsApp simulado para a admissão de documentos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>
        <ApiProvider>{children}</ApiProvider>
      </body>
    </html>
  );
}
