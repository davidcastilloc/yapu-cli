# Context Budget Rules

Standard rules for keeping the orchestrator's context lean. Reference for workflows that spawn subagents or read significant content.

---

## Universal Rules

1. **Never** read agent definition files (`agents/*.md`) — the subagent type auto-loads them.
2. **Never** inline large files in subagent prompts — tell agents to read files from disk.
3. **Reading depth scales with context window:**
   - **< 500k tokens (default 200k):** read only frontmatter, status fields, or summaries. Never read full bodies of SUMMARY.md, VERIFICATION.md, or RESEARCH.md.
   - **≥ 500k tokens (1M model):** CAN read full bodies of subagent output when content is needed for inline presentation or decision making.
4. **Delegate** heavy lifting to subagents — the orchestrator routes, it does not execute.
5. **Proactive warning:** If you have already consumed significant context, warn: "The context budget is running low. Consider checkpointing."

## Reading Depth by Context Window

| Context Window | Subagent Output | SUMMARY.md | VERIFICATION.md | PLAN.md (other phases) |
|---------------|---------------------|------------|-----------------|----------------------|
| < 500k (200k) | Only frontmatter | Only frontmatter | Only frontmatter | Current phase only |
| ≥ 500k (1M) | Full body allowed | Full body allowed | Full body allowed | Current phase only |

**How to verify:** Read `.planning/config.json` and inspect `context_window`. If the field does not exist, treat as 200k (conservative default).

---

## Context Degradation Tiers

Monitor context usage and adjust behavior:

| Tier | Usage | Behavior |
|------|-----|---------------|
| **PEAK** | 0-30% | Full operations. Read bodies, spawn multiple agents, inline results. |
| **GOOD** | 30-50% | Normal operations. Prefer frontmatter reads, delegate aggressively. |
| **DEGRADING** | 50-70% | Economize. Frontmatter-only reads, minimal inline, warn user. |
| **POOR** | 70%+ | Emergency mode. Immediate progress checkpoint. No new reads unless critical. |

---

## Degradation Signals

Quality degrades gradually before panic thresholds are triggered:

- **Silent partial completion** — agent claims the task is done but the implementation is incomplete. Self-check verifies file existence but not semantic completeness. Always verify that output meets the plan's must_haves, not just that files exist.
- **Increasing vagueness** — agent starts using phrases like "appropriate handling" or "standard patterns" instead of specific code. Indicates context pressure before warnings are triggered.
- **Omitted steps** — agent skips steps it would normally follow. If success criteria has 8 items but reports 5, suspect context pressure.

> **Fundamental limitation:** The orchestrator cannot verify semantic correctness of agent output — only structural completeness. Mitigate with must_haves.truths and spot-check verification.
