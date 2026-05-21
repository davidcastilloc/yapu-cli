# Thinking Models: Debug

Structured reasoning models for **debug** agents. Apply at decision points during investigation, not continuously. Each model counters a specific failure mode.

## Conflict Resolution

Fault Tree and Hypothesis-Driven are sequential: Fault Tree FIRST (generate the tree of possible causes), Hypothesis-Driven SECOND (test each branch systematically). Fault Tree provides the map; Hypothesis-Driven provides the discipline to navigate it.

---

## 1. Fault Tree Analysis

**Counters:** Jumping to conclusions without systematically mapping failure paths.

Before testing any hypothesis, construct a fault tree: start with the observed symptom as the root node, then branch into all possible causes by level (hardware, software, configuration, data, environment). Use AND/OR gates — some failures require multiple conditions (AND), others have independent triggers (OR). This tree becomes your investigation roadmap. Prioritize branches by probability and testability, but DO NOT prune branches just because they seem unlikely — unlikely causes that are easy to test should be tested early.

## 2. Hypothesis-Driven Investigation

**Counters:** Making random changes hoping something works — the "shotgun debugging" anti-pattern.

For each hypothesis on the fault tree, follow the strict protocol:
1. **PREDICT** — "If hypothesis H is correct, then test T should produce result R"
2. **TEST** — Execute exactly one test
3. **OBSERVE** — Record the actual result
4. **CONCLUDE** — matched = SUPPORTED, failed = ELIMINATED, unexpected = new evidence

Never skip the PREDICT step — without a prediction, you cannot distinguish a meaningful result from noise. Never change more than one variable per test.

## 3. Occam's Razor

**Counters:** Chasing elaborate explanations when simple ones have not been ruled out.

Before investigating complex multi-component interaction bugs, race conditions, or framework-level issues, check simple explanations first: variable name typo, incorrect path, missing import, incorrect config value, stale cache, wrong environment variable. These "boring" causes make up the majority of bugs. Only escalate to complex hypotheses AFTER eliminating the simple ones. If your current hypothesis requires 3+ things failing simultaneously, back up and look for a single-point failure.

## 4. Counterfactual Thinking

**Counters:** Failing to isolate causality by not asking "what if I change only this?"

When you have a hypothesis about the root cause, construct a counterfactual: "If I change ONLY this variable/config/line, the bug should disappear (or appear)." Run the counterfactual test. If the bug persists after your targeted change, your hypothesis is incorrect. If it disappears, you have strong causal evidence. This is more powerful than correlation ("the bug appeared after deploy X") because it tests the mechanism, not just the timeline.

---

## When NOT to Think

- **Obvious single-cause bugs** — If the error message names the exact file, line, and cause (e.g., `TypeError: Cannot read property 'x' of undefined at foo.js:42`), fix it directly.
- **Reproducing a known fix** — If you already know the root cause from a previous investigation, jump straight to the fix.
- **Typos, missing imports, incorrect paths** — If Occam's Razor would solve it immediately, apply the fix without invoking the full model.
- **Reading error logs** — Reading and understanding error output is normal debugging, not a "decision point." Only invoke models when there are multiple plausible hypotheses.
