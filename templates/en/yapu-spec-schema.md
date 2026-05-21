# Schema: Phase Specification — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-SPEC.md`
> Locks requirements before `discuss-phase`, with ambiguity scoring.

**Key principle:** Every requirement must be falsifiable — you can write a test or check that proves whether it was met or not. Vague requirements like "improve performance" are not allowed.

**Downstream consumers:**
- `discuss-phase` — Reads SPEC.md at the start; treats Requirements and Boundaries as locked
- Planner — Reads locked requirements to restrict the plan's scope
- Verifier — Uses acceptance criteria as explicit pass/fail checks

## Template

```markdown
# Phase [X]: [Name] — Specification

**Created:** [date]
**Ambiguity score:** [score] (gate: ≤ 0.20)
**Requirements:** [N] locked

## Goal

[A precise sentence — specific and measurable. NOT "improve X" — but "X changes from A to B".]

## Background

[Current state of the codebase — what exists today, what is broken or missing, what triggers this work. Based on code reality, not abstract description.]

## Requirements

1. **[Short label]**: [Specific, testable statement.]
   - Current: [what exists or does NOT exist today]
   - Target: [what it must become after this phase]
   - Acceptance: [concrete pass/fail check — how a verifier confirms it was met]

2. **[Short label]**: [Specific, testable statement.]
   - Current: [what exists today]
   - Target: [what it must be]
   - Acceptance: [concrete pass/fail check]

## Boundaries

**In scope:**
- [Explicit list of what this phase produces]
- [Each item is a concrete deliverable or behavior]

**Out of scope:**
- [What this phase DOES NOT do] — [brief reason]
- [Adjacent problems excluded] — [brief reason]

## Constraints

[Performance, compatibility, data volume, dependencies, platform.
If none: "No additional constraints beyond standard project conventions."]

## Acceptance Criteria

- [ ] [Pass/fail criterion — unambiguous, verifiable]
- [ ] [Pass/fail criterion]
- [ ] [Pass/fail criterion]

[Each criterion must be a checkbox that resolves to PASS or FAIL.
No "should feel good", "looks reasonable", or "generally works".]

## Ambiguity Report

| Dimension | Score | Min | Status | Notes |
|-----------|-------|-----|--------|-------|
| Goal Clarity | | 0.75 | | |
| Boundary Clarity | | 0.70 | | |
| Constraint Clarity | | 0.65 | | |
| Acceptance Criteria | | 0.70 | | |
| **Ambiguity** | | ≤0.20 | | |

Status: ✓ = meets minimum, ⚠ = below minimum (planner treats as assumption)

## Interview Log

[Key decisions during the Socratic interview.]

| Round | Perspective | Question Summary | Locked Decision |
|-------|------------|---------------------|-----------------|
| 1 | Researcher | [what was asked] | [what was decided] |
| 2 | Simplifier | [what was asked] | [what was decided] |
| 3 | Boundary Keeper | [what was asked] | [what was decided] |

---
*Phase: [XX-name]*
*Spec created: [date]*
```

## Ambiguity Scoring Rubric

| Dimension | 0.0 (max ambiguity) | 0.5 | 1.0 (crystal clear) |
|-----------|----------------------|-----|-------------------|
| Goal Clarity | "Improve the app" | "Add auth" | "Users register with email/password, receive verification, can reset password" |
| Boundary Clarity | No boundaries | Partial boundaries | Explicit in/out scope with reasons |
| Constraint Clarity | No constraints mentioned | Some implicit limits | Each constraint with type + value + reason |
| Acceptance Criteria | "Should work" | Generic checkboxes | Each criterion is a pass/fail check with concrete values |

**Gate:** Ambiguity score ≤ 0.20 to proceed. If > 0.20, more clarifying questions are needed.
