# YAPU GRILL-DOCS (DOCUMENTATION CONTEXT EXTRACTION)

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

Act in [DOCUMENTARY INTERROGATION MODE].

Your objective is to generate, update, and verify all project documentation. You detect the existing doc structure, build a work manifest, write docs, verify accuracy against the codebase, and correct inaccuracies. Output: complete and verified documentation.

## STEP 1: CLASSIFY PROJECT

Explore the project to determine its type and signals:

```bash
[ -f package.json ] && echo "HAS_PACKAGE_JSON"
ls src/routes src/api routes/ api/ 2>/dev/null && echo "HAS_API_ROUTES"
ls bin/ cli.* 2>/dev/null && echo "HAS_CLI_BIN"
[ -f LICENSE ] && echo "IS_OPEN_SOURCE"
ls Dockerfile docker-compose* fly.toml vercel.json 2>/dev/null && echo "HAS_DEPLOY_CONFIG"
ls pnpm-workspace.yaml lerna.json 2>/dev/null && echo "IS_MONOREPO"
ls **/*.test.* **/*.spec.* 2>/dev/null | head -1 && echo "HAS_TESTS"
```

| Condition | Primary Type |
|-----------|--------------|
| Monorepo detected | `monorepo` |
| CLI without API | `cli-tool` |
| API without open-source | `saas` |
| Open-source without API | `library` |
| None | `generic` |

## STEP 2: ASSEMBLE DOC QUEUE

### Docs always-on (6 — always generated):

| # | Doc | Content |
|---|-----|-----------|
| 1 | `README.md` | Description, quick start, badges |
| 2 | `ARCHITECTURE.md` | System design, layers, decisions |
| 3 | `GETTING-STARTED.md` | Step-by-step setup from scratch |
| 4 | `DEVELOPMENT.md` | Development workflow, conventions, scripts |
| 5 | `TESTING.md` | How to run tests, strategy, coverage |
| 6 | `CONFIGURATION.md` | Environment variables, config files, secrets |

### Conditional docs (up to 3 — only if applicable):

| Signal | Doc |
|-------|-----|
| `HAS_API_ROUTES` | `API.md` — endpoints, auth, request/response schemas |
| `IS_OPEN_SOURCE` | `CONTRIBUTING.md` — how to contribute, PR guidelines |
| `HAS_DEPLOY_CONFIG` | `DEPLOYMENT.md` — deployment process, environments |

**Maximum total: 9 docs.** CHANGELOG.md is never included.

## STEP 3: WORK MANIFEST

Create a manifest that tracks the status of each doc:

```markdown
## Work Manifest

| Doc | Mode | Status | Notes |
|-----|------|--------|-------|
| README.md | create/update | pending | — |
| ARCHITECTURE.md | create | pending | — |
| ... | ... | ... | ... |
```

- **create**: does not exist, generate from scratch
- **update**: exists, update with info from codebase
- **review**: exists (hand-written), verify accuracy

Persist the manifest in `.planning/doc-manifest.md` to avoid losing state between steps.

## STEP 4: GENERATE/UPDATE DOCS

For each doc in the manifest:

1. **Read the codebase** to extract real information — DO NOT invent
2. **If it is an update**: preserve existing structure, update obsolete data
3. **If it is a create**: use verified information from the code
4. Mark as `done` in the manifest

### Quality Rules
- Each path mentioned must exist: `[ -f path ] || echo "WARNING: path not found"`
- Each documented command must work
- Environment variables must match `.env.example` or code

## STEP 5: ACCURACY VERIFICATION

For each generated doc, verify claims against the codebase:

```bash
# Does the documented command work?
# Do the mentioned paths exist?
# Are the environment variables in the code?
grep -r "process.env.DB_URL\|os.environ" src/ | head -10
```

### Hand-written Docs (review queue)
For existing docs that are NOT in the canon (e.g. `docs/api/custom-flow.md`):
- Verify that referenced paths, endpoints, and commands are still valid
- Flag found inaccuracies

## STEP 6: FIX LOOP (Bounded)

If verification finds inaccuracies:

1. **Correct** the doc with real codebase information
2. **Re-verify** the correction
3. **Maximum 3 iterations** — if errors remain after 3 cycles, document remaining issues and escalate

## STEP 7: QUESTIONS FOR THE USER

Identify gaps you CANNOT resolve by reading code:
- Undocumented business logic
- Deployment steps requiring external secrets/accesses
- Naming or branding decisions

Ask me precise questions. Update docs with responses.

## OUTPUT

1. Update the manifest with final status
2. Generated docs in the project root or `docs/`
3. Verification report: what was verified, what failed, what was corrected

## ANTI-PATTERNS

- ❌ Generic documentation that does not reflect the actual project
- ❌ Paths or commands that do not exist in the codebase
- ❌ Ignoring existing hand-written docs
- ❌ Infinite fix loop — maximum 3 iterations
- ❌ Inventing environment variables or endpoints


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
