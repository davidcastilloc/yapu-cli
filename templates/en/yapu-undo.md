# YAPU SAFE REVERT

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

Act in [ SAFE REVERT MODE ].

Your objective is to revert changes safely using `git revert` — **NEVER `git reset`**. History is always preserved. Each revert goes through a confirmation gate and dependency verification.

> Deep load: `@yapu-ref-git-integration.md`

## ABSOLUTE RULE

```
  ╔══════════════════════════════════════════════╗
  ║  NEVER use git reset --hard                 ║
  ║  NEVER use git reset --soft (to revert)      ║
  ║  ALWAYS use git revert --no-commit           ║
  ║  ALWAYS preserve history                     ║
  ╚══════════════════════════════════════════════╝
```

**Why?** `git reset` destroys shared history. `git revert` creates a new commit that undoes the changes — traceable, auditable, reversible.

## MODES OF USE

### `--last N` — Interactive selection of recent commits

```bash
git log --oneline --no-merges -${N:-10}
```

Filter commits that follow conventional format `type(scope): message`.

Show numbered list:
```
Recent commits:
  1. abc1234 feat(04-01): implement auth endpoint
  2. def5678 docs(03-02): complete plan summary
  3. ghi9012 fix(02-03): correct validation logic

Which ones to revert? (comma-separated numbers, or 'all')
```

### `--phase NN` — Revert an entire phase

Find commits of the phase in the manifest or by git log:
```bash
# First: try .planning/.phase-manifest.json
# Fallback: search by scope in git log
git log --oneline --no-merges | grep -E "\(0*${NN}(-[0-9]+)?\):" | head -50
```

### `--plan NN-MM` — Revert a specific plan

```bash
git log --oneline --no-merges | grep -E "\(${NN}-${MM}\)" | head -50
```

## REVERSION FLOW

### Step 1: Gather Candidate Commits

According to the chosen mode, obtain the list of hashes.

If no matching commits are found: "No commits found for {target}. Verify the phase/plan number."

### Step 2: Dependency Analysis

**BEFORE reverting, verify dependencies:**

```bash
# For each candidate commit, see what files it touches
git diff-tree --no-commit-id --name-only -r {hash}
```

Detect if subsequent commits (NOT in the reversion list) depend on files created or modified by candidate commits.

```
Dependency Analysis
─────────────────────────────
Commits to revert: 3
Affected files: 7

⚠️  Dependencies detected:
  - auth.js (created in abc1234) is imported by routes.js (subsequent commit xyz789)
  - middleware.js (modified in def567) has dependent changes in ghi012

Options:
  1. Revert all (include dependents)
  2. Revert only the selected commits (may break build)
  3. Cancel
```

### Step 3: Confirmation Gate (MANDATORY)

**Never revert without explicit user confirmation.**

```
  ═══════════════════════════════════════
    REVERSION CONFIRMATION
  ═══════════════════════════════════════

  {N} commits will be reverted:
    1. abc1234 feat(04-01): implement auth endpoint
    2. def5678 docs(03-02): complete plan summary

  Files that will change:
    - src/auth.js (deleted)
    - src/middleware.js (restored to previous version)
    - tests/auth.test.js (deleted)

  Proceed? [Yes, revert] / [No, cancel]
```

### Step 4: Execute Reversion

```bash
# Revert in reverse order (most recent first)
for hash in $(echo "$COMMITS" | tac); do
  git revert --no-commit "$hash"
done

# Verify that the result is coherent
# (build, basic tests)

# Single commit with the revert
git commit -m "revert: undo {scope} ({N} commits)

Reverted commits:
- {hash1} {message1}
- {hash2} {message2}
"
```

### Step 5: Update State

If `.planning/STATE.md` exists:
- Update reverted tasks (mark as `[ ]` again if applicable)
- Add reversion note in history section

### Step 6: Report

```
Reversion Completed
─────────────────────────────
Reverted commits: {N}
Reversion commit: {new_hash}
Affected files: {M}
Build status: ✅ passes | ⚠️ requires attention
```

## ANTI-PATTERNS

- ❌ **`git reset --hard`** — destroys history, unrecoverable on shared branches
- ❌ **Reverting without confirmation** — always confirmation gate
- ❌ **Ignoring dependencies** — reverting a commit that others depend on breaks the build
- ❌ **Reverting merge commits** — extra complexity, requires `-m 1` and careful analysis


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
