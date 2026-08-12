import { Router, Request, Response } from "express";
import {
  CHANGE_PROCESSES,
  PROCESS_VALENCE_LABELS,
  VALENCE_DEFINITIONS,
} from "@shared/eemm-processes";

const router = Router();

/**
 * GET /api/eemm/processes
 *
 * Serve o mapa COMPLETO de processos de mudança (todos os 8 sistemas) numa única
 * resposta, em vez de expor um filtro `?system=X`.
 *
 * Justificativa: o mapa é estático, imutável em tempo de execução e pequeno
 * (32 processos). Servi-lo inteiro permite ao frontend busca-lo uma unica vez na
 * montagem da pagina e renderizar a ajuda contextual a partir do estado local, sem
 * requisicao de rede a cada celula aberta. Isso importa para a heuristica HU10:
 * ajuda "no ponto de uso" que depende de round-trip por abertura de painel introduz
 * latencia e estado de carregamento exatamente no momento em que o profissional
 * precisa da definicao.
 *
 * Inclui tambem as definicoes operacionais de valencia, pelo mesmo motivo (HU6).
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    processes: CHANGE_PROCESSES,
    processValenceLabels: PROCESS_VALENCE_LABELS,
    valenceDefinitions: VALENCE_DEFINITIONS,
  });
});

export default router;
