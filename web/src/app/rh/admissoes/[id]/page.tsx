"use client";

import { use } from "react";
import { DetalheAdmissao } from "../../../../rh/DetalheAdmissao";

export default function DetalheAdmissaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <DetalheAdmissao id={id} />;
}
