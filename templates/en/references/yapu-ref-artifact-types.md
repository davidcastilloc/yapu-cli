# Yapu Artifact Taxonomy

All artifact types in the planning taxonomy. Each type has a defined shape, lifecycle, location, and consumption mechanism. A well-formatted artifact that no workflow reads is inert — the consumption mechanism is what gives it meaning.

---

## Core Artifacts

### ROADMAP.md
- **Shape**: Milestone + phase listing with goals and canonical refs
- **Lifecycle**: Created → Updated per milestone → Archived
- **Location**: `.planning/ROADMAP.md`
- **Consumed by**: plan-phase, discuss-phase, execute-phase, progress, state

### STATE.md
- **Shape**: Current position tracker (phase, plan, progress, decisions)
- **Lifecycle**: Continuously updated during the project
- **Location**: `.planning/STATE.md`
- **Consumed by**: All orchestration workflows; resume-project, progress, next

### REQUIREMENTS.md
- **Shape**: Numbered acceptance criteria with traceability table
- **Lifecycle**: Created at start → Updated as requirements are met
- **Location**: `.planning/REQUIREMENTS.md`
- **Consumed by**: discuss-phase, plan-phase, CONTEXT.md generation; executor marks as complete

### CONTEXT.md (per phase)
- **Shape**: 6-section format: domain, decisions, canonical_refs, code_context, specifics, deferred
- **Lifecycle**: Created before planning → Used during planning/execution → Replaced by next phase
- **Location**: `.planning/phases/XX-name/XX-CONTEXT.md`
- **Consumed by**: plan-phase (reads decisions), execute-phase (reads code_context and canonical_refs)

### PLAN.md (per plan)
- **Shape**: Frontmatter + objective + tasks with types + success criteria + output spec
- **Lifecycle**: Created by planner → Executed → SUMMARY.md produced
- **Location**: `.planning/phases/XX-name/XX-YY-PLAN.md`
- **Consumed by**: Executor; commits reference plan IDs

### SUMMARY.md (per plan)
- **Shape**: Frontmatter with dependency graph + narrative + deviations + self-check
- **Lifecycle**: Created upon plan completion → Read by subsequent plans
- **Location**: `.planning/phases/XX-name/XX-YY-SUMMARY.md`
- **Consumed by**: Orchestrator (progress), planner (context for future plans)

### HANDOFF.json / .continue-here.md
- **Shape**: Structured pause state (machine-readable JSON + human-readable Markdown)
- **Lifecycle**: Created upon pause → Consumed on resume → Replaced at next pause
- **Location**: `.planning/HANDOFF.json` + `.planning/phases/XX-name/.continue-here.md`
- **Consumed by**: resume-project workflow

---

## Extended Artifacts

### DISCUSSION-LOG.md (per phase)
- **Shape**: Audit trail of assumptions and corrections from discuss-phase
- **Lifecycle**: Created in discussion → Read-only log
- **Location**: `.planning/phases/XX-name/XX-DISCUSSION-LOG.md`
- **Consumed by**: Human review; not read by automated workflows

### VERIFICATION.md (per phase)
- **Shape**: Verification results with gaps and deferred items
- **Lifecycle**: Created post-execution → Input for gap closure if gaps exist
- **Location**: `.planning/phases/XX-name/XX-VERIFICATION.md`
- **Consumed by**: Gap closure mode, orchestrator for decisions

### SPIKE.md / DESIGN.md (per spike)
- **Shape**: Research question + methodology + findings + recommendation
- **Lifecycle**: Created → Researched → Decided → Archived
- **Location**: `.planning/spikes/SPIKE-NNN/`
- **Consumed by**: Planner when spike is referenced

---

## Permanent Reference Artifacts

### METHODOLOGY.md
- **Shape**: Permanent reference — reusable interpretive frameworks (lenses) that apply across phases
- **Lifecycle**: Created → Active → Replaced (when a lens is substituted for a better one)
- **Location**: `.planning/METHODOLOGY.md` (project-scoped, not phase-scoped)
- **Content**: Named lenses, each documenting:
  - What it diagnoses (class of problem it detects)
  - What it recommends (class of response it prescribes)
  - When to apply (trigger conditions)

**Why consumption matters:** A METHODOLOGY.md that no workflow reads is inert. Lenses only take effect when an agent loads them into its reasoning context before analysis.

### Example lens entry

```markdown
## Bayesian Updating

**Diagnoses:** Decisions made with obsolete priors — assumptions formed early that evidence contradicted, but which remain in the plan.

**Recommends:** Before confirming an assumption, ask: "What evidence would make me change this?" If no evidence could change it, it is a belief, not an assumption.

**Apply when:** Any assumption carries a Confident label but was formed before recent architectural changes.
```
