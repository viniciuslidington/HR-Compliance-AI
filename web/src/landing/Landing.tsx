"use client";

import Link from "next/link";
import Image from "next/image";
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
    texto: "Orienta o envio, explica o que precisa ser corrigido e retoma as pendências conforme o prazo.",
  },
  {
    n: "03",
    titulo: "O RH decide a exceção",
    texto: "Receba o motivo, as tentativas e o histórico. Revise o caso e acompanhe a conclusão no painel.",
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
          const alvo = e.target as HTMLElement;
          alvo.classList.add(estilos.visivel);
          if (alvo.dataset.revelar === "final") set_final_visivel(true);
          obs.unobserve(alvo);
          // Depois da entrada, o reveal sai de cena: o estado final é o mesmo, e o hover deixa de herdar
          // o atraso em cascata da transição de entrada.
          const ao_terminar = (ev: TransitionEvent) => {
            if (ev.target !== alvo || ev.propertyName !== "opacity") return;
            alvo.removeAttribute("data-revelar");
            alvo.removeEventListener("transitionend", ao_terminar);
          };
          alvo.addEventListener("transitionend", ao_terminar);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    alvos.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, []);

  // Destaque no hover: a luz de cada card segue o ponteiro. Só com mouse; no toque não há hover.
  useEffect(() => {
    const el = raiz.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let quadro = 0;
    const ao_mover = (ev: PointerEvent) => {
      const alvo = (ev.target as Element).closest<HTMLElement>("[data-destaque]");
      if (!alvo) return;
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = alvo.getBoundingClientRect();
        alvo.style.setProperty("--px", `${ev.clientX - r.left}px`);
        alvo.style.setProperty("--py", `${ev.clientY - r.top}px`);
      });
    };
    el.addEventListener("pointermove", ao_mover, { passive: true });
    return () => {
      el.removeEventListener("pointermove", ao_mover);
      cancelAnimationFrame(quadro);
    };
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
          <a href="#para-quem">Para quem</a>
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
              Um agente que pede, confere e acompanha os documentos até resolver a pendência.
              Seu RH entra quando uma decisão precisa de atenção.
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
              Menos cobrança manual.<br />
              <span className={estilos.apagado}>Mais clareza para admitir.</span>
            </h2>
            <p className={estilos.descricao}>
              Cada documento pendente vira uma tarefa acompanhada pelo agente.
              Você vê o andamento, identifica os casos em risco e sabe onde precisa agir.
            </p>
          </div>
          <div className={estilos.vitrine}>
            <div className={estilos.vitrine_texto} data-revelar>
              <h3 className={estilos.h3}>Todas as admissões, uma visão.</h3>
              <p>Documentos recebidos, data de início e status por pessoa.
                O que está em coleta, o que terminou e o que precisa do RH ficam no mesmo lugar.</p>
              <ul className={estilos.beneficios}>
                <li>Acompanhe pendências sem montar uma planilha paralela.</li>
                <li>Priorize os casos que se aproximam da data de início.</li>
                <li>Consulte o histórico antes de falar com o colaborador.</li>
              </ul>
              <Link href="/rh" className={estilos.link_editorial}>Explorar o painel <span aria-hidden="true">↗</span></Link>
            </div>
            <figure className={estilos.captura} data-revelar>
              <a href="/landing/produto/painel.png" target="_blank" rel="noreferrer" aria-label="Ampliar captura do painel de admissões">
                <Image src="/landing/produto/painel.png" width={3268} height={1732}
                  sizes="(max-width: 1200px) 100vw, 1104px"
                  alt="Painel real da demonstração Vinda, com quatro admissões, progresso dos documentos e um caso que precisa do RH." />
              </a>
              <figcaption>Painel de admissões · captura do aplicativo enviada pela equipe</figcaption>
            </figure>
          </div>
          <div className={`${estilos.vitrine} ${estilos.vitrine_inversa}`}>
            <div className={estilos.vitrine_texto} data-revelar>
              <h3 className={estilos.h3}>Defina uma vez. O agente conduz.</h3>
              <p>Escolha o modelo de admissão, informe a data de início e ajuste a lista de documentos.
                O agente parte desse contexto para orientar cada envio e acompanhar o que falta.</p>
              <ul className={estilos.beneficios}>
                <li>Use modelos diferentes para CLT e estágio.</li>
                <li>Adicione ou remova documentos conforme a admissão.</li>
                <li>Confira as orientações que o colaborador vai receber.</li>
              </ul>
              <Link href="/rh/admissoes/nova" className={estilos.link_editorial}>Criar uma admissão <span aria-hidden="true">↗</span></Link>
            </div>
            <figure className={estilos.captura} data-revelar>
              <a href="/landing/produto/nova-admissao.png" target="_blank" rel="noreferrer" aria-label="Ampliar captura da configuração de uma nova admissão">
                <Image src="/landing/produto/nova-admissao.png" width={3264} height={1732}
                  sizes="(max-width: 1200px) 100vw, 1104px"
                  alt="Tela real de nova admissão na Vinda, com cargo, data de início, modelo CLT e lista personalizável de documentos." />
              </a>
              <figcaption>Nova admissão · captura do aplicativo enviada pela equipe</figcaption>
            </figure>
          </div>
        </section>

        <section id="como-funciona" className={estilos.secao} aria-labelledby="titulo-como">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-como" className={estilos.h2}>
              O agente acompanha do início ao fim.
            </h2>
          </div>
          <ol className={estilos.passos}>
            {PASSOS.map((p, i) => (
              <li key={p.n} className={estilos.passo} data-revelar data-destaque style={{ "--i": i } as CSSProperties}>
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
              <li key={r.doc} className={estilos.regra} data-revelar data-destaque style={{ "--i": i % 3 } as CSSProperties}>
                <span className={`text-data ${estilos.regra_doc}`}>{r.doc}</span>
                <p className={`text-lead ${estilos.regra_texto}`}>{r.regra}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="para-quem" className={estilos.secao} aria-labelledby="titulo-publico">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-publico" className={estilos.h2}>Para quem admite sempre.<br /><span className={estilos.apagado}>E não pode perder o fio.</span></h2>
            <p className={estilos.descricao}>Para equipes de RH e departamento pessoal que lidam com várias admissões ao mesmo tempo e precisam dar atenção às pessoas, além da papelada.</p>
          </div>
          <div className={estilos.publicos}>
            {[
              ["Varejo e serviços", "Reposições frequentes e várias unidades. Centralize o acompanhamento para que cada pendência tenha um próximo passo."],
              ["Operações e terceirização", "Datas de início próximas e admissões em lote. Visualize o que falta por pessoa e priorize as exceções."],
              ["Programas de estágio", "Turmas com documentos específicos. Use um modelo de admissão com matrícula e os requisitos do seu programa."],
            ].map(([titulo, texto]) => <article key={titulo} data-revelar><h3 className={estilos.h3}>{titulo}</h3><p>{texto}</p></article>)}
          </div>
        </section>

        <section className={estilos.secao} aria-labelledby="titulo-perguntas">
          <div className={estilos.cabeca} data-revelar>
            <h2 id="titulo-perguntas" className={estilos.h2}>Antes de começar.</h2>
          </div>
          <div className={estilos.perguntas}>
            {[
              ["O que consigo testar agora?", "Cadastre uma admissão, escolha os documentos, anexe arquivos na conversa e acompanhe recusas, reenvios, lembretes e revisão pelo RH. A demonstração usa dados fictícios, WhatsApp e leitura de documentos simulados."],
              ["O agente toma a decisão de contratar?", "A Vinda acompanha a documentação da admissão. A decisão de contratar continua com a empresa. Casos que exigem revisão são encaminhados ao RH com o histórico disponível."],
              ["Funciona com a minha folha ou ERP?", "A proposta é levar os dados conferidos ao sistema de destino. Na demonstração, esse cadastro é simulado; a integração com a sua folha ou ERP precisa ser avaliada antes de uma implantação."],
              ["Como avaliar o retorno para a minha operação?", "Em um piloto, acompanhe o tempo do convite à conclusão, os reenvios por documento e os casos que exigem intervenção do RH. Compare com o seu processo atual para medir o resultado."],
              ["Quanto custa?", "O modelo comercial está em validação, com cobrança por admissão concluída como proposta. Preço e condições de implantação ainda não estão definidos."],
            ].map(([pergunta, resposta]) => <details key={pergunta}><summary>{pergunta}<span aria-hidden="true">+</span></summary><p>{resposta}</p></details>)}
          </div>
        </section>

        <section className={estilos.final} aria-labelledby="titulo-final" data-revelar="final">
          <SimboloChegada movimento="encaixar" fechado={final_visivel} tom="marca" className={estilos.final_simbolo} />
          <h2 id="titulo-final" className={estilos.final_titulo}>
            Sua próxima admissão,<br />com menos idas e vindas.
          </h2>
          <p className={estilos.descricao}>Explore o painel e acompanhe uma pendência até a resolução.</p>
          <div className={estilos.acoes}>
            <Link href="/rh" className={estilos.cta_claro}>
              Testar a demonstração
            </Link>
          </div>
        </section>
        </div>
      </main>

      <footer className={`text-caption ${estilos.rodape}`}>
        <MarcaChegada movimento="parado" className={estilos.rodape_marca} />
        <span>Demonstração com dados fictícios e leitura simulada.</span>
        <Link href="/rh">Acessar painel</Link>
      </footer>
    </div>
  );
}
