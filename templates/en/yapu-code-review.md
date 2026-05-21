# YAPU CODE REVIEW (CODE REVIEW)

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

Act in [CODE REVIEW MODE].

Your objective is to review source files changed during a phase for bugs, security issues, and quality problems. Then, optionally apply iterative auto-fixes (capped at 3 rounds). Output: `REVIEW.md` + optional `REVIEW-FIX.md`.

> Deep load: `@yapu-ref-common-bugs.md`, `@yapu-ref-verification-patterns.md`

---

## PART 1: REVIEW

### STEP 1: INITIALIZE

1. Identify the phase to review (from argument)
2. Read `STATE.md` → active phase, status
3. Validate that the phase exists in `ROADMAP.md` → if not: error and exit

**Optional Flags:**
| Flag | Effect |
|------|--------|
| `--files=a.ts,b.ts` | File scope override (Tier 1) |
| `--depth=quick\|standard\|deep` | Review depth |

### STEP 2: RESOLVE FILE SCOPE

Three tiers with explicit precedence:

#### Tier 1 — `--files` override (highest priority)

If `--files` is present:
- Split by comma into a list of files
- **Validate** that each path is within the repo (prevent path traversal)
- Verify existence of each file
- Skip Tiers 2 and 3

#### Tier 2 — SUMMARY.md Extraction (primary)

If `--files` is NOT present:
- Look for `*-SUMMARY.md` in the phase directory
- Extract paths from `key_files.created` and `key_files.modified`
- If no files are extracted → fall back to Tier 3

#### Tier 3 — Git Diff Fallback

If there is no SUMMARY.md or it does not contain paths:
- Determine base commit of the phase via `git log --grep`
- `git diff --name-only {base}..HEAD`
- **Automatic exclusions:** `.planning/`, `ROADMAP.md`, `STATE.md`, `*-SUMMARY.md`, `*-PLAN.md`, lock files
- If there is no reliable base → **fail closed** (do not use arbitrary `HEAD~N`) → ask for `--files`

#### Post-processing (all tiers)

Filter resulting files:
- Remove paths from `.planning/` and artifacts
- Remove non-existent files (already deleted)
- Deduplicate
- If 0 files remain → "No files to review" → exit

### STEP 3: EXECUTE REVIEW

For each file in scope:

| Category | What to look for |
|-----------|------------|
| **Bugs** | Null refs, race conditions, off-by-one, logic errors |
| **Security** | Injection, auth bypass, exposed secrets, path traversal |
| **Quality** | Code smells, excessive complexity, duplication, naming |
| **Correctness** | Does the code do what it claims to do? Edge cases? |

**Finding Severity:**

| Level | Description | Auto-fix? |
|-------|-------------|-----------|
| 🔴 **Critical** | Active bug or vulnerability | Yes |
| 🟡 **Warning** | Potential issue, should be fixed | Yes |
| 🟢 **Info** | Suggested improvement, not urgent | No (by default) |

### STEP 4: GENERATE REVIEW.md

Write `{phase_dir}/{padded_phase}-REVIEW.md`:

```markdown
# Code Review: Phase {N} — {Name}

## Summary
- Files reviewed: {count}
- Findings: {critical} critical, {warnings} warnings, {info} info
- Scope: {tier used}

## Findings

### 🔴 Critical

#### [CR-001] {Finding Title}
- **File:** `{path}:{line}`
- **Description:** {what is wrong}
- **Impact:** {what can happen}
- **Suggested Fix:** {how to fix it}

### 🟡 Warning
...

### 🟢 Info
...

## Files Reviewed
- `{path}` — {status summary}
```

---

## PART 2: AUTO-FIX

### STEP 5: DETERMINE WHAT TO FIX

**Fix Scope:**
- Default: only 🔴 Critical + 🟡 Warning
- With `--all`: also 🟢 Info

**Prerequisite:** REVIEW.md must exist → if not: "Run `yapu-code-review` first."

### STEP 6: APPLY FIXES (Max 3 rounds)

```
Round 1: Apply fixes → Re-review affected files
Round 2: Fix regressions → Re-review
Round 3: Final fixes → If issues remain: document as residual
```

**In each round:**
1. Apply the suggested fix in REVIEW.md
2. Verify that the fix does not introduce regressions
3. Re-review only the files modified in this round
4. If new findings appear → next round
5. If no new findings → finished

**STRICT CAP: 3 rounds.** After 3 rounds, any remaining issues are documented as residual in REVIEW-FIX.md — no further fix attempts are made.

### STEP 7: GENERATE REVIEW-FIX.md

Write `{phase_dir}/{padded_phase}-REVIEW-FIX.md`:

```markdown
# Code Review Fix: Phase {N}

## Rounds executed: {N}/3

## Fixes Applied
1. [CR-001] {title} — ✅ Fixed
   - File: `{path}`
   - Change: {description of fix}

2. [CR-003] {title} — ✅ Fixed
   ...

## Residual (unfixed)
- [CR-002] {title} — ⚠️ Requires design decision
  Reason: {why auto-fix was not possible}

## Regressions Detected and Resolved
- Round 2: Fix of CR-001 caused {issue} → resolved in round 2
```

## ANTI-PATTERNS

| Anti-Pattern | Prevention |
|-------------|------------|
| Reviewing planning artifacts | Exclude `.planning/`, `STATE.md`, etc. |
| Using arbitrary HEAD~N | Fail closed — ask for `--files` if no base exists |
| Infinite fix loops | Strict cap of 3 rounds |
| Ignoring regressions | Re-review after each fix |
| Reviewing without scope | Always resolve scope before starting |

## OUTPUT

- **Artifacts**: `{padded_phase}-REVIEW.md` + `{padded_phase}-REVIEW-FIX.md` (if auto-fix)
- **Next step**: `yapu-verify` if there are fixes, or continue with the phase


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
