import db from "../database";

/**
 * Governanca de dados operacionais (Sec. 4.10).
 *
 * Este modulo concentra DOIS mecanismos que o texto do TCC afirma existir e que,
 * ate este sprint, nao tinham correspondente no codigo:
 *
 *   1. Purga automatica de casos expirados, sem intervencao manual.
 *   2. Verificacao de integridade da eliminacao por consulta ao banco,
 *      executada imediatamente apos cada exclusao.
 *
 * A verificacao existe justamente para NAO confiar cegamente no ON DELETE CASCADE
 * declarado no schema: a afirmacao do Sec. 4.10 e sobre comprovar a eliminacao,
 * nao sobre presumi-la a partir da constraint.
 */

/**
 * Janela maxima de retencao de um caso, contada a partir da sua CRIACAO.
 *
 * Padrao: 4 horas. O artefato nao possui autenticacao nem sessao — nao ha
 * login/logout, cookie de sessao ou qualquer evento que marque inicio e fim de
 * uso. O proxy operacional adotado para "termino de sessao" e, portanto, a
 * expiracao de tempo desde a criacao do caso (ver SPRINT_3_LOG.md, Passo 1).
 *
 * 4 horas cobre com folga a sessao de inspecao unica (60-90 min, Apendice B) e a
 * consolidacao subsequente (Sec. 4.8.3), sem virar retencao de fato.
 *
 * Sobrescrever via CASE_TTL_SECONDS existe para permitir teste do mecanismo com
 * janela curta sem editar codigo — o que evita o risco de um valor de teste ficar
 * commitado por engano. O valor de producao e o default abaixo.
 */
const DEFAULT_CASE_TTL_SECONDS = 4 * 60 * 60;
export const CASE_TTL_SECONDS =
  Number(process.env.CASE_TTL_SECONDS) || DEFAULT_CASE_TTL_SECONDS;

/** Frequencia da varredura de expirados. */
const DEFAULT_PURGE_INTERVAL_SECONDS = 15 * 60;
export const PURGE_INTERVAL_SECONDS =
  Number(process.env.PURGE_INTERVAL_SECONDS) || DEFAULT_PURGE_INTERVAL_SECONDS;

/**
 * Tabela de backup criada pela migracao do Sprint 5 (schema dimensao×nivel ->
 * sistema×operador). Entra na varredura pelo mesmo motivo que a v1 nao podia ficar
 * de fora: uma tabela de backup nao coberta pela purga acumula dado de aparencia
 * clinica indefinidamente e contradiz a afirmacao do Sec. 4.10.
 *
 * A v1 (`eemm_cells_legacy_backup`) NAO aparece aqui porque foi eliminada na
 * migracao — ver `server/src/database.ts`. Cobrir por purga e alternativa
 * secundaria; eliminar resolve a causa.
 */
const LEGACY_BACKUP_TABLE = "eemm_cells_legacy_backup_v2";

function legacyBackupExists(): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(LEGACY_BACKUP_TABLE);
  return row !== undefined;
}

export interface PurgeVerification {
  patientId: number;
  /** Linhas restantes em `patients` para este id — tem de ser 0. */
  patientRowsRemaining: number;
  /** Linhas orfas restantes em `eemm_cells` para este id — tem de ser 0. */
  cellRowsRemaining: number;
  /**
   * Linhas restantes na tabela de backup de migracao para este id — tem de ser 0.
   * A tabela nao tem FK nem ON DELETE CASCADE (e uma copia crua do schema antigo),
   * entao a exclusao dela e explicita, nao herdada.
   */
  legacyBackupRowsRemaining: number;
  /** Verdadeiro somente se as tres contagens acima forem 0. */
  verified: boolean;
}

/**
 * Exclui um caso e verifica a eliminacao consultando o banco logo em seguida.
 *
 * A verificacao roda APOS o DELETE ter sido efetivado (better-sqlite3 e sincrono
 * e cada statement e autocommitado), e nao dentro da mesma transacao — ler o
 * estado ja committado e a leitura forte da afirmacao "verificada por consulta ao
 * banco imediatamente apos a execucao".
 *
 * Retorna o resultado da verificacao em vez de lanca-lo, para que tanto a rota de
 * exclusao manual quanto a purga automatica possam reportar o desfecho.
 */
export function deleteCaseAndVerify(patientId: number): PurgeVerification {
  const cellsBefore = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells WHERE patient_id = ?")
    .get(patientId) as { count: number };

  db.prepare("DELETE FROM patients WHERE id = ?").run(patientId);

  // A tabela de backup de migracao nao tem FK: o CASCADE nao a alcanca. A exclusao
  // e explicita e roda junto da do caso, para que o mesmo TTL valha para as duas.
  const backupExists = legacyBackupExists();
  if (backupExists) {
    db.prepare(
      `DELETE FROM ${LEGACY_BACKUP_TABLE} WHERE patient_id = ?`
    ).run(patientId);
  }

  // --- Verificacao pos-purga -------------------------------------------------
  const patientRows = db
    .prepare("SELECT COUNT(*) AS count FROM patients WHERE id = ?")
    .get(patientId) as { count: number };

  const cellRows = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells WHERE patient_id = ?")
    .get(patientId) as { count: number };

  const backupRows = backupExists
    ? (db
        .prepare(
          `SELECT COUNT(*) AS count FROM ${LEGACY_BACKUP_TABLE} WHERE patient_id = ?`
        )
        .get(patientId) as { count: number })
    : { count: 0 };

  const verification: PurgeVerification = {
    patientId,
    patientRowsRemaining: patientRows.count,
    cellRowsRemaining: cellRows.count,
    legacyBackupRowsRemaining: backupRows.count,
    verified:
      patientRows.count === 0 &&
      cellRows.count === 0 &&
      backupRows.count === 0,
  };

  if (verification.verified) {
    console.log(
      `[purga] caso id=${patientId} eliminado e verificado: ` +
        `patients=0, eemm_cells=0, ${LEGACY_BACKUP_TABLE}=0 ` +
        `(${cellsBefore.count} celula(s) removida(s) em cascata)`
    );
  } else {
    // Falha aqui indica quebra de integridade referencial apesar do ON DELETE
    // CASCADE — e exatamente o cenario que a verificacao existe para expor.
    console.error(
      `[purga][FALHA DE INTEGRIDADE] caso id=${patientId} NAO foi integralmente eliminado: ` +
        `patients=${verification.patientRowsRemaining}, ` +
        `eemm_cells=${verification.cellRowsRemaining}, ` +
        `${LEGACY_BACKUP_TABLE}=${verification.legacyBackupRowsRemaining}`
    );
  }

  return verification;
}

/**
 * Elimina linhas da tabela de backup de migracao cujo paciente ja nao existe.
 *
 * Sem isto, a cobertura por TTL teria um buraco exatamente do tamanho do achado P0:
 * uma linha de backup cujo paciente foi purgado ANTES de a tabela existir (ou por
 * uma rota que nao passe por `deleteCaseAndVerify`) nunca mais teria evento que a
 * eliminasse, e sobreviveria indefinidamente. Um backup orfao ja e, por definicao,
 * dado retido alem do TTL do caso a que pertencia.
 */
export function purgeOrphanLegacyBackupRows(): number {
  if (!legacyBackupExists()) return 0;

  const { count } = db
    .prepare(
      `SELECT COUNT(*) AS count FROM ${LEGACY_BACKUP_TABLE}
       WHERE patient_id NOT IN (SELECT id FROM patients)`
    )
    .get() as { count: number };

  if (count === 0) return 0;

  db.prepare(
    `DELETE FROM ${LEGACY_BACKUP_TABLE}
     WHERE patient_id NOT IN (SELECT id FROM patients)`
  ).run();

  console.log(
    `[purga] ${count} linha(s) orfa(s) removida(s) de ${LEGACY_BACKUP_TABLE} ` +
      `(paciente ja inexistente).`
  );

  return count;
}

/**
 * Identifica e elimina todos os casos cuja idade ultrapassou o TTL.
 *
 * Os ids sao registrados em log ANTES do DELETE: um log de auditoria que so
 * mencionasse o caso depois de ele deixar de existir nao teria valor de rastro.
 *
 * O log contem apenas identificadores, contagens e timestamps — nunca nome do
 * paciente nem conteudo clinico. Registrar dado do caso no log recriaria, no
 * proprio mecanismo de eliminacao, o canal de retencao que ele existe para fechar.
 */
export function purgeExpiredCases(): PurgeVerification[] {
  // Roda antes da varredura de casos: cobre o backup de migracao mesmo quando nao
  // ha nenhum caso expirado nesta passagem.
  purgeOrphanLegacyBackupRows();

  const expired = db
    .prepare(
      `SELECT id, created_at FROM patients
       WHERE created_at < datetime('now', ?)`
    )
    .all(`-${CASE_TTL_SECONDS} seconds`) as {
    id: number;
    created_at: string;
  }[];

  if (expired.length === 0) return [];

  console.log(
    `[purga] ${expired.length} caso(s) expirado(s) (TTL=${CASE_TTL_SECONDS}s): ` +
      `ids=[${expired.map((p) => p.id).join(", ")}] ` +
      `criados_em=[${expired.map((p) => p.created_at).join(", ")}]`
  );

  return expired.map((patient) => deleteCaseAndVerify(patient.id));
}

/**
 * Agenda a varredura periodica e executa uma passagem imediata no bootstrap.
 *
 * setInterval foi preferido a um middleware por request: o comportamento nao
 * depende de haver trafego, e um caso expirado num servidor ocioso continua sendo
 * eliminado. Tambem e mais simples de raciocinar e de testar. A passagem imediata
 * cobre o caso de o servidor ter ficado fora do ar durante a janela de expiracao.
 *
 * `unref()` impede que o timer sozinho mantenha o processo vivo.
 */
export function startPurgeScheduler(): NodeJS.Timeout {
  const run = () => {
    try {
      purgeExpiredCases();
    } catch (err) {
      console.error("[purga] varredura falhou:", err);
    }
  };

  run();

  console.log(
    `[purga] varredura automatica ativa: TTL=${CASE_TTL_SECONDS}s, ` +
      `intervalo=${PURGE_INTERVAL_SECONDS}s`
  );

  return setInterval(run, PURGE_INTERVAL_SECONDS * 1000).unref();
}
