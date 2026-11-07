// Datas do domínio. Nenhuma função chama new Date() sem argumento: `agora` é sempre passado.

const MS_DIA = 86_400_000;

function utc_de_data(data: string): number {
  const [a, m, d] = data.slice(0, 10).split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

/** Dias de calendário de `a` até `b` (datas YYYY-MM-DD). Positivo se `b` é depois. */
export function dias_entre(a: string, b: string): number {
  return Math.round((utc_de_data(b) - utc_de_data(a)) / MS_DIA);
}

export function somar_horas(iso: string, h: number): string {
  return new Date(new Date(iso).getTime() + h * 3_600_000).toISOString();
}

/** dd/mm/aaaa a partir de YYYY-MM-DD ou de um ISO completo (usa a parte da data). */
export function formatar_data(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function data_local(agora: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}

/** "hoje", "em 1 dia", "em 3 dias", "há 1 dia", "há 5 dias" (dias de calendário no fuso local). */
export function rotulo_relativo(data_inicio: string, agora: Date): string {
  const n = dias_entre(data_local(agora), data_inicio);
  if (n === 0) return "hoje";
  const abs = Math.abs(n);
  const unidade = abs === 1 ? "dia" : "dias";
  return n > 0 ? `em ${abs} ${unidade}` : `há ${abs} ${unidade}`;
}
