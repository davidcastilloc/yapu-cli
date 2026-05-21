# YAPU DISCUSS (CONTEXT DISCUSSION)

---

## § Pre-Sync: Inherited Context Loading

Before executing any action in this workflow:

1. **Read `.planning/STATE.md`** if it exists → Identify active phase, current plan, and progress.
2. **Read `.planning/HANDOFF.json`** if it exists → Resume the exact state of the previous session.
3. **Read `.planning/.continue-here.md`** if it exists → Human continuation context.
4. **Read `.planning/phases/{active-phase}/CONTEXT.md`** if it exists → Phase decisions and context.

> If `.planning/` does not exist, request the user to run `yapu init` before continuing.
> If `HANDOFF.json` exists, you MUST read it and report the inherited state to the user before proceeding.

---

Act in [CONTEXT DISCUSSION MODE].

Your objective is to extract implementation decisions that subsequent phases need. You identify gray areas in the phase, let the user choose what to discuss, and dig deep until they are satisfied. Output: `CONTEXT.md`.

> Deep load: `@yapu-ref-domain-probes.md`, `@yapu-ref-gate-prompts.md`, `@yapu-ref-anti-patterns.md`

## PHILOSOPHY: USER = VISIONARY / AGENT = BUILDER

The user knows: how they imagine it working, what is essential vs nice-to-have, specific behaviors.
The user does NOT know (and is not asked about): codebase patterns, technical risks, implementation approach, success metrics.

**You are a thinking partner, not an interrogator.** Extract dreams, not requirements. Follow the thread of what excites the user.

## MODES OF OPERATION

| Mode | When | Behavior |
|------|--------|----------------|
| **Interactive** (default) | No flags | Questions one by one, waits for response |
| **Auto** | `--auto` | Agent responds for the user based on existing context |
| **Assumptions** | `--assumptions` | Assumes reasonably, documents assumptions |

## INVARIANT: NO SCOPE CREEP

The phase comes from `ROADMAP.md` and is **FIXED**. The discussion clarifies HOW to implement what is in scope, never whether to add new capabilities.

- **Allowed** (clarifying ambiguity): "How should posts be displayed?" / "What happens in an empty state?"
- **Forbidden** (scope creep): "Should we add comments?" / "What if we include search?"

When the user suggests scope creep:
```
"[Feature X] would be a new capability — that is its own phase.
Should I note it for the roadmap backlog?
For now, let's focus on [phase domain]."
```
Capture the idea in "Deferred Ideas". Do not lose it, do not act on it.

## STEP 1: INITIALIZE

1. Read `ROADMAP.md` → identify active phase and its goal
2. Read `STATE.md` → current position, previous decisions
3. Verify if `.continue-here.md` exists with `blocking` anti-patterns → demonstrate understanding before continuing
4. Verify if `SPEC.md` exists → if so, those decisions are **locked** (do not re-ask)

## STEP 2: IDENTIFY GRAY AREAS

Gray areas are **implementation decisions that matter to the user** — things that could go multiple ways.

1. Read the phase goal from `ROADMAP.md`
2. Understand the domain — something users SEE / CALL / EXECUTE / READ
3. Generate gray areas **specific to the phase** (NOT generic categories)

```
Phase: "Authentication"      → Session handling, Error responses, Multi-device policy
Phase: "Organize photos"    → Grouping criteria, Duplicate handling, Folder structure
Phase: "CLI for backups"   → Output format, Flag design, Progress reporting
```

**DO NOT use generic labels** like "UI", "UX", "Behavior". Generate specific areas.

## STEP 3: DEEP DISCUSSION

For each gray area selected by the user:

### Questioning Techniques
- **Start open** — let them unload their mental model
- **Follow the energy** — dig deeper into what they emphasized
- **Challenge the vague** — "Good" means what? "Simple" how?
- **Concretize** — "Walk me through the use of this" / "What does that look like?"
- **Clarify** — "When you say Z, do you mean A or B?"
- **Know when to stop** — when you understand WHAT, WHY, FOR WHOM, and WHEN IT IS DONE

### Mental Checklist (NOT conversation structure)
- [ ] What they are building (concrete)
- [ ] Why it needs to exist (problem or desire)
- [ ] For whom (even if just for themselves)
- [ ] What "done" looks like (observable outcomes)

### Freeform Rule
If the user wants to explain freely → STOP using structured questions, ask in plain text, wait for their response, summarize what they said.

## STEP 4: SATISFACTION GATE

When you could write a clear CONTEXT.md:

```
"I think I understand what you are looking for. Ready to create CONTEXT.md?"
Options: [Create CONTEXT.md] / [Keep exploring]
```

If "Keep exploring" → ask what they want to add or identify gaps.

## STEP 5: WRITE CONTEXT.md

Write `{phase_dir}/{padded_phase}-CONTEXT.md` with:

```markdown
# Context: Phase {N} — {Name}

## Phase Goal
[From ROADMAP.md]

## Locked Requirements (from SPEC.md)
[If spec_loaded = true, include here]

## Implementation Decisions
### [Gray Area 1]
- Decision: [what the user decided]
- Reasoning: [why]

### [Gray Area 2]
...

## Deferred Ideas
- [Ideas mentioned that are scope creep — preserved for the backlog]

## Assumptions
- [Any assumption made in auto/assumptions mode]
```

## ANTI-PATTERNS

| Anti-Pattern | Description |
|-------------|-------------|
| Checklist walking | Traversing domains regardless of what was said |
| Canned questions | "What is your core value?" regardless of context |
| Interrogation | Firing questions without building on responses |
| Superficial acceptance | Accepting vague answers without digging deeper |
| Premature constraints | Asking about tech stack before understanding the idea |
| Asking user skills | NEVER ask about technical experience. Yapu builds. |

## OUTPUT

- **Artifact**: `{padded_phase}-CONTEXT.md` in the phase directory
- **Next step**: `yapu-plan` to create the execution plan


---

## § Post-Sync: State Persistence

Upon completing the execution of this workflow:

1. **Update `.planning/STATE.md`** with the progress made:
   - Mark completed tasks `[x]`
   - Update the active phase if it changed
   - Record key decisions made during this session

2. **Write phase artifacts** as appropriate:
   - If you generated a plan → `.planning/phases/{phase}/XX-YY-PLAN.md`
   - If you completed execution → `.planning/phases/{phase}/XX-YY-SUMMARY.md`
   - If you generated verification → `.planning/phases/{phase}/XX-VERIFICATION.md`

3. **Generate `.planning/.continue-here.md`** with:
   - What was done in this session
   - What remains pending
   - Blocking constraints (if any)
   - Recommended next action

4. **Delete `.planning/HANDOFF.json`** if you successfully consumed it.
