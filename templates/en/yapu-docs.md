# YAPU DOCUMENTATION

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

Act in [DOCUMENTATION UPDATE MODE].

Your objective is to orchestrate the generation, updating, and verification of all project documentation. Detect structure, assemble the work manifest, dispatch parallel waves of writing and verification, and execute a capped fix loop.

> Deep load: `@yapu-ref-artifact-types.md`

---

## STEP 1: CLASSIFY PROJECT

Determine primary project type (first match wins):

| Condition | Primary Type |
|-----------|--------------|
| Monorepo (multiple workspaces) | `monorepo` |
| CLI without API routes | `cli-tool` |
| API routes without open-source | `saas` |
| Open-source without API routes | `open-source-library` |
| None of the above | `generic` |

Detect conditional signals **independently** of the primary type:

| Signal | Conditional Doc |
|-------|----------------|
| Has API routes | API.md |
| Is open-source (LICENSE detected) | CONTRIBUTING.md |
| Has deployment config | DEPLOYMENT.md |

---

## STEP 2: BUILD DOC QUEUE

### Always-On (6 docs — always, without exception):
1. **README** — Description, quick-start, badges
2. **ARCHITECTURE** — Component diagram, design decisions
3. **GETTING-STARTED** — Step-by-step setup for new devs
4. **DEVELOPMENT** — Development workflow, conventions, branching
5. **TESTING** — How to run tests, structure, coverage
6. **CONFIGURATION** — Environment variables, feature flags, config files

### Conditional (up to 3 docs — only if signal present):
7. **API** — Endpoints, auth, request/response schemas
8. **CONTRIBUTING** — Guidelines for contributors (confirm with user if new)
9. **DEPLOYMENT** — CI/CD pipeline, environments, rollback

> **Hard limit: maximum 9 docs.** Never queue CHANGELOG.md.

### Review Queue (existing non-canonical docs)

Scan existing docs that do not match the canonical queue. These go to accuracy verification without rewriting:

```
Existing docs for accuracy review:
  - docs/api/endpoint-map.md (hand-written)
  - docs/frontend/pages/README.md (hand-written)
```

---

## STEP 3: WORK MANIFEST

Create `.planning/docs-manifest.md` for persistent tracking:

```markdown
## Doc Work Manifest

| # | Doc | Mode | Status | Wave |
|---|-----|------|--------|------|
| 1 | README | create | pending | 1 |
| 2 | ARCHITECTURE | update | pending | 1 |
| 3 | API | create | pending | 2 |
```

Modes:
- **create** — does not exist, generate from scratch
- **update** — exists, update with current codebase info
- **verify** — only verify accuracy (for hand-written docs)

> **The manifest persists between steps.** If the process is interrupted, resume from the manifest.

---

## STEP 4: WRITING WAVES

Dispatch docs in parallel waves (2-3 docs per wave):

### Wave 1: Foundation Docs
- README + ARCHITECTURE + GETTING-STARTED
- Read codebase to extract factual info
- Generate/update each doc

### Wave 2: Dev Docs
- DEVELOPMENT + TESTING + CONFIGURATION
- + conditional docs if they apply

### For each doc in the wave:

1. **Read** the relevant codebase (package.json, src/, tests/, config/)
2. **Generate/Update** content based on the actual state of the code
3. **Verify** factual claims against the codebase:
   - Do the listed commands actually work?
   - Do the referenced paths exist?
   - Are the listed dependencies in package.json/requirements.txt?
4. **Mark as done** in the manifest

---

## STEP 5: ACCURACY VERIFICATION

For each doc (canonical + review queue):

1. Extract verifiable claims (commands, paths, imports, URLs)
2. Verify against the actual codebase:
   ```bash
   # Does the command exist?
   grep -r "script_name" package.json
   # Does the path exist?
   ls -la path/referenced/in/doc
   # Does the import work?
   grep -r "import.*ModuleName" src/
   ```
3. Classify inaccuracies: `{doc, claim, expected, actual, severity}`

---

## STEP 6: CAPPED FIX LOOP

If inaccuracies are found:

```
Max 3 iterations of the fix loop.
```

For each iteration:
1. Fix the identified inaccuracies
2. Re-verify only the applied fixes
3. If inaccuracies remain after 3 iterations → report as unresolved gaps

```
## Doc Verification Results

✅ Verified: {N}/{total} docs
⚠️ Inaccuracies corrected: {N}
❌ Unresolved gaps (after 3 iterations): {N}
```

---

## STEP 7: GAPS DETECTION

Analyze codebase for areas without documentation:

1. Scan significant directories (src/components/, src/services/, lib/, routes/)
2. Compare against existing docs
3. Identify areas without documentary coverage
4. Present to the user for decision:

```
Documentation gaps found:
1. src/services/ — 5 services without docs
2. src/components/ — 12 components without docs

Generate docs for these? (all/select/skip)
```

---

## ANTI-PATTERNS

- ❌ Deriving the doc queue from existing docs — always build from the 9 canonical types
- ❌ Including CHANGELOG.md in the queue — never
- ❌ Infinite fix loop — maximum 3 iterations, then report
- ❌ Writing docs without verifying claims against the actual codebase
- ❌ Rewriting hand-written docs — only verify accuracy and make surgical fixes
- ❌ Losing the manifest — it is the recovery point for interruptions


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
