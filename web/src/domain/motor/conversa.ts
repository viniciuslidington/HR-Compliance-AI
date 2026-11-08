// Todas as frases do agente. Tom de WhatsApp: caloroso, curto e específico.
// O agente nunca fala de salário, benefícios ou contrato: encaminha ao RH.
import { formatar_data } from "../datas";

export interface ItemChecklist {
  nome: string;
  instrucao: string | null;
}

const ROTULOS: Record<string, { curto: string; feminino: boolean; plural?: boolean }> = {
  rg_cnh: { curto: "RG/CNH", feminino: false },
  cpf: { curto: "CPF", feminino: false },
  comprovante_residencia: { curto: "comprovante de residência", feminino: false },
  dados_bancarios: { curto: "dados bancários", feminino: false, plural: true },
  declaracao_matricula: { curto: "declaração de matrícula", feminino: true },
  aso: { curto: "ASO", feminino: false },
  nr10: { curto: "certificado NR-10", feminino: false },
  nr35: { curto: "certificado NR-35", feminino: false },
};

export function rotulo_curto(tipo_documento_id: string | null, personalizado?: string | null): string {
  return (tipo_documento_id && ROTULOS[tipo_documento_id]?.curto) || personalizado || "documento";
}

function maiuscula(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function lista_natural(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function primeiro_nome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

function dia_mes(data: string): string {
  return formatar_data(data).slice(0, 5);
}

export function boas_vindas(nome: string, data_inicio: string, itens: ItemChecklist[]): string {
  const lista = itens
    .map((i, n) => `${n + 1}. ${i.nome}${i.instrucao ? `: ${i.instrucao}` : ""}`)
    .join("\n");
  const qtd = itens.length;
  return (
    `Oi, ${primeiro_nome(nome)}! Aqui é o agente de admissão. Vou te ajudar a reunir ` +
    `${qtd === 1 ? "o documento" : `os ${qtd} documentos`} para o seu início.\n\n${lista}\n\n` +
    `Preciso de tudo até ${dia_mes(data_inicio)}. Pode mandar a foto de cada um por aqui, ` +
    `na ordem que preferir.`
  );
}

export function faltam(rotulos: string[]): string {
  return `${rotulos.length === 1 ? "Falta" : "Faltam"} ${rotulos.length}: ${lista_natural(rotulos)}.`;
}

export function aprovado(
  tipo_documento_id: string | null,
  personalizado: string | null,
  rotulos_faltantes: string[],
): string {
  const rotulo = tipo_documento_id ? ROTULOS[tipo_documento_id] : undefined;
  const nome = maiuscula(rotulo_curto(tipo_documento_id, personalizado));
  const sufixo = rotulo?.plural ? "s" : "";
  return `${nome} ${rotulo?.feminino ? "aprovada" : "aprovado"}${sufixo}. ${faltam(rotulos_faltantes)}`;
}

export function ja_aprovado(
  tipo_documento_id: string | null,
  personalizado: string | null,
  rotulos_faltantes: string[],
): string {
  const feminino = tipo_documento_id ? ROTULOS[tipo_documento_id]?.feminino : false;
  const nome = rotulo_curto(tipo_documento_id, personalizado);
  return `Esse é ${feminino ? "a" : "o"} ${nome}, que já está ${feminino ? "aprovada" : "aprovado"}. ${faltam(rotulos_faltantes)}`;
}

export function leitura_indisponivel(): string {
  return "Recebi seu arquivo, mas não consegui ler o documento agora. Pode mandar de novo daqui a pouquinho?";
}

export function recusado(motivo_texto: string, o_que_fazer: string): string {
  return `${maiuscula(motivo_texto)}. ${maiuscula(o_que_fazer)}, por favor.`;
}

export function aviso_escalacao_documento(): string {
  return "Vou pedir para o pessoal do RH dar uma olhada nisso com você. Eles te chamam em breve, e você pode continuar mandando o que faltar por aqui.";
}

export function conclusao(nome: string, id_externo: string, data_inicio: string): string {
  return (
    `Pronto, ${primeiro_nome(nome)}! Todos os documentos foram aprovados e o seu cadastro foi concluído ` +
    `(código ${id_externo}). Nos vemos em ${dia_mes(data_inicio)}!`
  );
}

export function nada_pendente(): string {
  return "Já recebi e aprovei todos os seus documentos, então não falta nada por enquanto. Se precisar de algo, é só chamar.";
}

export function encaminhado_ao_rh(): string {
  return "Essa dúvida é com o pessoal do RH, então já encaminhei para eles. Eles te respondem por aqui. Enquanto isso, sigo com os documentos.";
}

export function status_pendentes(rotulos: string[]): string {
  if (rotulos.length === 0) return nada_pendente();
  return `${faltam(rotulos)} É só mandar a foto por aqui.`;
}

export function aprovado_pelo_rh(
  tipo_documento_id: string | null,
  personalizado: string | null,
  rotulos_faltantes: string[],
): string {
  const feminino = tipo_documento_id ? ROTULOS[tipo_documento_id]?.feminino : false;
  const nome = maiuscula(rotulo_curto(tipo_documento_id, personalizado));
  return `O RH conferiu e ${nome} foi ${feminino ? "aprovada" : "aprovado"}. ${faltam(rotulos_faltantes)}`;
}

export function pedir_de_novo(rotulo: string, instrucao: string | null): string {
  return `Preciso que você mande ${rotulo} de novo, por favor.${instrucao ? ` ${instrucao}` : ""}`;
}

export function lembrete_leve(rotulos: string[]): string {
  return `Oi! Passando para lembrar dos documentos. ${faltam(rotulos)} Quando puder, é só mandar a foto por aqui.`;
}

export function lembrete_prazo(data_inicio: string, rotulos: string[]): string {
  return `Já estamos na metade do prazo. Preciso de tudo até ${dia_mes(data_inicio)}. ${faltam(rotulos)}`;
}

export function lembrete_firme(data_inicio: string, rotulos: string[]): string {
  return `O prazo está acabando: seu início é em ${dia_mes(data_inicio)} e ainda ${rotulos.length === 1 ? "falta" : "faltam"} ${lista_natural(rotulos)}. Consegue mandar hoje?`;
}
