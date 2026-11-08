"use client";

import { useConsulta } from "../api/contexto";
import { Card } from "../ui/Card";
import { Eyebrow } from "../ui/Eyebrow";
import esqueleto from "./Esqueleto.module.css";
import estilos from "./CatalogoModelos.module.css";
import { rotulo_campo, rotulo_regra } from "./rotulos";

export function CatalogoModelos() {
  const dados = useConsulta((api) => ({ tipos: api.listar_catalogo(), modelos: api.listar_modelos() }));

  return (
    <div>
      <header className={estilos.cabecalho}>
        <Eyebrow>Painel do RH</Eyebrow>
        <h1 className={`text-display-h2 ${estilos.titulo}`}>Catálogo e modelos</h1>
        <p className={`text-body ${estilos.nota}`}>Ajustes são feitos por admissão.</p>
      </header>

      {!dados ? (
        <div aria-busy="true" className={`${esqueleto.bloco} ${estilos.esqueleto}`} />
      ) : (
        <>
          <section aria-labelledby="sec-modelos" className={estilos.secao}>
            <h2 id="sec-modelos" className="text-display-h3">Modelos</h2>
            <div className={estilos.modelos}>
              {dados.modelos.map(({ modelo, tipos }) => (
                <Card key={modelo.id} titulo={modelo.nome}>
                  <ul className={estilos.docs}>
                    {tipos.map((t) => (
                      <li key={t.id} className="text-body-sm">{t.nome}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="sec-tipos" className={estilos.secao}>
            <h2 id="sec-tipos" className="text-display-h3">Tipos de documento</h2>
            <div className={estilos.tipos}>
              {dados.tipos.map((t) => (
                <article key={t.id} className={estilos.tipo}>
                  <h3 className="text-label">{t.nome}</h3>
                  <p className={`text-body-sm ${estilos.instrucao}`}>{t.instrucao_colaborador}</p>
                  <div className={estilos.listas}>
                    <div>
                      <p className={`text-caption ${estilos.chave}`}>Campos extraídos</p>
                      <ul className={estilos.rotulos}>
                        {t.campos_extracao.map((c) => (
                          <li key={c} className="text-caption">{rotulo_campo(c)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className={`text-caption ${estilos.chave}`}>Regras de validação</p>
                      <ul className={estilos.rotulos}>
                        {t.regras_validacao.map((r) => (
                          <li key={r} className="text-caption">{rotulo_regra(r)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
