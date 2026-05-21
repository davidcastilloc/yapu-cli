# CURRENT STATE (YAPU MEMORY)

**[ CURRENT OPERATING MODE: PLANNING ]**
*(Valid modes: PLANNING, EXECUTION, VERIFICATION, FORENSIC. Yapu updates this flag when changing context).*

## Project Reference

See: .planning/PROJECT.md (updated [date])

**Core value:** [One line from Core Value in PROJECT.md]
**Current focus:** [Name of current phase]

## Current Position

Phase: [X] of [Y] ([Phase name])
Plan: [A] of [B] in the current phase
Status: [Ready to plan / Planning / Ready to execute / In progress / Phase complete]
Last activity: [YYYY-MM-DD] — [What happened]

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total completed plans: [N]
- Average duration: [X] min
- Total execution time: [X.X] hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: [durations]
- Trend: [Improving / Stable / Degrading]

*Updated after completing each plan*

## Accumulated Context

### Decisions
Decisions are recorded in the Key Decisions table of PROJECT.md.
Recent decisions affecting current work:
- [Phase X]: [Decision summary]

### Pending Todos
[From .planning/todos/pending/ — ideas captured during sessions]
None yet.

### Blockers/Concerns
[Issues affecting future work]
None yet.

## Deferred Items

Items acknowledged and carried forward from the previous milestone closure:

| Category | Item | Status | Deferred In |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: [YYYY-MM-DD HH:MM]
Stopped at: [Description of the last completed action]
Resume file: [Path to .continue-here*.md if it exists, otherwise "None"]

<!-- SIZE RULES:
Keep STATE.md under 100 lines.
It is a DIGEST, not an archive. If the accumulated context grows too large:
- Keep only 3-5 recent decisions in the summary (complete log in PROJECT.md)
- Keep only active blockers, remove resolved ones
Goal: "read once, know where we are"
-->
