# YAPU SPEC (REQUIREMENTS SPECIFICATION)

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

Act in [REQUIREMENTS SPECIFICATION MODE].

Your objective is to clarify WHAT a phase delivers through a Socratic interview with quantitative ambiguity scoring. Produce a `SPEC.md` with falsifiable requirements that `yapu-discuss` treats as locked decisions.

## SEPARATION OF CONCERNS

| This workflow | `yapu-discuss` |
|---------------|-------------------|
| WHAT and WHY | HOW |
| Falsifiable requirements | Implementation decisions |
| Boundaries (in/out scope) | Technical gray areas |

## AMBIGUITY MODEL

Quantitative scoring per dimension (0.0 = totally unclear → 1.0 = crystal clear):

| Dimension | Weight | Minimum | What it measures |
|-----------|------|--------|----------|
| **Goal Clarity** | 35% | 0.75 | Is the outcome specific and measurable? |
| **Boundary Clarity** | 25% | 0.70 | What is in scope vs out of scope? |
| **Constraint Clarity** | 20% | 0.65 | Performance, compatibility, data? |
| **Acceptance Criteria** | 20% | 0.70 | How do we know it is done? |

**Ambiguity score** = `1.0 − (0.35×goal + 0.25×boundary + 0.20×constraint + 0.20×acceptance)`

### Quality Gate
**Pass:** ambiguity ≤ 0.20 **AND** all dimensions ≥ their minimums.
A score of 0.20 means 80% weighted clarity — enough so that the planner does not assume incorrectly.

## STEP 1: INITIALIZE

1. Read `ROADMAP.md` → active phase, goal, description
2. Read `STATE.md` → previous decisions, blockers
3. Check if `SPEC.md` already exists → options: Update / View / Skip

## STEP 2: CODEBASE SCOUT

**Before asking any question**, investigate:
- Existing implementations of similar functionality
- Integration points where the new code will connect
- Artifacts of previous phases (SUMMARY.md, VERIFICATION.md)
- Gap between current state and the phase goal

**Synthesize the current state internally.** Do not present it to the user yet — you use it to ask precise and well-founded questions.

## STEP 3: INITIAL AMBIGUITY ASSESSMENT

Before asking, score ambiguity based only on ROADMAP.md and PROJECT.md:

```
Goal Clarity:       [score] (min 0.75)
Boundary Clarity:   [score] (min 0.70)
Constraint Clarity: [score] (min 0.65)
Acceptance Criteria:[score] (min 0.70)

Ambiguity: [score] (gate: ≤ 0.20)
```

**If it already passes the gate:** Derive SPEC.md directly from existing context → skip to Step 5.

## STEP 4: SOCRATIC INTERVIEW

**Max 6 rounds. 2-3 questions per round.** Rotating perspectives:

### Round 1-2: Researcher
- "What exists in the codebase today related to this phase?"
- "What is the delta between today and the target state?"
- "What triggers this work — what is broken or missing?"

### Round 2: Simplifier
- "What is the simplest version that solves the core problem?"
- "If you had to cut 50%, what is the irreducible core?"
- "What would make this phase successful without the nice-to-haves?"

### Round 3: Boundary Guardian
- "What explicitly will NOT be done in this phase?"
- "What adjacent problems is it tempting to solve but we must not?"
- "What does 'done' look like — what is the final deliverable?"

### Round 4: Failure Analyst
- "What is the worst that can happen if the requirements are wrong?"
- "What does a broken version of this look like?"
- "What would make a verifier reject the output?"

### Round 5-6: Closer
- "We have {dimension} at {score} — what would make it completely clear?"
- "The remaining ambiguity is in {area} — do we decide now?"
- "Is there anything you would regret not specifying before planning?"

### After each round

Update the 4 scores and show:
```
After round {N}:
  Goal Clarity:       {score} (min 0.75) [✓ or ↑ needed]
  Boundary Clarity:   {score} (min 0.70) [✓ or ↑ needed]
  Constraint Clarity: {score} (min 0.65) [✓ or ↑ needed]
  Acceptance Criteria:{score} (min 0.70) [✓ or ↑ needed]
  Ambiguity: {score} (gate: ≤ 0.20)
```

**If gate passes:** "Ambiguity at {score} — do we proceed to write SPEC.md?"
**If max rounds and doesn't pass:** Write SPEC.md marking dimensions below minimum.

## STEP 5: GENERATE SPEC.md

Write `{phase_dir}/{padded_phase}-SPEC.md`:

```markdown
# SPEC: Phase {N} — {name}

## Ambiguity Report
Goal: {score} | Boundary: {score} | Constraint: {score} | Acceptance: {score}
Final: {score} (gate: ≤ 0.20)

## Requirements
1. **{Requirement Name}**
   - Current state: {what exists today}
   - Target state: {what it should be}
   - Acceptance criterion: {how to verify — pass/fail}

2. ...

## Boundaries
### In Scope
- {what this phase produces}

### Out of Scope
- {what it does NOT do — with brief rationale}

## Acceptance Criteria
- [ ] {verifiable pass/fail criterion}
- [ ] {verifiable pass/fail criterion}
```

### Requirement Rules
- ✗ "The system must be fast" → REJECTED (vague)
- ✗ "Improve user experience" → REJECTED (subjective)
- ✓ "API responds in < 200ms p95 under 100 concurrent requests"
- ✓ "CLI exits with code 1 and prints to stderr on invalid input"

**Each requirement MUST have:** current state, target state, acceptance criterion.
**Boundaries CANNOT be empty.**
**Acceptance criteria are pass/fail** — not "must feel good".

## ANTI-PATTERNS

| Anti-Pattern | Prevention |
|-------------|------------|
| Asking about the HOW | That is `yapu-discuss` territory |
| Vague requirements | Each must be falsifiable |
| Frontloading questions | Max 2-3 per round |
| Ignoring codebase | Scout BEFORE the first question |
| Subjective criteria | Only verifiable pass/fail |

## OUTPUT

- **Artifact**: `{padded_phase}-SPEC.md`
- **Next step**: `yapu-discuss {phase}` — discuss will detect SPEC.md and focus on implementation decisions


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
