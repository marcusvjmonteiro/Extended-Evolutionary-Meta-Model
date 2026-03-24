import { Router, Request, Response } from "express";
import db from "../database";

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

    db.prepare("DELETE FROM patients WHERE id = ?").run(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
