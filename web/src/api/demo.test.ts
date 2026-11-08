// Roteiro da demo (docs/designs/admissao-ui.md, "Roteiro da demo") percorrido só pela Api, com relógio fixo.
import { describe, expect, it } from "vitest";
import { data_local } from "../domain/datas";
import { ArmazenamentoMemoria } from "../store/armazenamento";
import { MockApi } from "./mock_api";

const AGORA = new Date(2026, 10, 7, 10, 0, 0);

function arquivo(nome: string): File {
  return new File(["x"], nome, { type: "image/jpeg" });
}

describe("roteiro da demo", () => {
  it("do reset à conclusão da estagiária, sem estourar o prazo de Ana e Diego", async () => {
    const api = new MockApi(new ArmazenamentoMemoria(), () => AGORA.getTime(), {
      reduzir_imagem: () => Promise.resolve("data:image/png;base64,iVBORw0KGgo="),
    });
    const por_nome = (nome: string) => api.listar_admissoes().find((r) => r.admissao.nome === nome)!;

    // 1. Reiniciar dados
    api.resetar();

    // 2. Escalação do Bruno (comprovante recusado 3 vezes) → aprovar manualmente
    expect(por_nome("Bruno Lima")).toMatchObject({ alerta_prazo: true, admissao: { status: "escalada" } });
    const esc = api.listar_escalacoes({ status: "aberta" }).find((v) => v.escalacao.motivo === "tres_falhas")!;
    expect(esc.admissao.nome).toBe("Bruno Lima");
    api.resolver_escalacao(esc.escalacao.id, "aprovar_manualmente");
    expect(por_nome("Bruno Lima").admissao.status).not.toBe("escalada");

    // 3. Nova admissão: Estágio + Dados bancários, início em 10 dias → boas-vindas
    const estagio = api.listar_modelos().find((m) => m.modelo.id === "estagio")!;
    const nova = api.criar_admissao({
      nome: "Júlia Martins",
      whatsapp: "+55 11 91234-5678",
      cargo: "Estagiária de Marketing",
      data_inicio: data_local(new Date(2026, 10, 17)),
      modelo_id: "estagio",
      documentos: [...estagio.tipos.map((t) => t.id), "dados_bancarios"].map((t) => ({ tipo_documento_id: t })),
    });
    const det = () => api.obter_admissao(nova.id)!;
    const doc = (tipo: string) => det().documentos.find((d) => d.documento.tipo_documento_id === tipo)!.documento;
    expect(det().documentos.filter((d) => d.documento.status === "pendente")).toHaveLength(5);
    expect(det().mensagens.at(-1)!.texto).toContain("Júlia");

    // 4. RG borrado recusa; RG da frente aprova
    await api.enviar_arquivo(nova.id, arquivo("rg-borrado.jpg"));
    expect(doc("rg_cnh").status).toBe("pendente");
    await api.enviar_arquivo(nova.id, arquivo("rg-frente.jpg"));
    expect(doc("rg_cnh").status).toBe("aprovado");

    // 5. Comprovante recusado por ser de março
    await api.enviar_arquivo(nova.id, arquivo("comprovante.jpg"));
    expect(doc("comprovante_residencia").status).toBe("pendente");
    expect(det().mensagens.at(-1)!.texto).toContain("março");

    // 6. Presets na admissão nova → leve, prazo, firme e alerta de prazo
    for (const p of ["mais_24h", "metade_prazo", "dois_dias_antes"] as const) api.avancar_tempo(p, nova.id);
    expect(det().lembretes.map((l) => l.nivel)).toEqual(["leve", "prazo", "firme"]);
    expect(por_nome("Júlia Martins").alerta_prazo).toBe(true);
    for (const nome of ["Ana Souza", "Diego Rocha"]) expect(por_nome(nome).escalacoes_abertas).toBe(0);
    for (const nome of ["Ana Souza", "Diego Rocha"])
      expect(api.obter_admissao(por_nome(nome).admissao.id)!.escalacoes).toHaveLength(0);

    // 7. O resto → concluída com o código do sistema de destino
    for (const nome of ["cpf.jpg", "comprovante.jpg", "matricula.jpg", "banco.jpg"])
      await api.enviar_arquivo(nova.id, arquivo(nome));
    expect(det().admissao.status).toBe("concluida");
    expect(det().admissao.id_externo).toBeTruthy();
  });
});
