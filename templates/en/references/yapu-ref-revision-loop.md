# Revision Loop Pattern

> Reference loaded on demand via `@yapu-ref-revision-loop.md`.
> Standard pattern for iterative agent revision with feedback. Used when a checker/validator finds issues and the producing agent needs to revise its output.

---

## Pattern: Check-Revise-Escalate (max 3 iterations)

This pattern applies when:
1. An agent produces output (plans, imports, gap closure plans).
2. A checker/validator evaluates that output.
3. Issues needing revision are found.

### Flow

```
prev_issue_count = Infinity
iteration = 0

LOOP:
  1. Run checker/validator on current output
  2. Read checker results
  3. If PASSED or only INFO-level issues:
     -> Accept output, exit loop
  4. If BLOCKER or WARNING issues found:
     a. iteration += 1
     b. If iteration > 3:
        -> Escalate to user (see "After 3 Iterations")
     c. Parse issue count from checker output
     d. If issue_count >= prev_issue_count:
        -> Escalate to user: "Revision loop stalled (issue count not decreasing)"
     e. prev_issue_count = issue_count
     f. Re-spawn the producing agent with checker feedback attached
     g. After revision, go to LOOP
```

### Issue Count Tracking

Track the number of BLOCKER + WARNING issues returned by the checker in each iteration. If the count does not decrease between consecutive iterations, the producing agent is stalled and further iterations will not help. Cut early and escalate to the user.

Display iteration progress before each revision re-spawn:
`Revision iteration {N}/3 -- {blocker_count} blockers, {warning_count} warnings`

### Re-spawn Prompt Structure

When re-spawning the producing agent for revision, pass the checker issues in YAML format:

```
<checker_issues>
The issues below are in YAML format. Each has: dimension, severity, finding,
affected_field, suggested_fix. Address ALL BLOCKER issues. Address WARNING
issues where feasible.

{YAML issues block from checker output — passed verbatim}
</checker_issues>

<revision_instructions>
Address ALL BLOCKER and WARNING issues identified above.
- For each BLOCKER: make the required change.
- For each WARNING: address or explain why it is acceptable.
- DO NOT introduce new issues while fixing existing ones.
- Preserve all content not flagged by the checker.
This is revision iteration {N} of max 3. Previous iteration had {prev_count}
issues. You must reduce the count or the loop will terminate.
</revision_instructions>
```

### After 3 Iterations

If issues persist after 3 revision cycles:

1. Present remaining issues to the user.
2. Use gate prompt (pattern: yes-no from `@yapu-ref-gate-prompts.md`):
   - question: "Issues remain after 3 revision attempts. Proceed with current output?"
   - header: "Proceed?"
   - options:
     - label: "Proceed anyway" — description: "Accept output with remaining issues"
     - label: "Adjust approach" — description: "Discuss a different approach"
3. If "Proceed anyway": accept current output and continue.
4. If "Adjust approach" or "Other": discuss with user, then re-enter the producer step with updated context.

### Variations by Workflow

| Workflow | Producing Agent | Checker Agent | Notes |
|----------|-----------------|----------------|-------|
| plan-phase | yapu-planner | yapu-plan-checker | Revision prompt via planner-revision |
| execute-phase | yapu-executor | yapu-verifier | Post-execution verification |
| discuss-phase | orchestrator | yapu-plan-checker | Inline revision by orchestrator |

---

## Important Notes

- **INFO-level issues are always acceptable** — they do not trigger a revision.
- **Each iteration gets a fresh agent spawn** — do not attempt to continue in the same context.
- **Checker feedback must be inlined** — the revision agent needs to see exactly what failed.
- **Do not swallow issues silently** — always present the final state to the user after exiting the loop.
