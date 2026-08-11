import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const sharedDir = path.resolve(rootDir, "../shared");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Espelha o alias `@shared/*` declarado em client/tsconfig.json. Sem isto o
    // TypeScript resolveria o import em tempo de checagem, mas o bundler falharia
    // em tempo de execução.
    alias: {
      "@shared": sharedDir,
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: "all",
    // `shared/` fica fora da raiz do projeto do client; o dev server precisa de
    // permissão explícita para servir arquivos de lá.
    fs: {
      allow: [rootDir, sharedDir],
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
