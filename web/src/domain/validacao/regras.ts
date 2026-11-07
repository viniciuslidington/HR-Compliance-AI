import { data_local, dias_entre, formatar_data } from "../datas";
import { cpf_valido, normalizar } from "../identificadores";
import type { Admissao, Motivo, TipoDocumento } from "../tipos";
import type { LeituraMock } from "./index";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const JANELA_DIAS = 90;

function mes_por_extenso(data: string): string {
  return MESES[Number(data.slice(5, 7)) - 1] ?? formatar_data(data);
}

function recusa(codigo: string, texto: string, o_que_fazer: string): Motivo {
  return { codigo, texto, o_que_fazer, gravidade: "recusa" };
}

/** Camada 2: uma verificação por regra do tipo. `legivel` e `frente_e_verso` ficam na camada 1. */
export function validar_regras(
  tipo: TipoDocumento,
  leitura: LeituraMock,
  admissao: Admissao,
  agora: Date,
): Motivo[] {
  const d = leitura.dados_extraidos;
  const hoje = data_local(agora);
  const motivos: Motivo[] = [];

  for (const regra of tipo.regras_validacao) {
    switch (regra) {
      case "cnh_dentro_validade":
        if (d.validade_cnh && dias_entre(d.validade_cnh, hoje) > 0) {
          motivos.push(
            recusa(
              "cnh_vencida",
              `a CNH venceu em ${formatar_data(d.validade_cnh)}`,
              "mande outro documento de identidade válido: seu RG ou uma CNH dentro da validade",
            ),
          );
        }
        break;
      case "cpf_digito_valido":
        if (!cpf_valido(d.numero ?? null)) {
          motivos.push(
            recusa(
              "cpf_invalido",
              "o número do CPF não parece válido (algum dígito está errado)",
              "confira o número e mande uma foto mais nítida do seu CPF",
            ),
          );
        }
        break;
      case "emitido_menos_90_dias":
        if (d.data_emissao && dias_entre(d.data_emissao, hoje) >= JANELA_DIAS) {
          motivos.push(
            recusa(
              "comprovante_antigo",
              `o comprovante é de ${mes_por_extenso(d.data_emissao)}`,
              "preciso de um emitido nos últimos 90 dias",
            ),
          );
        }
        break;
      case "data_recente":
        if (d.data && dias_entre(d.data, hoje) >= JANELA_DIAS) {
          motivos.push(
            recusa(
              "declaracao_antiga",
              `a declaração é de ${mes_por_extenso(d.data)}`,
              "preciso de uma declaração emitida nos últimos 90 dias",
            ),
          );
        }
        break;
      case "titular_igual_colaborador":
        if (normalizar(d.titular ?? "") !== normalizar(admissao.nome)) {
          motivos.push(
            recusa(
              "titular_divergente",
              "a conta está no nome de outra pessoa",
              "mande os dados de uma conta que esteja no seu nome",
            ),
          );
        }
        break;
      default:
        break; // legivel, frente_e_verso (camada 1), nome_igual_rg (camada 3)
    }
  }
  return motivos;
}
