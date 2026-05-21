# Prompt Patterns for Gates

> Reference loaded on demand via `@yapu-ref-gate-prompts.md`.
> Reusable prompt patterns for structured gate checks in workflows and agents.

---

## Rules

- `header` must be a maximum of 12 characters.
- `multiSelect` is always `false` for gate checks.
- Always handle the "Other" case (user wrote a free-form response instead of selecting).
- Maximum of 4 options per prompt — if more are needed, use a 2-step flow.

---

## 1. approve-revise-abort

3-option gate for plan approval, gap closure.
- question: "Approve these {noun}?"
- header: "Approve?"
- options: Approve | Request changes | Abort

## 2. yes-no

Simple 2-option confirmation for re-planning, rebuild, plan replacement, commit.
- question: "{Specific question about the action}"
- header: "Confirm"
- options: Yes | No

## 3. stale-continue

2-option freshness gate for obsolescence warnings.
- question: "{Artifact} may be outdated. Refresh or continue?"
- header: "Stale"
- options: Refresh | Continue anyway

## 4. yes-no-pick

3-option selection for seed selection, item inclusion.
- question: "Include {items} in planning?"
- header: "Include?"
- options: Yes, all | Let me pick | No

## 5. multi-option-failure

4-option failure handler for build failures.
- question: "Plan {id} failed. How should we proceed?"
- header: "Failed"
- options: Retry | Skip | Rollback | Abort

## 6. multi-option-escalation

4-option escalation (max retries exceeded).
- question: "Phase {N} has failed verification {attempt} times. How should we proceed?"
- header: "Escalate"
- options: Accept gaps | Re-plan | Debug | Retry

## 7. multi-option-gaps

4-option gaps handler for gaps found in review.
- question: "{count} verification gaps need attention. How should we proceed?"
- header: "Gaps"
- options: Auto-fix | Override | Manual | Skip

## 8. multi-option-priority

4-option priority selection for milestone gaps.
- question: "Which gaps should we address?"
- header: "Priority"
- options: Must-fix only | Must + should | Everything | Let me pick

## 9. toggle-confirm

2-option confirmation for enabling/disabling boolean features.
- question: "Enable {feature_name}?"
- header: "Toggle"
- options: Enable | Disable

## 10. action-routing

Up to 4 suggested actions with selection (state, resume workflows).
- question: "What would you like to do next?"
- header: "Next Step"
- options: {primary action} | {alternative 1} | {alternative 2} | Something else
- Note: Generate options dynamically from the workflow state. Always include "Something else" as the last option.

## 11. scope-confirm

3-option confirmation for quick task scope validation.
- question: "This task looks complex. Proceed as quick task or use full planning?"
- header: "Scope"
- options: Quick task | Full plan | Revise

## 12. depth-select

3-option depth selection for planning workflow preferences.
- question: "How thorough should planning be?"
- header: "Depth"
- options: Quick (3-5 phases, skip research) | Standard (5-8 phases, default) | Comprehensive (8-12 phases, deep research)

## 13. context-handling

3-option handler for existing CONTEXT.md in discussion workflow.
- question: "Phase {N} already has a CONTEXT.md. How should we handle it?"
- header: "Context"
- options: Overwrite | Append | Cancel

## 14. gray-area-option

Dynamic template to present gray-area options in discussion workflow.
- question: "{Gray area title}"
- header: "Decision"
- options: {Option 1} | {Option 2} | Let Claude decide
- Note: Options generated at runtime. Always include "Let Claude decide" as the last option.
