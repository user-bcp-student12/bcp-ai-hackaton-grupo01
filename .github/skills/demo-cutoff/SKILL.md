---
name: demo-cutoff
description: Coordinate independent Tester and Security workers at any demo cutoff or final handoff. Pin one commit and scope, collect reproducible evidence and block readiness on failures, missing checks or stale reports.
---

# Demo cutoff

Use at every agreed demo checkpoint and before the final release. This is a conductor-coordinated readiness gate, not a replacement for per-PR checks/review. It does not add assignment lanes or change `orchestrate.mjs`'s merge enforcement.

## 1. Pin the candidate

- Require a committed, shared candidate and an agreed demo scope. If no commit/scaffold exists yet, report BLOCKED; do not manufacture passing reports.
- Agree a unique cutoff id using lowercase letters, numbers and hyphens, for example `demo-01`. Do not reuse a completed cutoff id for different code.
- In a clean conductor folder, inspect `git status --short` and resolve the full commit with `git rev-parse HEAD` (or the agreed ref). Record the full SHA, not just a moving branch name.
- Write `docs/quality/<cutoff>/cutoff.md` with target SHA, date, in-scope stories/spec scenarios, demo steps, required checks, synthetic fixtures/simulated services, authorized local targets and known assumptions/questions. Include report destinations and pending verdicts. Share this exact brief with both workers.
- A candidate may be an intermediate merged snapshot while builders continue. Later commits are not covered by this cutoff.

## 2. Start external specialists

Use two independent sessions, each in its own clone/worktree on the target SHA; never the builder's active folder. See `docs/quality-workers.md` for commands. A separate teammate can run each session on another machine.

- `tester`: follow `.github/agents/tester.agent.md`; return `docs/quality/<cutoff>/testing_report.md`.
- `security`: follow `.github/agents/security.agent.md`; return `docs/quality/<cutoff>/security_report.md`.

Supply each worker the cutoff brief, full SHA and scope. They do not call `work`, `done` or `tick`, register in the worker registry, or select an implementation lane. They may run in parallel against separate local services/databases. Give Security the tester report afterward to reconcile evidence on the same SHA.

## External-worker contract

1. Check `git status --short` and `git rev-parse HEAD` before work. Stop for a dirty tree, SHA mismatch, missing scope or unsafe environment. Do not stash or overwrite someone else's work.
2. Read the role profile, applicable standards, brief/specs/contracts and cutoff brief. Use local synthetic data and isolated services/ports. Never copy production credentials into review folders.
3. Run authorized checks and capture sanitized real results. PASS/FAIL/NOT RUN describe individual checks; required NOT RUN means a BLOCKED overall verdict. A proposed command is not evidence of execution.
4. Do not edit product code, tests, contracts or fixtures during assessment. The only authored repository file is the role's report. Logs/captures may go in that worktree's gitignored `.orchestrate/`; summarize the necessary evidence in the report so it survives transfer.
5. Return the report file, target SHA and PASS/FAIL/BLOCKED. Hand the file to the conductor via the team's approved channel or an artifact-only branch. Do not merge, open feature issues, mark tasks complete or release. Do not delete evidence.

## 3. Reconcile and persist

The conductor collects both reports into the candidate's artifact PR. Check that both name the same SHA, cutoff and scope, and that commands/results and scenario coverage support the verdicts.

- FAIL: route demonstrated defects into the normal bug/issue/PR flow. Do not turn speculative risks into confirmed bugs.
- BLOCKED: obtain missing access/evidence or a human scope decision; do not claim the cutoff is ready.
- Confirmed critical/high or demo-path-blocking security findings prevent readiness. Record the human's explicit disposition for any medium/low residual risks, with rationale and owner.
- Any implementation, test, contract, fixture, configuration or dependency change requires a new cutoff id/SHA and fresh reports from both roles. Never relabel old evidence as a new run.
- Record the conductor's final PASS/FAIL/BLOCKED decision in `cutoff.md`, with report links, unresolved items, simulations, human risk dispositions and what remains pending. Persist all three files through a normal PR with the `open-pr` and `review-pr` gates; never commit directly to main.

## 4. Demo/release decision

Only call a cutoff ready when both reports PASS, all required checks/scenarios ran, and blocking findings are resolved. Synthetic tests establish demo behavior, not production interoperability, legal approval, MAU, CAC or real-world funnel improvements.

Before release, verify that the accepted target SHA is the release candidate, or that the only changes since it are the three evidence files for that cutoff. Inspect `git diff --name-only <target-sha> <release-candidate-sha>` and reject any other changed file. Record both SHAs in the decision when evidence-only commits intervene. If anything else changed, run a new cutoff.

The `ship-release` skill still requires its normal fresh-main checks. Neither report author can approve or merge their own artifact PR. This readiness gate is enforced by these agent procedures, not by a new script-level lock.
