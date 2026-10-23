import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import type { FastifyInstance } from "fastify";
import { errorResponseSchema } from "@wallet/contracts";
import {
  accountResponseSchema,
  sessionResponseSchema,
} from "@wallet/contracts/auth";
import { registrationResponseSchema } from "@wallet/contracts/onboarding";
import { buildApp } from "../../api/src/app.js";
import { loadConfig, type Config } from "../../api/src/shared/config.js";

type KycResult = Config["DEMO_KYC_RESULT"];

const credentials = {
  documentType: "DNI",
  documentNumber: "12345678",
  password: "012345",
} as const;
const registration = {
  ...credentials,
  phone: "912345678",
  email: "ana.demo@example.test",
} as const;
const openingBalanceCents = 100_000;

const apps: FastifyInstance[] = [];
let directory: string;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "wallet-e2e-"));
});
afterEach(async () => {
  for (const app of apps.splice(0)) await app.close();
  rmSync(directory, { recursive: true });
});

// Each app shares the same SQLite file, so a second start reads what the first wrote.
async function startApp(kyc: KycResult = "activa") {
  const app = await buildApp({
    config: loadConfig({
      NODE_ENV: "test",
      DATABASE_PATH: join(directory, "demo.sqlite"),
      DEMO_KYC_RESULT: kyc,
    }),
    logger: false,
  });
  apps.push(app);
  return app;
}

async function register(app: FastifyInstance) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/users",
    payload: registration,
  });
  expect(response.statusCode).toBe(201);
  return registrationResponseSchema.parse(response.json()).user;
}

async function login(app: FastifyInstance) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: credentials,
  });
  expect(response.statusCode).toBe(201);
  return sessionResponseSchema.parse(response.json());
}

async function fetchAccount(app: FastifyInstance, accessToken: string) {
  const response = await app.inject({
    method: "GET",
    url: "/api/v1/me",
    headers: { authorization: `Bearer ${accessToken}` },
  });
  expect(response.statusCode).toBe(200);
  return accountResponseSchema.parse(response.json());
}

test.each([
  { kyc: "activa", active: true },
  { kyc: "pendiente", active: false },
  { kyc: "rechazada", active: false },
] as const)(
  "registration, login and own account for KYC $kyc",
  async ({ kyc, active }) => {
    const app = await startApp(kyc);
    const user = await register(app);
    expect(user).toMatchObject({
      kycStatus: kyc,
      active,
      walletId: active ? expect.any(String) : null,
    });

    const session = await login(app);
    expect(session.user).toEqual(user);

    const account = await fetchAccount(app, session.accessToken);
    expect(account.user).toEqual(user);
    expect(account.wallet).toEqual(
      active
        ? {
            id: user.walletId,
            currency: "PEN",
            balanceCents: openingBalanceCents,
          }
        : null,
    );
  },
);

test("wrong password gets the same 401 as an unknown document", async () => {
  const app = await startApp();
  await register(app);

  const wrongPassword = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { ...credentials, password: "999999" },
  });
  const unknownDocument = await app.inject({
    method: "POST",
    url: "/api/v1/sessions",
    payload: { ...credentials, documentNumber: "87654321" },
  });

  expect(wrongPassword.statusCode).toBe(401);
  expect(unknownDocument.statusCode).toBe(401);
  expect(errorResponseSchema.parse(wrongPassword.json()).error.code).toBe(
    "INVALID_CREDENTIALS",
  );
  expect(wrongPassword.json()).toEqual(unknownDocument.json());
  expect(wrongPassword.json()).not.toHaveProperty("accessToken");
});

test("registration and wallet survive an application restart", async () => {
  const first = await buildApp({
    config: loadConfig({
      NODE_ENV: "test",
      DATABASE_PATH: join(directory, "demo.sqlite"),
    }),
    logger: false,
  });
  const user = await register(first);
  const oldSession = await login(first);
  await first.close();

  const restarted = await startApp();
  const newSession = await login(restarted);
  const account = await fetchAccount(restarted, newSession.accessToken);

  expect(account.user).toEqual(user);
  expect(account.wallet?.balanceCents).toBe(openingBalanceCents);
  expect((await fetchAccount(restarted, oldSession.accessToken)).user).toEqual(
    user,
  );
});
