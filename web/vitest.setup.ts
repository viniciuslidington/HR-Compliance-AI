import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// `globals: false` desliga o cleanup automático do Testing Library.
afterEach(cleanup);

// Nos testes de tela a Api padrão é a MockApi local (o modo http precisa do servidor do Next).
process.env.NEXT_PUBLIC_API_MODO = "mock";
