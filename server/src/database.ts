import Database from "better-sqlite3";
import path from "path";
import { DIMENSIONS, LEVELS, VALENCES } from "@shared/eemm-types";

const db = new Database(path.join(__dirname, "..", "database.sqlite"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/**
 * Monta a lista de literais de um CHECK constraint a partir das constantes
 * compartilhadas. Os valores vêm de `shared/eemm-types.ts` (constantes de
 * compilação do próprio projeto, nunca entrada de usuário), então a interpolação
 * em SQL é segura aqui — e garante que o banco não aceite nenhum valor de
 * dimensão, nível ou valência que o sistema de tipos não reconheça.
 */
function sqlLiteralList(values: readonly string[]): string {
  return values.map((v) => `'${v}'`).join(", ");
}

const CREATE_EEMM_CELLS = `
  CREATE TABLE eemm_cells (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id      INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dimension       TEXT NOT NULL CHECK (dimension IN (${sqlLiteralList(DIMENSIONS)})),
    level           TEXT NOT NULL CHECK (level IN (${sqlLiteralList(LEVELS)})),
    valence         TEXT NOT NULL CHECK (valence IN (${sqlLiteralList(VALENCES)})),
    severity_score  INTEGER CHECK (severity_score IS NULL OR (severity_score BETWEEN 1 AND 10)),
    notes           TEXT,
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(patient_id, dimension, level, valence)
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

function hasValenceColumn(): boolean {
  const columns = db.prepare("PRAGMA table_info(eemm_cells)").all() as {
    name: string;
  }[];
  return columns.some((c) => c.name === "valence");
}

type MigrationResult =
  | { action: "created" }
  | { action: "up-to-date" }
  | { action: "migrated"; rowsBackedUp: number };

/**
 * Migração explícita do schema legado (4 níveis, sem valência) para o schema
 * bivalente de 3 níveis.
 *
 * A ausência da coluna `valence` é o sinal de schema legado. Linhas antigas NÃO
 * são convertidas automaticamente: o registro legado não carrega valência, e
 * atribuir uma (ex.: assumir tudo como "adaptive") inventaria dado clínico que
 * nunca foi coletado. O eixo de níveis também mudou de 4 categorias para 3, sem
 * correspondência 1:1. Por isso o dado antigo é preservado integralmente em
 * `eemm_cells_legacy_backup` e a tabela nova nasce vazia.
 */
const migrate = db.transaction((): MigrationResult => {
  if (!tableExists("eemm_cells")) {
    db.exec(CREATE_EEMM_CELLS);
    return { action: "created" };
  }

  if (hasValenceColumn()) {
    return { action: "up-to-date" };
  }

  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM eemm_cells")
    .get() as { count: number };

  if (count > 0) {
    // Cria o backup com a mesma forma da tabela legada (sem constraints) e
    // acrescenta as linhas. O INSERT separado do CREATE evita perda silenciosa
    // caso um backup anterior já exista.
    db.exec(
      "CREATE TABLE IF NOT EXISTS eemm_cells_legacy_backup AS SELECT * FROM eemm_cells WHERE 0;"
    );
    db.exec("INSERT INTO eemm_cells_legacy_backup SELECT * FROM eemm_cells;");
  }

  db.exec("DROP TABLE eemm_cells;");
  db.exec(CREATE_EEMM_CELLS);

  return { action: "migrated", rowsBackedUp: count };
});

const result = migrate();

// Índice em patient_id: a leitura da formulação busca todas as linhas de um
// paciente, e o schema bivalente dobra o teto de linhas por caso (36 contra 24).
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_eemm_cells_patient_id ON eemm_cells(patient_id);"
);

if (result.action === "migrated") {
  console.log(
    `[migração] eemm_cells: schema legado substituído pelo schema bivalente de 3 níveis. ` +
      `${result.rowsBackedUp} linha(s) preservada(s) em eemm_cells_legacy_backup; tabela nova iniciada vazia.`
  );
} else if (result.action === "created") {
  console.log("[migração] eemm_cells criada com o schema bivalente de 3 níveis.");
}

export default db;
