import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, expect, test } from "vitest";
import { SqlitePaymentQueries } from "./sqlite-payment-queries.js";

// Mirrors the payments table of migration 004 in the payments Contract.
const paymentsTable = `
  CREATE TABLE payments (
    id TEXT PRIMARY KEY NOT NULL,
    source_wallet_id TEXT NOT NULL,
    destination_wallet_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`;

let database: DatabaseSync;

beforeEach(() => {
  database = new DatabaseSync(":memory:");
  database.exec(paymentsTable);
  const insert = database.prepare(
    "INSERT INTO payments VALUES (?, ?, ?, 'contact', 1000, 'PEN', 'SUCCEEDED', ?)",
  );
  insert.run("pay-a", "w1", "w2", "2026-10-23T10:00:00.000Z");
  insert.run("pay-b", "w3", "w1", "2026-10-23T11:00:00.000Z");
  insert.run("pay-x", "w2", "w3", "2026-10-23T12:00:00.000Z");
});

afterEach(() => {
  database.close();
});

test("lists only payments where the wallet is source or destination", () => {
  const queries = new SqlitePaymentQueries(database);

  const ids = queries.listForWallet("w1").map((payment) => payment.id);

  expect(ids.sort()).toEqual(["pay-a", "pay-b"]);
});

test("maps columns to the PaymentView fields", () => {
  const queries = new SqlitePaymentQueries(database);

  expect(queries.findForWallet("pay-a", "w2")).toEqual({
    id: "pay-a",
    sourceWalletId: "w1",
    destinationWalletId: "w2",
    recipientType: "contact",
    amountCents: 1000,
    currency: "PEN",
    status: "SUCCEEDED",
    createdAt: "2026-10-23T10:00:00.000Z",
  });
});

test("returns null for an unrelated wallet, same as a missing payment", () => {
  const queries = new SqlitePaymentQueries(database);

  expect(queries.findForWallet("pay-x", "w1")).toBeNull();
  expect(queries.findForWallet("pay-missing", "w1")).toBeNull();
});
