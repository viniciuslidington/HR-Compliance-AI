import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// `globals: false` desliga o cleanup automático do Testing Library.
afterEach(cleanup);
