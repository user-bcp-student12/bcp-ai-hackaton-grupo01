import { expect, test } from "vitest";
import { loadConfig } from "./config.js";

test("Approved demo defaults", () => {
  const config = loadConfig({});
  expect(config.PORT).toBe(3000);
  expect(config.DEMO_MODE).toBe(true);
  expect(config.DEMO_KYC_RESULT).toBe("activa");
  expect(config.DEMO_INITIAL_BALANCE_CENTS).toBe(100_000);
  expect(config.PAYMENT_MAX_CENTS).toBe(50_000);
  expect(config.SESSION_TTL_SECONDS).toBe(3600);
});

test.each([
  ["PORT", "not-a-port"],
  ["PORT", "0"],
  ["DEMO_MODE", "false"],
  ["DEMO_KYC_RESULT", "unknown"],
  ["DEMO_INITIAL_BALANCE_CENTS", "-1"],
  ["PAYMENT_MAX_CENTS", "0"],
  ["PAYMENT_MAX_CENTS", "1.5"],
  ["SESSION_TTL_SECONDS", "7200"],
  ["AUTH_RATE_LIMIT_MAX", ""],
  ["WEB_ORIGIN", "*"],
  ["WEB_ORIGIN", "https://example.test/path"],
  ["DATABASE_PATH", ""],
])("Invalid demo configuration: %s", (field, value) => {
  expect(() => loadConfig({ [field]: value })).toThrow(
    `Invalid configuration fields: ${field}`,
  );
});

test("Configuration diagnostics omit invalid supplied values", () => {
  expect(() => loadConfig({ PORT: "private-value" })).toThrow("PORT");
  expect(() => loadConfig({ PORT: "private-value" })).not.toThrow(
    "private-value",
  );
});
