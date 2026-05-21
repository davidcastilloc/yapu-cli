# Thinking Models: Planning

Structured reasoning models for **planning** agents. Apply at decision points during plan creation, not continuously. Each model counters a specific failure mode.

## Conflict Resolution

Constraint Analysis and Pre-Mortem analyze risk at different granularities. Execute Constraint Analysis FIRST (identify the hardest constraint), then Pre-Mortem (list failure modes around that constraint and the rest of the plan).

---

## 1. Pre-Mortem Analysis

**Counters:** Optimistic decomposition that ignores failure modes.

Before finalizing the plan, assume it has already failed. List the 3 most likely reasons for failure — missing dependency, incorrect decomposition, underestimated complexity — and add mitigation steps or acceptance criteria that detect each failure early.

## 2. MECE Decomposition

**Counters:** Overlapping tasks (merge conflicts) or tasks with gaps (missing requirements).

Verify that the breakdown is MECE at the REQUIREMENTS level: (1) list each requirement from the phase goal, (2) confirm that each maps to exactly one `done` of a task, (3) if two tasks modify the same file, confirm that they modify DIFFERENT sections or serve DIFFERENT requirements, (4) flag any uncovered requirement.

## 3. Constraint Analysis

**Counters:** Deferring the hardest constraint to the last task, causing late failures.

Identify the hardest constraint of the phase — the thing that, if it doesn't work, makes everything else irrelevant. Schedule it as Task 1 or 2, not at the end. If it involves an external API or unfamiliar library, add a spike/proof-of-concept task before the main implementation.

## 4. Reversibility Test

**Counters:** Over-analyzing cheap decisions, under-analyzing costly decisions.

Classify each significant decision as REVERSIBLE (changing later costs little) or IRREVERSIBLE (requires migration, breaking changes, or significant rework). Spend analysis time proportional to irreversibility. For irreversible decisions, document the justification in the plan.

## 5. Curse of Knowledge Counter

**Counters:** Plan-to-executor ambiguity due to compressed instructions.

For each action step, re-read it as if you had NEVER seen the codebase. Is every noun unambiguous (which file? which function?)? Is every verb specific (add WHERE? modify HOW?)? If a step can be interpreted in two ways, rewrite it. Include file paths, function names, and expected behavior.

## 6. Base Rate Neglect Counter

**Counters:** Planners ignoring low-confidence research caveats.

Before finalizing, read ALL `[NEEDS DECISION]` items and LOW-confidence recommendations from the research summary. For each: (a) create a checkpoint task to resolve it, or (b) document why the risk is acceptable. Silently accepted LOW-confidence items become undocumented technical debt.

## Gap Closure: Root-Cause Check

**Applies only when:** Gaps are detected during verification.

Before writing the correction plan, apply a round of "whys": Was it a plan deficiency (wrong task), an execution failure (correct task, incorrect implementation), or a changed assumption (environment/dependency change)? The correction plan must target the root cause, not just the symptom.

---

## When NOT to Think

- **Single-task plans** — If the phase has a clear requirement and an obvious task, do not run Pre-Mortem or MECE.
- **Well-researched phases** — If research has HIGH-confidence recommendations for every decision, skip Base Rate Neglect Counter.
- **Revision iterations** — When reviewing a plan based on feedback, focus on the flagged issues. Do not re-execute the entire suite on every pass.
- **Boilerplate plans** — Config changes, version bumps, docs updates. They do not have failure modes that warrant a pre-mortem.
