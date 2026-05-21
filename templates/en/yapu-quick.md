# YAPU QUICK EXECUTION

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

Act in [ QUICK EXECUTION MODE ].

Your objective is to execute ad-hoc tasks with configurable quality. From trivial fixes (fast mode) to tasks with a complete quality pipeline (full mode). Tracking in STATE.md, atomic commits.

> Deep load: `@yapu-thinking-execution.md`

## TWO MODES OF OPERATION

### Fast Mode (default for trivial tasks)

**Eligibility criteria:**
- ≤ 3 modified files
- ≤ 1 minute of work
- No new dependencies or architectural changes
- No research necessary

**If the task is NOT trivial:** redirect to Quick mode with appropriate flags.

**Fast Flow:**
```
1. Parse task → understand what is asked
2. Scope check → is it really trivial?
3. Execute inline → read, modify, verify
4. Atomic commit → git add -A && git commit -m "fix: {desc}"
5. Log → record in STATE.md if "Quick Tasks" table exists
```

### Quick Mode (tasks with light planning)

For tasks that need more structure but not a complete phase cycle.

## QUALITY FLAGS (Composable)

| Flag | Effect |
|------|--------|
| `--discuss` | Light discussion before planning — surfaces assumptions, clarifies gray areas |
| `--research` | Focused research — approaches, libraries, pitfalls |
| `--validate` | Plan-checking (max 2 iterations) + post-execution verification |
| `--full` | All the above combined |

**Composition:** `--discuss --research --validate` = `--full`

Flags accumulate. You can use any combination.

## COMPLETE FLOW

### Step 1: Parse Input

Extract from arguments:
- Active flags (`--discuss`, `--research`, `--validate`, `--full`)
- Task description (remaining text)

If no description: ask "What do you want to do?"

### Step 2: Dispatch by Natural Language

If the input describes a vague intent, map to the correct action:

| If describing... | Action |
|----------------|--------|
| Bug, error, crash, something broken | → `yapu-debug` |
| Explore, research, compare | → `yapu-discovery` |
| Complex task, refactoring, migration | → `yapu-plan` + `yapu-execute` |
| Fix typo, config, import, rename | → Fast Mode (inline) |
| Actionable and scoped task | → Quick Mode (this flow) |

### Step 3: Discussion (if `--discuss`)

Before planning, surface ambiguities:

```
Before starting, I want to clarify:
1. {assumption that might be incorrect}
2. {identified gray area}
Any corrections or additional context?
```

Capture decisions. These are treated as **locked** during planning.

### Step 4: Research (if `--research`)

Focused research (~2-5 min):
- How is this task typically approached?
- Are there libraries that simplify it?
- Known pitfalls?

Brief output: 3-5 key findings, max 200 words.

### Step 5: Plan

Create light plan in `.planning/quick/{slug}.md`:

```markdown
# Quick: {description}
Date: {date}

## Tasks
- [ ] T1: {concrete action}
  - Files: {paths}
  - Verification: {how to confirm}
- [ ] T2: ...

## Decisions
{from the discussion phase, if applicable}
```

### Step 6: Validate Plan (if `--validate`)

Self-review the plan (max 2 iterations):
- Does each task have a verifiable output?
- Are there implicit dependencies?
- Is the total scope coherent with the description?

### Step 7: Execute

For each task in the plan:
```
1. Implement change
2. Verify (tests, lint, sanity check)
3. Atomic commit: git commit -m "yapu(quick): {desc}"
4. Mark [x] in the plan
```

### Step 8: Verify (if `--validate`)

Post-execution:
- Do all tests pass?
- Does the change meet the original description?
- Are there unforeseen side effects?

### Step 9: Log in STATE.md

If `.planning/STATE.md` has a "Quick Tasks Completed" table:
```
| {date} | quick | {description} | ✅ |
```

## STATE TRACKING

Quick tasks are tracked in `.planning/quick/` with structure:
```
.planning/quick/
├── {slug-1}.md
├── {slug-2}.md
└── ...
```

Each file persists the plan, decisions, and result for future reference.

## ANTI-PATTERNS

- ❌ **Quick for complex tasks** — if it needs more than 5 tasks, use `yapu-plan`
- ❌ **Skipping verification** — even in Fast mode, a basic sanity check is mandatory
- ❌ **Not registering** — every completed task must be recorded in STATE.md or in the quick plan
- ❌ **Flags as decoration** — if you use `--discuss`, actually discuss before acting


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
