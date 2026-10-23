# Planning personalities and external quality workers

The conductor coordinates four specialists; the existing implementation lanes remain `frontend` and `backend`.

| Personality | When | Responsibility |
|---|---|---|
| `product-owner` | Kickoff and scope changes | Rank stories and task groups by outcome, demo value, risk, effort and dependencies; recommend p0/p1/p2 and cutoffs |
| `architect` | Before initialization and when boundaries/contracts change | Review feasibility, scaffold, components, lane ownership, API contracts, simulations and testability |
| `tester` | Each demo cutoff and final handoff | Execute checks and scenario-based functional/API/persistence verification; report real evidence |
| `security` | Each demo cutoff and final handoff | Assess trust boundaries and OWASP ASVS concerns; report evidenced findings and reproducible verification |

The Architect, Tester and Security personalities adapt the responsibilities of the referenced CrewAI project's `agents/architect.py`, `agents/testing.py` and `agents/security.py`. That project's `.github` directory did not contain personalities or a Product Owner; the Product Owner is new. No CrewAI runtime, local source path or credentials are required.

## Kickoff

Run `/kickoff <idea>` in VS Code with the conductor, or start `copilot --agent conductor` in the repository and ask it to use the kickoff skill.

The sequence is Product Owner ranking, Architect feasibility/initialization, Product Owner reconciliation, then human scope approval. The conductor writes the approved brief and OpenSpec artifacts. Priorities live in task metadata; contracts live in each design's `## Contracts`. The specialists advise; the orchestrator creates and assigns the resulting issues after the spec PR merges.

## A cutoff, on this machine or a teammate's

In the conductor session, run `/demo-cutoff demo-01` in VS Code, or ask the CLI conductor to use the `demo-cutoff` skill. Agree the scope and candidate. The conductor resolves a full SHA and prepares a cutoff brief; both external workers receive the same brief and SHA.

After these agent files are merged and a committed candidate exists, create dedicated review folders from the team repo:

```text
node scripts/orchestrate.mjs worktree qa-demo-01
node scripts/orchestrate.mjs worktree security-demo-01
```

The script initially detaches each worktree at the team's current main. In **each** new folder, ensure it is clean, then pin the shared candidate (replace `<target-sha>` with the actual full SHA):

```text
git status --short
git checkout --detach <target-sha>
git rev-parse HEAD
```

These explicit detached checkouts are cutoff setup, not implementation branch creation. Do not run `orchestrate.mjs start` afterward: it would move the snapshot. Do not follow the worktree command's generic `/work` suggestion for these folders.

On another machine, use a separate clean clone of the team's repo and the same detached checkout. Fetch the candidate's shared branch first if its commit is not yet local; do not substitute the latest main. Do not run two review sessions in one folder or share mutable databases/ports.

In the tester folder:

```text
copilot --agent tester
```

In the security folder:

```text
copilot --agent security
```

Give each session the cutoff brief, id, full SHA, scope and authorized local test targets. Keep the normal interactive permission prompts; do not grant unrestricted shell access or production secrets. In VS Code, open each folder separately and use `/test-cutoff` or `/security-cutoff` with the same inputs. These are repository prompt files for VS Code; in CLI use the named agent and its instructions.

Each role verifies its snapshot before running checks. Missing application commands, unavailable browser/API environments, missing source criteria or unsafe prerequisites are explicit blockers, not a passing assessment.

## Evidence and decisions

Workers return `docs/quality/demo-01/testing_report.md` and `docs/quality/demo-01/security_report.md`. Transfer them to the conductor through the team's approved channel; gitignored logs alone are not a durable report. The conductor collects them with `docs/quality/demo-01/cutoff.md` through the normal artifact PR/review process.

Both reports must cover the same SHA and scope. Required checks not run, failures, stale reports and unresolved blocking security findings prevent readiness. Human disposition is required for nonblocking residual risks. Fixes go through the normal issue/worker/PR flow, followed by a new cutoff id and fresh reports; the reviewers do not fix code during assessment.

The final cutoff and release use the same rule: any change beyond that cutoff's three evidence files invalidates the old assessment. See the [demo-cutoff skill](../.github/skills/demo-cutoff/SKILL.md) for the complete gate. This is an agent-procedure gate; `orchestrate.mjs` still enforces only its existing PR checks.
