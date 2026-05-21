# Schema: Verification Report — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-VERIFICATION.md`
> Goal-backward verification of phase results.

## Template

```markdown
---
phase: XX-name
verified: YYYY-MM-DDTHH:MM:SSZ
status: passed | gaps_found | human_needed
score: N/M must-haves verified
---

# Phase {X}: {Name} — Verification Report

**Phase Goal:** {goal from ROADMAP.md}
**Verified:** {timestamp}
**Status:** {passed | gaps_found | human_needed}

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|-----------|
| 1 | {truth from must_haves} | ✓ VERIFIED | {what confirmed it} |
| 2 | {truth from must_haves} | ✗ FAILED | {what is wrong} |
| 3 | {truth from must_haves} | ? UNCERTAIN | {why it cannot be verified} |

**Score:** {N}/{M} truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|-----------|----------|--------|----------|
| `src/components/X.tsx` | Component Y | ✓ EXISTS + SUBSTANTIVE | Exports X, renders Y, no stubs |
| `src/app/api/x/route.ts` | CRUD | ✗ STUB | File exists but POST returns placeholder |

**Artifacts:** {N}/{M} verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|----------|
| Component.tsx | /api/endpoint | fetch in useEffect | ✓ WIRED | Line 23: `fetch(...)` with response handling |
| Input.tsx | /api/endpoint POST | onSubmit | ✗ NOT WIRED | onSubmit only calls console.log |

**Wiring:** {N}/{M} connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| {REQ-01}: {description} | ✓ SATISFIED | - |
| {REQ-02}: {description} | ✗ BLOCKED | API route is stub |
| {REQ-03}: {description} | ? NEEDS HUMAN | Not verifiable programmatically |

**Coverage:** {N}/{M} requirements satisfied

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---------|-------|--------|-----------|---------|
| src/api/route.ts | 12 | `// TODO: implement` | ⚠️ Warning | Indicates incomplete |
| src/components/X.tsx | 45 | `return <div>Placeholder</div>` | 🛑 Blocker | Does not render content |

**Anti-patterns:** {N} found ({blockers} blockers, {warnings} warnings)

## Human Verification Required

[If not needed:]
None — all verifiable items checked programmatically.

[If needed:]

### 1. {Test Name}
**Test:** {What to do}
**Expected:** {What should happen}
**Why human:** {Why it cannot be verified programmatically}

## Gaps Summary

[If no gaps:]
**No gaps found.** Phase goal achieved. Ready to proceed.

[If gaps:]

### Critical Gaps (Block Progress)

1. **{Gap name}**
   - Missing: {what is missing}
   - Impact: {why it blocks the goal}
   - Fix: {what needs to happen}

### Non-Critical Gaps (Can Be Deferred)

1. **{Gap name}**
   - Issue: {what is wrong}
   - Impact: {limited impact because...}
   - Recommendation: {fix now or defer}

## Recommended Fix Plans

[Only if gaps_found:]

### {phase}-{next}-PLAN.md: {Fix Name}
**Objective:** {What it fixes}
**Tasks:**
1. {Task to fix gap}
2. {Verification task}
**Estimated Scope:** {Small / Medium}

---

## Verification Metadata

**Approach:** Goal-backward (derived from phase goal)
**Must-haves source:** {PLAN.md frontmatter | derived from ROADMAP.md}
**Automatic checks:** {N} passed, {M} failed
**Human checks required:** {N}
**Total time:** {duration}

---
*Verified: {timestamp}*
*Verifier: Yapu (subagent)*
```

## Status Values

| Status | Meaning |
|--------|------------|
| `passed` | All must-haves verified, no blockers |
| `gaps_found` | One or more critical gaps found |
| `human_needed` | Automatic checks pass but human verification is required |

## Severity

| Emoji | Level | Meaning |
|-------|-------|------------|
| 🛑 | Blocker | Prevents goal achievement, must be fixed |
| ⚠️ | Warning | Indicates incomplete but does not block |
| ℹ️ | Info | Notable but not problematic |
