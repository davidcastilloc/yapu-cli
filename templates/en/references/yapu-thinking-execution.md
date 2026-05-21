# Thinking Models: Execution

Structured reasoning models for **execution** agents. Apply at decision points during task execution, not continuously. Each model counters a specific failure mode.

## Conflict Resolution

Forcing Function and First Principles both push towards "do it now." Execute First Principles FIRST (understand the constraint), Forcing Function SECOND (create the mechanism). Sequential, not competitive.

---

## 1. Circle of Concern vs Circle of Control

**Counters:** Executor trying to fix things outside its scope — upstream bugs, unrelated tech debt, infrastructure issues.

Before modifying code not explicitly listed in the plan, ask: Is it in my Circle of Control (plan scope) or my Circle of Concern (things I notice but should not fix)? If it is Concern: document it as a deviation note, DO NOT fix it. The executor's job is to build what the plan says, not to improve the codebase. Scope creep due to "while I'm here" fixes is the #1 cause of executor overruns.

## 2. Forcing Function

**Counters:** Deferring difficult decisions to runtime instead of resolving them at build time.

When you encounter an ambiguous requirement or unclear integration point, create a forcing function that makes the decision explicit NOW instead of hiding it behind a TODO or runtime check. Examples: `never` type in TypeScript to force exhaustive switches, build-time assertion for required config, interface that forces callers to handle error cases. If the decision truly cannot be made at build time, document it as a deviation — do not defer it silently.

## 3. First Principles Thinking

**Counters:** Copying existing code patterns without understanding if they apply to the current task.

Before copying a pattern from another file, break down WHY it exists: What constraint does it satisfy? Does your current task have the same constraint? If not, the pattern might be cargo cult. Build your implementation from the actual requirements of the task, not from the closest existing example. When in doubt, the plan's action steps define what to build.

## 4. Occam's Razor

**Counters:** Over-engineering simple tasks with unnecessary abstractions, generics, or future-proofing.

Before adding an abstraction layer, generic parameter, factory pattern, or configuration option, ask: Does the plan REQUIRE this flexibility? If the plan says "create a function that does X", create a function that does X — not a configurable, extensible framework. The simplest implementation that satisfies the plan's `done` condition is the correct one.

## 5. Chesterton's Fence

**Counters:** Removing or modifying existing code without understanding why it was written that way.

Before removing, replacing, or significantly modifying existing code, determine WHY it exists. Check: git blame of the commit that introduced it, comments explaining the reason, test cases exercising it. If the purpose is not clear, preserve it and add a comment noting the uncertainty — DO NOT remove code whose purpose you do not understand.

---

## When NOT to Think

- **Direct plan actions** — If the plan says "create file X with content Y" and the action is unambiguous, execute it directly.
- **Following established patterns** — If the codebase has a clear, consistent pattern and the plan says to add another, follow the pattern. Chesterton's Fence applies to removing patterns, not following them.
- **Trivial edits** — Adding an import, fixing a typo, updating a version number. These are mechanical changes without design decisions.
- **Running verification commands** — Running verify steps is procedural. Only invoke models if a step fails and you need to decide how to respond.
