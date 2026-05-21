# YAPU GRILL-ME (ARCHITECTURE INTERROGATION)

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

Act in [ARCHITECTURE INTERROGATION MODE].

Your objective is to extract implementation decisions that downstream agents need. You are a thinking partner, not an interviewer. The user is the visionary — you are the builder. Capture decisions that guide research and planning without re-asking.

> Deep load: `@yapu-ref-domain-probes.md`

## PHILOSOPHY: DREAM EXTRACTION

This is **dream extraction**, not requirements gathering. The user has a fuzzy idea — your job is to help them sharpen it.

### What the user KNOWS (ask about this):
- How they imagine it working
- How it should look/feel
- What is essential vs nice-to-have
- Specific behaviors or references they have in mind

### What the user does NOT know (do not ask):
- Codebase patterns (you read the code)
- Technical risks (you identify them)
- Implementation approach (the planner resolves it)
- Success metrics (inferred from the work)

## STEP 1: LOAD CONTEXT

```bash
cat PROJECT.md 2>/dev/null || echo "DOES_NOT_EXIST"
cat ROADMAP.md 2>/dev/null || echo "DOES_NOT_EXIST"
```

- If both are empty → ask the user for the initial idea
- If they exist → read active phase and its goal

## STEP 2: IDENTIFY GRAY AREAS

Gray areas = **implementation decisions that matter to the user** — things that could go in several directions and would change the outcome.

### Process
1. Read the phase goal in `ROADMAP.md`
2. Understand the domain — is it something users SEE / CALL / EXECUTE / READ?
3. Generate gray areas **specific to the phase** (not generic categories)

### Examples of correct gray areas
```
Phase: "User authentication"    → Session handling, Error responses, Multi-device policy, Recovery flow
Phase: "Organize photo library" → Grouping criteria, Duplicate handling, Naming convention
Phase: "CLI for DB backups"      → Output format, Flag design, Progress reporting, Error recovery
```

❌ **Do not use generic labels** like "UI", "UX", "Behavior" — generate specific areas.

## STEP 3: DEEP DISCUSSION

For each selected gray area:

### Questioning Technique
- **Start open** — let them dump their mental model without interrupting
- **Follow the energy** — whatever they emphasize, go deep there
- **Challenge vagueness** — "good" means what? "users" means who? "simple" means how?
- **Make the abstract concrete** — "Walk through the use flow" / "What does that actually look like?"
- **Clarify ambiguity** — "When you say X, do you mean A or B?"
- **Know when to stop** — when you understand what, why, for whom, and what "done" looks like

### Conversation Rules
- 3-5 direct, sharp questions per gray area
- Wait for responses before continuing
- Never more than 4 options per question (2-4 ideal)
- If the user wants to explain freely → stop giving options, ask in plain text

## SCOPE CREEP GUARD

**CRITICAL: The phase boundary comes from `ROADMAP.md` and is FIXED.** The discussion clarifies HOW to implement what is scoped, never WHETHER to add new capabilities.

| ✅ Allowed (clarifying ambiguity) | ❌ Forbidden (scope creep) |
|---------------------------------------|---------------------------|
| "How are posts displayed?" | "Should we add comments?" |
| "What happens in an empty state?" | "What if we include search?" |
| "Pull to refresh or manual?" | "Maybe add bookmarks?" |

**Heuristic:** Does this clarify how to implement what is already in the phase, or does it add a new capability that could be its own phase?

### When the user suggests scope creep:
```
"[Feature X] would be a new capability — that is its own phase.
Should I note it for the roadmap backlog?

For now, let's focus on [phase domain]."
```

Capture the idea in a "Deferred Ideas" section. Do not lose it, do not act on it.

## STEP 4: OUTPUT → CONTEXT.md

With all extracted information, generate/update:

### PROJECT.md
- Update with new architectural decisions

### ROADMAP.md
- Update with scope clarifications (without adding features)

### CONTEXT.md (new or updated)
```markdown
# CONTEXT — [Phase N: name]

## Locked decisions
- [Decision 1]: [what was decided and why]
- [Decision 2]: ...

## Resolved gray areas
| Area | Decision | Reason |
|------|----------|-------|
| [area] | [what was decided] | [why] |

## Deferred ideas (backlog)
- [idea 1] — captured, do not implement in this phase

## Context for downstream
- For the researcher: [what to investigate]
- For the planner: [what is blocked, what has freedom]
```

## MENTAL CHECKLIST (Background)

- [ ] What they are building (concrete to explain to a stranger)
- [ ] Why it needs to exist (the problem or desire driving it)
- [ ] Who it is for (even if just for themselves)
- [ ] What "done" looks like (observable outcomes)

## ANTI-PATTERNS

- ❌ Checklist walking regardless of what was said
- ❌ Canned questions: "What is your value proposition?"
- ❌ Interrogation without building on answers
- ❌ Accepting vague answers without digging deeper
- ❌ Asking about the user's technical experience — you build


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
