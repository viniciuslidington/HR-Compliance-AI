"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MarcaChegada, SimboloChegada } from "./Chegada";
import { CidadeAscii } from "./CidadeAscii";
import { OndaAscii } from "./OndaAscii";
import estilos from "./Landing.module.css";

/**
 * Vídeo do hero. Quando o vídeo estiver pronto, coloque os arquivos em web/public/landing/ e preencha:
 *   { src: "/landing/hero.mp4", poster: "/landing/hero.jpg" }
 * Enquanto for null, o hero usa o fundo animado em CSS (luz da marca + horizonte).
 */
const VIDEO_HERO: { src: string; poster?: string } | null = null;

/** Sem vídeo, o hero é esta foto do Marco Zero (Recife) redesenhada em ASCII. */
const FOTO_HERO = "/landing/recife-marco-zero.jpg";

const TITULO = ["Admissão", "que", "se", "resolve", "sozinha."];

const PASSOS = [
  {
    n: "01",
    titulo: "O RH cadastra",
    texto: "Defina o cargo, a data de início e os documentos necessários.",
  },
  {
    n: "02",
    titulo: "O agente conduz",
    texto: "Solicita os documentos, confere cada envio e acompanha as pendências.",
  },
  {
    n: "03",
    titulo: "O RH vê a exceção",
    texto: "Receba as pendências com o motivo e o próximo passo para decidir.",
  },
];

const REGRAS = [
  { doc: "CPF", regra: "Dígito verificador válido e nome igual ao do RG" },
  { doc: "RG ou CNH", regra: "Legível, frente e verso, CNH dentro da validade" },
  { doc: "Comprovante", regra: "Emitido há menos de 90 dias" },
  { doc: "Dados bancários", regra: "Titular da conta é o colaborador" },
  { doc: "Matrícula", regra: "Nome igual ao do RG e data recente" },
  { doc: "Personalizado", regra: "Legível e parece o documento pedido" },
];

export function Landing() {
  const raiz = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [nav_oculta, set_nav_oculta] = useState(false);
  const [nav_solida, set_nav_solida] = useState(false);
  const [final_visivel, set_final_visivel] = useState(false);

  // Navegação: some ao descer, volta ao subir; ganha fundo depois do topo do hero.
  useEffect(() => {
    let ultimo = window.scrollY;
    let pendente = false;
    const ao_rolar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        set_nav_solida(y > 24);
        set_nav_oculta(y > ultimo && y > 320);
        ultimo = y;
        raiz.current?.style.setProperty("--rolagem", String(Math.min(y / window.innerHeight, 1)));
        pendente = false;
      });
    };
    ao_rolar();
    window.addEventListener("scroll", ao_rolar, { passive: true });
    return () => window.removeEventListener("scroll", ao_rolar);
  }, []);

  // Reveal no scroll. Sem JS, nada fica escondido: o estado inicial só vale com data-anim="on".
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    el.dataset.anim = "on";
    const alvos = el.querySelectorAll<HTMLElement>("[data-revelar]");
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          e.target.classList.add(estilos.visivel);
          if ((e.target as HTMLElement).dataset.revelar === "final") set_final_visivel(true);
          obs.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    alvos.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, []);

  // Com movimento reduzido, o vídeo fica parado no pôster.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.pause();
  }, []);

  return (
    <div ref={raiz} className={`section-dark ${estilos.raiz}`}>
      <a href="#conteudo" className={estilos.pular}>
        Pular para o conteúdo
      </a>

      <header
        className={`${estilos.nav} ${nav_oculta ? estilos.nav_oculta : ""} ${nav_solida ? estilos.nav_solida : ""}`}
      >
        <Link href="/" className={estilos.nav_marca} aria-label="vinda, início">
          <MarcaChegada />
        </Link>
        <nav aria-label="Seções" className={estilos.nav_links}>
          <a href="#produto">Produto</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#regras">O que confere</a>
        </nav>
        <Link href="/rh" className={estilos.nav_cta}>
          Ver o painel
        </Link>
      </header>

      <main id="conteudo">
        <section ref={hero} className={estilos.hero} aria-labelledby="titulo-hero">
          <div className={estilos.hero_fundo} aria-hidden="true">
            {VIDEO_HERO ? (
              <video
                ref={video}
                className={estilos.video}
                src={VIDEO_HERO.src}
                poster={VIDEO_HERO.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <div className={estilos.cena}>
                <span className={`${estilos.orbe} ${estilos.orbe_laranja}`} />
                <span className={`${estilos.orbe} ${estilos.orbe_ambar}`} />
                <CidadeAscii src={FOTO_HERO} className={estilos.cidade} />
              </div>
            )}
            <span className={estilos.veu} />
            <span className={estilos.grao} />
          </div>

          <div className={estilos.hero_conteudo}>
            <h1 id="titulo-hero" className={estilos.titulo}>
              {TITULO.map((p, i) => (
                <span key={p} className={estilos.palavra} style={{ "--i": i } as CSSProperties}>
                  <span>{p}</span>
                </span>
              ))}
            </h1>
            <p className={`text-lead ${estilos.sub}`}>
              Coleta, conferência e acompanhamento de documentos em uma conversa.
              Seu RH participa das decisões que precisam de atenção.
            </p>
            <div className={estilos.acoes}>
              <Link href="/rh" className={estilos.cta_claro}>Conhecer a demonstração</Link>
            </div>
          </div>

        </section>

        {/* Tudo depois do hero corre sobre o fundo ASCII, que sobe do rodapé na transição. */}
        <div className={estilos.depois}>
          <OndaAscii className={estilos.onda} />
        <section id="produto" className={estilos.produto} aria-labelledby="titulo-produto">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-produto" className={estilos.h2}>
              Uma conversa de um lado.
              <br />
              <span className={estilos.apagado}>Um cadastro pronto do outro.</span>
            </h2>
          </div>

          <div className={estilos.janela} data-revelar>
            <div className={estilos.janela_barra} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={estilos.janela_corpo}>
              <div className={estilos.chat} aria-label="Exemplo de conversa">
                <p className={`text-body-sm ${estilos.bolha} ${estilos.bolha_agente}`}>
                  Oi, Ana! Para sua admissão na segunda, preciso de 4 documentos. Pode começar pelo RG, frente e
                  verso.
                </p>
                <p className={`text-body-sm ${estilos.bolha} ${estilos.bolha_pessoa}`}>comprovante_luz.pdf</p>
                <p className={`text-body-sm ${estilos.bolha} ${estilos.bolha_agente}`}>
                  Esse comprovante é de junho. Preciso de um dos últimos 90 dias. Tem o de outubro?
                </p>
                <p className={`text-body-sm ${estilos.bolha} ${estilos.bolha_pessoa}`}>luz_outubro.pdf</p>
                <p className={`text-body-sm ${estilos.bolha} ${estilos.bolha_agente}`}>Perfeito, está certo. Falta só a conta bancária.</p>
              </div>
              <div className={estilos.painel}>
                <div className={estilos.painel_topo}>
                  <div>
                    <p className="text-label">Ana Souza</p>
                    <p className={`text-caption ${estilos.apagado}`}>Estagiária de RH · início 09/11</p>
                  </div>
                  <span className={`text-caption ${estilos.pill_coleta}`}>Em coleta</span>
                </div>
                <div className={estilos.progresso} aria-hidden="true">
                  <span className={estilos.progresso_barra} />
                </div>
                <ul className={estilos.docs}>
                  {[
                    ["RG", "Aprovado"],
                    ["CPF", "Aprovado"],
                    ["Comprovante", "Aprovado na 2ª tentativa"],
                    ["Dados bancários", "Aguardando"],
                  ].map(([d, s], i) => (
                    <li key={d} className={estilos.doc} style={{ "--i": i } as CSSProperties}>
                      <span className={`${estilos.doc_marca} ${s === "Aguardando" ? estilos.doc_pendente : ""}`} aria-hidden="true" />
                      <span className="text-body-sm">{d}</span>
                      <span className={`text-data ${estilos.apagado}`}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className={estilos.secao} aria-labelledby="titulo-como">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-como" className={estilos.h2}>
              Do cadastro à conferência.
            </h2>
          </div>
          <ol className={estilos.passos}>
            {PASSOS.map((p, i) => (
              <li key={p.n} className={estilos.passo} data-revelar style={{ "--i": i } as CSSProperties}>
                <h3 className={estilos.h3}>{p.titulo}</h3>
                <p className={`text-body ${estilos.apagado}`}>{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="regras" className={estilos.secao} aria-labelledby="titulo-regras">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-regras" className={estilos.h2}>
              As regras que o RH confere à mão.
              <br />
              <span className={estilos.apagado}>Agora, a cada envio.</span>
            </h2>
          </div>
          <ul className={estilos.regras}>
            {REGRAS.map((r, i) => (
              <li key={r.doc} className={estilos.regra} data-revelar style={{ "--i": i % 3 } as CSSProperties}>
                <span className={`text-data ${estilos.regra_doc}`}>{r.doc}</span>
                <p className={`text-lead ${estilos.regra_texto}`}>{r.regra}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={estilos.final} aria-labelledby="titulo-final" data-revelar="final">
          <SimboloChegada movimento="encaixar" fechado={final_visivel} tom="marca" className={estilos.final_simbolo} />
          <h2 id="titulo-final" className={estilos.final_titulo}>
            Veja a Vinda em ação.
          </h2>
          <div className={estilos.acoes}>
            <Link href="/whatsapp" className={estilos.cta_claro}>
              Experimentar a conversa
            </Link>
          </div>
        </section>
        </div>
      </main>

      <footer className={`text-caption ${estilos.rodape}`}>
        <MarcaChegada movimento="parado" className={estilos.rodape_marca} />
        <span>Demonstração com WhatsApp simulado.</span>
        <Link href="/rh">Acessar painel</Link>
      </footer>
    </div>
  );
}
