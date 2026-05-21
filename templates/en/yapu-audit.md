# YAPU AUDIT

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

Act in [AUDIT MODE].

Your objective is to run project audits with three sub-modes: (1) audit-fix to automatically classify and repair findings, (2) audit-milestone to verify definition-of-done with REQ-ID traceability, (3) audit-uat to detect pending UAT items with obsolete test detection.

> Deep load: `@yapu-ref-verification-patterns.md`, `@yapu-ref-source-audit.md`

---

## SUB-MODE 1: AUDIT-FIX — Classify → Repair Pipeline

Autonomous pipeline: audit → classify → fix → test → atomic commit.

### Step 1: Collect Findings

Scan verification and UAT artifacts of the project:
```bash
find .planning/phases -name "*-UAT.md" -o -name "*-VERIFICATION.md" 2>/dev/null
```

Parse each finding into a structured record:
- **ID** — sequential (F-01, F-02, ...)
- **description** — concise summary
- **severity** — high / medium / low
- **file_refs** — specific referenced paths

### Step 2: Classify (err towards manual-only)

| Classification | Signals |
|---------------|---------|
| **auto-fixable** | Specific file+line reference, missing test, incorrect export/import, single-file change with obvious behavior |
| **manual-only** | Words like "consider"/"evaluate"/"design", architecture/API changes, ambiguous scope, multiple valid approaches, cross-cutting concerns |
| **skip** | Severity below the configured threshold |

> **⚠️ GOLDEN RULE: When in doubt, classify as manual-only.** A false negative (not fixing something that is fixable) is cheap. A false positive (fixing something that requires design) is destructive.

### Step 3: Present Classification Table

```
## Audit-Fix Classification

| # | Finding | Severity | Classification | Reason |
|---|----------|-----------|---------------|-------|
| F-01 | Missing export in index.ts | high | auto-fixable | Specific file, clear fix |
| F-02 | No error handling in payment | high | manual-only | Requires design decisions |
```

If in `--dry-run` mode → **STOP here**. The table is the final output.

### Step 4: Fix Loop (default max 5 findings)

For each auto-fixable, sorted by descending severity:

1. **Implement** the minimum change to resolve the specific finding — without collateral refactoring
2. **Run related tests** immediately
3. **Atomic commit** with finding ID: `fix: F-{ID} — {description}`
4. If test fails → revert and reclassify as manual-only

### Step 5: Summary

```
## Audit-Fix Results

✅ Repaired: {N} of {total}
⚠️ Manual-only: {N} (require human intervention)
❌ Reverted: {N} (fix failed tests)
```

---

## SUB-MODE 2: AUDIT-MILESTONE — Definition-of-Done Verification

Verifies that a milestone meets its definition of done by aggregating phase verifications, checking cross-phase integration, and evaluating requirement coverage.

### Step 1: Determine Milestone Scope

1. Read `ROADMAP.md` to extract: version, name, phases, definition-of-done
2. Identify all phase directories in scope
3. Extract REQ-IDs mapped to this milestone from `REQUIREMENTS.md`

### Step 2: Read Phase Verifications

For each phase directory, read `*-VERIFICATION.md`:

| Field | Extract |
|-------|---------|
| Status | passed / gaps_found |
| Critical gaps | Blockers |
| Non-critical gaps | Tech debt, deferred |
| Anti-patterns | TODOs, stubs, placeholders |
| Coverage | REQ-IDs satisfied/blocked |

> **Phase without VERIFICATION.md = unverified phase = BLOCKER.**

### Step 3: Cross-Reference of 3 Sources (REQ-ID Traceability)

For each REQ-ID of the milestone, cross-reference three independent sources:

| Source | Purpose |
|--------|-----------|
| **REQUIREMENTS.md** | Original definition |
| **VERIFICATION.md** | Compliance evidence |
| **Actual codebase** | Grep/Read to confirm implementation |

A REQ-ID is only **COVERED** if it appears in all 3 sources. If it is missing from any → **GAP**.

### Step 4: Milestone Report

```markdown
## Milestone Audit: v{version} — {name}

| REQ-ID | Description | REQS.md | VERIF.md | Code | Status |
|--------|-------------|---------|----------|--------|--------|
| REQ-01 | Auth flow   | ✅      | ✅       | ✅     | COVERED |
| REQ-02 | Rate limit  | ✅      | ❌       | ✅     | GAP    |

**Verdict:** {READY / NOT READY — with gaps listed}
```

---

## SUB-MODE 3: AUDIT-UAT — Pending Cross-Phase Items

Cross-phase audit of UAT and verification files. Detects pending items and obsolete tests.

### Step 1: Scan Artifacts

```bash
find .planning/phases -name "*-UAT.md" -o -name "*-VERIFICATION.md" 2>/dev/null
```

If there are no pending items → `✅ All Clear — no pending UAT items.` → STOP.

### Step 2: Categorize by Actionability

**Testable NOW** (without external dependencies):
- `pending` — tests never executed
- `human_uat` — human verification pending
- `skipped_unresolved` — skipped without clear block reason

**Needs Prerequisites:**
- `server_blocked` — needs external server
- `device_needed` — physical device
- `build_needed` — release/preview build
- `third_party` — external service

### Step 3: Obsolete Test Detection

For each "Testable NOW" item, verify against the actual codebase:

- **stale** — the referenced component/function no longer exists
- **needs_update** — the code was significantly rewritten
- **active** — the test is still relevant

```bash
# Verify existence of referenced files/functions
grep -r "{function_name}" src/ --include="*.ts" --include="*.tsx" -l
```

### Step 4: Report and Action Plan

```
## UAT Audit Report

**{total} pending items in {N} files of {M} phases**

### Testable Now ({N})
| # | Phase | Test | Description | Status |
|---|------|------|-------------|--------|

### Needs Prerequisites ({N})
| # | Phase | Test | Blocked By | Description |

### Stale — close ({N})
| # | Phase | Test | Reason for Obsolescence |

## Recommended Actions
1. Close stale items
2. Execute active tests (UAT plan below)
3. When prerequisites are ready, re-test blocked items
```

---

## ANTI-PATTERNS

- ❌ Classifying something that requires design decisions as auto-fixable
- ❌ Fixing more than 5 findings without re-evaluating
- ❌ Marking a REQ-ID as COVERED without verifying in all 3 sources
- ❌ Ignoring stale tests — they pollute coverage metrics
- ❌ Running audit-fix in non-dry-run mode without reviewing the classification first


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
