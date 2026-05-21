# MVP Concepts: Vertical Slices, Walking Skeleton, and SPIDR

Unified reference for MVP planning: how to structure features as vertical slices, when to use a walking skeleton, and how to split large stories using SPIDR.

---

## Vertical Slices

A **vertical slice** cuts across all layers of the stack (UI → API → DB) to deliver functional end-to-end behavior. Contrast this with horizontal slicing (Phase 1: schema, Phase 2: API, Phase 3: UI) which does not produce usable value until the end.

### Fundamental Principle

Each phase delivers something a user can use or verify. Not "the database is ready" but "a user can register."

### Ordering Rules

1. **Happy path first** — proves the slice works.
2. **Edge cases next** — error handling, complex validations.
3. **Optimizations last** — caching, performance, polish.

### User Story Format

```
As a [user role], I want to [capability], so that [benefit].
```

Validation regex: `/^As a .+, I want to .+, so that .+\.$/`

Each MVP phase must have a user story that defines its vertical slice.

---

## Walking Skeleton

A **walking skeleton** is the first phase of an MVP project: the minimal end-to-end implementation that proves the stack works together.

### When It Is Activated

- Phase 1 + new project + MVP mode + no previous SUMMARYs

### What It Includes

- Project scaffold (framework, DB, config)
- ONE complete end-to-end flow (request → process → response)
- Minimal deployment (can be local)

### What It Does NOT Include

- Complete features
- Exhaustive error handling
- Polished UI
- Optimizations

### Purpose

To prove that the pieces connect before investing in features. If the skeleton doesn't work, it's better to know after 1 day of work than 1 month.

---

## SPIDR Story Splitting

When a user story is too large for a single phase, use SPIDR to break it down into smaller slices.

### When to Split (Size Signals)

1. **Compound capabilities** — The story names 2+ independent actions joined by "and" (e.g., "register **and** log in **and** reset password").
2. **Multi-actor** — The story names more than one user role (e.g., "As a user or admin...").
3. **Length** — The story exceeds ~120 characters on one line.
4. **Vague capability** — The capability is a noun, not a verb-noun pair (e.g., "I want to use the dashboard").

If no signal applies → skip SPIDR and continue.

### The 5 SPIDR Axes

For each axis, ask ONE targeted question. Only one axis applies per split.

#### Spike
> "Is there an unknown that needs research before implementation?"

If yes: separate the research phase. The rest of the story becomes a follow-up.

#### Paths
> "Does this feature have a happy path and one or more error/edge paths?"

If yes: happy path in the first phase, edge paths in follow-ups.

#### Interfaces
> "Does this feature need to work across more than one interface (web, mobile, API, CLI)?"

If yes: split by interface. Web first if user-facing; API first if integration-driven.

#### Data
> "Does this feature touch multiple data scopes (one user vs. many, single team vs. multi-tenant)?"

If yes: split by scope. Smallest scope first, then expand.

#### Rules
> "Does this feature have multiple business rules that can be added incrementally?"

If yes: split by rule complexity. Minimum viable rules first.

### Splitting Anti-patterns

- **Split by technical layer.** "Phase 1: schema. Phase 2: API. Phase 3: UI." — That is horizontal. Reject.
- **Pre-splitting before showing the original.** Always show the story to the user first.
- **Split more than one axis at a time.** SPIDR is one axis per split. If two axes are needed, split by the first and re-evaluate.

---

## Key Interactions

- **MVP_MODE is all-or-nothing per phase.** A phase is either MVP or standard. There are no mixed-mode phases.
- **TDD_MODE is independent of MVP_MODE.** Only the intersection (both true) activates the MVP+TDD Gate.
- **The walking skeleton and the PRD can coexist in Phase 1 — the PRD informs what the skeleton must test.**
