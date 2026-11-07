"use client";

import { useRouter } from "next/navigation";
import { ListaAdmissoes } from "../../rh/ListaAdmissoes";

export default function RhPage() {
  const roteador = useRouter();
  return <ListaAdmissoes ao_abrir={(id) => roteador.push(`/rh/admissoes/${id}`)} />;
}
