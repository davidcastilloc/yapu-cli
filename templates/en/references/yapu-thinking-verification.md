# Thinking Models: Verification

Structured reasoning models for **verification** agents. Apply during verification passes, not continuously. Each model counters a specific failure mode.

## Conflict Resolution

Inversion and Confirmation Bias Counter both search for failures but serve different purposes. Execute in sequence:

1. **Inversion FIRST** (brainstorm): generate 3 ways this could be wrong.
2. **Confirmation Bias Counter SECOND** (structured check): find a partial requirement, a misleading test, an uncovered error path.

Inversion generates the list; Confirmation Bias Counter is the discipline to verify the items.

---

## 1. Inversion

**Counters:** Verifiers confirming success instead of looking for failures.

Instead of verifying what IS correct, list 3 specific ways the implementation could be WRONG despite passing tests: missing edge cases, silent data loss, race conditions, unhandled error paths. For each, write a concrete check (grep by pattern, test with a specific input, verify error handling exists). Additionally, verify if any documented deviation changes the meaning of a must-have.

## 2. Chesterton's Fence

**Counters:** Flagging functional code as dead or unnecessary.

Before flagging existing code as dead, redundant, or over-complicated, determine WHY it was written that way. Check git blame, comments, test cases, and the plan that created it. If the reason is not clear, flag as "unknown purpose — recommend keeping with a WARNING, not removing".

## 3. Confirmation Bias Counter

**Counters:** Verifiers biased by summary claims to see success.

After your initial verification pass, make a DISCONFIRMATION pass: (1) find a requirement that is only partially met, (2) find a test that passes but does not actually test the claimed behavior, (3) find an error path without test coverage. Report these even if the overall verification passes.

## 4. Planning Fallacy Calibration

**Counters:** Accepting oversized plans as reasonable.

For each task estimated as "simple" or "small", verify: does it touch more than 2 files? Does it require understanding an unfamiliar API? Does it modify shared infrastructure? If yes to any, flag as probably underestimated. Plans with >5 tasks or tasks touching >4 files per task are oversized.

## 5. Counterfactual Thinking

**Counters:** Plans that assume success at every step without error recovery.

For each plan, ask: "What would happen if the executor followed this plan EXACTLY but encountered a common failure: incorrect dependency version, API returning unexpected format, file already modified by previous plan?" If the plan has no contingency path, flag as a WARNING: "No error recovery path for task N."

---

## When NOT to Think

- **Re-verification of already approved items** — These only need a quick regression check (existence + basic sanity), not the full Inversion + Confirmation Bias treatment.
- **Binary existence checks** — If a must-have is "file X exists with >N lines" and the file clearly exists, do not run Counterfactual Thinking.
- **Direct test results** — If verify commands produce clear pass/fail output, accept the result. Only invoke models when results are ambiguous.
- **INFO-level issues** — Do not apply structured reasoning to decide if an INFO observation is actually a BLOCKER.
