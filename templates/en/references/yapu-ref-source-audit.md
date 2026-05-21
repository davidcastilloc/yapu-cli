# Plan Source Audit

Reference for the planner agent — multi-source coverage rules and authority limits.

---

## Coverage Audit Format

Before finalizing plans, produce a **source audit** covering all 4 artifact types:

```
SOURCE    | ID      | Feature/Requirement          | Plan  | Status    | Notes
--------- | ------- | ---------------------------- | ----- | --------- | ------
GOAL      | —       | {phase goal from ROADMAP}    | 01-03 | COVERED   |
REQ       | REQ-14  | OAuth login with Google + GH | 02    | COVERED   |
REQ       | REQ-22  | Email verification flow      | 03    | COVERED   |
RESEARCH  | —       | Rate limiting on auth routes | 01    | COVERED   |
RESEARCH  | —       | Refresh token rotation       | NONE  | ⚠ MISSING | No plan covering it
CONTEXT   | D-01    | Use jose library for JWT     | 02    | COVERED   |
CONTEXT   | D-04    | 15min access / 7day refresh  | 02    | COVERED   |
```

## The 4 Source Types

1. **GOAL** — The `goal:` field from ROADMAP.md for this phase. Primary success condition.
2. **REQ** — Each REQ-ID in `phase_req_ids`. Cross-reference with REQUIREMENTS.md for descriptions.
3. **RESEARCH** — Technical approaches, discovered constraints, and features identified in RESEARCH.md. Exclude items marked "out of scope" or "future work".
4. **CONTEXT** — Each decision D-XX from the `<decisions>` section of CONTEXT.md.

## What Is NOT a Gap

Do not mark as MISSING:
- Items in `## Deferred Ideas` from CONTEXT.md — the developer chose to defer them.
- Items from another phase via `phase_req_ids` — not assigned to this phase.
- Items in RESEARCH.md explicitly marked as "out of scope" or "future work".

## Handling MISSING Items

If ANY row is `⚠ MISSING`, DO NOT finalize the plan silently. Return to the orchestrator:

```
## ⚠ Source Audit: Unplanned Items

The following source artifact items have no corresponding plan:

1. **{SOURCE}: {item description}** (from {file}, section "{section}")
   - {why it was identified as required}

   Options:
   A) Add a plan to cover this item
   B) Split phase: move to sub-phase
   C) Explicitly defer: add to backlog with developer confirmation

   → Awaiting developer decision before finalizing plan set.
```

If ALL rows are COVERED → return `## PLANNING COMPLETE` as normal.

---

## Planner Authority Limits

The only legitimate reasons to split or escalate a feature are **constraints**, not difficulty judgments:

**Valid (constraints):**
- ✓ "This task touches 9 files and would consume ~45% of context — split into two tasks"
- ✓ "No API key or endpoint defined in any artifact — needs developer input"
- ✓ "This feature depends on the auth system built in Phase 03, which is not yet complete"

**Invalid (difficulty judgments):**
- ✗ "This is complex and difficult to implement correctly"
- ✗ "Integrating with an external service could take a long time"
- ✗ "This is a challenging feature that would be better left for a future phase"

**Rule:** If a feature does not have any of the three legitimate constraints (context cost, missing information, dependency conflict), it is planned. Period.
