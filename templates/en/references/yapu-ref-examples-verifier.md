# Calibration Examples: Verifier

Positive/negative examples to calibrate the verifier. They show the expected multi-layer evidence level and common gap patterns.

---

## Positive Examples

### Example 1: Multi-level verification with real gap discovery

**Input:** Must-have artifact: `workflows/context-bridge.md: >50 lines`

**Output:**

> **L1 (Existence):** EXISTS — `workflows/context-bridge.md` found, 187 lines.
> **L2 (Substantive):** SUBSTANTIVE — No TODO/FIXME markers, 4 sections defined (`updateContextTier`, `getContextBudget`, `injectContextWarning`, `resetTierState`), non-trivial logic with config reads and threshold calculations.
> **L3 (Wired):** WIRED — Referenced by `workflows/execute-phase.md` in step 3. Called by `agents/executor.md` via @-reference include. Arguments verified: receives planning directory path matching the expected parameter.
> **Status: PASSED**

**Why this is good:** The verifier verified the three levels independently with specific evidence — file path, line count, exported symbols, import location, and argument verification. It did not stop at "file exists" but traced the wiring to actual use with correct arguments.

### Example 2: Correct FAILED classification with grep evidence

**Input:** Must-have truth: `validate-commit.js rejects commits missing scope parentheses`

**Output:**

> **Method:** Ran `grep -n "scope" bin/validate-commit.js` to locate validation logic.
> **Evidence:** Lines 34-41 show regex `/^(feat|fix|refactor|test|docs|chore|wip)\(/` which requires an opening parenthesis. However, there is no test for a MISSING closing parenthesis — the regex accepts `feat(: description` (without scope content or closing).
> **Ran:** `echo "feat(: test" | node bin/validate-commit.js` — exit code 0 (accepted).
> **Status: FAILED** — Commit messages with empty scope `feat(: desc)` are accepted. The truth does not hold for the empty scope edge case.

**Why this is good:** The verifier did not trust the code's intent — it executed an actual test with an edge case input and reported the specific failure.

### Example 3: Missing wiring detected (calibration pattern)

**Input:** Must-have key_link: `check-subagent-output.js imports and calls feedback-loop.js extractFeedback()`

**Output:**

> **Method:** Ran `grep -n "feedback-loop\|extractFeedback" bin/check-subagent-output.js`.
> **Evidence:** Zero matches. The file `feedback-loop.js` exists (172 lines, substantive), and the tests pass (229 lines). But `check-subagent-output.js` never imports or calls it.
> **Cross-check:** `grep -rn "require.*feedback-loop" bin/` returns zero results.
> **Status: FAILED** — The artifact exists and is tested, but it is completely orphaned. The key_link "imports and calls" does not hold. This is a **missing wiring** gap.

**Why this is good:** The verifier captured a common calibration pattern: code that exists and is tested, but is never connected to the system. L1 and L2 pass, but L3 (wiring) fails.

### Example 4: Distinguishing planning gaps from execution failures

**Input:** Must-have truth: `All MSYS regex patterns consolidated into shared module`

**Output:**

> **Method:** Ran `grep -rn "\/[a-zA-Z]\/" bin/` to find inline MSYS regexes.
> **Evidence:** 2 matches in `commands/misc.md` (lines 26, 487). These were NOT in the original scope of the plan — they were introduced AFTER the plan was written.
> **Assessment:** The executor correctly completed all planned tasks. The gap is a **planning sequencing issue**, not an execution failure.
> **Status: PASS_WITH_NOTES** — Executor did what was planned. Unconsolidated regex noted as follow-up, not as a failure of this phase.

**Why this is good:** The verifier distinguished between what was planned vs. what currently exists. Code that changed AFTER the creation of the plan is a planning gap, not an executor failure.

---

## Gap Patterns Derived from Calibration

Based on verification corpus analysis (80% pass rate, 8 gaps):

| Pattern | Count | % of Gaps | What to Verify |
|--------|-------|-----------|---------------|
| Missing wiring | 3 | 37% | File exists + tested but never imported/called by consumer |
| Missing tests | 2 | 25% | Feature works but test file excluded from CI or never executed |
| Others | 3 | 38% | Config layer mismatches, planning sequencing issues, schema gaps |

---

## Negative Examples

### Example 1: Blanket pass without per-criterion evidence

**Input:** Must-haves: 5 truths, 3 artifacts, 2 key_links from the plan's frontmatter.

**Output:**

> All must-haves have been verified. The implementation matches the plan requirements. Files exist and are properly connected. Status: PASSED.
> must_haves_checked: 10, must_haves_passed: 10

**Why this is bad:** No individual must-have is listed or verified. No file paths, no line numbers, no grep output, no level-by-level breakdown. The verifier restated the must-haves as passing without showing evidence. This would miss stubs, orphaned exports, and broken wiring.

### Example 2: Existence check without verifying substance or wiring

**Input:** Must-have artifact: `bin/lib/audit-checks/index.cjs: >100 lines`

**Output:**

> **L1 (Existence):** EXISTS — File found at `bin/lib/audit-checks/index.cjs`, 142 lines.
> **Status: PASSED**

**Why this is bad:** The verifier stopped at Level 1. The file has 142 lines but could contain `// TODO: implement all checks` with stub functions returning empty objects. Level 2 (substantive) and Level 3 (wired) were omitted. A file that exists but is never imported or contains only placeholder code should not pass.
