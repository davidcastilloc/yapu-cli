# YAPU AUTONOMOUS (AUTONOMOUS EXECUTION)

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

Act in [AUTONOMOUS MODE].

Your objective is to execute milestone phases autonomously: discuss → plan → execute → verify per phase. Re-read `ROADMAP.md` after each phase to detect dynamically inserted phases. Pause only for explicit user decisions.

> Deep load: `@yapu-ref-gates.md`, `@yapu-ref-anti-patterns.md`, `@yapu-ref-continuation-format.md`

## INVARIANT: SINGLE PASS PER INVOCATION

Each autonomous invocation executes **one complete phase** (discuss→plan→execute→verify). Upon completion, report results and suggest continuing — do NOT automatically chain the next phase without user confirmation.

## STEP 1: INITIALIZE

### Flags
| Flag | Effect |
|------|--------|
| `--from N` | Start from phase N |
| `--to N` | Stop after phase N |
| `--only N` | Execute only phase N |
| `--interactive` | Inline discuss with questions, plan+execute in background |

### Prerequisites
1. Read `ROADMAP.md` → if it does not exist: error → "No ROADMAP.md found. Run `yapu-map` first."
2. Read `STATE.md` → if it does not exist: error → "No STATE.md found. Initialize the project first."
3. Extract: `milestone_version`, `milestone_name`, `phase_count`, `completed_phases`

### Banner
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTONOMOUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Milestone: {version} — {name}
 Phases: {total} total, {completed} completed
```

## STEP 2: DISCOVER PHASES

1. Analyze `ROADMAP.md` → obtain array of phases
2. Filter to incomplete phases (`status !== "complete"`)
3. Apply `--from`, `--to`, `--only` filters if present
4. Sort in ascending order
5. If no phases remain: "All phases complete. Nothing to do." → exit

### Show Phase Plan
```
| # | Phase | Status |
|---|------|--------|
| 5 | Skill Scaffolding | In Progress |
| 6 | Smart Discuss | Not Started |
```

## STEP 3: SAFETY GATES (before each phase)

Execute these checks before proceeding. Exit on the first blocker unless `--force` is passed.

| Gate | Condition | Action |
|------|-----------|--------|
| **Unresolved Checkpoint** | `.continue-here.md` exists | ⛔ Read, resolve, delete before continuing |
| **Error State** | `STATE.md` shows `status: error` | ⛔ Resolve error first |
| **Failed Verification** | `VERIFICATION.md` has `FAIL` without override | ⛔ Resolve failures before advancing |

### Guard for Consecutive Executions
If the agent has executed 3+ phases without user input → **FORCED PAUSE**:
```
"There have been {N} consecutive phases executed without input.
Let's review the state before continuing."
```

## STEP 4: EXECUTE PHASE

For the current phase, execute sequentially:

### Progress Banner
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTONOMOUS ▸ Phase {N}/{T}: {Name} [████░░░░] {P}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4a. Discuss
- If `CONTEXT.md` exists → skip ("Context exists — skipping discuss")
- If not → run `yapu-discuss --auto` to generate CONTEXT.md without interactive questions
- In `--interactive` mode: run discuss with questions to the user

### 4b. Plan
- If plans exist → skip ("Plans exist — skipping planning")
- If not → run `yapu-plan` using CONTEXT.md as input

### 4c. Execute
- For each plan without a corresponding SUMMARY.md:
  - Run `yapu-execute` against that plan
  - Verify that SUMMARY.md was generated
  - If it fails → mark as blocker, move to the next plan or stop

### 4d. Verify
- Run `yapu-verify` against the phase
- If there are critical failures → pause and report to the user
- If it passes → mark phase as complete

## STEP 5: PHASE TRANSITION

1. **Re-read `ROADMAP.md`** — detect dynamically inserted phases
2. Update `STATE.md` with progress
3. If `--only N` → "Phase {N} complete" → exit
4. If phases remain and there are no blockers → report and suggest continuing

### Transition Report
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTONOMOUS ▸ Phase {N} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Completed: {phase name}
 Next: Phase {N+1} — {name}
 Progress: [████████░░] {P}%

 Continue with the next phase?
```

## ANTI-PATTERNS

| Anti-Pattern | Prevention |
|-------------|------------|
| Chaining without reviewing | Re-read ROADMAP after each phase |
| Ignoring verify failures | Mandatory pause on critical failures |
| Executing without context | CONTEXT.md is a prerequisite for planning |
| Running infinitely | Cap on consecutive phases without input |
| Assuming completeness | Verify SUMMARY.md exists for each plan |

## OUTPUT

- **Artifacts per phase**: CONTEXT.md, PLAN.md, SUMMARY.md, VERIFICATION.md
- **State**: `STATE.md` updated after each phase
- **Next step**: Next phase or final milestone report


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
