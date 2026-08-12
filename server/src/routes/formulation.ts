import { Router, Request, Response } from "express";
import { generateFormulation } from "../services/formulation";

const router = Router({ mergeParams: true });

/**
 * GET /api/patients/:id/formulation
 *
 * Retorna JSON de blocos por dimensão (e não markdown ou texto plano) para que a
 * estrutura permaneça auditável: cada sentença fica isolada em seu bloco, o que
 * torna possível testar automaticamente a conformidade com HC3 — por exemplo,
 * verificar que nenhuma sentença contém conectivo causal — sem ter de reparsear
 * prosa.
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const formulation = generateFormulation(Number(req.params.id));

    if (!formulation) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    res.json(formulation);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
