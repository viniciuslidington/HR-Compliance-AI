import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "../../ui/Eyebrow";
import { Logo, Simbolo } from "../../ui/Logo";
import estilos from "./marca.module.css";

export const metadata: Metadata = { title: "Guia da marca" };

const CORES = [
  { token: "--surface", nome: "Papel", hex: "#F6F6F3", claro: true },
  { token: "--ink", nome: "Tinta", hex: "#10120F" },
  { token: "--lime", nome: "Lima", hex: "#D4F75B", claro: true },
  { token: "--mint", nome: "Menta", hex: "#5BE3A0", claro: true },
  { token: "--aqua", nome: "Água", hex: "#3CC3E6", claro: true },
  { token: "--accent", nome: "Sinal", hex: "#0E9F5B" },
  { token: "--alert", nome: "Atenção", hex: "#F2683A" },
];

const ESCALA = [
  { classe: "text-display-hero", nome: "Display hero", spec: "60 / 60 · 600 · −2.1" },
  { classe: "text-display-h2", nome: "Display H2", spec: "38 / 42 · 600 · −1.2" },
  { classe: "text-display-h3", nome: "Display H3", spec: "17 / 24 · 600" },
  { classe: "text-lead", nome: "Lead", spec: "18 / 28 · 400" },
  { classe: "text-body", nome: "Body", spec: "16 / 25 · 400" },
  { classe: "text-data", nome: "Data (mono)", spec: "13 / 20 · tabular" },
];

const VOZ = [
  { sim: "Faltam 2 documentos. Te aviso quando chegarem.", nao: "Olá! 😊 Estou aqui para ajudar você em sua jornada de admissão!" },
  { sim: "O comprovante tem mais de 90 dias. Manda um de outubro?", nao: "Infelizmente seu documento foi rejeitado pelo sistema." },
  { sim: "Ana entra segunda. Está tudo certo.", nao: "Processo de onboarding concluído com sucesso via IA." },
];

export default function MarcaPage() {
  return (
    <div className={estilos.pagina}>
      <header className={estilos.topo}>
        <Link href="/rh" className={estilos.home} aria-label="Voltar ao painel">
          <Logo tamanho="sm" />
        </Link>
        <span className="text-eyebrow">Guia da marca · v1</span>
      </header>

      <section className={estilos.hero}>
        <div className={estilos.hero_simbolo}>
          <Simbolo className={estilos.simbolo_xl} />
        </div>
        <h1 className={`text-display-hero ${estilos.titulo}`}>
          Admissão que se resolve <span className="text-gradient">sozinha.</span>
        </h1>
        <p className={`text-lead ${estilos.lead}`}>
          vinda é o agente que recebe o novo colaborador pelo WhatsApp, confere cada documento e só chama o RH
          quando precisa. A marca tem que parecer assim: calma, precisa e sem pressa de aparecer.
        </p>
      </section>

      <section className={estilos.secao}>
        <div className={estilos.intro}>
          <Eyebrow>01 · Símbolo</Eyebrow>
          <h2 className="text-display-h2">Um v que também é um check.</h2>
          <p className="text-body">
            Dois traços que convergem num ponto. Lê-se a <em>vinda</em> de quem chega e o documento aprovado.
            O tile carrega o gradiente; o traço é sempre tinta.
          </p>
        </div>
        <div className={estilos.grade_logo}>
          <figure className={estilos.placa}>
            <Logo tamanho="lg" />
            <figcaption className="text-caption">Sobre papel</figcaption>
          </figure>
          <figure className={`section-dark ${estilos.placa} ${estilos.placa_escura}`}>
            <Logo tamanho="lg" />
            <figcaption className="text-caption">Sobre grafite</figcaption>
          </figure>
          <figure className={`${estilos.placa} ${estilos.placa_gradiente}`}>
            <span className={estilos.wordmark}>vinda</span>
            <figcaption className="text-caption">Wordmark sobre o gradiente</figcaption>
          </figure>
          <figure className={estilos.placa}>
            <div className={estilos.tamanhos}>
              <Logo variante="simbolo" tamanho="lg" />
              <Logo variante="simbolo" tamanho="md" />
              <Logo variante="simbolo" tamanho="sm" />
            </div>
            <figcaption className="text-caption">Ícone · 44 / 28 / 22 px · raio 30%</figcaption>
          </figure>
        </div>
      </section>

      <section className={estilos.secao}>
        <div className={estilos.intro}>
          <Eyebrow>02 · Cor</Eyebrow>
          <h2 className="text-display-h2">Papel, tinta e um gradiente.</h2>
          <p className="text-body">
            A interface é quase monocromática. O gradiente lima → menta → água aparece em poucos lugares: o
            símbolo, o progresso e a luz no topo da página. O verde-sinal marca o que está resolvido; o laranja,
            o que precisa de alguém.
          </p>
        </div>
        <div className={estilos.gradiente} aria-hidden="true" />
        <ul className={estilos.cores}>
          {CORES.map((c) => (
            <li key={c.token} className={estilos.cor}>
              <span
                className={`${estilos.amostra} ${c.claro ? estilos.amostra_clara : ""}`}
                style={{ background: `var(${c.token})` }}
              />
              <span className="text-label">{c.nome}</span>
              <span className={`text-data ${estilos.meta}`}>{c.hex}</span>
              <span className={`text-data ${estilos.meta}`}>{c.token}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={estilos.secao}>
        <div className={estilos.intro}>
          <Eyebrow>03 · Tipografia</Eyebrow>
          <h2 className="text-display-h2">Funnel para falar, Geist Mono para medir.</h2>
          <p className="text-body">
            Funnel Display tem terminais cortados e um desenho geométrico com personalidade, sem o ar genérico das
            grotescas de sempre. Funnel Sans é a mesma família para o texto. Geist Mono fica com o que é dado:
            CPFs, prazos, contagens e rótulos técnicos.
          </p>
        </div>
        <div className={estilos.especimes}>
          <div className={estilos.especime}>
            <span className={estilos.aa} style={{ fontFamily: "var(--font-display)" }}>Aa</span>
            <span className="text-label">Funnel Display</span>
            <span className={`text-data ${estilos.meta}`}>Títulos · 500–600</span>
          </div>
          <div className={estilos.especime}>
            <span className={estilos.aa} style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}>Aa</span>
            <span className="text-label">Funnel Sans</span>
            <span className={`text-data ${estilos.meta}`}>Texto · 400–500</span>
          </div>
          <div className={estilos.especime}>
            <span className={estilos.aa} style={{ fontFamily: "var(--font-mono)", fontWeight: 400, letterSpacing: "-0.04em" }}>
              01
            </span>
            <span className="text-label">Geist Mono</span>
            <span className={`text-data ${estilos.meta}`}>Dados · tabular</span>
          </div>
        </div>
        <ol className={estilos.escala}>
          {ESCALA.map((e) => (
            <li key={e.classe} className={estilos.degrau}>
              <span className={`text-data ${estilos.meta}`}>{e.spec}</span>
              <span className={`${e.classe} ${estilos.amostra_texto}`}>Ana entra segunda</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={estilos.secao}>
        <div className={estilos.intro}>
          <Eyebrow>04 · Movimento</Eyebrow>
          <h2 className="text-display-h2">Rápido para começar, suave para pousar.</h2>
          <p className="text-body">
            Toda animação usa <code className="text-data">--ease-out</code>, mexe só em transform e opacity e some
            com <code className="text-data">prefers-reduced-motion</code>. O movimento confirma algo; não decora.
          </p>
        </div>
        <div className={estilos.motion}>
          <figure className={estilos.placa}>
            <span className={estilos.demo_pulso} aria-hidden="true" />
            <figcaption className="text-caption">Agente ativo · pulso 2.4s</figcaption>
          </figure>
          <figure className={estilos.placa}>
            <span className={estilos.demo_trilho} aria-hidden="true">
              <span className={estilos.demo_barra} />
            </span>
            <figcaption className="text-caption">Progresso · 560ms ease-out</figcaption>
          </figure>
          <figure className={estilos.placa}>
            <span className={estilos.demo_check} aria-hidden="true">
              <Simbolo />
            </span>
            <figcaption className="text-caption">Aprovado · traço do check</figcaption>
          </figure>
        </div>
      </section>

      <section className={estilos.secao}>
        <div className={estilos.intro}>
          <Eyebrow>05 · Voz</Eyebrow>
          <h2 className="text-display-h2">Fala como um colega do RH.</h2>
          <p className="text-body">
            Frases curtas, o fato primeiro, o próximo passo depois. Sem emoji, sem “IA” no texto e sem jargão de
            sistema.
          </p>
        </div>
        <ul className={estilos.voz}>
          {VOZ.map((v) => (
            <li key={v.sim} className={estilos.par}>
              <p className={`text-body ${estilos.sim}`}>{v.sim}</p>
              <p className={`text-body-sm ${estilos.nao}`}>{v.nao}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className={`text-caption ${estilos.rodape}`}>
        <Logo variante="simbolo" tamanho="sm" />
        Tokens em design-system/tokens.json · regras em design-system/BRAND.md
      </footer>
    </div>
  );
}
