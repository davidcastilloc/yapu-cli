# YAPU EXECUTION

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

Act in [EXECUTION MODE].

Your objective is to execute the tasks of the plan in `STATE.md` atomically, with commits per task and immediate verification. Each completed task must leave the codebase in a functional state.

> Deep load: `@yapu-thinking-execution.md`, `@yapu-ref-checkpoints.md`

## RULE ZERO: STATE VERIFICATION

```
1. Read STATE.md
2. If the [ CURRENT OPERATION MODE ] is NOT "PLANNED" or "EXECUTION":
   → ABORT: "⚠️ State conflict. Current mode: {mode}. Change the flag in STATE.md or run yapu-plan."
3. If there are no pending tasks (all [x]):
   → ABORT: "✅ All tasks completed. Run yapu-verify."
4. Update mode to "EXECUTION"
```

## ATOMIC CLOSE-OUT INVARIANT

For each executed task, the only valid closing order is:

```
production code → commit → mark [x] in STATE.md
```

**Illegal state:** a production commit exists for a task but STATE.md does not mark it as completed. If you detect this condition on startup, repair the state before continuing.

## EXECUTION FLOW PER TASK

For each pending task `[ ]` in STATE.md, in order:

### 1. Read and Understand
- Read task description, expected output, and involved files
- Verify dependencies are completed

### 2. Implement
- Make atomic changes using your writing tools
- Follow the conventions detected in `PROJECT.md` or `.planning/codebase/CONVENTIONS.md`

### 3. Verify Immediately
- Execute the verification command defined in the task
- Run linter and relevant tests:
  ```bash
  # Example — adapt to project stack
  npm test -- --related  # or pytest, go test, cargo test, etc.
  ```

### 4. Atomic Commit
```bash
git add -A
git commit -m "yapu: T{N} - {brief description of the task}"
```

### 5. Mark Completed
- Change `[ ]` to `[x]` in STATE.md for this task

### 6. Drift Gate
- If the task modified files outside the expected scope, document it as a deviation in STATE.md

## NODE-REPAIR: WHEN A TASK FAILS

If a task does not pass verification, apply this repair ladder:

| Strategy | When | Action |
|-----------|--------|--------|
| **Retry** | Minor error, typo, missing import | Correct and re-verify (max 2 attempts) |
| **Decompose** | Task too large or complex | Split into sub-tasks and execute incrementally |
| **Prune** | Non-essential feature blocking | Implement minimal version, document debt |
| **Escalate** | Requires human decision or external info | STOP, report to the user with precise context |

### Escalation Format
```
🚨 BLOCKER in T{N}: {name}
   Problem: {precise description}
   Attempts: {what I tried and what failed}
   Need: {specific decision/info from the user}
```

## DRIFT GATE (Post-Execution)

Upon completing ALL tasks:

1. **Verify final coherence:**
   ```bash
   git log --oneline -10  # commits of this session
   git diff --stat HEAD~{N}  # touched files vs. plan
   ```

2. **Compare touched files vs. original plan** — if there are modified files not listed in the plan, document the deviation

3. **Update STATE.md:**
   - Mode → "EXECUTED"
   - Summary of what was completed
   - Documented deviations (if any)

## STRICT RULES

- ✅ One commit per completed task
- ✅ Tests pass before marking [x]
- ✅ Deviations explicitly documented
- ❌ NEVER mark [x] without verification
- ❌ NEVER make massive multi-task commits
- ❌ NEVER continue if a dependency failed
- ❌ NEVER modify ROADMAP.md during execution


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
