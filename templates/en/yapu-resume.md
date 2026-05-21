# YAPU RESUME (SESSION CONTINUITY)

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

Act in [SESSION CONTINUITY MODE].

Two sub-modes: **PAUSE** (preserve state for next session) and **RESUME** (restore context and continue). State is persisted in dual format: JSON (machine-readable) + Markdown (human-readable).

> Deep load: `@yapu-ref-continuation-format.md`, `@yapu-ref-checkpoints.md`

---

## SUB-MODE: PAUSE

Create `HANDOFF.json` + `.continue-here.md` to preserve full state between sessions.

### STEP 1: DETECT CONTEXT

Determine what type of work is being paused:

| Detected Context | Handoff Destination |
|--------------------|---------------------|
| Active phase | `.planning/phases/XX-name/.continue-here.md` |
| Active spike | `.planning/spikes/SPIKE-NNN/.continue-here.md` |
| Research | `.planning/.continue-here.md` |
| Default (no clear context) | `.planning/.continue-here.md` — note ambiguity |

### STEP 2: GATHER STATE

Gather these 9 elements:

1. **Current position** — phase, plan, task
2. **Completed work** — what was done this session
3. **Pending work** — what remains in the current plan/phase
4. **Decisions made** — key decisions and rationale
5. **Blockers/issues** — what is stuck
6. **Pending human actions** — things needing manual intervention
7. **Background processes** — running servers/watchers
8. **Modified files** — uncommitted changes
9. **Blocking constraints** — anti-patterns discovered by real failure (not predictions)

### STEP 3: WRITE HANDOFF.json

```json
{
  "version": "1.0",
  "timestamp": "{ISO}",
  "phase": "{phase_number}",
  "phase_name": "{name}",
  "plan": "{current_plan}",
  "task": "{current_task}",
  "total_tasks": "{total}",
  "status": "paused",
  "completed_tasks": [
    {"id": 1, "name": "...", "status": "done"},
    {"id": 2, "name": "...", "status": "in_progress", "progress": "..."}
  ],
  "remaining_tasks": [
    {"id": 3, "name": "...", "status": "not_started"}
  ],
  "blockers": [{"description": "...", "type": "technical|human_action|external"}],
  "human_actions_pending": [{"action": "...", "blocking": true}],
  "decisions": [{"decision": "...", "rationale": "..."}],
  "uncommitted_files": [],
  "next_action": "{first specific action when resuming}",
  "context_notes": "{mental state, focus, what you were thinking about}"
}
```

### STEP 4: WRITE .continue-here.md

```markdown
---
context: [phase|spike|research|default]
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: {timestamp}
---

# BLOCKING CONSTRAINTS — Read Before Anything Else

> Not suggestions. Each constraint was discovered by real failure.

- [ ] CONSTRAINT: [name] — [what it is] — [structural mitigation]

## Critical Anti-Patterns

| Pattern | Description | Severity | Prevention |
|---------|-------------|----------|------------|
| [name] | [what it is and how it manifested] | blocking | [structural mechanism] |
| [name] | [what it is and how it manifested] | advisory | [guide to avoid it] |

**Severity:** `blocking` = the agent must demonstrate understanding before continuing. `advisory` = important context, does not block.

## Current State
[Where exactly we are]

## Completed Work
- Task 1: [name] — Done
- Task 2: [name] — In progress ({detail})

## Pending Work
- Task 3: [name]
- Task 4: [name]

## Next Action
[Specific and immediate action when resuming]
```

---

## SUB-MODE: RESUME

Restores full context to answer "Where were we?" instantly.

### STEP 1: LOAD STATE

1. Read `STATE.md` → position, progress, decisions, blockers
2. Read `PROJECT.md` → what this is, requirements, constraints
3. Look for `HANDOFF.json` → primary source of resumption
4. Look for `.continue-here.md` → human-readable context

### STEP 2: DETECT INCOMPLETE WORK

Detection priority:

| Source | What to search for | Action |
|--------|------------|--------|
| `HANDOFF.json` | `status: "paused"`, `blockers`, `human_actions_pending` | Surface immediately |
| `.continue-here.md` | Blocking constraints, tasks in progress | Demonstrate understanding of `blocking` constraints |
| Plans without SUMMARY | Plan executed but not completed | Mark as incomplete |
| `git status` | Uncommitted modified files | Validate vs `uncommitted_files` of handoff |

### STEP 3: VERIFY BLOCKING CONSTRAINTS

If `.continue-here.md` has constraints with `severity: blocking`:

**MANDATORY** — For each blocking constraint, answer:
1. **What is this anti-pattern?** — Describe it in your own words
2. **How did it manifest?** — Explain the specific failure
3. **What structural mechanism prevents it?** — "I recognize it" is not enough

**Do not proceed until you demonstrate understanding of all blocking constraints.**

### STEP 4: PRESENT RESUMPTION SUMMARY

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YAPU ► RESUMING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Project: {name}
  Phase: {N} — {name}
  Plan: {M} of {total}
  Task: {T} of {total_tasks}

  Last action: {next_action from handoff}
  Blockers: {count or "none"}

  Next: {immediate action}
```

### STEP 5: ROUTE

- If there is handoff with `next_action` → execute that action
- If there are unexecuted plans → `yapu-execute`
- If there are no plans → `yapu-progress` to determine the next step
- Clear `HANDOFF.json` and `.continue-here.md` once context is restored

## OUTPUT

- **PAUSE**: `HANDOFF.json` + `.continue-here.md`
- **RESUME**: Context restored + next action executing


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
