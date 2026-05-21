# Schema: Debug Session — Yapu

> Format for `.planning/debug/[slug].md`
> Active debug session tracking with append-only discipline.

**Principle:** The file IS the debugging brain. Yapu can resume perfectly from any point of interruption.

## Template

```markdown
---
status: gathering | investigating | fixing | verifying | awaiting_human_verify | resolved
trigger: "[user's verbatim input]"
created: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Focus
<!-- OVERWRITE at each update — always reflects NOW -->

hypothesis: [current theory being tested]
test: [how it is being tested]
expecting: [what the result means if true/false]
next_action: [immediate next step — be specific, NOT "continue investigating"]
reasoning_checkpoint: null  <!-- populated before each fix attempt -->
tdd_checkpoint: null        <!-- populated when tdd_mode is active -->

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: [what should happen]
actual: [what actually happens]
errors: [error messages if any]
reproduction: [how to reproduce]
started: [when it broke / always broken]

## Eliminated
<!-- APPEND only — prevents re-investigating after /clear -->

- hypothesis: [theory that was wrong]
  evidence: [what refuted it]
  timestamp: [when it was eliminated]

## Evidence
<!-- APPEND only — facts discovered during investigation -->

- timestamp: [when it was found]
  checked: [what was examined]
  found: [what was observed]
  implication: [what this means]

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: [empty until found]
fix: [empty until applied]
verification: [empty until verified]
files_changed: []
```

## Section Rules

| Section | Discipline | Purpose |
|---------|-----------|-----------|
| `status` | OVERWRITE | Reflects current debug phase |
| `trigger` | IMMUTABLE | User's verbatim input, never changes |
| Current Focus | OVERWRITE | Always reflects what Yapu is doing NOW |
| Symptoms | IMMUTABLE | Reference point of what we are fixing |
| Eliminated | APPEND only | Prevents re-investigating dead ends |
| Evidence | APPEND only | Builds the case for the root cause |
| Resolution | OVERWRITE | Updated as fixes are tried |

## Lifecycle

```
gathering → investigating → fixing → verifying → awaiting_human_verify → resolved
                ↑                        |
                └── if verification fails ┘
```

1. **Creation:** Triggered by user input → status `gathering` → gather symptoms
2. **Investigation:** OVERWRITE Current Focus with each hypothesis → APPEND Evidence → APPEND Eliminated if it fails
3. **Fixing:** Confirm root_cause → apply fix → update Resolution
4. **Verification:** Automatically verify → if it fails, return to investigating
5. **Awaiting human:** Self-verification passes → request user confirmation
6. **Resolution:** User confirms → move to `.planning/debug/resolved/`

## Resume Behavior

When Yapu reads this file after context loss:

1. Parse frontmatter → know status
2. Read Current Focus → know exactly what was happening
3. Read Eliminated → know what NOT to retry
4. Read Evidence → know what has been learned
5. Continue from `next_action`

## Size Constraints

- Evidence entries: 1-2 lines each, facts only
- Eliminated: brief — hypothesis + why it failed
- No narrative prose — structured data only
- If evidence grows too large (10+ entries), check for cycles
