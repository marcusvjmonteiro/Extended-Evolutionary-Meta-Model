import express from "express";
import cors from "cors";
import "./database";
import patientsRouter from "./routes/patients";
import eemmRouter from "./routes/eemm";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/patients", patientsRouter);
app.use("/api/patients/:id/eemm", eemmRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
