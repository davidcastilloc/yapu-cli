# YAPU PROGRESS (PROGRESS & NAVIGATION)

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

Act in [PROGRESS & NAVIGATION MODE].

Your objective is to answer "Where am I? What's next?" with an enriched status report and smart routing to the next action. State machine with 6 possible routes.

> Deep load: `@yapu-ref-gates.md`, `@yapu-ref-artifact-types.md`

## STEP 1: LOAD CONTEXT

1. Verify existence of `.planning/` → if not: "No project. Initialize first." → exit
2. Read `STATE.md` → current position, decisions, blockers
3. Read `ROADMAP.md` → phase structure, progress
4. Read `PROJECT.md` → project name, description

**If `ROADMAP.md` is missing but `PROJECT.md` exists:** Milestone completed and archived → go to **Route F**.
**If both are missing:** "No project. Initialize first." → exit

## STEP 2: SAFETY GATES

Execute gates before routing. Exit on the first block unless `--force`.

| Gate | Condition | Action |
|------|-----------|--------|
| **Checkpoint** | `.continue-here.md` exists | ⛔ "Unresolved checkpoint. Read it, resolve it, delete it." |
| **Error** | `STATE.md` → `status: error` | ⛔ "Project in error state. Resolve it first." |
| **Verification** | `VERIFICATION.md` with `FAIL` without override | ⛔ "Unresolved verification failures." |

## STEP 3: ANALYZE & COUNT

For the current phase:
```bash
# Count artifacts in phase directory
PLANS=$(ls .planning/phases/{current}/*-PLAN.md 2>/dev/null | wc -l)
SUMMARIES=$(ls .planning/phases/{current}/*-SUMMARY.md 2>/dev/null | wc -l)
```

Also obtain:
- 2-3 most recent SUMMARY.md → "recent work"
- Pending todos
- Active debug sessions

## STEP 4: PRESENT REPORT

```markdown
# {Project Name}

**Progress:** [████████░░] {P}%
**Phase:** {N} of {total} — {name}
**Plan:** {M} of {total_plans} — {status}

## Recent Work
- [Phase X, Plan Y]: {one-line summary}
- [Phase X, Plan Z]: {one-line summary}

## Current Position
CONTEXT: {✓ | —}
PLANS: {completed}/{total}

## Key Decisions
- {decision} — {reasoning}

## Blockers
- {blocker or "none"}

## What's Next
{Determined by the state machine}
```

## STEP 5: ROUTE (State Machine)

### Condition evaluation

| Condition | Route |
|-----------|------|
| `SUMMARIES < PLANS` (unexecuted plans) | **Route A** |
| `SUMMARIES == PLANS && PLANS > 0` (phase complete) | → Step 6 (verify/complete) |
| `PLANS == 0` (unplanned phase) | **Route B** |
| UAT with diagnosed gaps | **Route E** |
| Milestone complete | **Route F** |

---

### Route A: Unexecuted plan exists

Find the first PLAN.md without corresponding SUMMARY.md.

```
▶ Next: {phase}-{plan}: {Plan Name}
  {summary of plan goal}

  Execute: yapu-execute
```

---

### Route B: Phase needs planning

Verify if `CONTEXT.md` exists for the phase.

**If CONTEXT.md exists:**
```
▶ Next: Phase {N} — {Name}
  ✓ Context gathered, ready to plan

  Execute: yapu-plan
```

**If CONTEXT.md does NOT exist:**
```
▶ Next: Phase {N} — {Name}
  Needs to gather context first

  Execute: yapu-discuss
  Alternative: yapu-plan (skip discussion)
```

---

### Route C: Phase complete → Verify

```
▶ Next: Verify Phase {N}
  All plans executed. Verify goal achieved.

  Execute: yapu-verify
```

---

### Route D: Complete milestone

```
▶ Next: Complete milestone {version}
  All phases verified.

  Execute: Archive and close milestone
```

---

### Route E: UAT gaps need fixes

```
⚠ UAT Gaps in Phase {N}
  {count} gaps require fix plans.

  Execute: yapu-plan --gaps
```

---

### Route F: Between milestones

```
Previous milestone completed and archived.
No active ROADMAP.md.

  Execute: Create new milestone or ROADMAP.md
```

## STEP 6: CROSS-PHASE COMPLETENESS VERIFICATION

Before declaring a phase complete, scan previous phases for debt:

| Debt Type | Detection |
|-----------|-----------|
| Plans without SUMMARY | PLAN.md without corresponding SUMMARY.md |
| Verification failures | VERIFICATION.md with FAIL without override |
| Context without plans | CONTEXT.md without PLAN.md |

If there is debt → show as **WARNING** (non-blocker):
```
⚠ Verification debt ({N} files in previous phases)
  Phase {X}: {count} pending
```

## OUTPUT

- **Artifact**: None (read-only)
- **Action**: Automatic routing to the next Yapu skill


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
