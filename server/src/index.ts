import express from "express";
import cors from "cors";
import path from "path";
import "./database";
import patientsRouter from "./routes/patients";
import eemmRouter from "./routes/eemm";
import processesRouter from "./routes/processes";
import formulationRouter from "./routes/formulation";
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

app.use("/api/eemm/processes", processesRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/patients/:id/eemm", eemmRouter);
app.use("/api/patients/:id/formulation", formulationRouter);

// Em producao, este mesmo processo serve o build estatico do client, de modo que
// o par server/client seja publicavel como uma unica instancia (ver .replit).
// Em desenvolvimento o Vite continua servindo o frontend em :5173 com proxy para
// /api, entao este bloco fica inativo e o comportamento de dev nao muda em nada.
if (process.env.NODE_ENV === "production") {
  // Fallback relativo mantido para execução a partir de `src/` (ts-node com
  // NODE_ENV=production). No container o layout é outro — o servidor roda de
  // `dist/server/src/` e o build do client vive em `/app/client/dist` —, por isso o
  // caminho é configurável em vez de derivado da posição do arquivo.
  const clientDist =
    process.env.CLIENT_DIST_PATH ||
    path.join(__dirname, "..", "..", "client", "dist");
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
