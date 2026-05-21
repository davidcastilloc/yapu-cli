# Schema: Phase Plan — Yapu

> Output format for `.planning/phases/XX-name/{phase}-{plan}-PLAN.md`
> Executable plan optimized for sequential or parallel execution.

## Template

```markdown
---
phase: XX-name
plan: NN
type: execute              # execute | tdd
wave: N                    # Execution wave (1, 2, 3...). Pre-computed during planning.
depends_on: []             # Required plan IDs (e.g.: ["01-01"])
files_modified: []         # Files modified by this plan
autonomous: true           # false if it contains checkpoints requiring interaction
requirements: []           # REQUIRED — REQ-IDs from ROADMAP. CANNOT be empty.
user_setup: []             # Human setup that Yapu cannot automate

# Goal-backward verification (derived during planning, verified post-execution)
must_haves:
  truths: []               # Observable behaviors that must be true
  artifacts: []            # Files that must exist with real implementation
  key_links: []            # Critical connections between artifacts
---

<objective>
[What this plan achieves]

Purpose: [Why it matters for the project]
Output: [What artifacts will be created]
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Only reference previous SUMMARYs if genuinely needed:
# - This plan uses types/exports from a previous plan
# - A previous plan made a decision that affects this plan

[Relevant source files:]
@src/path/to/relevant.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: [Action-oriented name]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <read_first>path/to/reference.ext</read_first>
  <action>[Specific implementation — what to do, how to do it, what to avoid and WHY.
  Include CONCRETE values: exact identifiers, parameters, expected outputs.]</action>
  <verify>[Command or check that proves it worked]</verify>
  <acceptance_criteria>
    - [Verifiable condition: "file.ext contains 'exact string'"]
    - [Measurable condition: "output.ext uses 'expected-value', NOT 'incorrect-value'"]
  </acceptance_criteria>
  <done>[Measurable acceptance criterion]</done>
</task>

<task type="tdd">
  <name>Task 2: [TDD-focused name]</name>
  <files>path/to/file.ext, path/to/file.test.ext</files>
  <test_first>Write a failing test → implement → test passes</test_first>
  <action>[Red-green-refactor cycle implementation]</action>
  <verify>[Test suite passes]</verify>
  <done>[Green tests + functional criterion]</done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <decision>[What needs to be decided]</decision>
  <context>[Why this decision matters]</context>
  <options>
    <option id="option-a"><name>[Name]</name><pros>[Benefits]</pros><cons>[Tradeoffs]</cons></option>
    <option id="option-b"><name>[Name]</name><pros>[Benefits]</pros><cons>[Tradeoffs]</cons></option>
  </options>
  <resume-signal>Select: option-a or option-b</resume-signal>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[What Yapu built] — server running at [URL]</what-built>
  <how-to-verify>Visit [URL] and verify: [visual checks, NOT CLI commands]</how-to-verify>
  <resume-signal>Write "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
Before declaring the plan complete:
- [ ] [Specific test command]
- [ ] [Build/type check passes]
- [ ] [Behavior verification]
</verification>

<success_criteria>
- All tasks completed
- All verifications pass
- No errors or warnings introduced
- [Plan-specific criterion]
</success_criteria>

<output>
After completing, create `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
</output>
```

## Frontmatter Fields

| Field | Required | Purpose |
|-------|-----------|-----------|
| `phase` | Yes | Phase identifier (e.g.: `01-foundation`) |
| `plan` | Yes | Plan number within the phase |
| `type` | Yes | Standard `execute` or `tdd` for TDD plans |
| `wave` | Yes | Wave number — pre-computed during planning |
| `depends_on` | Yes | Array of required plan IDs |
| `files_modified` | Yes | Files touched by this plan |
| `autonomous` | Yes | `true` without checkpoints, `false` with checkpoints |
| `requirements` | Yes | **MUST** list REQ-IDs from ROADMAP |
| `must_haves` | Yes | Goal-backward verification criteria |

## Task Types

| Type | Usage |
|------|-----|
| `auto` | Autonomous execution without human intervention |
| `tdd` | Red-green-refactor cycle with test-first |
| `checkpoint:decision` | Requires user decision (blocking gate) |
| `checkpoint:human-verify` | Requires user visual verification |
