import { describe, expect, it } from "vitest";
import { estado_vazio, type Estado } from "../estado";
import { documentos_do_modelo } from "./admissao";
import { alerta_prazo } from "./cobranca";
import { acao_sugerida } from "./escalacoes";
import { aplicar } from "./index";
import type { Evento, NovaAdmissaoInput } from "./eventos";

const AGORA = new Date(2026, 10, 7, 10, 0, 0); // 07/11/2026 10:00 local

function input(modelo_id = "estagio", extra: string[] = []): NovaAdmissaoInput {
  return {
    nome: "Ana Souza",
    whatsapp: "+5511999990000",
    cargo: "Estagiária de Marketing",
    data_inicio: "2026-11-20",
    modelo_id,
    documentos: [...documentos_do_modelo(modelo_id), ...extra].map((t) => ({ tipo_documento_id: t })),
  };
}

function criar(modelo_id = "estagio", extra: string[] = []): { estado: Estado; id: string } {
  const estado = aplicar(estado_vazio(), { tipo: "admissao_criada", dados: input(modelo_id, extra) }, AGORA);
  return { estado, id: estado.admissoes[0].id };
}

function enviar(estado: Estado, id: string, nome_arquivo: string): Estado {
  const e: Evento = { tipo: "arquivo_recebido", admissao_id: id, nome_arquivo, arquivo_url: `blob:${nome_arquivo}` };
  return aplicar(estado, e, AGORA);
}

function texto(estado: Estado, id: string, t: string): Estado {
  return aplicar(estado, { tipo: "texto_recebido", admissao_id: id, texto: t }, AGORA);
}

const doc = (e: Estado, tipo: string) => e.documentos.find((d) => d.tipo_documento_id === tipo)!;
const ultima_do_agente = (e: Estado) => [...e.mensagens].reverse().find((m) => m.direcao === "saida")!;

describe("admissao_criada", () => {
  it("copia os documentos do modelo: Estágio = 4, + dados bancários = 5", () => {
    expect(criar("estagio").estado.documentos).toHaveLength(4);
    expect(criar("estagio", ["dados_bancarios"]).estado.documentos).toHaveLength(5);
    expect(documentos_do_modelo("clt_padrao")).toEqual(["rg_cnh", "cpf", "comprovante_residencia", "dados_bancarios"]);
  });

  it("vai a em_coleta com boas-vindas com instruções e prazo", () => {
    const { estado, id } = criar();
    const a = estado.admissoes[0];
    expect(a.status).toBe("em_coleta");
    expect(a.id_externo).toBeNull();
    expect(estado.documentos.every((d) => d.status === "pendente" && d.tentativas === 0 && d.admissao_id === id)).toBe(true);
    const msgs = estado.mensagens.filter((m) => m.admissao_id === id);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatchObject({ direcao: "saida", autor: "agente", midia_url: null });
    expect(msgs[0].texto).toContain("4 documentos");
    expect(msgs[0].texto).toContain("Seu RG ou sua CNH. Mande uma foto");
    expect(msgs[0].texto).toContain("até 20/11");
  });

  it("é pura: não muta o estado de entrada e incrementa rev; ids são determinísticos", () => {
    const antes = estado_vazio();
    const congelado = JSON.stringify(antes);
    const depois = aplicar(antes, { tipo: "admissao_criada", dados: input() }, AGORA);
    expect(JSON.stringify(antes)).toBe(congelado);
    expect(depois.rev).toBeGreaterThan(antes.rev);
    expect(aplicar(estado_vazio(), { tipo: "admissao_criada", dados: input() }, AGORA)).toEqual(depois);
  });

  it("aceita documento personalizado", () => {
    const dados = input();
    dados.documentos.push({ tipo_documento_id: null, descricao_personalizada: "Carteira de vacinação" });
    const e = aplicar(estado_vazio(), { tipo: "admissao_criada", dados }, AGORA);
    expect(e.documentos).toHaveLength(5);
    expect(e.documentos[4].descricao_personalizada).toBe("Carteira de vacinação");
    expect(e.mensagens[0].texto).toContain("Carteira de vacinação");
  });
});

describe("arquivo_recebido", () => {
  it("1º RG ilegível: recusa com motivo + o que fazer e volta a pendente", () => {
    const { estado, id } = criar();
    const e = enviar(estado, id, "rg.jpg");
    const rg = doc(e, "rg_cnh");
    expect(rg.status).toBe("pendente");
    expect(rg.tentativas).toBe(1);
    expect(rg.motivo_recusa).toContain("a foto cortou a data de nascimento");
    expect(e.envios).toHaveLength(1);
    expect(e.envios[0]).toMatchObject({
      documento_admissao_id: rg.id,
      resultado: "recusado",
      arquivo_url: "blob:rg.jpg",
      motivo_codigo: "ilegivel",
    });
    expect(e.envios[0].motivo).toBe(rg.motivo_recusa);
    const entrada = e.mensagens.find((m) => m.direcao === "entrada")!;
    expect(entrada).toMatchObject({ midia_url: "blob:rg.jpg", texto: "rg.jpg" });
    const resposta = ultima_do_agente(e);
    expect(resposta.texto).toContain("a foto cortou a data de nascimento");
    expect(resposta.texto).toContain("nova foto");
    expect(resposta.criada_em > entrada.criada_em).toBe(true);
  });

  it("reenvio do RG é aprovado: grava dados, zera motivo e diz o que falta", () => {
    const { estado, id } = criar();
    const e = enviar(enviar(estado, id, "rg.jpg"), id, "rg.jpg");
    const rg = doc(e, "rg_cnh");
    expect(rg.status).toBe("aprovado");
    expect(rg.motivo_recusa).toBeNull();
    expect(rg.dados_extraidos?.nome).toBe("Ana Souza");
    expect(e.envios.map((x) => x.resultado)).toEqual(["recusado", "aprovado"]);
    expect(ultima_do_agente(e).texto).toBe(
      "RG/CNH aprovado. Faltam 3: CPF, comprovante de residência e declaração de matrícula.",
    );
  });

  it("identifica o documento pelo nome do arquivo; senão usa o primeiro pendente", () => {
    const { estado, id } = criar();
    const e = enviar(estado, id, "meu-cpf.jpg");
    expect(doc(e, "cpf").status).toBe("aprovado");
    expect(doc(e, "rg_cnh").tentativas).toBe(0);
    const e2 = enviar(e, id, "foto123.jpg"); // sem dica: primeiro pendente = RG
    expect(doc(e2, "rg_cnh").tentativas).toBe(1);
  });

  it("1º comprovante é recusado por ser antigo, com o mês", () => {
    const { estado, id } = criar();
    const e = enviar(estado, id, "comprovante.pdf");
    expect(doc(e, "comprovante_residencia").status).toBe("pendente");
    expect(ultima_do_agente(e).texto).toContain("comprovante é de março");
    expect(ultima_do_agente(e).texto).toContain("90 dias");
  });

  it("3ª falha no mesmo documento abre escalação tres_falhas e põe a admissão em escalada", () => {
    const { estado, id } = criar();
    let e = enviar(estado, id, "rg-borrado.jpg");
    e = enviar(e, id, "rg-borrado.jpg");
    expect(e.escalacoes).toHaveLength(0);
    expect(e.admissoes[0].status).toBe("em_coleta");
    e = enviar(e, id, "rg-borrado.jpg");
    expect(e.escalacoes).toHaveLength(1);
    expect(e.escalacoes[0]).toMatchObject({
      motivo: "tres_falhas",
      status: "aberta",
      admissao_id: id,
      documento_admissao_id: doc(e, "rg_cnh").id,
    });
    expect(e.admissoes[0].status).toBe("escalada");
    expect(ultima_do_agente(e).texto).toContain("RH");
  });

  it("não duplica escalação aberta do mesmo documento", () => {
    const { estado, id } = criar();
    let e = estado;
    for (let i = 0; i < 4; i++) e = enviar(e, id, "rg-borrado.jpg");
    expect(e.escalacoes).toHaveLength(1);
  });

  it("admissão escalada continua recebendo documentos", () => {
    const { estado, id } = criar();
    let e = estado;
    for (let i = 0; i < 3; i++) e = enviar(e, id, "rg-borrado.jpg");
    e = enviar(e, id, "cpf.jpg");
    expect(doc(e, "cpf").status).toBe("aprovado");
    expect(e.admissoes[0].status).toBe("escalada");
  });

  it("1ª inconsistência só pede para corrigir; a 2ª escala como inconsistencia", () => {
    const { estado, id } = criar();
    let e = enviar(estado, id, "rg-ok.jpg");
    e = enviar(e, id, "cpf-outro-nome.jpg");
    expect(doc(e, "cpf").status).toBe("pendente");
    expect(e.envios[1].motivo_codigo).toBe("inconsistencia");
    expect(e.escalacoes).toHaveLength(0);
    expect(e.admissoes[0].status).toBe("em_coleta");
    e = enviar(e, id, "cpf-outro-nome.jpg");
    expect(e.escalacoes).toHaveLength(1);
    expect(e.escalacoes[0].motivo).toBe("inconsistencia");
    expect(e.admissoes[0].status).toBe("escalada");
  });

  it("último documento aprovado conclui: id_externo, concluida_em, mensagem; escalações abertas resolvidas", () => {
    const { estado, id } = criar();
    let e = estado;
    for (let i = 0; i < 3; i++) e = enviar(e, id, "rg-borrado.jpg"); // escala
    e = enviar(e, id, "rg-ok.jpg");
    e = enviar(e, id, "cpf.jpg");
    e = enviar(e, id, "comprovante-ok.jpg");
    expect(e.admissoes[0].status).toBe("escalada");
    e = enviar(e, id, "declaracao.jpg");
    const a = e.admissoes[0];
    expect(a.status).toBe("concluida");
    expect(a.id_externo).toMatch(/^COL-\d{6}$/);
    expect(a.concluida_em).toBe(AGORA.toISOString());
    expect(ultima_do_agente(e).texto).toContain(a.id_externo!);
    expect(e.escalacoes[0]).toMatchObject({ status: "resolvida", resolucao: "admissão concluída" });
  });

  it("arquivo sem nada pendente: 'não falta nada', sem envio criado", () => {
    const { estado, id } = criar();
    let e = estado;
    for (const a of ["rg-ok.jpg", "cpf.jpg", "comprovante-ok.jpg", "declaracao.jpg"]) e = enviar(e, id, a);
    expect(e.admissoes[0].status).toBe("concluida");
    const envios = e.envios.length;
    e = enviar(e, id, "outra-coisa.jpg");
    expect(e.envios).toHaveLength(envios);
    expect(e.admissoes[0].status).toBe("concluida");
    expect(ultima_do_agente(e).texto).toContain("não falta nada");
    expect(e.mensagens.filter((m) => m.direcao === "entrada").pop()?.texto).toBe("outra-coisa.jpg");
  });

  it("arquivo sem dica no nome vai ao primeiro pendente, não ao personalizado", () => {
    const dados = input();
    dados.documentos = [
      { tipo_documento_id: "rg_cnh" },
      { tipo_documento_id: null, descricao_personalizada: "Carteira de vacinação" },
    ];
    let e = aplicar(estado_vazio(), { tipo: "admissao_criada", dados }, AGORA);
    e = enviar(e, e.admissoes[0].id, "foto.jpg");
    expect(e.documentos[0].tentativas).toBe(1);
    expect(e.documentos[1].tentativas).toBe(0);
    expect(e.documentos[1].status).toBe("pendente");
  });

  it("documento personalizado é aprovado ao receber um arquivo", () => {
    const dados = input();
    dados.documentos = [{ tipo_documento_id: null, descricao_personalizada: "Carteira de vacinação" }];
    let e = aplicar(estado_vazio(), { tipo: "admissao_criada", dados }, AGORA);
    e = enviar(e, e.admissoes[0].id, "vacina.jpg");
    expect(e.documentos[0].status).toBe("aprovado");
    expect(e.admissoes[0].status).toBe("concluida");
  });
});

describe("texto_recebido", () => {
  it.each(["Qual será o meu SALÁRIO?", "e os benefícios?", "posso ver o contrato antes?"])(
    "escala fora_do_escopo: %s",
    (t) => {
      const { estado, id } = criar();
      const e = texto(estado, id, t);
      expect(e.escalacoes).toHaveLength(1);
      expect(e.escalacoes[0]).toMatchObject({ motivo: "fora_do_escopo", status: "aberta", documento_admissao_id: null });
      expect(e.admissoes[0].status).toBe("escalada");
      expect(ultima_do_agente(e).texto).toContain("encaminhei");
      expect(e.mensagens.some((m) => m.direcao === "entrada" && m.texto === t && m.midia_url === null)).toBe(true);
    },
  );

  it("não abre segunda escalação fora_do_escopo enquanto houver uma aberta", () => {
    const { estado, id } = criar();
    const e = texto(texto(estado, id, "e o salário?"), id, "e o contrato?");
    expect(e.escalacoes).toHaveLength(1);
  });

  it("texto comum: responde com o que falta", () => {
    const { estado, id } = criar();
    const e = texto(estado, id, "oi, tudo bem?");
    expect(e.escalacoes).toHaveLength(0);
    expect(e.admissoes[0].status).toBe("em_coleta");
    expect(ultima_do_agente(e).texto).toContain("Faltam 4");
  });
});

describe("outros eventos", () => {
  it("reset devolve o estado sem mudança (o store trata)", () => {
    const { estado } = criar();
    expect(aplicar(estado, { tipo: "reset" }, AGORA)).toEqual(estado);
  });
});

const resolver = (
  e: Estado,
  acao: "aprovar_manualmente" | "pedir_de_novo" | "falar_com_colaborador",
  texto?: string,
) => aplicar(e, { tipo: "escalacao_resolvida", escalacao_id: e.escalacoes[0].id, acao, texto }, AGORA);

function escalado(): { estado: Estado; id: string } {
  const { estado, id } = criar();
  let e = estado;
  for (let i = 0; i < 3; i++) e = enviar(e, id, "rg-borrado.jpg");
  return { estado: e, id };
}

describe("escalacao_resolvida", () => {
  it("acao_sugerida por motivo", () => {
    const base = { id: "x", admissao_id: "a", documento_admissao_id: null, status: "aberta", resolucao: null, criada_em: "" } as const;
    expect(acao_sugerida({ ...base, motivo: "tres_falhas" })).toBe("Conferir a imagem e aprovar manualmente ou pedir de novo");
    expect(acao_sugerida({ ...base, motivo: "prazo_estourado" })).toBe("Falar com o colaborador ou adiar o início");
  });

  it("aprovar manualmente aprova o documento, resolve e volta a em_coleta", () => {
    const { estado } = escalado();
    const e = resolver(estado, "aprovar_manualmente");
    expect(doc(e, "rg_cnh")).toMatchObject({ status: "aprovado", motivo_recusa: null });
    expect(e.escalacoes[0]).toMatchObject({ status: "resolvida", resolucao: "aprovado manualmente" });
    expect(e.admissoes[0].status).toBe("em_coleta");
    expect(ultima_do_agente(e).texto).toContain("aprovado");
    expect(estado.escalacoes[0].status).toBe("aberta"); // pura
  });

  it("aprovar o último pendente conclui a admissão", () => {
    const { estado, id } = escalado();
    let e = estado;
    for (const a of ["cpf.jpg", "comprovante-ok.jpg", "declaracao.jpg"]) e = enviar(e, id, a);
    expect(e.admissoes[0].status).toBe("escalada");
    e = resolver(e, "aprovar_manualmente");
    expect(e.admissoes[0].status).toBe("concluida");
    expect(e.admissoes[0].id_externo).toMatch(/^COL-\d{6}$/);
    expect(e.escalacoes[0].resolucao).toBe("aprovado manualmente");
  });

  it("pedir de novo zera tentativas, volta a pendente e manda mensagem com a instrução", () => {
    const { estado } = escalado();
    const e = resolver(estado, "pedir_de_novo");
    expect(doc(e, "rg_cnh")).toMatchObject({ status: "pendente", tentativas: 0 });
    expect(e.escalacoes[0]).toMatchObject({ status: "resolvida", resolucao: "pediu reenvio" });
    expect(e.admissoes[0].status).toBe("em_coleta");
    expect(ultima_do_agente(e).texto).toContain("RG/CNH de novo");
    expect(ultima_do_agente(e).texto).toContain("Mande uma foto");
  });

  it("depois de pedir de novo, o reenvio não repete a recusa roteirizada do 1º envio", () => {
    const { estado, id } = criar();
    let e = estado;
    for (let i = 0; i < 3; i++) e = enviar(e, id, "comprovante-antigo.jpg");
    expect(e.escalacoes[0].motivo).toBe("tres_falhas");
    e = resolver(e, "pedir_de_novo");
    e = enviar(e, id, "comprovante.jpg");
    expect(doc(e, "comprovante_residencia").status).toBe("aprovado");
  });

  it("a recusa roteirizada só vale no 1º envio do documento; dica no nome continua mandando", () => {
    const { estado, id } = criar();
    let e = enviar(estado, id, "comprovante.jpg");
    expect(doc(e, "comprovante_residencia").status).toBe("pendente");
    e = enviar(e, id, "comprovante-antigo.jpg");
    expect(doc(e, "comprovante_residencia").status).toBe("pendente");
    e = enviar(e, id, "comprovante.jpg");
    expect(doc(e, "comprovante_residencia").status).toBe("aprovado");
  });

  it("falar com colaborador grava mensagem com autor rh", () => {
    const { estado } = escalado();
    const e = resolver(estado, "falar_com_colaborador", "Oi Ana, vou te ligar.");
    const m = e.mensagens[e.mensagens.length - 1];
    expect(m).toMatchObject({ direcao: "saida", autor: "rh", texto: "Oi Ana, vou te ligar." });
    expect(e.escalacoes[0]).toMatchObject({ status: "resolvida", resolucao: "RH falou com o colaborador" });
    expect(e.admissoes[0].status).toBe("em_coleta");
  });
});

const ate = (h: number) => new Date(AGORA.getTime() + h * 3_600_000);
const avancar = (e: Estado, d: Date) => aplicar(e, { tipo: "tempo_avancado", ate: d.toISOString() }, AGORA);
const nivel = (e: Estado) => e.lembretes.map((l) => l.nivel);

describe("tempo_avancado (cobrança)", () => {
  it("+25 h sem resposta gera um leve com o que falta; repetir não duplica", () => {
    const { estado } = criar();
    const d = ate(25);
    const e = avancar(estado, d);
    expect(nivel(e)).toEqual(["leve"]);
    expect(e.lembretes[0]).toMatchObject({ enviado_em: d.toISOString(), agendado_para: d.toISOString() });
    expect(ultima_do_agente(e).texto).toContain("Faltam 4");
    expect(avancar(e, d)).toEqual(e);
    expect(nivel(avancar(e, ate(26)))).toEqual(["leve"]);
  });

  it("2 dias antes do início gera firme e liga o alerta de prazo", () => {
    const { estado, id } = criar();
    expect(alerta_prazo(id, estado)).toBe(false);
    const e = avancar(estado, new Date(2026, 10, 18, 9, 0, 0));
    expect(nivel(e)).toContain("firme");
    expect(alerta_prazo(id, e)).toBe(true);
    expect(e.escalacoes).toHaveLength(0);
  });

  it("salto grande gera só o firme (uma mensagem); rodar de novo não duplica nem manda os níveis pulados", () => {
    const { estado } = criar();
    const d = new Date(2026, 10, 18, 9, 0, 0);
    const e = avancar(estado, d);
    expect(nivel(e)).toEqual(["firme"]);
    expect(e.mensagens.filter((m) => m.direcao === "saida")).toHaveLength(2); // boas-vindas + firme
    expect(avancar(e, d)).toEqual(e);
    expect(nivel(avancar(e, new Date(2026, 10, 19, 9, 0, 0)))).toEqual(["firme"]);
  });

  it("+24h → metade do prazo → 2 dias antes gera leve, prazo e firme nessa ordem", () => {
    const { estado } = criar();
    let e = avancar(estado, ate(24));
    const meio = (AGORA.getTime() + new Date(2026, 10, 20).getTime()) / 2 + 60_000;
    e = avancar(e, new Date(meio));
    e = avancar(e, new Date(2026, 10, 18, 9, 0, 0));
    expect(nivel(e)).toEqual(["leve", "prazo", "firme"]);
  });

  it("passar de data_inicio abre prazo_estourado, uma só vez", () => {
    const { estado } = criar();
    let e = avancar(estado, new Date(2026, 10, 21, 9, 0, 0));
    expect(e.escalacoes).toHaveLength(1);
    expect(e.escalacoes[0]).toMatchObject({ motivo: "prazo_estourado", status: "aberta" });
    expect(e.admissoes[0].status).toBe("escalada");
    e = avancar(e, new Date(2026, 10, 22, 9, 0, 0));
    expect(e.escalacoes).toHaveLength(1);
  });

  it("admissão concluída não recebe lembrete nem escalação", () => {
    const { estado, id } = criar();
    let e = estado;
    for (const a of ["rg-ok.jpg", "cpf.jpg", "comprovante-ok.jpg", "declaracao.jpg"]) e = enviar(e, id, a);
    const antes = e;
    e = avancar(e, new Date(2026, 10, 25, 9, 0, 0));
    expect(e.lembretes).toHaveLength(0);
    expect(e.escalacoes).toHaveLength(0);
    expect(e).toEqual(antes);
  });
});
