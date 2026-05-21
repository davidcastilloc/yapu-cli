# YAPU TESTS

---

## § Pre-Sync: Inherited Context Loading

Before executing any action in this workflow:

1. **Read `.planning/STATE.md`** if it exists → Identify active phase, current plan, and progress.
2. **Read `.planning/HANDOFF.json`** if it exists → Resume the exact state of the previous session.
3. **Read `.planning/.continue-here.md`** if it exists → Human continuation context.
4. **Read `.planning/phases/{active-phase}/CONTEXT.md`** if it exists → Phase decisions and context.

> If `.planning/` does not exist, request the user to run `yapu init` before continuing.
> If `HANDOFF.json` exists, you MUST read it and report the inherited state to the user before proceeding.

---

Act in [TEST GENERATION & VALIDATION MODE].

Your objective is to manage the full testing cycle: generate classified tests, audit requirement→test coverage (Nyquist), and execute conversational UAT with the user.

> Deep load: `@yapu-ref-tdd.md`, `@yapu-ref-verification-patterns.md`

---

## SUB-MODE 1: GENERATE — Classify Files and Generate Tests

Generates unit and E2E tests for a completed phase. Classifies each modified file, presents a plan for approval, then generates tests following RED-GREEN conventions.

### Step 1: Load Phase Context

Read phase artifacts (in order of priority):
1. `STATE.md` — goal and completed tasks of the phase
2. `*-SUMMARY.md` — what was implemented, changed files
3. `CONTEXT.md` — acceptance criteria, decisions

If no SUMMARY exists → **STOP**: "Phase not executed. Run yapu-execute first."

### Step 2: Classify Files

For each modified file, classify into one of three categories:

| Category | Criteria | Test Type |
|-----------|-----------|-------------|
| **TDD** | Pure functions: `expect(fn(input)).toBe(output)` is writable | Unit tests |
| **E2E** | UI behavior verifiable by browser automation | Playwright/E2E |
| **Skip** | Not significantly testable or already covered | None |

TDD signals: Business logic, calculations, validations, data transformations, parsers, state machines, utilities.

E2E signals: Keyboard shortcuts, navigation, forms, selection, drag-and-drop, modals, data grids (sort/filter/inline edit).

Skip signals: CSS layout/styling, configuration, glue code (DI setup, middleware registration, routing tables).

### Step 3: Present Test Plan — Approval GATE

```
## Test Plan — Phase {N}: {name}

| File | Category | Proposed Tests | Rationale |
|---------|-----------|-----------------|-------|
| src/pricing.ts | TDD | 4 unit tests | Price calculations with edge cases |
| src/pages/checkout.tsx | E2E | 2 flows | Submit + validation errors |
| src/config.ts | Skip | — | Static configuration |

**Total:** {N} unit + {M} E2E tests

Proceed with generation? (yes/modify/cancel)
```

> **⚠️ DO NOT generate tests without plan approval.** This gate prevents useless tests.

### Step 4: Generate Tests

For each approved file:
1. Read the complete implementation
2. Generate tests following project conventions (jest/vitest/pytest/etc.)
3. Run tests immediately to verify they pass
4. If it fails → fix or report as gap

### Step 5: Summary

```
## Generated Tests

✅ Unit: {N} tests in {M} files
✅ E2E: {N} flows in {M} files
⚠️ Gaps: {N} tests needing manual attention
```

---

## SUB-MODE 2: VALIDATE — Nyquist Coverage Audit

Audit that each requirement has at least one test validating it (Nyquist coverage: requirement → test mapping).

### Step 1: Detect State

- **VALIDATION.md exists** → audit existing
- **SUMMARY.md exists, no VALIDATION** → reconstruct from artifacts
- **No SUMMARY** → STOP: "Phase not executed"

### Step 2: Discovery

1. Read PLAN and SUMMARY — extract tasks, REQ-IDs, key files
2. Build requirement→task map: `{ task_id, requirement_ids, has_automated_test }`
3. Detect test infra:
   ```bash
   find . -name "jest.config.*" -o -name "vitest.config.*" -o -name "pytest.ini" 2>/dev/null | head -5
   find . \( -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" \) -not -path "*/node_modules/*" 2>/dev/null | head -30
   ```
4. Cross-reference: requirement → test_file → status

### Step 3: Gap Analysis

| Status | Criteria |
|--------|-----------|
| **COVERED** | Test exists, targets behavior, passes green |
| **PARTIAL** | Test exists but failing or incomplete |
| **MISSING** | No test found |

No gaps → mark `nyquist_compliant: true` and report.

### Step 4: Present Gap Plan

```
## Nyquist Coverage Audit

| REQ-ID | Requirement | Test File | Status |
|--------|-------------|-----------|--------|
| REQ-01 | Login flow  | auth.test.ts | COVERED |
| REQ-02 | Rate limit  | — | MISSING |

Coverage: {N}/{total} ({%})

Options:
1. Fix all gaps — generate missing tests
2. Skip — mark as manual-only
3. Cancel
```

---

## SUB-MODE 3: UAT — Conversational User Verification

Conversational testing: show the expected, the user confirms, record result, feed gaps back to planning.

> Philosophy: **Show what is expected, ask if reality matches.** No Pass/Fail buttons. No severity questions. Only: "This should happen. Does it?"

### Step 1: Verify Active Sessions

```bash
find .planning/phases -name "*-UAT.md" -type f 2>/dev/null
```

- Active sessions AND no arguments → show sessions table, ask which to resume
- Active sessions AND with phase argument → offer to resume or restart
- No sessions → ask for phase number to start

### Step 2: Extract Tests from SUMMARY.md

For each testable deliverable in the SUMMARY, generate a UAT checkpoint:

```markdown
### Test {N}: {nombre}
**Expected:** {behavior that should be observed}
**How to verify:** {step-by-step instructions}
```

### Step 3: Testing Loop (one at a time)

Present one test at a time. Interpret answers:
- "yes" / "y" / "next" / empty → **PASS**
- Anything else → **ISSUE** (infer severity from context)

Record each result in `*-UAT.md` with timestamp.

### Step 4: Session Closure

```
## UAT Results — Phase {N}

✅ Passed: {N}/{total}
⚠️ Issues: {N} (details below)
❌ Blocked: {N}

### Issues Found
1. [severity] {description} → feed back to planning as gap
```

Write gaps to the format that `yapu-plan` can consume with `--gaps`.

---

## ANTI-PATTERNS

- ❌ Generating tests without presenting the plan first (mandatory gate)
- ❌ Classifying config/glue files as TDD — they produce fragile tests
- ❌ Assuming Nyquist coverage without requirement→test cross-reference
- ❌ Asking the user for severity during UAT — infer it from the context
- ❌ Presenting multiple UAT tests at once — one by one, always


---

## § Post-Sync: State Persistence

Upon completing the execution of this workflow:

1. **Update `.planning/STATE.md`** with the progress made:
   - Mark completed tasks `[x]`
   - Update the active phase if it changed
   - Record key decisions made during this session

2. **Write phase artifacts** as appropriate:
   - If you generated a plan → `.planning/phases/{phase}/XX-YY-PLAN.md`
   - If you completed execution → `.planning/phases/{phase}/XX-YY-SUMMARY.md`
   - If you generated verification → `.planning/phases/{phase}/XX-VERIFICATION.md`

3. **Generate `.planning/.continue-here.md`** with:
   - What was done in this session
   - What remains pending
   - Blocking constraints (if any)
   - Recommended next action

4. **Delete `.planning/HANDOFF.json`** if you successfully consumed it.
