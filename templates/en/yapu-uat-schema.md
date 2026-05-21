# Schema: User Acceptance Testing — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-UAT.md`
> Persistent tracking of UAT sessions with state preserved between sessions.

## Template

```markdown
---
status: testing | partial | complete | diagnosed
phase: XX-name
source: [list of tested SUMMARY.md files]
started: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Test
<!-- OVERWRITE each test — shows where we are -->

number: [N]
name: [test name]
expected: |
  [what the user should observe]
awaiting: user response

## Tests

### 1. [Test Name]
expected: [observable behavior — what the user should see]
result: [pending]

### 2. [Test Name]
expected: [observable behavior]
result: pass

### 3. [Test Name]
expected: [observable behavior]
result: issue
reported: "[user's verbatim response]"
severity: major

### 4. [Test Name]
expected: [observable behavior]
result: skipped
reason: [why it was skipped]

### 5. [Test Name]
expected: [observable behavior]
result: blocked
blocked_by: server | physical-device | release-build | third-party | prior-phase
reason: [why it was blocked]

## Summary

total: [N]
passed: [N]
issues: [N]
pending: [N]
skipped: [N]
blocked: [N]

## Gaps

<!-- YAML format for downstream consumption -->
- truth: "[expected test behavior]"
  status: failed
  reason: "User reported: [verbatim response]"
  severity: blocker | major | minor | cosmetic
  test: [N]
  root_cause: ""       # Filled by diagnosis
  artifacts: []        # Filled by diagnosis
  missing: []          # Filled by diagnosis
  debug_session: ""    # Filled by diagnosis
```

## Section Rules

| Section | Discipline | Detail |
|---------|-----------|---------|
| Frontmatter `status` | OVERWRITE | testing → partial → complete → diagnosed |
| Frontmatter `phase/source/started` | IMMUTABLE | Set upon creation |
| Current Test | OVERWRITE | Fully overwritten at each test transition |
| Tests `result` | OVERWRITE | Updated when the user responds |
| Summary | OVERWRITE | Counts updated after each response |
| Gaps | APPEND | Only when an issue is found (YAML) |

## Result Values

| Value | Meaning |
|-------|------------|
| `[pending]` | Not yet tested |
| `pass` | Confirmed working |
| `issue` | Problem encountered (add `reported` + `severity`) |
| `skipped` | Skipped (add `reason`) |
| `blocked` | Untestable (add `blocked_by` + `reason`) |

## Severity Guide

Severity is INFERRED from the user's natural language, never asked:

| User describes | Infer |
|--------------------|---------|
| Crash, error, exception, fails completely, unusable | blocker |
| Does not work, nothing happens, incorrect behavior, missing | major |
| Works but..., slow, weird, minor, small issue | minor |
| Color, font, spacing, alignment, visual, looks bad | cosmetic |

**Default: major** (safe default)

## Lifecycle

1. **Creation:** Extract tests from SUMMARY.md → status `testing` → all `[pending]`
2. **During testing:** Present test → user responds → update result → update Summary
3. **Issue found:** Append to Gaps in YAML → infer severity
4. **Completed:** status → `complete` → commit
5. **Partial:** status → `partial` if outstanding items remain
6. **Diagnosis:** After complete, if gaps exist → investigate → fill `root_cause` in each gap → status → `diagnosed`
