import { MockApi } from "../api/mock_api";
import { ArmazenamentoMemoria } from "../store/armazenamento";

export const AGORA_FIXO = new Date(2026, 10, 7, 10, 0, 0);
export const IMAGEM_FIXA = "data:image/png;base64,iVBORw0KGgo=";

/** MockApi de teste: relógio fixo e redução de imagem stubada (o jsdom não tem canvas). */
export function criar_api(): MockApi {
  return new MockApi(new ArmazenamentoMemoria(), () => AGORA_FIXO.getTime(), {
    reduzir_imagem: () => Promise.resolve(IMAGEM_FIXA),
  });
}
