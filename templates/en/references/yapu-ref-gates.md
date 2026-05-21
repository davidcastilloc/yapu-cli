# Gate Taxonomy

> Reference loaded on demand via `@yapu-ref-gates.md`.
> Canonical gate types used across all Yapu workflows. Each validation point maps to one of these four types.

---

## Gate Types

### Pre-flight Gate
**Purpose:** Validates preconditions before starting an operation.
**Behavior:** Blocks entry if conditions are not met. No partial work is created.
**Recovery:** Correct the missing precondition, then retry.
**Examples:**
- Planning phase verifies REQUIREMENTS.md before planning.
- Execution phase validates that PLAN.md exists before executing.
- Discussion phase confirms that the phase exists in ROADMAP.md.

### Revision Gate
**Purpose:** Evaluates output quality and routes to revision if it is insufficient.
**Behavior:** Loops back to the producer with specific feedback. Bounded by an iteration cap.
**Recovery:** The producer addresses the feedback; the checker re-evaluates. The loop also escalates early if the issue count does not decrease between consecutive iterations (stagnation detection). After max iterations, it escalates unconditionally.
**Examples:**
- Plan-checker reviewing PLAN.md (max 3 iterations).
- Verifier checking phase deliverables against success criteria.

### Escalation Gate
**Purpose:** Presents unresolvable issues to the developer for decision-making.
**Behavior:** Pauses the workflow, presents options, waits for human input.
**Recovery:** The developer chooses an action; the workflow resumes along the selected path.
**Examples:**
- Revision loop exhausted after 3 iterations.
- Merge conflict during worktree cleanup.
- Ambiguous requirement needing clarification.

### Abort Gate
**Purpose:** Terminates the operation to prevent damage or waste.
**Behavior:** Halts immediately, preserves state, reports the reason.
**Recovery:** The developer investigates the root cause, corrects it, and restarts from a checkpoint.
**Examples:**
- Critically low context window during execution.
- STATE.md in an error state blocking progress.
- Verification finds missing critical deliverables.

---

## Gates Matrix

| Workflow | Phase | Gate Type | Verified Artifacts | Failure Behavior |
|----------|------|-------------|----------------------|------------------------|
| plan-phase | Entry | Pre-flight | REQUIREMENTS.md, ROADMAP.md | Block with missing file message |
| plan-phase | Revision | Revision | PLAN.md quality | Loop to planner (max 3) |
| plan-phase | Post-revision | Escalation | Unresolved issues | Present to developer |
| execute-phase | Entry | Pre-flight | PLAN.md | Block with missing plan message |
| execute-phase | Completion | Revision | SUMMARY.md completeness | Re-execute incomplete tasks |
| verify-work | Entry | Pre-flight | SUMMARY.md | Block with missing summary message |
| verify-work | Evaluation | Escalation | Failed criteria | Present gaps to developer |
| next | Entry | Abort | Error state, checkpoints | Halt with diagnosis |

---

## Implementing Gates

- **Pre-flight** gates belong at workflow entry points. They are cheap, deterministic checks that prevent wasted work. If you can verify a precondition with a file existence check or config read, use a pre-flight gate.
- **Revision** gates belong after a producer step where quality varies. Always pair with an iteration cap to prevent infinite loops. The cap should reflect the cost of each iteration — expensive operations get fewer retries.
- **Escalation** gates belong where automatic resolution is impossible or ambiguous. They are the safety valve between revision loops and abort. Present clear options and sufficient context to the developer to decide.
- **Abort** gates belong at points where continuing would cause damage, waste significant resources, or produce nonsense output. They must preserve state so that work can be resumed after correcting the root cause.

**Selection heuristic:** Start with pre-flight. If the check occurs after producing work, it is a revision gate. If the revision loop cannot resolve the issue, escalate. If continuing is dangerous, abort.
