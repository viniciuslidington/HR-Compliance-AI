"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { AdmissaoResumo } from "../api/api";
import { useAcao, useConsulta } from "../api/contexto";
import { Conversa } from "../ui/Conversa";
import { useSelecaoTravada } from "../ui/useSelecaoTravada";
import { Anexar } from "./Anexar";
import { Digitando } from "./Digitando";
import { SeletorContato } from "./SeletorContato";
import estilos from "./Telefone.module.css";

/** Tempo que a resposta do agente fica escondida atrás do "digitando…" (só na UI). */
const ATRASO_DIGITANDO_MS = 1200;

export interface TelefoneProps {
  admissao_inicial?: string;
  ao_trocar_contato?: (id: string) => void;
  /** "Reiniciar dados" (em qualquer janela): a página tira o `?admissao=` da URL. */
  ao_resetar?: () => void;
}

/** Padrão do celular: a em_coleta mais recente; senão, a mais recente. */
function padrao_do_celular(admissoes: AdmissaoResumo[]): string | null {
  const recentes = [...admissoes].sort((a, b) => b.admissao.criada_em.localeCompare(a.admissao.criada_em));
  return (recentes.find((r) => r.admissao.status === "em_coleta") ?? recentes[0])?.admissao.id ?? null;
}

interface Retencao {
  admissao_id: string;
  desde: string;
}

interface EnvioPendente {
  admissao_id: string;
  nome: string;
  url: string | null;
}

export function Telefone({ admissao_inicial, ao_trocar_contato, ao_resetar }: TelefoneProps) {
  const executar = useAcao();
  const admissoes = useConsulta((api) => api.listar_admissoes());
  const epoca = useConsulta((api) => api.epoca());
  const [texto, setTexto] = useState("");
  const [retencao, setRetencao] = useState<Retencao | null>(null);
  const [pendente, setPendente] = useState<EnvioPendente | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { id, escolher } = useSelecaoTravada({
    admissoes,
    epoca,
    resolver_padrao: padrao_do_celular,
    inicial: admissao_inicial,
    ao_resetar,
  });

  const detalhe = useConsulta((api) => (id ? api.obter_admissao(id) : null), [id]);

  const area = useRef<HTMLDivElement>(null);
  const no_fim = useRef(true);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const enviando_aqui = pendente !== null && pendente.admissao_id === id ? pendente : null;
  const retendo = retencao !== null && retencao.admissao_id === id ? retencao : null;
  const mensagens = (detalhe?.mensagens ?? []).filter(
    (m) => !(retendo && m.direcao === "saida" && m.criada_em >= retendo.desde),
  );

  // Gruda no fim quando chega mensagem nova, se a pessoa já estava no fim.
  useLayoutEffect(() => {
    const el = area.current;
    if (el && no_fim.current) el.scrollTop = el.scrollHeight;
  }, [id, mensagens.length, retendo, enviando_aqui]);

  function ao_rolar() {
    const el = area.current;
    if (el) no_fim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  }

  function trocar(novo: string) {
    if (timer.current) clearTimeout(timer.current);
    setRetencao(null);
    no_fim.current = true;
    escolher(novo);
    ao_trocar_contato?.(novo);
  }

  function segurar_resposta(admissao_id: string) {
    if (timer.current) clearTimeout(timer.current);
    setRetencao({ admissao_id, desde: executar((api) => api.agora()).toISOString() });
  }

  function soltar_resposta() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRetencao(null), ATRASO_DIGITANDO_MS);
  }

  function enviar_texto(e: FormEvent) {
    e.preventDefault();
    const limpo = texto.trim();
    if (!id || !limpo) return;
    segurar_resposta(id);
    executar((api) => api.enviar_texto(id, limpo));
    soltar_resposta();
    setTexto("");
    no_fim.current = true;
  }

  async function enviar_arquivo(arquivo: File, url: string | null) {
    if (!id) return;
    segurar_resposta(id);
    // Bolha otimista: a entrada real só existe depois de reduzir e salvar a imagem.
    setPendente({ admissao_id: id, nome: arquivo.name, url });
    no_fim.current = true;
    try {
      await executar((api) => api.enviar_arquivo(id, arquivo));
    } catch (erro) {
      if (timer.current) clearTimeout(timer.current);
      setRetencao(null);
      throw erro;
    } finally {
      setPendente(null);
    }
    soltar_resposta();
  }

  return (
    <div className={estilos.raiz}>
      {admissoes && admissoes.length > 0 && id && (
        <SeletorContato admissoes={admissoes} valor={id} ao_trocar={trocar} />
      )}
      <section className={estilos.moldura} aria-label="Celular da colaboradora">
        <header className={estilos.cabecalho}>
          <span className={`text-label ${estilos.avatar}`} aria-hidden="true">
            A
          </span>
          <div>
            <h2 className={`text-label ${estilos.nome}`}>Agente de Admissão</h2>
            <p className={`text-caption ${estilos.sub}`}>RH · responde na hora</p>
          </div>
        </header>

        {admissoes && admissoes.length === 0 ? (
          <p className={`text-body-sm ${estilos.vazio}`}>Nenhuma admissão. Crie uma no painel do RH.</p>
        ) : (
          <div ref={area} className={estilos.area} onScroll={ao_rolar}>
            {detalhe && (
              <Conversa
                key={id}
                variante="telefone"
                proprio="entrada"
                mensagens={mensagens}
                resolver_midia={(u) => executar((api) => api.resolver_midia(u))}
              />
            )}
            {enviando_aqui && (
              <div className={estilos.propria}>
                {enviando_aqui.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={estilos.miniatura} src={enviando_aqui.url} alt="Documento sendo enviado" />
                ) : (
                  <p className={`text-body-sm ${estilos.arquivo}`}>{enviando_aqui.nome}</p>
                )}
                <span className={`text-caption ${estilos.legenda}`}>Enviando…</span>
              </div>
            )}
            {retendo && !enviando_aqui && <Digitando />}
          </div>
        )}

        <form className={estilos.barra} onSubmit={enviar_texto}>
          <Anexar key={id ?? "nenhuma"} ao_enviar={enviar_arquivo}>
            <input
              className={`text-body-sm ${estilos.campo}`}
              aria-label="Mensagem"
              placeholder="Mensagem"
              autoComplete="off"
              value={texto}
              disabled={!id}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button type="submit" className={estilos.enviar} aria-label="Enviar" disabled={!texto.trim()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </Anexar>
        </form>
      </section>
    </div>
  );
}
