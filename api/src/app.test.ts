import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import type { FastifyInstance } from "fastify";
import { errorResponseSchema, healthResponseSchema } from "@wallet/contracts";
import { buildApp } from "./app.js";
import { loadConfig } from "./shared/config.js";
import { migrationsDirectory, openDatabase } from "./shared/database.js";

let directory: string;
const apps: FastifyInstance[] = [];
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "wallet-api-"));
});
afterEach(async () => {
  for (const app of apps.splice(0)) await app.close();
  rmSync(directory, { recursive: true });
});
const config = () =>
  loadConfig({
    NODE_ENV: "test",
    DATABASE_PATH: join(directory, "demo.sqlite"),
  });

test("Ready local runtime", async () => {
  const app = await buildApp({ config: config(), logger: false });
  apps.push(app);
  const response = await app.inject("/api/v1/health");
  expect(response.statusCode).toBe(200);
  expect(healthResponseSchema.parse(response.json())).toEqual({
    status: "ok",
    simulated: true,
  });
});

test("Storage unavailable", async () => {
  const database = openDatabase(config().DATABASE_PATH, migrationsDirectory);
  const app = await buildApp({ config: config(), database, logger: false });
  apps.push(app);
  database.close();
  const response = await app.inject("/api/v1/health");
  expect(response.statusCode).toBe(503);
  expect(errorResponseSchema.parse(response.json()).error.code).toBe(
    "STORAGE_UNAVAILABLE",
  );
});

test("Unknown API route returns safe JSON", async () => {
  const app = await buildApp({ config: config(), logger: false });
  apps.push(app);
  const response = await app.inject("/api/v1/missing");
  expect(response.statusCode).toBe(404);
  expect(errorResponseSchema.parse(response.json()).error.code).toBe(
    "NOT_FOUND",
  );
});

test("Health rejects unknown input without echoing it", async () => {
  const app = await buildApp({ config: config(), logger: false });
  apps.push(app);
  const response = await app.inject("/api/v1/health?password=private-value");
  expect(response.statusCode).toBe(400);
  expect(errorResponseSchema.parse(response.json()).error.code).toBe(
    "VALIDATION_ERROR",
  );
  expect(response.body).not.toContain("private-value");
});

test("Unexpected errors do not leak credentials into responses or logs", async () => {
  const logs: string[] = [];
  const app = await buildApp({
    config: config(),
    logger: { stream: { write: (line: string) => logs.push(line) } },
  });
  apps.push(app);
  app.post("/api/v1/test-failure", () => {
    throw new Error("private-value");
  });
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/test-failure?key=private-value",
    headers: { authorization: "private-value" },
    payload: { password: "private-value", email: "private-value" },
  });
  expect(response.statusCode).toBe(500);
  expect(errorResponseSchema.parse(response.json()).error.code).toBe(
    "INTERNAL_ERROR",
  );
  expect(response.body).not.toContain("private-value");
  expect(logs.join("")).toContain("INTERNAL_ERROR");
  expect(logs.join("")).not.toContain("private-value");
});

test("Malformed JSON is an explicit safe validation error", async () => {
  const app = await buildApp({ config: config(), logger: false });
  apps.push(app);
  app.post("/api/v1/test-input", () => ({ ok: true }));
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/test-input",
    headers: { "content-type": "application/json" },
    payload: '{"password":"private-value"',
  });
  expect(response.statusCode).toBe(400);
  expect(errorResponseSchema.parse(response.json()).error.code).toBe(
    "VALIDATION_ERROR",
  );
  expect(response.body).not.toContain("private-value");
});

test("Only the configured web origin gets CORS permission", async () => {
  const app = await buildApp({ config: config(), logger: false });
  apps.push(app);
  const allowed = await app.inject({
    url: "/api/v1/health",
    headers: { origin: "http://localhost:5173" },
  });
  const other = await app.inject({
    url: "/api/v1/health",
    headers: { origin: "https://other.example.test" },
  });
  expect(allowed.headers["access-control-allow-origin"]).toBe(
    "http://localhost:5173",
  );
  expect(other.headers["access-control-allow-origin"]).not.toBe(
    "https://other.example.test",
  );
});

test("Built web shell serves app routes while unknown API routes stay JSON", async () => {
  const webDirectory = join(directory, "web");
  mkdirSync(join(webDirectory, "assets"), { recursive: true });
  writeFileSync(
    join(webDirectory, "index.html"),
    '<!doctype html><div id="root"></div>',
  );
  writeFileSync(join(webDirectory, "assets", "app.js"), "console.log(1);");
  const app = await buildApp({
    config: config(),
    logger: false,
    webDirectory,
  });
  apps.push(app);
  const page = await app.inject("/ejemplo/formulario");
  expect(page.statusCode).toBe(200);
  expect(page.body).toContain('id="root"');
  expect((await app.inject("/assets/app.js")).statusCode).toBe(200);
  const missingApi = await app.inject("/api/v1/missing");
  expect(missingApi.statusCode).toBe(404);
  expect(errorResponseSchema.parse(missingApi.json()).error.code).toBe(
    "NOT_FOUND",
  );
});
