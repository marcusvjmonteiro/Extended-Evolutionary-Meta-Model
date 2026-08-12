import Database from "better-sqlite3";
import path from "path";
import { SYSTEMS, OPERATORS, VALENCES } from "@shared/eemm-types";

/**
 * Caminho do arquivo SQLite.
 *
 * O fallback é o caminho histórico (`server/database.sqlite`, relativo a `src/`),
 * então `npm run dev` continua se comportando exatamente como antes — nenhuma
 * variável precisa ser definida para desenvolver.
 *
 * `DATABASE_PATH` existe para o container: lá o arquivo vive num diretório de dados
 * dedicado e gravável (`/app/data`), fora da árvore de código somente-leitura. Sem
 * isso, o banco cairia dentro de `dist/`, onde o processo não deve escrever e cujo
 * conteúdo é descartável a cada rebuild da imagem.
 */
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, "..", "database.sqlite");

const db = new Database(DATABASE_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/**
 * Monta a lista de literais de um CHECK constraint a partir das constantes
 * compartilhadas. Os valores vêm de `shared/eemm-types.ts` (constantes de
 * compilação do próprio projeto, nunca entrada de usuário), então a interpolação
 * em SQL é segura aqui — e garante que o banco não aceite nenhum valor de
 * sistema, operador ou valência que o sistema de tipos não reconheça.
 */
function sqlLiteralList(values: readonly string[]): string {
  return values.map((v) => `'${v}'`).join(", ");
}

/**
 * Schema sistema × operador × valência (Sprint 5).
 *
 * `notes` NÃO é anotação genérica: é onde o atributo A4 (qualificação processual,
 * §4.8.4 corrigido) se satisfaz — a caracterização qualitativa de como aquele
 * operador evolucionário se manifesta naquele sistema. Não há campo adicional para
 * isso por decisão explícita: um segundo campo de texto livre ao lado deste
 * produziria ambiguidade sobre o que vai em qual. A UI é que torna a função
 * explícita, via rótulo e placeholder do campo.
 */
const CREATE_EEMM_CELLS = `
  CREATE TABLE eemm_cells (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    system          TEXT NOT NULL CHECK (system IN (${sqlLiteralList(SYSTEMS)})),
    operator        TEXT NOT NULL CHECK (operator IN (${sqlLiteralList(OPERATORS)})),
    valence         TEXT NOT NULL CHECK (valence IN (${sqlLiteralList(VALENCES)})),
    severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
    notes           TEXT,
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(patient_id, system, operator, valence)
  );
`;

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

function tableExists(name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name);
  return row !== undefined;
}

function hasColumn(table: string, column: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  return columns.some((c) => c.name === column);
}

type MigrationResult =
  | { action: "created" }
  | { action: "up-to-date" }
  | { action: "migrated"; rowsBackedUp: number };

/**
 * Migração do schema dimensão × nível (Sprint 1) para o schema sistema × operador
 * (Sprint 5).
 *
 * A ausência da coluna `system` é o sinal de schema antigo. Linhas antigas NÃO são
 * convertidas automaticamente. Não existe correspondência segura de
 * (dimension, level) para um único `system`: o valor `level = 'psychological'`
 * simplesmente não tem destino no eixo novo (os oito sistemas não incluem um
 * "psicológico" como categoria à parte — as seis dimensões já SÃO o nível
 * psicológico), e mapear dimension→system descartando o nível inventaria a
 * informação de qual sistema o registro de nível biofisiológico ou sociocultural
 * pertenceria. Como os registros existentes são fictícios, de teste, a tabela nova
 * nasce vazia e o dado antigo vai para backup.
 *
 * O backup vai para `eemm_cells_legacy_backup_v2` — nome distinto de propósito. A
 * tabela `eemm_cells_legacy_backup`, criada na migração do Sprint 1, é ela mesma o
 * achado P0 da auditoria (resíduo clínico fora do alcance da purga) e é eliminada
 * abaixo, não reaproveitada.
 */
const migrate = db.transaction((): MigrationResult => {
  if (!tableExists("eemm_cells")) {
    db.exec(CREATE_EEMM_CELLS);
    return { action: "created" };
  }

  if (hasColumn("eemm_cells", "system")) {
    return { action: "up-to-date" };
  }

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells")
    .get() as { count: number };

  if (count > 0) {
    db.exec(
      "CREATE TABLE IF NOT EXISTS eemm_cells_legacy_backup_v2 AS SELECT * FROM eemm_cells WHERE 0;"
    );
    db.exec("INSERT INTO eemm_cells_legacy_backup_v2 SELECT * FROM eemm_cells;");
  }

  db.exec("DROP TABLE eemm_cells;");
  db.exec(CREATE_EEMM_CELLS);

  return { action: "migrated", rowsBackedUp: count };
});

const result = migrate();

/**
 * Eliminação do resíduo de duas migrações atrás (achado P0 da auditoria, §4.10).
 *
 * `eemm_cells_legacy_backup` foi criada no Sprint 1 para preservar o dado do schema
 * de 4 níveis sem valência. Desde então acumula linha de aparência clínica fora do
 * alcance de `purge.ts` — que varre `patients` e `eemm_cells`, e nada mais —,
 * contradizendo a afirmação do §4.10 sobre eliminação integral dos registros.
 *
 * A rastreabilidade da migração do Sprint 1 já está registrada em SPRINT_1_LOG.md e
 * nas duas rodadas de auditoria; manter o dado dentro do banco de produção não
 * acrescenta rastro algum e é, ele mesmo, o problema. Por isso: DROP, não migração
 * para outro nome nem inclusão na purga.
 *
 * Roda fora da transação de migração de propósito: é uma correção de governança de
 * dados independente do estado do schema — precisa acontecer inclusive quando o
 * schema já está atualizado (`up-to-date`).
 */
function dropLegacyBackupV1(): number | null {
  if (!tableExists("eemm_cells_legacy_backup")) return null;

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells_legacy_backup")
    .get() as { count: number };

  db.exec("DROP TABLE eemm_cells_legacy_backup;");
  return count;
}

const droppedLegacyRows = dropLegacyBackupV1();

// Índice em patient_id: a leitura da formulação busca todas as linhas de um
// paciente, e o teto de linhas por caso subiu de 36 para 64 no schema novo.
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_eemm_cells_patient_id ON eemm_cells(patient_id);"
);

if (result.action === "migrated") {
  console.log(
    `[migração] eemm_cells: schema dimensão×nível substituído pelo schema ` +
      `sistema×operador (8×4, bivalente). ${result.rowsBackedUp} linha(s) preservada(s) ` +
      `em eemm_cells_legacy_backup_v2; tabela nova iniciada vazia.`
  );
} else if (result.action === "created") {
  console.log(
    "[migração] eemm_cells criada com o schema sistema×operador (8×4, bivalente)."
  );
}

if (droppedLegacyRows !== null) {
  console.log(
    `[migração] eemm_cells_legacy_backup ELIMINADA (${droppedLegacyRows} linha(s) ` +
      `removida(s)) — resíduo do schema de 4 níveis, sem cobertura de purga. ` +
      `Achado P0 da auditoria resolvido.`
  );
}

export default db;
