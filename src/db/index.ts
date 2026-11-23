import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

const sqlite =
  globalForDb.sqlite ?? new Database(process.env.DATABASE_URL?.replace(/^file:/, '') ?? './dev.db');

if (process.env.NODE_ENV !== 'production') globalForDb.sqlite = sqlite;

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    consultation_date TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'digital'))
  );
  CREATE INDEX IF NOT EXISTS consultations_date_idx
    ON consultations (consultation_date DESC, id DESC);
`);

export const db = drizzle(sqlite, { schema });
export { schema };
