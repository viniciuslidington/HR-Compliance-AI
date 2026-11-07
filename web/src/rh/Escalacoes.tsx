"use client";

import { useState } from "react";
import Link from "next/link";
import type { AcaoEscalacao, EscalacaoView } from "../api/api";
import type { Mensagem } from "../domain/tipos";
import { useAcao, useConsulta } from "../api/contexto";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Conversa } from "../ui/Conversa";
import { Eyebrow } from "../ui/Eyebrow";
import { Field } from "../ui/Field";
import { ImagemEnvio } from "../ui/ImagemEnvio";
import esqueleto from "./Esqueleto.module.css";
import estilos from "./Escalacoes.module.css";
import { data_hora, MOTIVO_ESCALACAO } from "./rotulos";

interface Caso {
  view: EscalacaoView;
  ultimas: Mensagem[];
  ultima_imagem: string | null;
}

type Aba = "abertas" | "resolvidas";

function CartaoEscalacao({
  caso,
  resolver_midia,
}: {
  caso: Caso;
  resolver_midia: (u: string | null) => string | null;
}) {
  const executar = useAcao();
  const [falando, setFalando] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const { view } = caso;
  const { escalacao, admissao, tipo, documento } = view;
  const aberta = escalacao.status === "aberta";
  const permitidas = view.acoes_permitidas;
  const nome_doc = tipo?.nome ?? documento?.descricao_personalizada ?? null;

  function resolver(acao: AcaoEscalacao, t?: string) {
    executar((api) => api.resolver_escalacao(escalacao.id, acao, t));
  }

  function enviar() {
    if (texto.trim() === "") {
      setErro("Escreva a mensagem para o colaborador.");
      return;
    }
    setErro(undefined);
    resolver("falar_com_colaborador", texto.trim());
  }

  return (
    <Card
      titulo={admissao.nome}
      eyebrow={MOTIVO_ESCALACAO[escalacao.motivo]}
      acoes={
        <Link href={`/rh/admissoes/${admissao.id}`} className={estilos.link}>
          Ver admissão
        </Link>
      }
    >
      <div className={estilos.corpo}>
        <dl className={estilos.fatos}>
          {nome_doc && (
            <div>
              <dt className={`text-caption ${estilos.chave}`}>Documento</dt>
              <dd className="text-body-sm">
                {nome_doc}
                {documento && documento.tentativas > 0 ? ` · ${documento.tentativas} tentativas` : ""}
              </dd>
            </div>
          )}
          <div>
            <dt className={`text-caption ${estilos.chave}`}>Aberta em</dt>
            <dd className="text-body-sm">{data_hora(escalacao.criada_em)}</dd>
          </div>
          {aberta && (
            <div className={estilos.sugestao}>
              <dt className={`text-caption ${estilos.chave}`}>Ação sugerida</dt>
              <dd className="text-body-sm">{view.acao_sugerida}</dd>
            </div>
          )}
        </dl>

        {caso.ultima_imagem && (
          <div className={estilos.imagem}>
            <p className={`text-caption ${estilos.chave}`}>Último envio</p>
            <ImagemEnvio src={resolver_midia(caso.ultima_imagem)} alt={`Último envio de ${admissao.nome}`} />
          </div>
        )}

        {caso.ultimas.length > 0 && (
          <div className={estilos.conversa}>
            <p className={`text-caption ${estilos.chave}`}>Últimas mensagens</p>
            <Conversa mensagens={caso.ultimas} resolver_midia={resolver_midia} variante="painel" />
          </div>
        )}
      </div>

      {aberta ? (
        <div className={estilos.acoes}>
          {permitidas.includes("aprovar_manualmente") && (
            <Button onClick={() => resolver("aprovar_manualmente")}>Aprovar manualmente</Button>
          )}
          {permitidas.includes("pedir_de_novo") && (
            <Button variante="secundario" onClick={() => resolver("pedir_de_novo")}>Pedir de novo</Button>
          )}
          {permitidas.includes("falar_com_colaborador") && !falando && (
            <Button variante="secundario" onClick={() => setFalando(true)}>Falar com o colaborador</Button>
          )}
          {falando && (
            <div className={estilos.falar}>
              <Field rotulo={`Mensagem para ${admissao.nome}`} erro={erro}>
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)} />
              </Field>
              <div className={estilos.falar_botoes}>
                <Button onClick={enviar}>Enviar mensagem</Button>
                <Button variante="discreto" onClick={() => { setFalando(false); setErro(undefined); }}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className={`text-body-sm ${estilos.resolucao}`}>
          <span className={estilos.chave}>Resolução: </span>
          {escalacao.resolucao ?? "Resolvida"}
        </p>
      )}
    </Card>
  );
}

export function Escalacoes() {
  const [aba, setAba] = useState<Aba>("abertas");
  const dados = useConsulta((api) => {
    const montar = (v: EscalacaoView): Caso => {
      const det = api.obter_admissao(v.admissao.id);
      const envios = det?.documentos.find((d) => d.documento.id === v.documento?.id)?.envios ?? [];
      return {
        view: v,
        ultimas: det ? det.mensagens.slice(-3) : [],
        ultima_imagem: envios.length ? envios[envios.length - 1].arquivo_url : null,
      };
    };
    return {
      abertas: api.listar_escalacoes({ status: "aberta" }).map(montar),
      resolvidas: api.listar_escalacoes({ status: "resolvida" }).map(montar),
      resolver_midia: (u: string | null) => api.resolver_midia(u),
    };
  });

  const cabecalho = (
    <header className={estilos.cabecalho}>
      <Eyebrow>Painel do RH</Eyebrow>
      <h1 className={`text-display-h2 ${estilos.titulo}`}>Escalações</h1>
    </header>
  );

  if (!dados) {
    return (
      <div aria-busy="true">
        {cabecalho}
        <div className={`${esqueleto.bloco} ${estilos.esqueleto}`} />
      </div>
    );
  }

  const casos = aba === "abertas" ? dados.abertas : dados.resolvidas;

  return (
    <div>
      {cabecalho}
      <div role="tablist" aria-label="Filtro de escalações" className={estilos.abas}>
        <button
          type="button"
          role="tab"
          id="aba-abertas"
          aria-selected={aba === "abertas"}
          aria-controls="painel-escalacoes"
          className={`text-label ${estilos.aba}`}
          onClick={() => setAba("abertas")}
        >
          Abertas ({dados.abertas.length})
        </button>
        <button
          type="button"
          role="tab"
          id="aba-resolvidas"
          aria-selected={aba === "resolvidas"}
          aria-controls="painel-escalacoes"
          className={`text-label ${estilos.aba}`}
          onClick={() => setAba("resolvidas")}
        >
          Resolvidas
        </button>
      </div>

      <div id="painel-escalacoes" role="tabpanel" aria-labelledby={`aba-${aba}`} className={estilos.lista}>
        {casos.length === 0 ? (
          <p className={`text-lead ${estilos.vazio}`}>
            {aba === "abertas" ? "Nenhuma escalação aberta. O agente está dando conta." : "Nenhuma escalação resolvida ainda."}
          </p>
        ) : (
          casos.map((c) => (
            <CartaoEscalacao key={c.view.escalacao.id} caso={c} resolver_midia={dados.resolver_midia} />
          ))
        )}
      </div>
    </div>
  );
}
