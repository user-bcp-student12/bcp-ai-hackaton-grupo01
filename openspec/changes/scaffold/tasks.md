# Tasks

## 1. Initialize backend runtime and persistence tooling
<!-- issue: area=backend size=M priority=p0 assignee=user-bcp-student36 files=package.json,package-lock.json,api/,packages/contracts/src/common.ts,.env.example -->
- [ ] 1.1 Probe Node 24 node:sqlite on Windows before selecting exact versions; record working versions or stop for a human decision on failure.
- [ ] 1.2 Create strict npm workspace/API/contracts tooling, health, typed config/error mapper, migration ledger and non-destructive seed entry; verify API starts and invalid config fails.
- [ ] 1.3 Record backend install/test commands and SQLite assumptions in AGENTS/standards; verify each recorded command runs.
- [ ] 1.4 Test health 200/503, unknown API 404, invalid config, redacted errors and real SQLite restart persistence through public runtime surfaces.

## 2. Build design primitives and verify the local workspace
<!-- issue: area=frontend size=M priority=p0 assignee=user-bcp-student36 depends=1 files=web/,package.json,package-lock.json,AGENTS.md,README.md,.github/instructions/ -->
- [ ] 2.1 Build React/Vite shell, tokens, labeled Input/Button/Status, visible focus and loading/error/disclaimer; verify keyboard behavior in component tests.
- [ ] 2.2 Wire Router/Query, typed HTTP client, same-origin API proxy and built-web local serving; verify shell calls health successfully and API 404 stays JSON.
- [ ] 2.3 Fill actual Install/Dev/Lint/Test/Build/Seed commands, ownership, exact versions and local Deploy steps; verify Commands via check and note explicit no-public-deploy exception.
- [ ] 2.4 Test accessible shell, health integration and repeatable seed runner with a technical fixture (no wallet tables yet); run workspace lint/typecheck/test/build and report real results.
