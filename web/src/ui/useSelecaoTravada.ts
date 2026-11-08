"use client";

import { useEffect, useRef, useState } from "react";
import type { AdmissaoResumo } from "../api/api";

// Seleção de admissão das telas da demo (celular e BarraDemo). O padrão é resolvido UMA vez e fica travado:
// mudar o status da admissão padrão (concluir, escalar) não faz a tela pular para outra pessoa. Ele só segue
// sozinho quando aparece uma admissão criada depois de tudo o que já se viu (a apresentadora acabou de criar
// uma no /rh). A escolha manual ganha enquanto existir. Quando a época da Api muda ("Reiniciar dados", em
// qualquer janela), escolha, inicial e padrão são descartados.

interface Trava {
  epoca: number | null;
  padrao: string | null;
  /** `criada_em` mais recente já visto quando o padrão foi travado/seguido. */
  visto_ate: string;
  escolhida: string | null;
  /** `inicial` vigente no último reset: ignorado até a página trocar o valor. */
  inicial_descartada: string | undefined;
}

export interface OpcoesSelecao {
  admissoes: AdmissaoResumo[] | null;
  epoca: number | null;
  /** Como resolver o padrão na primeira vez (e depois de um reset). */
  resolver_padrao: (admissoes: AdmissaoResumo[]) => string | null;
  /** Vem de fora (ex.: `?admissao=`); ganha do padrão, perde da escolha manual. */
  inicial?: string;
  /** Chamado (num efeito) quando a época muda depois da primeira leitura. */
  ao_resetar?: () => void;
}

function mais_nova(admissoes: AdmissaoResumo[]): AdmissaoResumo | null {
  let m: AdmissaoResumo | null = null;
  for (const r of admissoes) if (!m || r.admissao.criada_em > m.admissao.criada_em) m = r;
  return m;
}

export function useSelecaoTravada({ admissoes, epoca, resolver_padrao, inicial, ao_resetar }: OpcoesSelecao) {
  const [trava, setTrava] = useState<Trava>({
    epoca: null,
    padrao: null,
    visto_ate: "",
    escolhida: null,
    inicial_descartada: undefined,
  });

  const existe = (id: string | null | undefined): id is string =>
    !!id && !!admissoes?.some((r) => r.admissao.id === id);

  // Estado derivado do que a Api mostra agora: atualizado durante o render (padrão do React para
  // "ajustar estado quando uma entrada muda"), sempre atrás de uma comparação para não entrar em laço.
  let t = trava;
  if (admissoes && epoca !== null) {
    let p = t;
    if (p.epoca !== null && p.epoca !== epoca)
      p = { epoca, padrao: null, visto_ate: "", escolhida: null, inicial_descartada: inicial };
    else if (p.epoca === null) p = { ...p, epoca };
    const nova = mais_nova(admissoes);
    const visto = nova?.admissao.criada_em ?? "";
    if (!existe(p.padrao)) {
      const padrao = resolver_padrao(admissoes);
      if (padrao !== p.padrao || visto !== p.visto_ate) p = { ...p, padrao, visto_ate: visto };
    } else if (nova && visto > p.visto_ate) {
      p = { ...p, padrao: nova.admissao.id, visto_ate: visto };
    }
    if (p !== t) {
      setTrava(p);
      t = p;
    }
  }

  const ultima_epoca = useRef<number | null>(null);
  useEffect(() => {
    if (epoca === null) return;
    if (ultima_epoca.current !== null && ultima_epoca.current !== epoca) ao_resetar?.();
    ultima_epoca.current = epoca;
  }, [epoca, ao_resetar]);

  const inicial_valida = inicial !== t.inicial_descartada && existe(inicial) ? inicial : null;
  const id = (existe(t.escolhida) ? t.escolhida : null) ?? inicial_valida ?? (existe(t.padrao) ? t.padrao : null);

  return {
    id,
    escolher: (novo: string | null) => setTrava((x) => ({ ...x, escolhida: novo })),
  };
}
