import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const BUSY_TIMEOUT_MS = 5000;
export const migrationsDirectory = fileURLToPath(
  new URL("../../db/migrations/", import.meta.url),
);

export function inTransaction(
  database: DatabaseSync,
  action: () => void,
): void {
  database.exec("BEGIN IMMEDIATE");
  try {
    action();
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function migrate(
  database: DatabaseSync,
  directory: string,
  now: () => string = () => new Date().toISOString(),
): void {
  const applied = database.prepare(
    "SELECT 1 FROM schema_migrations WHERE version = ?",
  );
  const record = database.prepare(
    "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
  );
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (!/^\d{3}-[a-z0-9-]+\.sql$/.test(file)) {
      throw new Error("Invalid migration filename; expected NNN-name.sql");
    }
    inTransaction(database, () => {
      if (applied.get(file)) return;
      database.exec(readFileSync(join(directory, file), "utf8"));
      record.run(file, now());
    });
  }
}

export function openDatabase(
  path: string,
  migrationsDirectory: string,
): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  try {
    database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = ${String(BUSY_TIMEOUT_MS)};
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY, applied_at TEXT NOT NULL
      );
    `);
    migrate(database, migrationsDirectory);
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

export function runSeeds(
  database: DatabaseSync,
  seeds: readonly ((database: DatabaseSync) => void)[],
): void {
  inTransaction(database, () => {
    for (const seed of seeds) seed(database);
  });
}
