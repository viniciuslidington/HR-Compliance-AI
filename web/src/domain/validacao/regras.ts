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

function data_valida(data: string | undefined): data is string {
  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const [a, m, d] = data.split("-").map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d));
  return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** YYYY-MM-DD + n meses (dia limitado ao fim do mês). */
function somar_meses(data: string, n: number): string {
  const [a, m, d] = data.split("-").map(Number);
  const total = m - 1 + n;
  const ano = a + Math.floor(total / 12);
  const mes = total % 12;
  const ultimo = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${ano}-${p(mes + 1)}-${p(Math.min(d, ultimo))}`;
}

function data_ilegivel(): Motivo {
  return recusa(
    "data_ilegivel",
    "não consegui ler a data do documento",
    "mande uma nova foto em que a data de emissão apareça bem visível",
  );
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
        if (!data_valida(d.data_emissao)) {
          motivos.push(data_ilegivel());
        } else if (dias_entre(d.data_emissao, hoje) >= JANELA_DIAS) {
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
        if (!data_valida(d.data)) {
          motivos.push(data_ilegivel());
        } else if (dias_entre(d.data, hoje) >= JANELA_DIAS) {
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
      case "aso_apto": {
        const resultado = normalizar(d.resultado ?? "");
        if (!/\bapto\b/.test(resultado) || /\binapto\b/.test(resultado)) {
          motivos.push(
            recusa(
              "aso_nao_apto",
              d.resultado ? "o ASO não traz o resultado \"apto\"" : "não consegui ler o resultado do ASO",
              "mande o ASO com o resultado \"apto\" bem visível; se o resultado for outro, fale com o RH",
            ),
          );
        }
        break;
      }
      default: {
        const validade = /^valido_(\d+)_meses$/.exec(regra);
        const carga = /^carga_minima_(\d+)h$/.exec(regra);
        if (validade) {
          if (!data_valida(d.data_realizacao)) {
            motivos.push(
              recusa(
                "data_ilegivel",
                "não consegui ler a data de realização",
                "mande uma nova foto em que a data do curso ou do exame apareça bem visível",
              ),
            );
          } else {
            const vence = somar_meses(d.data_realizacao, Number(validade[1]));
            if (dias_entre(hoje, vence) <= 0) {
              motivos.push(
                recusa(
                  "certificado_vencido",
                  `${tipo.nome} venceu em ${formatar_data(vence)}`,
                  "mande o documento da reciclagem ou do exame mais recente",
                ),
              );
            }
          }
        } else if (carga) {
          const minimo = Number(carga[1]);
          const horas = Number(/\d+/.exec(d.carga_horaria ?? "")?.[0] ?? NaN);
          if (Number.isNaN(horas)) {
            motivos.push(
              recusa(
                "carga_ilegivel",
                "não consegui ler a carga horária do certificado",
                "mande uma nova foto em que a carga horária apareça bem visível",
              ),
            );
          } else if (horas < minimo) {
            motivos.push(
              recusa(
                "carga_insuficiente",
                `o curso tem ${horas}h e o ${tipo.nome.charAt(0).toLowerCase() + tipo.nome.slice(1)} exige pelo menos ${minimo}h`,
                `mande o certificado de um curso com ${minimo}h ou mais`,
              ),
            );
          }
        }
        // legivel, frente_e_verso (camada 1), nome_igual_rg (camada 3)
      }
    }
  }
  return motivos;
}
