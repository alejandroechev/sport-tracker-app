---
name: dev-loop
description: Mandatory development loop for the Sport Tracker App. Enforces strict TDD (RED→GREEN→REFACTOR per function), E2E + CLI tests per feature, pre-commit validation gates (coverage ≥90%, all tests pass, tsc clean), and commit checklist. Invoke before any implementation work.
---

# Dev Loop — Mandatory Development Workflow

## Pre-Development

- Read all ADRs in `docs/adrs/` before starting work.
- Do not contradict existing ADRs without explicit user approval.

<important>

## TDD Workflow (strict, per-function)

For **EVERY** function, component, or module:

1. **RED** — Write a failing test FIRST. Run it. Confirm it fails.
2. **GREEN** — Write the MINIMUM implementation to make the test pass. Run test. Confirm pass.
3. **REFACTOR** — Clean up code while keeping tests green. Run test again.

**NEVER write implementation code without a pre-existing failing test.**

Each cycle must be verified by actually running the test suite — do not assume outcomes.

</important>

## E2E and CLI Tests (per-feature)

- Write a **Playwright E2E test** for every user-facing feature.
- Execute a **CLI scenario** via the CLI for every feature to validate end-to-end behavior.

<important>

## Pre-Commit Validation Gate

You **CANNOT** commit until ALL of the following pass:

```bash
# 1. Unit tests with ≥90% coverage
npx vitest run --coverage

# 2. E2E tests
npx playwright test

# 3. TypeScript clean (zero errors)
npx tsc -b

# 4. Visual validation (UI features only) — screenshots via Playwright MCP
```

All four gates must be green before any `git commit` or `git add`.

</important>

## Commit Checklist

Before running `git commit`, verify every item:

- [ ] Every new function built with TDD (RED→GREEN→REFACTOR)?
- [ ] E2E tests exist for all new user-facing features?
- [ ] CLI scenarios executed?
- [ ] `npx vitest run --coverage` — coverage ≥90%?
- [ ] `npx playwright test` — all pass?
- [ ] `npx tsc -b` — zero errors?
- [ ] Screenshots taken and reviewed (UI features)?
- [ ] README updated (public-facing changes)?
- [ ] System diagram updated (architecture changes)?
- [ ] ADR written (major decisions)?

## Trigger Phrases

This skill is triggered by:

- "start dev loop"
- "dev loop"
- "begin development"
- "implement feature"
- Automatically invoked by **ralph-loop** during task execution
