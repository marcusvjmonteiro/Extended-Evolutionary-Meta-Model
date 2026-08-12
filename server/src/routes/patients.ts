import { Router, Request, Response } from "express";
import db from "../database";
import { deleteCaseAndVerify } from "../services/purge";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  try {
    const patients = db
      .prepare("SELECT * FROM patients ORDER BY created_at DESC")
      .all();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", (req: Request, res: Response) => {
  const { name, date_of_birth, notes } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "Field 'name' is required" });
    return;
  }

  try {
    const result = db
      .prepare(
        "INSERT INTO patients (name, date_of_birth, notes) VALUES (?, ?, ?)"
      )
      .run(name.trim(), date_of_birth ?? null, notes ?? null);

    const patient = db
      .prepare("SELECT * FROM patients WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", (req: Request, res: Response) => {
  try {
    const patient = db
      .prepare("SELECT * FROM patients WHERE id = ?")
      .get(req.params.id);

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const patient = db
      .prepare("SELECT id FROM patients WHERE id = ?")
      .get(req.params.id);

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    // A exclusao e a verificacao de integridade vivem no mesmo servico usado pela
    // purga automatica — a query nao e duplicada aqui.
    const verification = deleteCaseAndVerify(Number(req.params.id));

    // Responde 200 com o resultado da verificacao, e nao 204 vazio: a afirmacao do
    // Sec. 4.10 sobre integridade da eliminacao fica demonstravel na propria
    // resposta da chamada, sem depender de um log interno ou de inspecao do banco.
    res.status(verification.verified ? 200 : 500).json({
      deleted: true,
      verified: verification.verified,
      patientId: verification.patientId,
      remaining: {
        patients: verification.patientRowsRemaining,
        eemm_cells: verification.cellRowsRemaining,
        eemm_cells_legacy_backup_v2: verification.legacyBackupRowsRemaining,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
