# YAPU STRUCTURED DEBUGGING

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

Act in [ STRUCTURED DEBUGGING MODE ].

Your objective is to diagnose and resolve bugs using the scientific method: observe symptoms, formulate hypotheses, design experiments, evaluate evidence. Sessions are persisted in `.planning/debug/` for continuation between contexts.

> Deep load: `@yapu-thinking-debug.md`

## KEY PRINCIPLE: DIAGNOSE BEFORE REPAIRING

Without diagnosis: "Page doesn't load" → guess fix → probably incorrect.
With diagnosis: "Page doesn't load" → "useEffect without dependency array" → precise fix.

## SUBCOMMANDS

### `new <description>` — New debugging session

1. **Collect symptoms:**
   - What should happen vs. what happens?
   - Is it reproducible? When did it start?
   - Are there errors in console/logs?

2. **Generate slug:** kebab-case of the problem, max 30 chars, only `[a-z0-9-]`

3. **Create `.planning/debug/{slug}.md`:**
   ```yaml
   ---
   status: investigating
   trigger: "{user description}"
   created: {date}
   updated: {date}
   ---
   ## Current Focus
   - hypothesis: "{initial hypothesis based on symptoms}"
   - test: "{experiment to validate/invalidate}"
   - expecting: "{expected result if hypothesis is correct}"
   - next_action: "{first concrete step}"

   ## Evidence
   (empty — filled during investigation)

   ## Eliminated
   (hypotheses discarded with reasons)

   ## Resolution
   - root_cause:
   - fix:
   - verification:
   - files_changed: []
   ```

4. **Execute investigation loop** (see Debugging Flow below)

### `list` — List active sessions

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved
```

Show formatted table:
```
Active Debug Sessions
─────────────────────────────────────────
  #  Slug                    Status         Updated
  1  auth-token-null         investigating  2026-04-12
     hypothesis: JWT decode fails with nested claims
     next: Add logging in jwt.verify()
─────────────────────────────────────────
Use `debug continue <slug>` to resume.
```

If there are no sessions: "No active debug sessions."

### `status <slug>` — Session details

Sanitize slug: `^[a-z0-9][a-z0-9-]*$`, max 30 chars, reject `..`, `/`, `\`.
Search in `.planning/debug/{slug}.md` → if it does not exist, search in `resolved/`.
Show: frontmatter + current focus + evidence count + eliminated count.

### `continue <slug>` — Resume existing session

Sanitize slug. Read file. Show current state. Resume from `next_action`.

## DEBUGGING FLOW (Investigation Loop)

```
┌──────────────────────────────────────────┐
│  OBSERVE → HYPOTHESIZE → EXPERIMENT   │
│         → EVALUATE → DECIDE             │
┌──────────────────────────────────────────┐
```

### Step 1: Formulate Hypothesis
- Based on symptoms and gathered evidence
- Must be **falsifiable** — if you cannot design a test that invalidates it, refine it

### Step 2: Design Experiment
- One change, one variable — isolate the factor
- Define expected outcome BEFORE executing
- Prefer: add logging > read code > modify code

### Step 3: Execute and Record Evidence
```markdown
## Evidence
- timestamp: {date}
  hypothesis: "{the tested hypothesis}"
  test: "{what was done}"
  result: "{what happened}"
  conclusion: supports|refutes|inconclusive
```

### Step 4: Evaluate and Decide

| Outcome | Action |
|-----------|--------|
| **Supports** hypothesis | Dig deeper — is it the root cause or just a symptom? |
| **Refutes** hypothesis | Move to `## Eliminated`, formulate new hypothesis |
| **Inconclusive** | Design a more specific experiment |

### Step 5: Checkpoint (every 2-3 cycles)
Update `## Current Focus` with current hypothesis and next_action. This allows continuation in another context.

## 4 REPAIR STRATEGIES

Once you identify the root cause, apply the appropriate strategy:

| Strategy | When to use |
|------------|-------------|
| **Retry** | Transient error, race condition, timing issue |
| **Decompose** | Complex problem — split into sub-problems |
| **Prune** | Unnecessary complexity causes the bug — simplify |
| **Escalate** | Requires architecture decision or human input |

## PARALLEL DIAGNOSIS (Multiple Gaps)

When UAT or verification reveals multiple problems:

1. Create a debugging session **per gap**
2. Each session investigates independently
3. Gather root causes from all sessions
4. Update the parent artifact with diagnoses

## RESOLUTION

Upon finding and verifying the fix:
1. Update `status: resolved` in frontmatter
2. Complete the entire `## Resolution` section
3. Move file to `.planning/debug/resolved/{slug}.md`
4. Commit:
   ```bash
   git add -A
   git commit -m "fix: {concise description of the fix}"
   ```

## ANTI-PATTERNS

- ❌ **Shotgun debugging** — changing random things hoping it will work
- ❌ **Non-falsifiable hypothesis** — "something is wrong with the server"
- ❌ **Jumping to the solution** — implementing a fix without confirming the root cause
- ❌ **Ignoring evidence** — discarding results that contradict your theory


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
