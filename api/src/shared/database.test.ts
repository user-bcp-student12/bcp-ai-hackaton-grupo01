import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { buildApp } from "../app.js";
import { loadConfig } from "./config.js";
import { migrate, openDatabase, runSeeds } from "./database.js";

let directory: string;
let migrations: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "wallet-db-"));
  migrations = join(directory, "migrations");
  mkdirSync(migrations);
});
afterEach(() => {
  rmSync(directory, { recursive: true });
});

test("Restart preserves data", async () => {
  const path = join(directory, "demo.sqlite");
  const database = openDatabase(path, migrations);
  writeFileSync(
    join(migrations, "001-fixture.sql"),
    "CREATE TABLE fixture (id INTEGER PRIMARY KEY, value TEXT); INSERT INTO fixture VALUES (1, 'original');",
  );
  migrate(database, migrations, () => "2026-10-23T00:00:00.000Z");
  database
    .prepare("UPDATE fixture SET value = ? WHERE id = ?")
    .run("changed", 1);
  const config = loadConfig({ DATABASE_PATH: path, NODE_ENV: "test" });
  const first = await buildApp({ config, database, logger: false });
  expect((await first.inject("/api/v1/health")).statusCode).toBe(200);
  await first.close();
  const reopened = openDatabase(path, migrations);
  const second = await buildApp({ config, database: reopened, logger: false });
  try {
    expect((await second.inject("/api/v1/health")).statusCode).toBe(200);
    expect(
      reopened.prepare("SELECT value FROM fixture WHERE id = ?").get(1),
    ).toEqual({
      value: "changed",
    });
    expect(
      reopened.prepare("SELECT count(*) AS count FROM schema_migrations").get(),
    ).toEqual({
      count: 1,
    });
  } finally {
    await second.close();
  }
});

test("Failed migration rolls back and never records success", () => {
  const database = openDatabase(join(directory, "demo.sqlite"), migrations);
  try {
    writeFileSync(
      join(migrations, "001-broken.sql"),
      "CREATE TABLE incomplete (id INTEGER); INSERT INTO missing_table VALUES (1);",
    );
    expect(() => {
      migrate(database, migrations);
    }).toThrow();
    expect(
      database.prepare("SELECT count(*) AS count FROM schema_migrations").get(),
    ).toEqual({
      count: 0,
    });
    expect(
      database
        .prepare("SELECT name FROM sqlite_master WHERE name = 'incomplete'")
        .get(),
    ).toBeUndefined();
  } finally {
    database.close();
  }
});

test("Repeated seed runner is non-destructive", () => {
  const database = openDatabase(join(directory, "demo.sqlite"), migrations);
  const fixtureSeed = () => {
    database.exec(
      "CREATE TABLE IF NOT EXISTS fixture (id INTEGER PRIMARY KEY, value TEXT)",
    );
    database
      .prepare("INSERT OR IGNORE INTO fixture VALUES (?, ?)")
      .run(1, "initial");
  };
  try {
    runSeeds(database, [fixtureSeed]);
    database
      .prepare("UPDATE fixture SET value = ? WHERE id = ?")
      .run("changed", 1);
    runSeeds(database, [fixtureSeed]);
    expect(database.prepare("SELECT * FROM fixture").all()).toEqual([
      { id: 1, value: "changed" },
    ]);
  } finally {
    database.close();
  }
});

test("Unavailable required persistence fails without a memory substitute", () => {
  expect(() => openDatabase(directory, migrations)).toThrow();
});

test("Failed seed rolls back its changes", () => {
  const database = openDatabase(join(directory, "demo.sqlite"), migrations);
  try {
    expect(() => {
      runSeeds(database, [
        () => {
          database.exec("CREATE TABLE rolled_back (id INTEGER)");
          throw new Error("Controlled failure");
        },
      ]);
    }).toThrow("Controlled failure");
    expect(
      database
        .prepare("SELECT name FROM sqlite_master WHERE name = 'rolled_back'")
        .get(),
    ).toBeUndefined();
  } finally {
    database.close();
  }
});
