# Schema: Execution Summary — Yapu

> Format for `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
> Post-execution documentation with dependency graph for automatic context assembly.

## Template

```markdown
---
phase: XX-name
plan: YY
subsystem: [primary category: auth, payments, ui, api, database, infra, testing]
tags: [searchable tech: jwt, stripe, react, postgres, prisma]

# Dependency graph
requires:
  - phase: [previous phase it depends on]
    provides: [what that phase built that this one uses]
provides:
  - [list of what this plan built/delivered]
affects: [phases or keywords that will need this context]

# Technical tracking
tech-stack:
  added: [added libraries/tools]
  patterns: [architectural/code patterns established]

key-files:
  created: [important files created]
  modified: [important files modified]

key-decisions:
  - "Decision 1"
  - "Decision 2"

patterns-established:
  - "Pattern 1: description"

requirements-completed: []  # REQUIRED — REQ-IDs completed in this plan

# Metrics
duration: Xmin
completed: YYYY-MM-DD
---

# Phase [X]: [Name] — Summary

**[Substantive one-liner describing the outcome — NOT "phase complete" or "implementation finished"]**

## Performance

- **Duration:** [time] (e.g.: 23 min, 1h 15m)
- **Started:** [ISO timestamp]
- **Completed:** [ISO timestamp]
- **Tasks:** [number completed]
- **Files modified:** [number]

## Accomplishments
- [Most important outcome]
- [Second key accomplishment]
- [Third if applicable]

## Task Commits

Each task was committed atomically:

1. **Task 1: [name]** — `abc123f` (feat/fix/test/refactor)
2. **Task 2: [name]** — `def456g` (feat/fix/test/refactor)

**Plan metadata:** `lmn012o` (docs: complete plan)

## Files Created/Modified
- `path/to/file.ts` — What it does
- `path/to/another.ts` — What it does

## Decisions Made
[Key decisions with brief reasoning, or "None — followed plan exactly"]

## Plan Deviations

[If there were none: "None — plan executed exactly as written"]

[If there were deviations:]

### Auto-fixed Issues

**1. [Category] Brief description**
- **Found during:** Task [N] ([name])
- **Issue:** [What was wrong]
- **Fix:** [What was done]
- **Files:** [paths]
- **Verification:** [How it was verified]

---
**Total deviations:** [N] auto-fixed
**Impact on plan:** [Brief evaluation]

## Issues Encountered
[Problems and how they were resolved, or "None"]

## Next Phase Readiness
[What is ready for the next phase]
[Blockers or concerns]

---
*Phase: XX-name*
*Completed: [date]*
```

## One-liner Rules

The one-liner MUST be substantive:

| ✓ Good | ✗ Bad |
|---------|--------|
| "JWT auth with refresh rotation using jose" | "Phase complete" |
| "Prisma schema with User, Session, and Product" | "Authentication implemented" |
| "Dashboard with real-time metrics via SSE" | "All tasks done" |

## Purpose of the Frontmatter

- **Fast scanning:** First ~25 lines, cheap to scan without reading the entire content
- **Dependency graph:** `requires`/`provides`/`affects` create explicit links between phases
- **Subsystem:** Primary categorization to detect related phases
- **Tags:** Searchable technical keywords for tech stack awareness
