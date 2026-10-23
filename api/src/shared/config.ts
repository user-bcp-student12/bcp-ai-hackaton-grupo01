import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const MAX_BALANCE_CENTS = 100_000_000;
const workspaceRoot = fileURLToPath(new URL("../../../", import.meta.url));
const integer = (minimum: number, maximum: number) =>
  z.coerce.number().int().min(minimum).max(maximum);

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: integer(1, 65_535).default(3000),
  DATABASE_PATH: z
    .string()
    .trim()
    .min(1)
    .default(".orchestrate/wallet-demo.sqlite"),
  WEB_ORIGIN: z
    .url()
    .refine((value) => {
      const url = URL.parse(value);
      return (
        url !== null &&
        ["http:", "https:"].includes(url.protocol) &&
        url.origin === value
      );
    })
    .default("http://localhost:5173"),
  DEMO_MODE: z
    .literal("true")
    .default("true")
    .transform(() => true),
  DEMO_KYC_RESULT: z
    .enum(["activa", "pendiente", "rechazada"])
    .default("activa"),
  DEMO_INITIAL_BALANCE_CENTS: integer(0, MAX_BALANCE_CENTS).default(100_000),
  PAYMENT_MAX_CENTS: integer(1, MAX_BALANCE_CENTS).default(50_000),
  SESSION_TTL_SECONDS: z.coerce.number().pipe(z.literal(3600)).default(3600),
  AUTH_RATE_LIMIT_MAX: integer(1, Number.MAX_SAFE_INTEGER).default(5),
  AUTH_RATE_LIMIT_WINDOW_SECONDS: integer(1, Number.MAX_SAFE_INTEGER).default(
    900,
  ),
  VITE_API_BASE_URL: z.literal("/api/v1").default("/api/v1"),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(
  env: Record<string, string | undefined> = process.env,
): Config {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid configuration fields: ${fields.join(", ")}`);
  }
  return {
    ...result.data,
    DATABASE_PATH: resolve(workspaceRoot, result.data.DATABASE_PATH),
  };
}
