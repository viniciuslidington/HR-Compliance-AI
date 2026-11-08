"use client";

import type { AdmissaoResumo, PresetTempo } from "../api/api";
import { useAcao, useConsulta } from "../api/contexto";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { useSelecaoTravada } from "../ui/useSelecaoTravada";
import { data_local, formatar_data } from "../domain/datas";
import estilos from "./BarraDemo.module.css";

const PRESETS: { preset: PresetTempo; rotulo: string }[] = [
  { preset: "mais_24h", rotulo: "+24 h" },
  { preset: "metade_prazo", rotulo: "Metade do prazo" },
  { preset: "dois_dias_antes", rotulo: "2 dias antes" },
  { preset: "prazo_estourado", rotulo: "Prazo estourado" },
];

function hora(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Padrão da barra: a mais recente em coleta ou escalada; senão, a primeira da lista. */
function padrao_da_barra(admissoes: AdmissaoResumo[]): string | null {
  const candidatas = admissoes.filter((r) => r.admissao.status === "em_coleta" || r.admissao.status === "escalada");
  const recente = [...candidatas].sort((a, b) => b.admissao.criada_em.localeCompare(a.admissao.criada_em))[0];
  return recente?.admissao.id ?? admissoes[0]?.admissao.id ?? null;
}

export function BarraDemo() {
  const executar = useAcao();
  const dados = useConsulta((api) => ({ admissoes: api.listar_admissoes(), agora: api.agora(), epoca: api.epoca() }));
  const { id, escolher } = useSelecaoTravada({
    admissoes: dados?.admissoes ?? null,
    epoca: dados?.epoca ?? null,
    resolver_padrao: padrao_da_barra,
  });
  const selecionada = id ?? "";
  const alvos = useConsulta(
    (api) => new Map(PRESETS.map((p) => [p.preset, selecionada ? api.alvo_preset(p.preset, selecionada) : null])),
    [selecionada],
  );

  if (!dados) return <footer className={estilos.barra} aria-label="Modo demo" />;

  const { admissoes, agora } = dados;

  function reiniciar() {
    // A troca de época (resetar) já descarta a escolha manual, aqui e nas outras janelas.
    if (window.confirm("Reiniciar os dados da demonstração? Tudo o que foi criado será apagado.")) {
      executar((api) => api.resetar());
    }
  }

  return (
    <footer className={estilos.barra} aria-label="Modo demo">
      <span className={`text-label ${estilos.rotulo}`}>Modo demo</span>
      <label className={`text-nav ${estilos.campo}`}>
        <span className={estilos.legenda}>Admissão</span>
        <Select
          className={estilos.select}
          value={selecionada}
          onChange={(e) => escolher(e.target.value)}
          disabled={admissoes.length === 0}
        >
          {admissoes.map((r) => (
            <option key={r.admissao.id} value={r.admissao.id}>
              {r.admissao.nome}
            </option>
          ))}
        </Select>
      </label>
      <div className={estilos.acoes}>
        {PRESETS.map((p) => {
          const passou = !!selecionada && !alvos?.get(p.preset);
          return (
            <Button
              key={p.preset}
              variante="secundario"
              tamanho="sm"
              disabled={!selecionada || passou}
              title={passou ? "Já passou" : undefined}
              onClick={() => executar((api) => api.avancar_tempo(p.preset, selecionada))}
            >
              {p.rotulo}
            </Button>
          );
        })}
        <Button variante="discreto" tamanho="sm" onClick={reiniciar}>
          Reiniciar dados
        </Button>
      </div>
      <p className={`text-nav ${estilos.relogio}`} aria-live="off">
        Agora na demo: {formatar_data(data_local(agora))}, {hora(agora)}
      </p>
    </footer>
  );
}
