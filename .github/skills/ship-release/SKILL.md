---
name: ship-release
description: Cut a tagged release from main with an auto-generated changelog and verify the deploy. Use when the user says "release", "tag a version", "deploy", "ship the demo build", or before the demo.
---

# Ship a release

## Steps

1. **Gate.** All of these must hold:
   - Use `node scripts/orchestrate.mjs start` in a clean release folder to detach at the team's latest main; never check out the shared `main` branch
   - The `check` skill passes on a fresh `main`
   - No open `priority:p0` PRs that are meant to be in this release
   - Finished OpenSpec changes are archived (`openspec list`), so `openspec/specs/` describes what you're shipping
   - The demo path works locally. Run through the demo script in the `context:` of `openspec/config.yaml`.
   - The final `demo-cutoff` decision and both external Tester/Security reports PASS for the release candidate. Apply that skill's exact-SHA/evidence-only diff rule; new code, tests, contracts, configuration or dependencies require a new cutoff. Required NOT RUN checks and unresolved blocking findings prevent release.

2. **Pick a version**: use `v0.x.0` while iterating, and `v1.0.0` for the demo build.
   ```
   git rev-parse HEAD
   gh release create v<X.Y.Z> --target <verified-release-sha> --generate-notes --title "v<X.Y.Z>: <name>"
   ```
   Use the full SHA verified by the gate for `--target`; do not let a moving default branch choose the released commit.
   Release notes are generated from merged PR titles, which is why PR titles must be clean.

3. **Deploy.** Follow the "Deploy" section in `AGENTS.md`. If the deploy isn't automated yet, write the exact steps you ran into `AGENTS.md` so the next person can repeat them.

4. **Smoke test** the deployed URL: load the app, then run the 3–5 demo steps.

5. **Freeze**: within the last hour before the demo, recommend that only `fix:` PRs touching the demo path get merged.

Report the release URL, the deploy URL, and the smoke-test result.
