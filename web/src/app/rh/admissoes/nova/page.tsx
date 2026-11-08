"use client";

import { useRouter } from "next/navigation";
import { NovaAdmissao } from "../../../../rh/NovaAdmissao";

export default function NovaAdmissaoPage() {
  const roteador = useRouter();
  return (
    <NovaAdmissao
      ao_criar={(id) => roteador.push(`/rh/admissoes/${id}`)}
      ao_cancelar={() => roteador.push("/rh")}
    />
  );
}
