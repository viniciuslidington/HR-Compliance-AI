"use client";

import { useState } from "react";
import Link from "next/link";
import { formatar_data, rotulo_relativo } from "../domain/datas";
import type { NivelLembrete } from "../domain/tipos";
import { useConsulta } from "../api/contexto";
import { ChecklistDocumentos } from "../ui/ChecklistDocumentos";
import { Conversa } from "../ui/Conversa";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import { ImagemEnvio } from "../ui/ImagemEnvio";
import { LinkBotao } from "../ui/LinkBotao";
import { StatusPill } from "../ui/StatusPill";
import esqueleto from "./Esqueleto.module.css";
import estilos from "./DetalheAdmissao.module.css";
import { data_hora, MOTIVO_ESCALACAO, rotulo_campo } from "./rotulos";

const ROTULO_LEMBRETE: Record<NivelLembrete, string> = {
  leve: "Lembrete",
  prazo: "Aviso de prazo",
  firme: "Lembrete firme",
};

export function DetalheAdmissao({ id }: { id: string }) {
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const dados = useConsulta(
    (api) => ({
      detalhe: api.obter_admissao(id),
      resolver_midia: (u: string | null) => api.resolver_midia(u),
      agora: api.agora(),
    }),
    [id],
  );

  if (!dados) {
    return (
      <div aria-busy="true">
        <div className={`${esqueleto.bloco} ${estilos.esqueleto_cabecalho}`} />
        <div className={`${esqueleto.bloco} ${estilos.esqueleto_corpo}`} />
      </div>
    );
  }

  const { detalhe, resolver_midia, agora } = dados;
  if (!detalhe) {
    return (
      <div className={estilos.nao_encontrada}>
        <h1 className="text-display-h2">Admissão não encontrada</h1>
        <p>Esse link não leva a nenhuma admissão. Ela pode ter sido removida ao reiniciar os dados.</p>
        <LinkBotao href="/rh" variante="secundario">Voltar às admissões</LinkBotao>
      </div>
    );
  }

  const { admissao, documentos, mensagens, lembretes, escalacoes } = detalhe;
  const padrao = (documentos.find((d) => d.documento.status !== "aprovado") ?? documentos[0])?.documento.id ?? null;
  const selecionado_id = escolhido && documentos.some((d) => d.documento.id === escolhido) ? escolhido : padrao;
  const sel = documentos.find((d) => d.documento.id === selecionado_id) ?? null;
  const aberta = escalacoes.find((e) => e.status === "aberta");
  const enviados = lembretes.filter((l) => l.enviado_em).sort((a, b) => a.enviado_em!.localeCompare(b.enviado_em!));
  const extraidos = sel?.documento.dados_extraidos ? Object.entries(sel.documento.dados_extraidos) : [];
  const envios = sel ? [...sel.envios].sort((a, b) => b.criado_em.localeCompare(a.criado_em)) : [];
  const nome_sel = sel ? (sel.tipo?.nome ?? sel.documento.descricao_personalizada ?? "Documento") : "";

  return (
    <div>
      <p className={`text-body-sm ${estilos.voltar}`}>
        <Link href="/rh" className={estilos.link}>Admissões</Link>
      </p>
      <header className={estilos.cabecalho}>
        <div>
          <Eyebrow>Admissão</Eyebrow>
          <h1 className={`text-display-h2 ${estilos.titulo}`}>{admissao.nome}</h1>
          <p className={`text-body ${estilos.meta}`}>
            {admissao.cargo} · {detalhe.modelo_nome}
          </p>
          <p className={`text-body-sm ${estilos.meta}`}>
            Início {rotulo_relativo(admissao.data_inicio, agora)}, {formatar_data(admissao.data_inicio)} · WhatsApp {admissao.whatsapp}
          </p>
          {admissao.status === "concluida" && admissao.id_externo && (
            <p className={`text-body-sm ${estilos.meta}`}>Cadastrada no sistema de destino · {admissao.id_externo}</p>
          )}
        </div>
        <StatusPill status={admissao.status} />
      </header>

      {aberta && (
        <p className={`text-body-sm ${estilos.faixa}`}>
          <span>{MOTIVO_ESCALACAO[aberta.motivo] ?? "Precisa de você"}. O agente parou e espera uma decisão do RH.</span>
          <Link href="/rh/escalacoes" className={estilos.link_faixa}>Resolver escalação</Link>
        </p>
      )}

      <div className={estilos.colunas}>
        <div className={estilos.coluna}>
          <Card titulo="Documentos">
            <ChecklistDocumentos
              documentos={documentos}
              selecionado_id={selecionado_id}
              ao_selecionar={setEscolhido}
            />
          </Card>

          {sel && (
            <Card titulo={nome_sel} eyebrow="Documento selecionado">
              <div className={estilos.painel}>
                <section aria-label="Dados extraídos">
                  <h3 className="text-label">Dados extraídos</h3>
                  {extraidos.length > 0 ? (
                    <dl className={estilos.dados}>
                      {extraidos.map(([k, v]) => (
                        <div key={k} className={estilos.dado}>
                          <dt className={`text-caption ${estilos.chave}`}>{rotulo_campo(k)}</dt>
                          <dd className="text-body-sm">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className={`text-body-sm ${estilos.suave}`}>
                      {sel.documento.motivo_recusa ?? "Ainda não recebido"}
                    </p>
                  )}
                </section>

                <section aria-label="Envios">
                  <h3 className="text-label">Envios</h3>
                  {envios.length === 0 ? (
                    <p className={`text-body-sm ${estilos.suave}`}>Nenhum envio até agora.</p>
                  ) : (
                    <ul className={estilos.envios}>
                      {envios.map((e) => (
                        <li key={e.id} className={estilos.envio}>
                          <ImagemEnvio src={resolver_midia(e.arquivo_url)} alt={`Envio de ${nome_sel} em ${data_hora(e.criado_em)}`} />
                          <div className={estilos.envio_texto}>
                            <div className={estilos.envio_topo}>
                              <time className="text-caption" dateTime={e.criado_em}>{data_hora(e.criado_em)}</time>
                              <StatusPill status={e.resultado} />
                            </div>
                            {e.motivo && <p className={`text-body-sm ${estilos.motivo}`}>{e.motivo}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </Card>
          )}
        </div>

        <div className={estilos.coluna}>
          <Card titulo="Conversa">
            {mensagens.length === 0 ? (
              <p className={`text-body-sm ${estilos.suave}`}>Nenhuma mensagem ainda.</p>
            ) : (
              <Conversa mensagens={mensagens} resolver_midia={resolver_midia} variante="painel" />
            )}
          </Card>
          <Card titulo="Lembretes">
            {enviados.length === 0 ? (
              <p className={`text-body-sm ${estilos.suave}`}>Nenhum lembrete enviado</p>
            ) : (
              <ul className={estilos.lembretes}>
                {enviados.map((l) => (
                  <li key={l.id} className={`text-body-sm ${estilos.lembrete}`}>
                    <span>{ROTULO_LEMBRETE[l.nivel]}</span>
                    <time className={estilos.suave} dateTime={l.enviado_em!}>{data_hora(l.enviado_em!)}</time>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
