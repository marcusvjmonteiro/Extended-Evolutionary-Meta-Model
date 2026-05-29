import { Router, type Request, type Response } from "express";
import db from "../db.js";

const router = Router();

const DIMENSIONS = [
  "cognition",
  "affect",
  "attention",
  "self",
  "behavior",
  "motivation",
] as const;

const LEVELS = [
  "variation",
  "selection",
  "retention",
] as const;

type Dimension = (typeof DIMENSIONS)[number];
type Level = (typeof LEVELS)[number];

router.get("/patients/:id/eemm", (req: Request, res: Response) => {
  try {
    const patient = db
      .prepare("SELECT id FROM patients WHERE id = ?")
      .get(req.params.id);

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const rows = db
      .prepare(
        "SELECT dimension, level, severity_score, notes, updated_at FROM eemm_cells WHERE patient_id = ?"
      )
      .all(req.params.id) as {
      dimension: string;
      level: string;
      severity_score: number | null;
      notes: string | null;
      updated_at: string;
    }[];

    const cellMap = new Map(rows.map((r) => [`${r.dimension}|${r.level}`, r]));

    const cells = [];
    for (const dimension of DIMENSIONS) {
      for (const level of LEVELS) {
        const key = `${dimension}|${level}`;
        const existing = cellMap.get(key);
        cells.push({
          dimension,
          level,
          severity_score: existing?.severity_score ?? null,
          notes: existing?.notes ?? null,
          updated_at: existing?.updated_at ?? null,
        });
      }
    }

    res.json(cells);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/patients/:id/eemm", (req: Request, res: Response) => {
  const { dimension, level, severity_score, notes } = req.body as {
    dimension?: string;
    level?: string;
    severity_score?: number | null;
    notes?: string | null;
  };

  if (!dimension || !DIMENSIONS.includes(dimension as Dimension)) {
    res.status(400).json({
      error: `Field 'dimension' must be one of: ${DIMENSIONS.join(", ")}`,
    });
    return;
  }

  if (!level || !LEVELS.includes(level as Level)) {
    res.status(400).json({
      error: `Field 'level' must be one of: ${LEVELS.join(", ")}`,
    });
    return;
  }

  if (
    severity_score !== undefined &&
    severity_score !== null &&
    (typeof severity_score !== "number" ||
      !Number.isInteger(severity_score) ||
      severity_score < 1 ||
      severity_score > 10)
  ) {
    res
      .status(400)
      .json({ error: "Field 'severity_score' must be an integer between 1 and 10" });
    return;
  }

  try {
    const patient = db
      .prepare("SELECT id FROM patients WHERE id = ?")
      .get(req.params.id);

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    db.prepare(`
      INSERT INTO eemm_cells (patient_id, dimension, level, severity_score, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(patient_id, dimension, level) DO UPDATE SET
        severity_score = excluded.severity_score,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `).run(
      req.params.id,
      dimension,
      level,
      severity_score ?? null,
      notes ?? null
    );

    const cell = db
      .prepare(
        "SELECT * FROM eemm_cells WHERE patient_id = ? AND dimension = ? AND level = ?"
      )
      .get(req.params.id, dimension, level);

    res.json(cell);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
