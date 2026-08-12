import { Router, Request, Response } from "express";
import { CASE_TTL_SECONDS, PURGE_INTERVAL_SECONDS } from "../services/purge";
import { formatDuration } from "../services/duration";

const router = Router();

/**
 * GET /api/config/retention
 *
 * Expõe a política de retenção REAL em vigor, lida das mesmas constantes que a
 * rotina de purga usa para operar (`CASE_TTL_SECONDS`, `PURGE_INTERVAL_SECONDS`
 * em [purge.ts](../services/purge.ts)).
 *
 * A razão de existir deste endpoint é de honestidade, não de arquitetura: a página
 * de transparência afirma ao avaliador por quanto tempo os dados dele ficam no
 * sistema. Se esse número fosse escrito à mão no JSX, ele passaria a ser uma
 * PROMESSA DESACOPLADA DO MECANISMO — bastaria alguém definir `CASE_TTL_SECONDS`
 * no ambiente para a página passar a mentir, sem que nada acusasse. Lendo da
 * mesma fonte, a página não tem como divergir do comportamento real: os dois
 * mudam juntos ou não mudam.
 *
 * Não expõe `DATABASE_PATH`. O caminho do arquivo no servidor não informa nada ao
 * avaliador sobre a política de retenção e é detalhe de infraestrutura — o que
 * importa dizer, e a página diz, é que o banco é local à instância.
 */
router.get("/retention", (_req: Request, res: Response) => {
  res.json({
    ttlSeconds: CASE_TTL_SECONDS,
    ttlHuman: formatDuration(CASE_TTL_SECONDS),
    purgeIntervalSeconds: PURGE_INTERVAL_SECONDS,
    purgeIntervalHuman: formatDuration(PURGE_INTERVAL_SECONDS),
  });
});

export default router;
