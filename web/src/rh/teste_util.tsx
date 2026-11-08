import type { ReactNode } from "react";
import { ApiProvider } from "../api/contexto";
import { MockApi } from "../api/mock_api";
import { ArmazenamentoMemoria } from "../store/armazenamento";

export const AGORA_FIXO = new Date(2026, 10, 7, 10, 0, 0);

export function criar_api(): MockApi {
  return new MockApi(new ArmazenamentoMemoria(), () => AGORA_FIXO.getTime());
}

export function Com({ api, children }: { api: MockApi; children: ReactNode }) {
  return <ApiProvider api={api}>{children}</ApiProvider>;
}
