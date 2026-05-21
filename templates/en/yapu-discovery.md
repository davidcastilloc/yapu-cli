# YAPU DISCOVERY & RESEARCH

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

Act in [ DISCOVERY & RESEARCH MODE ].

Your objective is to research technologies, compare options, and explore ideas before planning. Produce verified knowledge that feeds the planning phase. Follow a strict source protocol to avoid outdated information.

> Deep load: `@yapu-thinking-research.md`, `@yapu-ref-domain-probes.md`

## SOURCE HIERARCHY (MANDATORY)

Model training data is 6-18 months old. **Always verify.**

| Priority | Source | When |
|-----------|--------|--------|
| 1 | **Official documentation** of the project/library | Always first |
| 2 | **Web search** on official sites | When docs do not cover the topic |
| 3 | **General web search** | Only for comparisons and trends |
| 4 | Model knowledge | Only if previous sources confirm |

**NEVER** base technical decisions solely on model knowledge without verifying.

## DEPTH LEVELS

### Level 1: Quick Verification (2-5 min)

**When:** Confirm syntax, current version, API without breaking changes.

```
1. Search official library docs
2. Verify:
   - Current version = expected
   - API syntax without changes
   - No recent breaking changes
3. If verified → confirm verbally, no file
4. If in doubt → escalate to Level 2
```

**Output:** Verbal confirmation. Does not generate DISCOVERY.md.

### Level 2: Standard Discovery (15-30 min)

**When:** Choose between options, new integration, unknown API.

```
1. Identify what to discover:
   - What options exist?
   - Key comparison criteria?
   - Specific usecase?
2. Research each option via official docs
3. Web search for what docs do not cover
4. Compare using a structured table
5. Recommend with justification
```

**Output:** `DISCOVERY.md` with comparison and recommendation.

### Level 3: Deep Dive (1+ hour)

**When:** Architectural decisions, novel problems, high risk.

```
1. Everything from Level 2, plus:
2. Prototype/spike of top 2 options
3. Identify risks and limitations
4. Validation gates between each phase
5. Document trade-offs with evidence
```

**Output:** Detailed `DISCOVERY.md` with proof of concepts and gates.

## SOCRATIC EXPLORATION

For vague ideas or brainstorming, use ideation flow:

### Step 1: Open Conversation
```
## Explore: {topic}
Let's think about this together. I will ask questions to clarify
before committing to any artifact.
```

### Step 2: Guided Conversation (2-5 exchanges)
- **One question at a time** — never a list
- Probe: constraints, trade-offs, users, scope, dependencies, risks
- Listen for signals: "or" / "versus" / "trade-off" = conflicting priorities
- Reflect understanding before moving forward

### Step 3: Research Gate (after 2-3 exchanges)
If the conversation reveals factual questions or comparisons:

```
This touches on the topic of [specific question].
Would you like me to do quick research before continuing?
~30 seconds to get useful context.

[Yes, research] / [No, let's keep exploring]
```

### Step 4: Crystallize Outputs (after 3-6 exchanges)

Analyze the conversation and suggest up to 4 outputs:

| Type | Destination | When |
|------|---------|--------|
| Note | `.planning/notes/{slug}.md` | Observations, context, decisions |
| Todo | `.planning/todos/{slug}.md` | Identifiably actionable tasks |
| Seed | `.planning/seeds/{slug}.md` | Future ideas with trigger conditions |
| Question | `.planning/research/questions.md` | Open questions to investigate |
| Requirement | `REQUIREMENTS.md` (append) | Clear requirements that emerged |

## FORMAT OF DISCOVERY.md

```markdown
---
depth: standard|deep
date: {date}
topic: "{researched topic}"
---
# Discovery: {topic}

## Context
{Why this research is needed}

## Evaluated Options
### Option A: {name}
- **Pros:** ...
- **Cons:** ...
- **Source:** {URL or reference}

### Option B: {name}
...

## Comparison
| Criterion | Option A | Option B |
|----------|----------|----------|
| ...      | ...      | ...      |

## Recommendation
{Chosen option with evidence-based justification}

## Identified Risks
- ...

## Open Questions
- ...
```

## ANTI-PATTERNS

- ❌ **Trusting the model without verifying** — always search for current sources
- ❌ **Analysis paralysis** — the depth level has a time limit
- ❌ **Researching without a goal** — define a concrete question before searching
- ❌ **Ignoring the usecase** — the "best" option depends on context


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
