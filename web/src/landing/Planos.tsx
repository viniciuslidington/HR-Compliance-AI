import Link from "next/link";
import type { CSSProperties } from "react";
import landing from "./Landing.module.css";
import estilos from "./Planos.module.css";

export type Plano = {
  id: string;
  nome: string;
  /** Texto antes do valor, como "a partir de". */
  prefixo?: string;
  preco: string;
  /** Periodicidade do valor; vazio quando o plano é gratuito. */
  periodo?: string;
  descricao: string;
  recursos: string[];
  cta: string;
  recomendado?: boolean;
};

/** Planos propostos pelo time (08/11/2026). Mude aqui; a landing e o teste leem desta lista. */
export const PLANOS: Plano[] = [
  {
    id: "gratis",
    nome: "Grátis",
    preco: "R$ 0",
    descricao: "Para pequenas empresas e para quem quer testar.",
    recursos: [
      "3 admissões por mês",
      "1 modelo de admissão",
      "1 usuário de RH",
      "Cadastro final por exportação",
      "Suporte pela central de ajuda",
    ],
    cta: "Testar a demonstração",
  },
  {
    id: "essencial",
    nome: "Essencial",
    preco: "R$ 149",
    periodo: "por mês",
    descricao: "Para empresas com poucas admissões.",
    recursos: [
      "15 admissões por mês (R$ 9,93 cada)",
      "Excedente a R$ 9",
      "Até 3 modelos de admissão",
      "2 usuários de RH",
      "Cadastro final por exportação",
      "Renovação de documentos opcional: R$ 0,50 por colaborador por mês",
      "Suporte por e-mail",
    ],
    cta: "Testar a demonstração",
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: "R$ 449",
    periodo: "por mês",
    descricao: "Para médias empresas de alto giro e empresas com cargos regulados.",
    recursos: [
      "60 admissões por mês (R$ 7,48 cada)",
      "Excedente a R$ 7",
      "Modelos ilimitados",
      "Documentos específicos da empresa, como ASO, NR-10 e NR-35 numa empresa de energia",
      "Integração com 1 sistema de folha",
      "Renovação de 100 colaboradores incluída; acima disso, R$ 0,50 por colaborador por mês",
      "Usuários ilimitados",
      "Relatório mensal de métricas",
      "Suporte por e-mail e chat",
    ],
    cta: "Testar a demonstração",
    recomendado: true,
  },
  {
    id: "corporativo",
    nome: "Corporativo",
    prefixo: "a partir de",
    preco: "R$ 1.500",
    periodo: "por mês",
    descricao: "Para grandes operações com vários CNPJs.",
    recursos: [
      "Volume de admissões e renovação negociados",
      "Tudo do Profissional",
      "Integrações sob medida",
      "Login corporativo (SSO)",
      "Gerente de conta e SLA",
    ],
    cta: "Ver o painel",
  },
];

/** Seção de planos da landing. Usa o reveal e o destaque no hover que o Landing.tsx já controla. */
export function Planos() {
  return (
    <section id="planos" className={landing.secao} aria-labelledby="titulo-planos">
      <div className={landing.cabeca} data-revelar>
        <h2 id="titulo-planos" className={landing.h2}>
          Planos para cada ritmo de admissão.
          <br />
          <span className={landing.apagado}>Comece grátis e mude quando o volume crescer.</span>
        </h2>
        <p className={landing.descricao}>
          Escolha pelo volume de admissões do mês e pelos documentos que o seu negócio exige.
        </p>
      </div>

      <ul className={estilos.grade}>
        {PLANOS.map((p, i) => (
          <li
            key={p.id}
            className={`${estilos.plano} ${p.recomendado ? estilos.recomendado : ""}`}
            data-revelar
            data-destaque
            style={{ "--i": i } as CSSProperties}
          >
            {p.recomendado && <span className={estilos.selo}>Recomendado</span>}
            <h3 className={estilos.nome}>{p.nome}</h3>
            {/* Prefixo, valor e período em linhas próprias, para os valores alinharem entre os cards. */}
            <p className={estilos.preco}>
              {p.prefixo && <span className={estilos.prefixo}>{p.prefixo} </span>}
              <span className={estilos.valor}>{p.preco}</span>
              <span className={estilos.periodo}>{p.periodo ? ` ${p.periodo}` : ""}</span>
            </p>
            <p className={estilos.descricao}>{p.descricao}</p>
            <ul className={estilos.recursos}>
              {p.recursos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <Link
              href="/rh"
              className={`${estilos.cta} ${p.recomendado ? estilos.cta_principal : ""}`}
              aria-label={`${p.cta}, plano ${p.nome}`}
            >
              {p.cta}
            </Link>
          </li>
        ))}
      </ul>

      <p className={estilos.nota}>
        Valores mensais, em reais. Na demonstração, todos os planos abrem o mesmo painel, com dados fictícios.
      </p>
    </section>
  );
}
