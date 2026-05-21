# YAPU CODE MAPPING

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

Act in [CODEBASE MAPPING MODE].

Your objective is to produce a structured map of the project in `.planning/codebase/` — 7 documents covering orthogonal domains. Each document is a reference for future planning and execution.

> Deep load: `@yapu-ref-mapping-domains.md`

## PHILOSOPHY

- **Quality over brevity** — include real paths with backticks: `src/services/user.ts`
- **Parallel mapping by domain** — fresh context per domain avoids token contamination
- **Always include file paths** — documents are reference material for the agent when planning/executing

## STEP 1: VERIFY EXISTING STATE

```bash
ls -la .planning/codebase/ 2>/dev/null || echo "DOES_NOT_EXIST"
git rev-parse HEAD 2>/dev/null  # SHA for drift detection
```

**If `.planning/codebase/` exists:**
Ask the user:
1. **Refresh** — Clear and re-map everything
2. **Update** — Update specific documents
3. **Skip** — Use existing map as is

**If it does not exist:** Continue to Step 2.

## STEP 2: CREATE STRUCTURE

```bash
mkdir -p .planning/codebase
```

## STEP 3: MAPPING OF 7 DOMINIONS

Explore the codebase using `tree`, `cat`, `grep`, `find` and produce these 7 documents:

| # | Document | Focus | Key Content |
|---|-----------|------|-----------------|
| 1 | `STACK.md` | Technologies | Runtime, frameworks, package managers, versions |
| 2 | `INTEGRATIONS.md` | External connections | APIs, DBs, third-party services, auth providers |
| 3 | `ARCHITECTURE.md` | System design | Layers, data flow, boundaries, patterns (MVC, etc.) |
| 4 | `STRUCTURE.md` | File organization | Annotated directory tree, entry points, config files |
| 5 | `CONVENTIONS.md` | Style and patterns | Naming, imports, error handling, logging patterns |
| 6 | `TESTING.md` | Testing strategy | Framework, coverage, test dirs, fixtures, CI integration |
| 7 | `CONCERNS.md` | Risks & technical debt | TODOs, known hacks, outdated dependencies, security gaps |

### Exploration Heuristics by Domain

- **Stack**: `package.json`, `Cargo.toml`, `go.mod`, `requirements.txt`, `Gemfile`, Dockerfiles
- **Integrations**: search for URLs, connection strings, SDK imports, `.env*` files
- **Architecture**: entry points, middleware chains, router configs, service layers
- **Structure**: `tree -I node_modules -I .git -L 3`
- **Conventions**: first 50 lines of 3-5 representative files
- **Testing**: `*.test.*`, `*.spec.*`, `__tests__/`, jest/vitest/pytest configs
- **Concerns**: `grep -rn "TODO\|FIXME\|HACK\|DEPRECATED" src/`

## STEP 4: DRIFT STAMP

Each document MUST include in its header:

```yaml
---
last_mapped_commit: <HEAD SHA>
mapped_at: <ISO timestamp>
---
```

This allows post-execution drift detection. If HEAD advances beyond the mapped SHA, the map needs an incremental update.

## STEP 5: SUMMARY AND PROJECT.md UPDATE

1. List the 7 created documents with line count
2. Overwrite `PROJECT.md` with an executive summary based on the findings
3. **DO NOT modify source code** — this mode is purely analytical

## INCREMENTAL MODE (--paths)

If invoked with specific paths (e.g. after execution):
- Limit exploration to indicated prefixes
- Update only affected documents
- Re-stamp the commit SHA

## ANTI-PATTERNS

- ❌ Superficial mapping without concrete file paths
- ❌ Generic documents that could apply to any project
- ❌ Ignoring configuration files or `.env.example`
- ❌ Not including the drift stamp


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
