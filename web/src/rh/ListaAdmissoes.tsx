"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { StatusAdmissao } from "../domain/tipos";
import { formatar_data } from "../domain/datas";
import type { AdmissaoResumo } from "../api/api";
import { useConsulta } from "../api/contexto";
import { LinkBotao } from "../ui/LinkBotao";
import { StatusPill } from "../ui/StatusPill";
import { Table } from "../ui/Table";
import esqueleto from "./Esqueleto.module.css";
import estilos from "./ListaAdmissoes.module.css";

export interface ListaAdmissoesProps {
  ao_abrir: (id: string) => void;
}

const COLUNAS = [
  { chave: "colaborador", titulo: "Colaborador" },
  { chave: "modelo", titulo: "Modelo" },
  { chave: "inicio", titulo: "Início" },
  { chave: "pendentes", titulo: "Documentos" },
  { chave: "status", titulo: "Status" },
];

const RESUMO: { status: StatusAdmissao; rotulo: string }[] = [
  { status: "em_coleta", rotulo: "Em coleta" },
  { status: "escalada", rotulo: "Escalada" },
  { status: "concluida", rotulo: "Concluída" },
  { status: "criada", rotulo: "Criada" },
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

function Cabecalho({ linha }: { linha?: string }) {
  return (
    <header className={estilos.cabecalho}>
      <div>
        <h1 className={`text-display-h2 ${estilos.titulo}`}>Admissões</h1>
        {linha && <p className={`text-body-sm ${estilos.linha}`}>{linha}</p>}
      </div>
      <LinkBotao href="/rh/admissoes/nova">Nova admissão</LinkBotao>
    </header>
  );
}

function celula(r: AdmissaoResumo, chave: string) {
  switch (chave) {
    case "colaborador":
      return (
        <span className={estilos.colaborador}>
          <span className={`text-caption ${estilos.avatar}`} aria-hidden="true">
            {iniciais(r.admissao.nome)}
          </span>
          <span className={estilos.pessoa}>
            <span className="text-label">{r.admissao.nome}</span>
            <span className={`text-body-sm ${estilos.cargo}`}>{r.admissao.cargo}</span>
          </span>
        </span>
      );
    case "modelo":
      return r.modelo_nome;
    case "inicio":
      return (
        <span className={estilos.pessoa}>
          <span>{r.rotulo_inicio}</span>
          <span className={`text-body-sm ${estilos.cargo}`}>{formatar_data(r.admissao.data_inicio)}</span>
        </span>
      );
    case "pendentes": {
      const prontos = r.total - r.pendentes;
      return (
        <span className={estilos.docs}>
          <span className={estilos.trilho} aria-hidden="true">
            <span className={estilos.barra} style={{ "--p": r.total ? prontos / r.total : 0 } as CSSProperties} />
          </span>
          <span className="text-data">
            {prontos}/{r.total} recebidos
          </span>
        </span>
      );
    }
    default:
      return <StatusPill status={r.admissao.status} />;
  }
}

export function ListaAdmissoes({ ao_abrir }: ListaAdmissoesProps) {
  const dados = useConsulta((api) => ({
    linhas: api.listar_admissoes(),
    resumo: api.resumo_status(),
  }));

  if (!dados) {
    return (
      <div aria-busy="true">
        <Cabecalho />
        <div className={`${esqueleto.bloco} ${estilos.esqueleto_resumo}`} />
        <div className={`${esqueleto.bloco} ${estilos.esqueleto_tabela}`} />
      </div>
    );
  }

  const { linhas, resumo } = dados;
  const com_escalacao = linhas.filter((r) => r.escalacoes_abertas > 0).length;
  const em_risco = linhas.filter((r) => r.alerta_prazo).map((r) => r.admissao.nome);
  const visiveis = RESUMO.filter((s) => s.status !== "criada" || resumo.criada > 0);
  const total = visiveis.reduce((n, s) => n + resumo[s.status], 0);
  const linha_topo =
    linhas.length === 0
      ? undefined
      : `${linhas.length} ${linhas.length === 1 ? "admissão" : "admissões"}` +
        (com_escalacao > 0 ? ` · ${com_escalacao} ${com_escalacao === 1 ? "precisa" : "precisam"} do RH` : " · tudo com o agente");

  return (
    <div>
      <Cabecalho linha={linha_topo} />

      {/* Visão geral: contagens, distribuição e o que precisa do RH num bloco só. */}
      <section className={estilos.visao} aria-label="Visão geral">
        <dl role="group" className={estilos.resumo} aria-label="Resumo por status">
          {visiveis.map((s) => (
            <div key={s.status} className={estilos.numero} data-status={s.status}>
              <dt className="text-body-sm">{s.rotulo}</dt>
              <dd className={`text-stat ${estilos.valor}`}>{resumo[s.status]}</dd>
            </div>
          ))}
        </dl>
        {total > 0 && (
          <div className={estilos.distribuicao} aria-hidden="true">
            {visiveis.map((s) =>
              resumo[s.status] > 0 ? (
                <span key={s.status} data-status={s.status} style={{ flexGrow: resumo[s.status] }} />
              ) : null,
            )}
          </div>
        )}
        {(com_escalacao > 0 || em_risco.length > 0) && (
          <div className={estilos.atencao}>
            {com_escalacao > 0 && (
              <p className={`text-body-sm ${estilos.aviso} ${estilos.aviso_escalacao}`}>
                <span className={estilos.aviso_ponto} aria-hidden="true" />
                <span>
                  {com_escalacao === 1 ? "1 admissão precisa de você." : `${com_escalacao} admissões precisam de você.`}
                </span>
                <Link href="/rh/escalacoes" className={estilos.link}>
                  Ver escalações
                </Link>
              </p>
            )}
            {em_risco.length > 0 && (
              <p className={`text-body-sm ${estilos.aviso}`}>
                <span className={estilos.aviso_ponto_neutro} aria-hidden="true" />
                Prazo em risco: {em_risco.join(", ")}.
              </p>
            )}
          </div>
        )}
      </section>

      <Table
        colunas={COLUNAS}
        linhas={linhas}
        render={celula}
        chave_linha={(r) => r.admissao.id}
        ao_clicar={(r) => ao_abrir(r.admissao.id)}
        vazio={
          <div className={estilos.vazio}>
            <p className="text-lead">Nenhuma admissão por aqui ainda.</p>
            <p>Crie a primeira e o agente pede os documentos pelo WhatsApp.</p>
            <LinkBotao href="/rh/admissoes/nova">Nova admissão</LinkBotao>
          </div>
        }
      />
    </div>
  );
}
