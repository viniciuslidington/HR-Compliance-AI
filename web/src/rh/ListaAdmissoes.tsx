"use client";

import Link from "next/link";
import type { StatusAdmissao } from "../domain/tipos";
import { formatar_data } from "../domain/datas";
import type { AdmissaoResumo } from "../api/api";
import { useConsulta } from "../api/contexto";
import { Eyebrow } from "../ui/Eyebrow";
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
  { chave: "pendentes", titulo: "Pendentes" },
  { chave: "status", titulo: "Status" },
];

const RESUMO: { status: StatusAdmissao; rotulo: string }[] = [
  { status: "em_coleta", rotulo: "Em coleta" },
  { status: "escalada", rotulo: "Escalada" },
  { status: "concluida", rotulo: "Concluída" },
  { status: "criada", rotulo: "Criada" },
];

function Cabecalho() {
  return (
    <header className={estilos.cabecalho}>
      <div>
        <Eyebrow>Painel do RH</Eyebrow>
        <h1 className={`text-display-h2 ${estilos.titulo}`}>Admissões</h1>
      </div>
      <LinkBotao href="/rh/admissoes/nova">Nova admissão</LinkBotao>
    </header>
  );
}

function celula(r: AdmissaoResumo, chave: string) {
  switch (chave) {
    case "colaborador":
      return (
        <span className={estilos.pessoa}>
          <span className="text-label">{r.admissao.nome}</span>
          <span className={`text-body-sm ${estilos.cargo}`}>{r.admissao.cargo}</span>
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
    case "pendentes":
      return `${r.pendentes} de ${r.total}`;
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

  return (
    <div>
      <Cabecalho />

      <dl className={estilos.resumo}>
        {RESUMO.filter((s) => s.status !== "criada" || resumo.criada > 0).map((s) => (
          <div key={s.status} className={estilos.numero}>
            <dd className={`text-stat ${estilos.valor}`}>{resumo[s.status]}</dd>
            <dt className="text-body-sm">{s.rotulo}</dt>
          </div>
        ))}
      </dl>

      {(com_escalacao > 0 || em_risco.length > 0) && (
        <div className={estilos.avisos}>
          {com_escalacao > 0 && (
            <p className={`text-body-sm ${estilos.aviso} ${estilos.aviso_escalacao}`}>
              <span>
                {com_escalacao === 1 ? "1 admissão precisa de você." : `${com_escalacao} admissões precisam de você.`}
              </span>
              <Link href="/rh/escalacoes" className={estilos.link}>
                Ver escalações
              </Link>
            </p>
          )}
          {em_risco.length > 0 && (
            <p className={`text-body-sm ${estilos.aviso}`}>Prazo em risco: {em_risco.join(", ")}.</p>
          )}
        </div>
      )}

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
