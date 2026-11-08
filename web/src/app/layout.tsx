import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, Geist_Mono } from "next/font/google";
import { ApiProvider } from "../api/contexto";
import "./globals.css";

// Fontes auto-hospedadas pelo Next. As variáveis alimentam --font-display/--font-sans/--font-mono
// do design-system (tokens.json), por isso a classe vai no <html>, que é o :root.
const display = Funnel_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-funnel-display" });
const sans = Funnel_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-funnel-sans" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "vinda · admissão que se resolve sozinha", template: "%s · vinda" },
  description: "Agente de admissão pelo WhatsApp: coleta, valida e cobra os documentos até o colaborador estar cadastrado.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <ApiProvider>{children}</ApiProvider>
      </body>
    </html>
  );
}
