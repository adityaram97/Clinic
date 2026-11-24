import assert from "node:assert/strict";
import { rm, readFile } from "node:fs/promises";
import Database from "better-sqlite3";
import { test } from "node:test";

test("clinic-name migration preserves existing consultations", async () => {
  const databasePath = `${process.cwd()}/.clinic-migration-test.sqlite`;
  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  try {
    const migrationFiles = [
      "drizzle/0000_chemical_onslaught.sql",
      "drizzle/0001_deep_black_bolt.sql",
      "drizzle/0002_friendly_stone_men.sql",
    ];
    for (const migrationFile of migrationFiles) {
      const migration = await readFile(migrationFile, "utf8");
      for (const statement of migration.split("--> statement-breakpoint")) {
        if (statement.trim()) sqlite.exec(statement);
      }
      if (migrationFile === migrationFiles[0]) {
        sqlite
          .prepare(
            "INSERT INTO doctors (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
          )
          .run(
            "existing-doctor",
            "existing@example.test",
            "hash",
            "2026-01-01",
          );
        sqlite
          .prepare(
            "INSERT INTO consultations (id, doctor_id, patient_name, consultation_date, amount_paise, payment_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .run(
            "existing-consultation",
            "existing-doctor",
            "Synthetic Patient",
            "2026-01-01",
            100000,
            "cash",
            "2026-01-01T00:00:00.000Z",
            "2026-01-01T00:00:00.000Z",
          );
      }
    }

    const existingRecord = sqlite
      .prepare(
        "SELECT id, patient_name, clinic_name FROM consultations WHERE id = ?",
      )
      .get("existing-consultation") as
      | { id: string; patient_name: string; clinic_name: string | null }
      | undefined;
    assert.deepEqual(existingRecord, {
      id: "existing-consultation",
      patient_name: "Synthetic Patient",
      clinic_name: null,
    });
  } finally {
    sqlite.close();
    await Promise.all(
      [databasePath, `${databasePath}-wal`, `${databasePath}-shm`].map((file) =>
        rm(file, { force: true }),
      ),
    );
  }
});
