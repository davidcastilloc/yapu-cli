# Git Integration

Atomic commit strategy per task with semantic formatting.

---

## Core Principle

**Commit outcomes, not process.**

The git log should read like a changelog of what was shipped, not a planning activity diary.

---

## Commit Points

| Event | Commit? | Why |
|--------|----------|---------|
| BRIEF + ROADMAP created | YES | Project initialization |
| PLAN.md created | NO | Intermediate — commit with plan completion |
| RESEARCH.md created | NO | Intermediate |
| **Task completed** | YES | Atomic unit of work (1 commit per task) |
| **Plan completed** | YES | Metadata commit (SUMMARY + STATE + ROADMAP) |
| Handoff created | YES | WIP state preserved |

---

## Commit Formats

### Project Initialization

```
docs: initialize [project-name] ([N] phases)

[One-liner from PROJECT.md]

Phases:
1. [phase-name]: [goal]
2. [phase-name]: [goal]
3. [phase-name]: [goal]
```

### Task Completion (during plan execution)

Each task gets its own commit immediately after completion.

```
{type}({phase}-{plan}): {task-name}

- [Key change 1]
- [Key change 2]
- [Key change 3]
```

**Commit types:**
- `feat` — New feature/functionality
- `fix` — Bug fix
- `test` — Test-only (TDD RED phase)
- `refactor` — Code cleanup (TDD REFACTOR phase)
- `perf` — Performance improvement
- `chore` — Dependencies, config, tooling

**Examples:**

```bash
# Standard task
git add src/api/auth.ts src/types/user.ts
git commit -m "feat(08-02): create user registration endpoint

- POST /auth/register validates email and password
- Checks for duplicate users
- Returns JWT token on success
"

# TDD - RED phase
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): add failing test for JWT generation

- Tests token contains user ID claim
- Tests token expires in 1 hour
- Tests signature verification
"

# TDD - GREEN phase
git add src/utils/jwt.ts
git commit -m "feat(07-02): implement JWT generation

- Uses jose library for signing
- Includes user ID and expiry claims
- Signs with HS256 algorithm
"
```

### Plan Completion (after all tasks)

A final metadata commit captures plan completion.

```
docs({phase}-{plan}): complete [plan-name] plan

Tasks completed: [N]/[N]
- [Task 1 name]
- [Task 2 name]

SUMMARY: .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md
```

**Note:** Code files NOT included — already committed per-task.

### Handoff (WIP)

```
wip: [phase-name] paused at task [X]/[Y]

Current: [task name]
[If blocked:] Blocked: [reason]
```

---

## Git Log Example

```
# Phase 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation

# Phase 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
9s0t1u feat(03-02): implement search and filters

# Phase 02 - Auth
5y6z7a docs(02-02): complete token refresh plan
8b9c0d feat(02-02): implement refresh token rotation
1e2f3g test(02-02): add failing test for token refresh
4h5i6j docs(02-01): complete JWT setup plan
7k8l9m feat(02-01): add JWT generation and validation

# Initialization
5c6d7e docs: initialize ecommerce-app (5 phases)
```

Each plan produces 2-4 commits (tasks + metadata). Clear, granular, bisectable.

---

## Anti-patterns

**Do not commit (intermediate artifacts):**
- PLAN.md creation (commit with plan completion)
- RESEARCH.md (intermediate)
- Minor planning tweaks
- "Fixed typo in roadmap"

**Do commit (outcomes):**
- Each task completion (feat/fix/test/refactor)
- Plan completion metadata (docs)
- Project initialization (docs)

**Key principle:** Commit working code and shipped outcomes, not the planning process.

---

## Why Commits Per-Task

**Context engineering for AI:**
- Git history becomes a primary context source for future sessions
- `git log --grep="{phase}-{plan}"` shows all work for a plan
- `git diff <hash>^..<hash>` shows exact changes per task

**Failure recovery:**
- Task 1 committed ✅, Task 2 failed ❌
- Next session: sees task 1 complete, can retry task 2
- Can `git reset --hard` to the last successful task

**Debugging:**
- `git bisect finds the exact failing task`
- `git blame traces the line to the task's specific context`
- Each commit is independently revertible
