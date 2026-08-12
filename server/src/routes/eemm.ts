import { Router, Request, Response } from "express";
import db from "../database";
import { SYSTEMS, OPERATORS, VALENCES } from "@shared/eemm-types";
import type { System, Operator, Valence } from "@shared/eemm-types";

const router = Router({ mergeParams: true });

interface CellRow {
  system: System;
  operator: Operator;
  valence: Valence;
  severity_score: number | null;
  notes: string | null;
  updated_at: string | null;
}

/**
 * GET /api/patients/:id/eemm
 *
 * Formato de resposta: array FLAT de 64 entradas
 * (8 sistemas × 4 operadores × 2 valências), sempre completo — registros ainda não
 * preenchidos vêm com `severity_score` e `notes` nulos.
 *
 * Escolhido em vez de um objeto aninhado por dois motivos: (a) a chave lógica é a
 * tripla (system, operator, valence), e um array flat a expõe sem ambiguidade nem
 * necessidade de percorrer níveis de aninhamento; (b) mantém a resposta estável e
 * legível para inspeção direta durante a avaliação por especialistas.
 */
router.get("/", (req: Request, res: Response) => {
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
        "SELECT system, operator, valence, severity_score, notes, updated_at FROM eemm_cells WHERE patient_id = ?"
      )
      .all(req.params.id) as CellRow[];

    const stored = new Map(
      rows.map((r) => [`${r.system}|${r.operator}|${r.valence}`, r])
    );

    const cells: CellRow[] = [];
    for (const system of SYSTEMS) {
      for (const operator of OPERATORS) {
        for (const valence of VALENCES) {
          const existing = stored.get(`${system}|${operator}|${valence}`);
          cells.push({
            system,
            operator,
            valence,
            severity_score: existing?.severity_score ?? null,
            notes: existing?.notes ?? null,
            updated_at: existing?.updated_at ?? null,
          });
        }
      }
    }

    res.json(cells);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", (req: Request, res: Response) => {
  const { system, operator, valence, severity_score, notes } = req.body;

  if (!system || !SYSTEMS.includes(system as System)) {
    res.status(400).json({
      error: `Field 'system' must be one of: ${SYSTEMS.join(", ")}`,
    });
    return;
  }

  if (!operator || !OPERATORS.includes(operator as Operator)) {
    res.status(400).json({
      error: `Field 'operator' must be one of: ${OPERATORS.join(", ")}`,
    });
    return;
  }

  if (!valence || !VALENCES.includes(valence as Valence)) {
    res.status(400).json({
      error: `Field 'valence' must be one of: ${VALENCES.join(", ")}`,
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

    // O alvo de conflito é a constraint composta de 4 colunas — é ela que permite
    // que o registro adaptativo e o desadaptativo da MESMA célula sistema×operador
    // coexistam em vez de um sobrescrever o outro.
    db.prepare(`
      INSERT INTO eemm_cells (patient_id, system, operator, valence, severity_score, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(patient_id, system, operator, valence) DO UPDATE SET
        severity_score = excluded.severity_score,
        notes = excluded.notes,
        updated_at = excluded.updated_at
    `).run(
      req.params.id,
      system,
      operator,
      valence,
      severity_score ?? null,
      notes ?? null
    );

    const cell = db
      .prepare(
        "SELECT system, operator, valence, severity_score, notes, updated_at FROM eemm_cells WHERE patient_id = ? AND system = ? AND operator = ? AND valence = ?"
      )
      .get(req.params.id, system, operator, valence);

    res.json(cell);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
