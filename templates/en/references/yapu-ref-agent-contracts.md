# Agent Contracts

Completion markers and handoff schemas for Yapu agents. Workflows use these markers to detect completion and route appropriately.

---

## Agent Registry

| Agent | Role | Completion Markers |
|--------|-----|---------------------------|
| yapu-planner | Plan creation | `## PLANNING COMPLETE` |
| yapu-executor | Plan execution | `## PLAN COMPLETE`, `## CHECKPOINT REACHED` |
| yapu-researcher | Phase research | `## RESEARCH COMPLETE`, `## RESEARCH BLOCKED` |
| yapu-plan-checker | Plan validation | `## VERIFICATION PASSED`, `## ISSUES FOUND` |
| yapu-debugger | Debug research | `## DEBUG COMPLETE`, `## ROOT CAUSE FOUND`, `## CHECKPOINT REACHED` |
| yapu-roadmapper | Roadmap creation/revision | `## ROADMAP CREATED`, `## ROADMAP REVISED`, `## ROADMAP BLOCKED` |
| yapu-verifier | Post-execution verification | `## Verification Complete` (title case) |

## Marker Rules

1. **ALL-CAPS markers** (e.g., `## PLANNING COMPLETE`) are the standard convention
2. **Title-case markers** (e.g., `## Verification Complete`) exist in the verifier — intentional, not a bug
3. **Non-standard markers** (e.g., `## PARTIAL`, `## ESCALATE`) indicate partial results that require the orchestrator's judgment
4. **Agents without markers** write artifacts directly to disk or return structured data (JSON/sections) that the caller parses
5. The markers must appear as H2 headings (`## `) at the beginning of a line in the agent's final output

---

## Key Handoff Contracts

### Planner → Executor (via PLAN.md)

| Field | Required | Description |
|-------|-----------|-------------|
| Frontmatter | Yes | phase, plan, type, wave, depends_on, files_modified, autonomous, requirements |
| `<objective>` | Yes | What the plan achieves |
| `<tasks>` | Yes | Ordered list of tasks with type, files, action, verify, acceptance_criteria |
| `<verification>` | Yes | General verification steps |
| `<success_criteria>` | Yes | Measurable completion criteria |

### Executor → Verifier (via SUMMARY.md)

| Field | Required | Description |
|-------|-----------|-------------|
| Frontmatter | Yes | phase, plan, subsystem, tags, key-files, metrics |
| Commit table | Yes | Hashes and descriptions of commits per task |
| Deviations section | Yes | Self-corrected issues or "None" |
| Self-Check | Yes | PASSED or FAILED with details |

---

## Workflow Regex Patterns

Workflows match these markers to detect completion:

**plan-phase matches:**
- `## RESEARCH COMPLETE` / `## RESEARCH BLOCKED`
- `## PLANNING COMPLETE`
- `## CHECKPOINT REACHED`
- `## VERIFICATION PASSED` / `## ISSUES FOUND`

**execute-phase matches:**
- `## PHASE COMPLETE`
- `## Self-Check: FAILED`

> **NOTE:** `## PLAN COMPLETE` is the executor's marker, but execute-phase does not match it via regex. Instead, it detects executor completion via spot-checks (existence of SUMMARY.md, git commit status). This is intentional behavior.
