import path from "node:path";
import type { NextConfig } from "next";

// A raiz do repositório precisa estar no escopo do bundler: globals.css importa
// ../design-system/tokens.css, que fica fora de web/.
const raiz_repo = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: { root: raiz_repo },
  outputFileTracingRoot: raiz_repo,
};

export default nextConfig;
