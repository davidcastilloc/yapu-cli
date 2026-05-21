# TDD: Test-Driven Development

TDD is about design quality, not coverage metrics. The red-green-refactor cycle forces thinking about behavior before implementation.

**Principle:** If you can describe the behavior as `expect(fn(input)).toBe(output)` before writing `fn`, TDD improves the outcome.

**Key Insight:** TDD work is inherently heavier — requiring 2-3 execution cycles (RED → GREEN → REFACTOR), each with file reads, test execution, and potential debugging.

---

## When to Use TDD

**TDD Candidates (create TDD plan):**
- Business logic with defined inputs/outputs.
- API endpoints with request/response contracts.
- Data transformations, parsing, formatting.
- Validation rules and constraints.
- Algorithms with testable behavior.
- State machines and workflows.
- Utility functions with clear specs.

**Skip TDD (use standard plan):**
- UI layout, styling, visual components.
- Configuration changes.
- Glue code connecting existing components.
- One-off scripts and migrations.
- Simple CRUD without business logic.
- Exploratory prototyping.

**Heuristic:** Can you write `expect(fn(input)).toBe(output)` before writing `fn`?
→ Yes: TDD Plan  |  → No: Standard plan

---

## Red-Green-Refactor Cycle

### RED — Write a failing test
1. Create a test file following project conventions.
2. Write a test describing expected behavior.
3. Run test — MUST fail.
4. If it passes: the feature exists or the test is wrong. Investigate.
5. Commit: `test({phase}-{plan}): add failing test for [feature]`

### GREEN — Implement to pass
1. Write minimal code to make the test pass.
2. No cleverness, no optimization — just make it work.
3. Run test — MUST pass.
4. Commit: `feat({phase}-{plan}): implement [feature]`

### REFACTOR (if necessary)
1. Clean up implementation if there are obvious improvements.
2. Run tests — MUST continue to pass.
3. Only commit if there are changes: `refactor({phase}-{plan}): clean up [feature]`

**Result:** Each TDD plan produces 2-3 atomic commits.

---

## Gate Enforcement

| Gate | Required | Commit Pattern | Validation |
|------|-----------|---------------|------------|
| RED | Yes | `test({phase}-{plan}): ...` | Test exists AND fails before implementation |
| GREEN | Yes | `feat({phase}-{plan}): ...` | Test passes after implementation |
| REFACTOR | No | `refactor({phase}-{plan}): ...` | Tests continue to pass after cleanup |

### Fail-Fast Rules

1. **Unexpected GREEN in RED phase:** If the test passes before writing code → STOP. Investigate.
2. **Missing RED commit:** If there is no `test(...)` commit before `feat(...)` → violation of TDD discipline.
3. **REFACTOR breaks tests:** Undo refactor immediately. Refactor in smaller steps.

---

## Test Quality

**Test behavior, not implementation:**
- ✓ "returns formatted date string"
- ✗ "calls formatDate helper with correct params"

**One concept per test:**
- ✓ Separate tests for valid, empty, malformed input
- ✗ A single test checking all edge cases

**Descriptive names:**
- ✓ "should reject empty email", "returns null for invalid ID"
- ✗ "test1", "handles error", "works correctly"

**No implementation details:**
- ✓ Test public API, observable behavior
- ✗ Mock internals, test private methods

---

## Test Framework Setup

If no test framework exists, configure it as part of the RED phase:

| Project | Framework | Installation |
|----------|-----------|-------------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

Setup is a one-time cost included in the first TDD plan.

---

## Context Budget

TDD plans target **~40% context usage** (lower than the ~50% of standard plans). The RED→GREEN→REFACTOR back-and-forth is inherently heavier than linear task execution.

One feature per TDD plan. If features are trivial enough for batching, they are trivial enough to skip TDD.
