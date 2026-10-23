## Contracts

All feature URLs use `/api/v1`; API JSON rejects unknown input properties.
IDs are opaque nonempty strings (maximum 100 characters); timestamps are UTC ISO
8601 strings. Money is safe integer cents, currency `"PEN"` only.

`GET /api/v1/health`: no body/auth; `200 {"status":"ok","simulated":true}` after
database readiness; `503` with the common error if storage is unavailable.
No personal information, paths or config values in health output.

Common error: `{"error":{"code":string,"message":string}}`.
Only validation adds `details:[{"field":string,"code":string}]` inside `error`;
never submitted values. Common statuses: `400 VALIDATION_ERROR`, `401
UNAUTHENTICATED`, `403 ACCOUNT_INACTIVE`, `404 NOT_FOUND`, `429 RATE_LIMITED`,
`500 INTERNAL_ERROR`, `503 STORAGE_UNAVAILABLE`. Feature contracts refine codes.
Messages are safe Spanish text; clients branch on codes, not message wording.
Unexpected errors are logged through Pino with sensitive fields removed.
Unmatched API routes return `404 NOT_FOUND` JSON, not the web HTML fallback.
HTTP authentication syntax and session semantics are owned by `auth/design.md`.

`packages/contracts/src/common.ts` implements these common schemas; feature files
own their schemas. No product tables in scaffold, only migration bookkeeping:
`schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`.
Feature migrations are `001-onboarding.sql`, `002-auth.sql`, `003-contacts.sql`,
`004-payments.sql`; run by ordered filename, each transactionally and once.

Validated env (scaffold owns initial `.env.example`, never real `.env`):

| Variable | Demo default / constraint |
|---|---|
| NODE_ENV | development; also test/production |
| HOST / PORT | 127.0.0.1 / 3000; valid port |
| DATABASE_PATH | `.orchestrate/wallet-demo.sqlite`; never served or committed |
| WEB_ORIGIN | http://localhost:5173; exact allowed origin, no wildcard |
| DEMO_MODE | true required for this simulated application |
| DEMO_KYC_RESULT | activa; enum activa/pendiente/rechazada |
| DEMO_INITIAL_BALANCE_CENTS | 100000; safe integer 0..100000000 |
| PAYMENT_MAX_CENTS | 50000; safe integer 1..100000000 |
| SESSION_TTL_SECONDS | 3600; fixed demo policy |
| AUTH_RATE_LIMIT_MAX | 5; positive integer |
| AUTH_RATE_LIMIT_WINDOW_SECONDS | 900; positive integer |
| VITE_API_BASE_URL | /api/v1; public value, no secrets |

Every feature references these env definitions rather than redefining them.
Node 24 exact version is recorded only after a real Windows `node:sqlite` probe.
No memory fallback on driver/config/DB failure.

## Context

Only the workflow kit exists. All runtime files below are planned additions.
The human approved a local demo instead of the usual public deployment.

## Goals / Non-Goals

**Goals:** quickly unblock two lanes, reproducible commands and persisted data.
**Non-Goals:** product logic, hosting, real KYC, funds or a remote-provider SDK.

## Decisions

- npm workspaces for `api`, `web`, `packages/contracts`; strict ESM TypeScript.
  Prefer built-in SQLite over external native drivers, subject to early probe.
- Fastify `buildApp(deps)` owns composition; server only listens. Feature use cases
  are supplied through plugin options; later route registration edits are ordered.
- Use SQLite foreign keys, busy timeout and explicit transactions; a single Node
  instance owns one local DB. Migration failures stop startup with a clear error.
- Vite proxies `/api` locally. Production-shaped local start serves compiled web
  and API from one process, API routes before SPA fallback. CORS only WEB_ORIGIN.
- Group 1 establishes backend/contracts/config; group 2 is the first frontend
  group and builds tokens, accessible controls and page shell, then verifies all
  workspace scripts. Every screen depends on group 2.
- Planned commands: `npm ci`, `npm run dev`, `npm run lint`, `npm test`,
  `npm run build`, `npm run seed:demo`, `npm start`. `npm test` includes
  typecheck and real tests. Do not fill Commands with unverified commands.

## Risks / Trade-offs

- [SQLite support] -> probe Windows before building features; failure blocks,
  requiring a human-approved alternative, not a dependency substitution.
- [Scaffold critical path] -> reserve conductor, avoid public deployment; no
  promise that the reduced p0 fits the remaining time.
- [Shared root files] -> group 2 follows group 1; later backend registrations
  follow the dependency chain rather than concurrent edits to app.ts.

## Migration Plan

No existing product data. Create the migration ledger without destructive reset.
Seed is explicit/idempotent, not a startup reset. Persist data across restarts;
clean up only test-created temporary databases after connections close.
Record actual local URLs and verified start/build commands in AGENTS Deploy.

## Traceability

Health -> Fastify HTTP test; invalid config/DB -> startup failure tests;
restart persistence -> real temporary SQLite test; shell -> Testing Library;
reproducible commands -> conductor check evidence. Demo readiness later requires
independent tester/security at the same immutable p0 commit, not this spec PR.
