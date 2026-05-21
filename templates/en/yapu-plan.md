# YAPU PLANNING (ADVANCED PLANNING)

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

Act in [ADVANCED PLANNING MODE].

Your objective is to create an atomic, verifiable, and ambiguity-free execution plan in `STATE.md`. The plan goes through: Source Audit → MECE Decomposition → Revision → Quality Gate.

> Deep load: `@yapu-ref-source-audit.md`, `@yapu-ref-planner-anti-patterns.md`, `@yapu-thinking-planning.md`

## INVARIANT: DO NOT EXECUTE CODE

This mode **plans only**. Do not write, modify, or execute production code. If you feel the urge to implement, STOP.

## PHASE 1: SOURCE AUDIT

Before planning, verify that you have sufficient context:

1. **Read `PROJECT.md`** — Does it exist? Is it updated? Does it reflect the real state?
2. **Read `ROADMAP.md`** — Identify the active phase and its goal
3. **Review the source code** of current entry points
4. **Verify coherence** — Does `PROJECT.md` contradict what you see in the code?

### Source Gate
| Source | Status | Action if Missing |
|--------|--------|-----------------|
| `PROJECT.md` | Exists and accurate? | If not → run `yapu-map` first |
| `ROADMAP.md` | Clear phases? | If not → run `yapu-grill-me` first |
| Source code | Can you read it? | If not → verify permissions/paths |

**If critical context is missing:** Ask me 2-3 direct questions about undocumented business logic, environment variables, or dependencies before continuing. Wait for responses.

## PHASE 2: MECE DECOMPOSITION

Decompose the active phase of `ROADMAP.md` into atomic tasks using MECE principles (Mutually Exclusive, Collectively Exhaustives):

### Decomposition Rules
- **Each task has a single verifiable output** (file created, test passing, endpoint responding)
- **No overlap** — two tasks must not touch the same file for the same purpose
- **Exhaustiveness** — the sum of tasks must cover 100% of the phase goal
- **Atomic size** — each task is completable in a single execution session (15-45 min of agent work)
- **Dependency order** — if task B needs output from task A, A goes first

### Task format in STATE.md

```markdown
## Active Phase: [phase name]
Goal: [measurable goal]

### Tasks
- [ ] **T1: [descriptive name]**
  - Output: [what it concretely produces]
  - Files: [paths it touches]
  - Verification: [command or check to confirm completeness]
  - Dependency: [none | T#]

- [ ] **T2: [descriptive name]**
  ...
```

## PHASE 3: REVISION (Revision Loop)

Before delivering the plan, self-review against these checks (max 3 iterations):

### Plan Quality Checklist
- [ ] Does each task have a concrete verification? (not "verify it works")
- [ ] Are task dependencies correct and non-circular?
- [ ] Are there tasks that are really 2+ tasks in disguise?
- [ ] Does the plan cover the entire phase goal?
- [ ] Does any task touch a file that another task also modifies? → resolve conflict
- [ ] Are tasks small enough for atomic execution?

### If defects are found
1. Document the defect found
2. Correct the plan
3. Re-evaluate (max 3 cycles)
4. If after 3 cycles there are still defects → escalate them as notes in the plan

## PHASE 4: QUALITY GATE (Plan Checker)

Final validation before marking the plan as ready:

| Check | Criterion | Failure → |
|-------|----------|---------|
| Completeness | All tasks cover the goal | Add missing tasks |
| Atomicity | Each task ≤ 1 work session | Split large tasks |
| Verifiability | Each task has executable check | Add verification commands |
| Coherence | No internal contradictions | Resolve conflicts |
| Closed-phase | Phase already completed? | ABORT — do not replan closed phases |

## OUTPUT

1. Write the plan in `STATE.md` using the tasks format
2. Update the `[ CURRENT OPERATION MODE ]` to "PLANNED"
3. **STOP. Do not execute code.**

## ANTI-PATTERNS

- ❌ **Vague tasks**: "configure the backend" → what files? what output?
- ❌ **Missing verification**: "create component" without a test or check
- ❌ **Mega-tasks**: a task that touches 10+ files
- ❌ **Planning without reading**: make plan without auditing sources first
- ❌ **Scope creep**: adding features that are not in the ROADMAP phase


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
