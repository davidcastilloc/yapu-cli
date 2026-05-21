# YAPU KNOWLEDGE EXTRACTION

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

Act in [ KNOWLEDGE EXTRACTION MODE ].

Your objective is to extract decisions, lessons, patterns, and surprises from the artifacts of completed phases. Capture institutional knowledge that would be lost between phases. Optionally, promote recurrent items to permanent project documents.

> Deep load: `@yapu-thinking-planning.md`, `@yapu-ref-artifact-types.md`

## PRINCIPLE: CAPTURE BEFORE YOU FORGET

The most valuable knowledge is generated during execution — implicit decisions, lessons from errors, discovered patterns. If not explicitly extracted, it is lost when the context expires.

## PHASE 1: COLLECT ARTIFACTS

### Required Artifacts
- `{phase_dir}/*-PLAN.md` — plans of the phase
- `{phase_dir}/*-SUMMARY.md` — execution summaries

If PLAN.md or SUMMARY.md do not exist: "Required artifacts missing. PLAN.md and SUMMARY.md are necessary for extraction."

### Optional Artifacts (read if they exist)
- `{phase_dir}/*-VERIFICATION.md` — verification results
- `{phase_dir}/*-UAT.md` — user acceptance testing results
- `.planning/STATE.md` — project state with decisions and blockers

Record missing artifacts in output metadata.

## PHASE 2: EXTRACT IN 4 CATEGORIES

### 1. Decisions
Technical and architectural decisions made during the phase.

**Search in:**
- Explicit decisions in PLAN.md or SUMMARY.md
- Tech choices and their rationale
- Evaluated trade-offs
- Decisions recorded in STATE.md

**Format per item:**
```markdown
### {Decision Name}
- **What:** {what was decided}
- **Why:** {rationale}
- **Source:** {source artifact, e.g., "03-01-PLAN.md"}
```

### 2. Lessons
Things learned during execution that were not known before.

**Search in:**
- Unexpected complexity in SUMMARY.md
- Issues discovered in VERIFICATION.md
- Documented failed approaches
- UAT feedback that revealed gaps

**Format per item:**
```markdown
### {Lesson Name}
- **What:** {what was learned}
- **Context:** {circumstances}
- **Source:** {source artifact}
```

### 3. Patterns
Reusable patterns, approaches, or techniques discovered.

**Search in:**
- Successful implementation patterns in SUMMARY.md
- Testing patterns in VERIFICATION.md / UAT.md
- Workflow patterns that worked well
- Code organization patterns

**Format per item:**
```markdown
### {Pattern Name}
- **Pattern:** {description}
- **When to use:** {application conditions}
- **Source:** {source artifact}
```

### 4. Surprises
Unexpected findings, behaviors, or outcomes.

**Search in:**
- Things that took more or less time than estimated
- Unexpected dependencies or interactions
- Edge cases not anticipated in planning
- Performance that differed from expectations

**Format per item:**
```markdown
### {Surprise Name}
- **What:** {what was surprising}
- **Impact:** {effect it had}
- **Source:** {source artifact}
```

## PHASE 3: GENERATE LEARNINGS.md

```markdown
---
phase: {phase number}
phase_name: "{name}"
date: {date}
artifacts_analyzed:
  - {list of read artifacts}
missing_artifacts:
  - {optional artifacts not found}
---
# Learnings: Phase {N} — {name}

## Decisions
{extracted items}

## Lessons
{extracted items}

## Patterns
{extracted items}

## Surprises
{extracted items}
```

Save to: `{phase_dir}/{padded}-LEARNINGS.md`

## PHASE 4: CROSS-PHASE GRADUATION (Optional)

When LEARNINGS.md from multiple phases (≥3) exist, search for recurrent items to promote to permanent documents.

### Clustering by Lexical Similarity

1. Collect LEARNINGS.md from the last N phases (default: 5)
2. Tokenize: lowercase, strip punctuation, remove stop words
3. Jaccard Similarity: `|A ∩ B| / |A ∪ B|` ≥ 0.25 = same cluster
4. Filter: only clusters with ≥3 distinct phases as source

### Promotion Destinations

| Category | Destination |
|-----------|---------|
| Recurrent **Decisions** | `PROJECT.md` → `## Validated Decisions` |
| Recurrent **Patterns** | `PATTERNS.md` → appropriate section |
| Recurrent **Lessons** | `PROJECT.md` → `## Invariants` |
| Recurrent **Surprises** | ⚠️ Flag for human review — if it surprises 3+ times, something structural is wrong |

### Confirmation Gate

**Never promote without explicit approval:**

```
📚 Graduation — recurrent items detected:

  1. [PATTERN] "Error boundary on each async component"
     Appears in phases 2, 4, 5 — Suggest: PATTERNS.md
  
  2. [DECISION] "Validation at boundary, not in model"
     Appears in phases 1, 3, 5 — Suggest: PROJECT.md

Promote? [All] / [Select] / [Defer] / [Discard]
```

Discarded or deferred items are recorded to avoid re-surfacing:
```yaml
graduation_backlog:
  - cluster_id: "{hash}"
    status: "dismissed|deferred"
    deferred_until: "phase-{N}"
```

## ANTI-PATTERNS

- ❌ **Extracting without source** — every item MUST have attribution to a specific artifact
- ❌ **Duplicating the obvious** — extract only non-trivial insights
- ❌ **Promoting without validating** — graduation requires human confirmation
- ❌ **Ignoring recurrent surprises** — they are symptoms of structural problems


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
