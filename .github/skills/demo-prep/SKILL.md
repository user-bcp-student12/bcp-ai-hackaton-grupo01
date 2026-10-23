---
name: demo-prep
description: "Prepare the demo: a polished README, demo script, architecture diagram, seed data and independent cutoff assessments. Use when the user mentions demo, pitch, presentation or handover."
---

# Demo prep

## Steps

1. **README.md** at the repo root (the audience reads it first). Start from the one `kickoff` wrote, and keep its Project structure section in step with `AGENTS.md`:
   - Name and a one-line pitch
   - Screenshot or GIF at the top
   - Problem → solution (3 sentences)
   - Features (what actually works, and honestly so)
   - Architecture: a mermaid diagram built from the `context:` in `openspec/config.yaml` and the changes' `design.md`
   - Tech stack
   - Run locally in at most 3 commands
   - Team members
   - How it was built: mention the agentic workflow (OpenSpec specs → one orchestrator agent assigning work → many Copilot worker agents building and cross-reviewing in parallel)

2. **`docs/DEMO.md`**: a 2–3 minute script:
   - Hook (15s): the problem, made relatable
   - Live demo (90s): the exact clicks and inputs, using deterministic seed data
   - How it works (30s): the architecture
   - What's next (15s)
   - **Backup plan**: link a pre-recorded video, and add a note in case the Wi-Fi or API dies

3. **Seed data**: make sure there's a script or fixture that puts the app into a demo-ready state in one command. Add it to `AGENTS.md`.

4. **Independent cutoff**: use the `demo-cutoff` skill at this and every agreed demo milestone. Pin a shared commit/scope and send it to external `tester` and `security` workers. Collect their real evidence; a conductor code walkthrough is not a substitute. Route confirmed demo blockers through normal bug issues and rerun both assessments on a new cutoff after fixes. Document simulated services/data and distinguish working behavior from pending or NOT RUN checks in `docs/DEMO.md`.

5. Open a PR with all of the above using the `open-pr` skill. Include the cutoff decision and reports. Do not call the demo ready with failed, blocked or stale evidence; if the prep PR changes more than the cutoff's three evidence files, assess the resulting candidate again before presenting or releasing it.
