# Universal Anti-Patterns

> Reference loaded on demand via `@yapu-ref-anti-patterns.md`.
> 29 rules that apply to ALL Yapu workflows and agents. Individual workflows may add additional rules.

---

## Context Budget

1. **Never** read agent definition files (`agents/*.md`) — `subagent_type` loads them automatically. Reading them in the orchestrator wastes context.
2. **Never** insert large files into subagent prompts — instruct them to read them from disk. Each agent has its own context window.
3. **Reading depth scales with context window** — Verify `context_window` in `.planning/config.json`. With < 500K: read only frontmatter, status fields, or summaries. With ≥ 500K: full reading permitted when needed for inline decisions.
4. **Delegate** heavy lifting to subagents — the orchestrator routes, it does not build, analyze, research, or verify.
5. **Proactive pause warning**: If context consumed is significant (large file reads, multiple subagent results), warn: "Context budget is running low. Consider checkpointing progress."

## File Reading

6. **SUMMARY.md reading depth scales with context window** — With < 500K: only frontmatter of previous SUMMARYs. With ≥ 500K: full reading for direct dependency phases. Transitive dependencies (2+ phases back) always only frontmatter.
7. **Never** read full PLAN.md files from other phases — only the current phase's plan.
8. **Never** read files from `.planning/logs/` — only the health workflow reads them.
9. **Do not** reread full content when frontmatter is sufficient — frontmatter contains status, key_files, commits, and provides. Exception: with ≥ 500K, rereading the body is acceptable when semantic content is needed.

## Subagent Rules

10. **NEVER** use generic agent types (`general-purpose`, `Explore`, `Plan`, `Bash`, etc.) — ALWAYS use `subagent_type: "yapu-{agent}"`. Yapu agents have prompts with project context, audit logging, and workflow context. Generic agents bypass all of this.
11. **Do not** re-litigate decisions already locked in CONTEXT.md (or PROJECT.md ## Context) — respect locked decisions unconditionally.

## Questioning Anti-Patterns

> Complete reference in `@yapu-ref-questioning.md`.
 
12. **Do not** walk through checklists — asking items one by one from a list is the #1 anti-pattern. Use progressive depth: start broad, drill down where interesting.
13. **Do not** use corporate jargon — avoid "stakeholder alignment", "synergize", "deliverables". Use direct language.
14. **Do not** apply premature constraints — do not narrow the solution space before understanding the problem. Ask about the problem first, then constrain.

## State Management

15. **Do not write/edit STATE.md or ROADMAP.md directly for mutations.** Always use the registered state handlers (e.g., `state.update`, `state.advance-plan`, `roadmap.update-plan-progress`) or the programmatic API. Direct writing bypasses safe update logic and is unsafe in multi-session environments. Exception: initial creation of STATE.md from a template.

## Behavior Rules

16. **Do not** create artifacts that the user has not approved — always confirm before writing new planning documents.
17. **Do not** modify files outside the workflow's declared scope — check the plan's files_modified list.
18. **Do not** suggest multiple actions without a clear priority — one primary suggestion, with alternatives listed as secondary.
19. **Do not** use `git add .` or `git add -A` — stage specific files only.
20. **Do not** include sensitive information (API keys, passwords, tokens) in planning documents or commits.

## Error Recovery

21. **Git lock detection**: Before any git operation, if it fails with "Unable to create lock file", check for a stale `.git/index.lock` and alert the user to remove it (do not remove it automatically).
22. **Config fallback**: Loading config silently returns `null` on invalid JSON. If the workflow depends on config values, check for null and warn: "invalid or missing config.json — running with default values."
23. **Partial state recovery**: If STATE.md references a phase directory that does not exist, do not proceed silently. Warn the user and suggest diagnosing the mismatch.

## Yapu-Specific Rules

24. **Do not** check `mode === 'auto'` or `mode === 'autonomous'` — Yapu uses the `yolo` flag in config. Check `yolo: true` for autonomous mode, absence or `false` for interactive mode.
25. **Plan files MUST follow the pattern `{padded_phase}-{NN}-PLAN.md`** (e.g., `01-01-PLAN.md`). Never use `PLAN-01.md`, `plan-01.md`, or any other variation — tool detection depends on this exact pattern.
26. **Do not start executing the next plan before writing the SUMMARY.md of the current plan** — subsequent plans may reference it via `@` includes.

## iOS / Apple Platform Rules

27. **NEVER use `Package.swift` + `.executableTarget` as the primary build system for iOS apps.** SPM executable targets produce macOS CLI binaries, not iOS `.app` bundles. Use XcodeGen (`project.yml` + `xcodegen generate`) to create a proper `.xcodeproj`.
28. **Verify availability of SwiftUI APIs before using.** Many APIs require a specific minimum iOS version (e.g., `NavigationSplitView` is iOS 16+, `@Observable` requires iOS 17). If a plan uses an API that exceeds the declared `IPHONEOS_DEPLOYMENT_TARGET`, raise the target or add `#available` guards.
29. **Prefer the programmatic API** for orchestration when a handler exists; when using the legacy CLI, use the correct file name from Yapu's tooling.
