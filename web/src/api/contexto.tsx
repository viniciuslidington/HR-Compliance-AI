"use client";

// Único caminho das telas até a Api: useConsulta (leitura) e useAcao (mutação).
// Assim a troca por uma HttpApi assíncrona fica concentrada aqui.
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArmazenamentoLocal } from "../store/armazenamento";
import type { Api } from "./api";
import { HttpApi } from "./http_api";
import { MockApi } from "./mock_api";

/** `mock` = tudo no localStorage do navegador; padrão = servidor do Next + IA do worker. */
const MODO = process.env.NEXT_PUBLIC_API_MODO === "mock" ? "mock" : "http";

interface Ligacao {
  api: Api;
  getRev: () => number;
  subscribe: (cb: () => void) => () => void;
}

/** Contador de revisão que sobe a cada notificação da Api; é o snapshot estável do useSyncExternalStore. */
function ligar(api: Api): Ligacao {
  let rev = 0;
  const ouvintes = new Set<() => void>();
  let cancelar: (() => void) | null = null;
  return {
    api,
    getRev: () => rev,
    subscribe(cb) {
      ouvintes.add(cb);
      if (ouvintes.size === 1)
        cancelar = api.assinar(() => {
          rev += 1;
          for (const f of [...ouvintes]) f();
        });
      return () => {
        ouvintes.delete(cb);
        if (ouvintes.size === 0) {
          cancelar?.();
          cancelar = null;
        }
      };
    },
  };
}

const ContextoApi = createContext<Ligacao | null>(null);

const nunca_assina = () => () => {};
const sem_rev = () => 0;

const no_cliente = () => true;
const no_servidor = () => false;

export function ApiProvider({ children, api }: { children: ReactNode; api?: Api }) {
  // O servidor (e a hidratação) não têm localStorage: sem `api` injetada, a MockApi só nasce no cliente, já montado.
  const montado = useSyncExternalStore(nunca_assina, no_cliente, no_servidor);
  const http = useHttpApi(!api && MODO === "http" && montado);
  const ligacao = useMemo(() => {
    if (api) return ligar(api);
    if (!montado) return null;
    if (MODO === "http") return http ? ligar(http) : null;
    return ligar(new MockApi(new ArmazenamentoLocal()));
  }, [api, montado, http]);
  return <ContextoApi.Provider value={ligacao}>{children}</ContextoApi.Provider>;
}

/** Cria a HttpApi e só a entrega depois da primeira carga do estado (tenta de novo a cada 2 s). */
function useHttpApi(ativo: boolean): HttpApi | null {
  const [pronta, setPronta] = useState<HttpApi | null>(null);
  useEffect(() => {
    if (!ativo) return;
    const h = new HttpApi();
    let vivo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const tentar = () =>
      h.carregar().then(
        () => vivo && setPronta(h),
        (erro) => {
          console.error("[ApiProvider] servidor indisponível", erro);
          if (vivo) espera = setTimeout(tentar, 2000);
        },
      );
    tentar();
    return () => {
      vivo = false;
      clearTimeout(espera);
      h.encerrar();
    };
  }, [ativo]);
  return pronta;
}

export function useApi(): Api {
  const l = useContext(ContextoApi);
  if (!l) throw new Error("A Api ainda não está disponível (use useConsulta ou useAcao dentro do ApiProvider).");
  return l.api;
}

/**
 * Leitura reativa. `fn` pode ser inline; passe em `deps` os valores que ela captura (ex.: um id).
 * O resultado mantém a mesma referência enquanto a revisão e as `deps` não mudam.
 * `null` no servidor, na hidratação e até a Api existir: as telas mostram um esqueleto. */
export function useConsulta<T>(fn: (api: Api) => T, deps: unknown[] = []): T | null {
  const l = useContext(ContextoApi);
  const rev = useSyncExternalStore(
    l ? l.subscribe : nunca_assina,
    l ? l.getRev : sem_rev,
    () => null,
  );
  // `fn` fica de fora de propósito: pode ser inline; o que ela captura entra em `deps`.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  return useMemo(() => (l && rev !== null ? fn(l.api) : null), [l, rev, ...deps]);
}

/** Mutação: `const executar = useAcao(); executar((api) => api.resolver_escalacao(...))`. */
export function useAcao(): <R>(fn: (api: Api) => R) => R {
  const l = useContext(ContextoApi);
  return useMemo(
    () =>
      <R,>(fn: (api: Api) => R): R => {
        if (!l) throw new Error("A Api ainda não está disponível.");
        return fn(l.api);
      },
    [l],
  );
}
