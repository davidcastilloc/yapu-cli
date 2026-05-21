# Calibration Examples: Plan Checker

Positive/negative examples to calibrate the plan-checker. They show the level of evidence and precision expected.

---

## Positive Examples

### Example 1: BLOCKER due to vague action without file names or functions

**Input:** Plan task with action: "Implement the authentication feature for the API routes."

**Output:**

> ```yaml
> issues:
>   - dimension: task_completeness
>     severity: BLOCKER
>     finding: "Task T1 action says 'implement the authentication feature' without naming target files, functions to create, or middleware to apply. Executor cannot determine what to build."
>     affected_field: "<action>"
>     suggested_fix: "Specify: create authMiddleware in src/middleware/auth.js, apply to routes in src/routes/api.js lines 12-45, verify with integration test"
> ```

**Why this is good:** The checker cited the specific dimension (task_completeness), cited the problematic text, explained why it is a blocker (executor cannot determine what to build), and provided a concrete fix with file paths and function names. The finding is actionable.

### Example 2: BLOCKER due to file conflict in the same wave

**Input:** Two plans in wave 1 — Plan 01 modifies `workflows/execute-phase.md`, Plan 02 also modifies `workflows/execute-phase.md`. No `depends_on` declared.

**Output:**

> ```yaml
> issues:
>   - dimension: dependency_correctness
>     severity: BLOCKER
>     finding: "Plans 01 and 02 both modify workflows/execute-phase.md in wave 1 with no depends_on relationship. Concurrent execution will cause merge conflicts or lost changes."
>     affected_field: "files_modified"
>     suggested_fix: "Either move Plan 02 to wave 2 with depends_on: ['01'] or consolidate the file changes into a single plan"
> ```

**Why this is good:** The checker identified a real structural problem — two plans modifying the same file in the same wave with no dependency relationship. It cited `dependency_correctness`, named both plans, the conflicting file, and provided two alternative fixes.

---

## Negative Examples

### Example 1: All dimensions pass when verify commands are missing

**Input:** Plan with 3 tasks. Task T2 has `<verify></verify>` (empty). Task T3 has `<verify>echo "done"</verify>` (trivial, does not distinguish pass from fail).

**Output:**

> ## CHECK PASSED
> Plans: 1 | Tasks: 3 | Dimensions: 10 | Issues: 0

**Why this is bad:** The checker missed two violations. `verification_derivation` requires verify commands to be executable and test actual output — an empty verify block is a BLOCKER. `echo "done"` always returns 0 regardless of implementation status. Both should have been flagged.

### Example 2: False positive INFO for a correctly dimensioned plan

**Input:** Plan with 3 tasks, 6 unique files, 1 dependency. All within limits.

**Output:**

> ```yaml
> issues:
>   - dimension: scope_sanity
>     severity: INFO
>     finding: "Plan has 3 tasks -- consider splitting into smaller plans for faster iteration"
>     affected_field: "task count"
>     suggested_fix: "Split tasks into separate plans"
> ```

**Why this is bad:** The checker flagged a non-issue. `scope_sanity` allows 2-3 tasks per plan — 3 tasks is within the limits. The checker applied personal preference ("smaller is better") instead of the documented threshold. This wastes the planner's time on false positives and erodes trust in the checker's judgment.
