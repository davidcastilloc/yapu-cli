# YAPU SHIP & PR

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

Act in [ SHIP & PR MODE ].

Your objective is to create a clean Pull Request on GitHub from completed work. Verify preconditions, generate a rich PR body from planning artifacts, and filter transient files so reviewers see only what is relevant.

> Deep load: `@yapu-ref-git-integration.md`

## SHIPPING FLOW

### Step 1: Initialize

Detect base branch for PRs:
```bash
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|^refs/remotes/origin/||')
BASE_BRANCH="${BASE_BRANCH:-main}"
CURRENT_BRANCH=$(git branch --show-current)
```

### Step 2: Preflight Checks (all must pass)

| Check | Command | If Fails |
|-------|---------|----------|
| **Verification passed** | Search `status: pass` in `*-VERIFICATION.md` | ⛔ Block — complete verification first |
| **Working tree clean** | `git status --short` | ⚠️ Ask to commit or stash |
| **On feature branch** | `$CURRENT_BRANCH != $BASE_BRANCH` | ⚠️ Warn — should be on a feature branch |
| **Remote configured** | `git remote -v` | ⛔ Error — cannot create PR without remote |
| **`gh` CLI available** | `which gh && gh auth status` | ⛔ Provide setup instructions |

```
Preflight Results
─────────────────────────────
✅ Verification: pass
✅ Working tree: clean
✅ Branch: feature/auth-system
✅ Remote: origin → github.com/user/repo
✅ gh CLI: authenticated
─────────────────────────────
```

**If any critical check (⛔) fails → STOP and report how to resolve.**

### Step 3: Push branch

```bash
git push origin ${CURRENT_BRANCH} 2>&1
# If it fails:
git push --set-upstream origin ${CURRENT_BRANCH} 2>&1
```

Report: "Pushed `{branch}` ({N} commits ahead of `{BASE_BRANCH}`)"

### Step 4: Generate PR Body

Auto-generate from planning artifacts:

**Title:**
```
Phase {N}: {phase name}
```

**Body structure:**
```markdown
## Summary
{Phase goal from ROADMAP.md}

## Changes Completed
{List of completed tasks from STATE.md / SUMMARY.md}

## Verification
{Status from VERIFICATION.md — pass/fail + details}

## Tests
{Executed tests and results}

## Modified Files
{List grouped by component}
```

### Step 5: Filter Transient Files (Clean PR Branch)

Classify commits to create a clean PR branch:

**STRUCTURAL files (included in PR):**
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/MILESTONES.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/milestones/**`

**TRANSIENT files (excluded from PR):**
- `.planning/phases/**` (PLAN.md, SUMMARY.md, CONTEXT.md, RESEARCH.md)
- `.planning/quick/**`
- `.planning/research/**`
- `.planning/debug/**`
- `.planning/seeds/**`
- `.planning/todos/**`

**Commit classification:**
| Type | Include? |
|------|-----------|
| **Code commits** (touch files outside `.planning/`) | ✅ Yes |
| **Structural commits** (only STATE/ROADMAP/PROJECT) | ✅ Yes |
| **Transient commits** (only files of phases/debug/quick) | ❌ No |
| **Mixed commits** (code + planning) | ✅ Yes (transient comes along) |

**Create filtered PR branch:**
```bash
PR_BRANCH="${CURRENT_BRANCH}-pr"
git checkout -b "$PR_BRANCH" "$BASE_BRANCH"
# Cherry-pick only included commits
git cherry-pick {hash-1} {hash-2} ...
```

### Step 6: Create PR

```bash
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$PR_BRANCH" \
  --title "{generated title}" \
  --body "{generated body}"
```

Show result:
```
PR created: {URL}
Branch: {PR_BRANCH} → {BASE_BRANCH}
Commits: {N} (of {M} total, {M-N} transient filtered)
```

## ANTI-PATTERNS

- ❌ **Shipping without verification** — ALWAYS requires verification pass
- ❌ **PR with transient artifacts** — PLAN.md, SUMMARY.md are noise for reviewers
- ❌ **Push to main** — always feature branch → PR → merge
- ❌ **Empty PR body** — planning artifacts exist for this, use them


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
