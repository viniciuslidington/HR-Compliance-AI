// Port de worker/ia/documentos.py (_digitos, cpf_valido, _normalizar). TypeScript puro.

export function digitos(t: string | null): string {
  return (t ?? "").replace(/\D/g, "");
}

export function cpf_valido(cpf: string | null): boolean {
  const d = digitos(cpf);
  if (d.length !== 11 || d === d[0].repeat(11)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const digito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (Number(d[tamanho]) !== digito) return false;
  }
  return true;
}

export function normalizar(t: string): string {
  const sem_acento = t.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  return sem_acento.toLowerCase().split(/\s+/).filter(Boolean).join(" ");
}
