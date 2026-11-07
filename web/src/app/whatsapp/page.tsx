"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Telefone } from "../../whatsapp/Telefone";

export default function WhatsappPage({ searchParams }: { searchParams: Promise<{ admissao?: string | string[] }> }) {
  const { admissao } = use(searchParams);
  const roteador = useRouter();
  const inicial = Array.isArray(admissao) ? admissao[0] : admissao;
  return (
    <Telefone
      admissao_inicial={inicial}
      ao_trocar_contato={(id) => roteador.replace(`/whatsapp?admissao=${encodeURIComponent(id)}`)}
    />
  );
}
