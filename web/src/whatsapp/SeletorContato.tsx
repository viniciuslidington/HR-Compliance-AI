import type { AdmissaoResumo } from "../api/api";
import type { StatusAdmissao } from "../domain/tipos";
import { Select } from "../ui/Select";
import estilos from "./SeletorContato.module.css";

const STATUS: Record<StatusAdmissao, string> = {
  criada: "criada",
  em_coleta: "em coleta",
  escalada: "escalada",
  concluida: "concluída",
};

export interface SeletorContatoProps {
  admissoes: AdmissaoResumo[];
  valor: string;
  ao_trocar: (id: string) => void;
}

/** Controle da demo (fica fora da moldura do celular): escolhe como quem a conversa acontece. */
export function SeletorContato({ admissoes, valor, ao_trocar }: SeletorContatoProps) {
  const ordenadas = [...admissoes].sort((a, b) => b.admissao.criada_em.localeCompare(a.admissao.criada_em));
  return (
    <label className={estilos.campo}>
      <span className="text-caption">Conversando como</span>
      <Select className={estilos.select} value={valor} onChange={(e) => ao_trocar(e.target.value)}>
        {ordenadas.map((r) => (
          <option key={r.admissao.id} value={r.admissao.id}>
            {r.admissao.nome} — {STATUS[r.admissao.status]}
          </option>
        ))}
      </Select>
    </label>
  );
}
