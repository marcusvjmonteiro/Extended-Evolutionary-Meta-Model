import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import "./database";
import patientsRouter from "./routes/patients";
import eemmRouter from "./routes/eemm";
import processesRouter from "./routes/processes";
import formulationRouter from "./routes/formulation";
import configRouter from "./routes/config";
import { startPurgeScheduler } from "./services/purge";

const app = express();

/**
 * Porta lida do ambiente, com 3001 como padrão de desenvolvimento.
 *
 * Plataformas de container (Cloud Run entre elas) injetam `PORT` e esperam que o
 * processo escute nela; um valor fixo no código faz o contêiner subir e nunca
 * receber tráfego. Está aqui antes de existir qualquer deploy de propósito — é
 * mudança que precisa estar pronta e testada localmente, não descoberta na
 * publicação.
 */
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/config", configRouter);
app.use("/api/eemm/processes", processesRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/patients/:id/eemm", eemmRouter);
app.use("/api/patients/:id/formulation", formulationRouter);

/**
 * Localiza o build estatico do client.
 *
 * `CLIENT_DIST_PATH` tem precedencia (e o que o container define). Sem ela, o
 * caminho depende de ONDE este arquivo esta executando, e sao dois lugares
 * diferentes:
 *
 *   ts-node de src/          -> __dirname = server/src            -> ../../client/dist
 *   node de dist/server/src/ -> __dirname = server/dist/server/src -> ../../../../client/dist
 *
 * Um unico fallback relativo nao cobre os dois. Testar existencia em vez de
 * escolher um cego evita a falha silenciosa em que o servidor sobe, responde a
 * /api normalmente, e serve 404 em toda rota de pagina — que e exatamente o modo
 * de falha que `.replit` (`npm run start`, agora rodando de dist/) teria.
 */
function resolveClientDist(): string {
  if (process.env.CLIENT_DIST_PATH) return process.env.CLIENT_DIST_PATH;

  const candidates = [
    path.join(__dirname, "..", "..", "client", "dist"),
    path.join(__dirname, "..", "..", "..", "..", "client", "dist"),
  ];

  const found = candidates.find((c) => fs.existsSync(path.join(c, "index.html")));

  if (!found) {
    console.warn(
      "[static] build do client nao encontrado em nenhum caminho conhecido; " +
        "as rotas de pagina responderao 404. Defina CLIENT_DIST_PATH. " +
        `Tentados: ${candidates.join(" | ")}`
    );
    return candidates[0];
  }

  console.log(`[static] servindo build do client de ${found}`);
  return found;
}

// Em producao, este mesmo processo serve o build estatico do client, de modo que
// o par server/client seja publicavel como uma unica instancia (ver .replit).
// Em desenvolvimento o Vite continua servindo o frontend em :5173 com proxy para
// /api, entao este bloco fica inativo e o comportamento de dev nao muda em nada.
if (process.env.NODE_ENV === "production") {
  // Resolvido UMA vez, no bootstrap: o resultado é usado tanto pelo middleware de
  // estáticos quanto pelo fallback de SPA, e os dois têm de apontar para o mesmo
  // diretório.
  const clientDist = resolveClientDist();
  app.use(express.static(clientDist));
  // Fallback de SPA: registrado DEPOIS das rotas de /api, que tem precedencia.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Purga automatica de casos expirados (Sec. 4.10). Roda uma passagem imediata
  // e depois em intervalo fixo, independentemente de haver trafego.
  startPurgeScheduler();
});
