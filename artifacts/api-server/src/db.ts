import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = path.join(__dirname, "..", "database.sqlite");

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS eemm_cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    dimension TEXT NOT NULL,
    level TEXT NOT NULL,
    severity_score INTEGER,
    notes TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(patient_id, dimension, level)
  );
`);

export default db;
