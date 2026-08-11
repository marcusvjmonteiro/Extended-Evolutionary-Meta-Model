import express from "express";
import cors from "cors";
import path from "path";
import "./database";
import patientsRouter from "./routes/patients";
import eemmRouter from "./routes/eemm";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/patients", patientsRouter);
app.use("/api/patients/:id/eemm", eemmRouter);

// Em producao, este mesmo processo serve o build estatico do client, de modo que
// o par server/client seja publicavel como uma unica instancia (ver .replit).
// Em desenvolvimento o Vite continua servindo o frontend em :5173 com proxy para
// /api, entao este bloco fica inativo e o comportamento de dev nao muda em nada.
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDist));
  // Fallback de SPA: registrado DEPOIS das rotas de /api, que tem precedencia.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
