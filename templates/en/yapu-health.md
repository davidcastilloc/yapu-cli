# YAPU INTEGRITY DIAGNOSTIC

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

Act in [ INTEGRITY DIAGNOSTIC MODE ].

Your objective is to validate the integrity of the planning workspace (`.planning/`) and report actionable issues. Two orthogonal modes: directory integrity and context utilization.

> Deep load: `@yapu-ref-artifact-types.md`

## TWO MODES (INDEPENDENT)

| Mode | Flag | What it validates |
|------|------|------------|
| **Directory Health** | (default) | `.planning/` structure, missing files, invalid config, inconsistent state |
| **Context Utilization** | `--context` | Model context window usage, management recommendations |

The modes are **orthogonal** — never mix the output of both in a single execution.

## MODE 1: DIRECTORY HEALTH (Default)

### Optional Flags
- `--repair` — auto-repair issues that are repairable
- `--backfill` — backfill missing files with default values

### Integrity Checks

#### 1. Core Files
| File | Required | If Missing |
|---------|-----------|----------|
| `.planning/STATE.md` | ✅ | ⛔ BROKEN — no state tracking |
| `.planning/ROADMAP.md` | ✅ | ⚠️ DEGRADED — no direction |
| `.planning/PROJECT.md` | Recommended | ⚠️ Warning — run `yapu-map` |
| `.planning/config.json` | Recommended | ⚠️ Warning — use defaults |

#### 2. State Coherence
- Does `STATE.md` reference phases that exist in `ROADMAP.md`?
- Do tasks marked `[x]` have corresponding commits?
- Are there phases in ROADMAP without a directory in `.planning/phases/`?
- Are there orphan phase directories (not referenced in ROADMAP)?

#### 3. Valid Configuration
- If `config.json` exists: is it valid JSON?
- Are configuration values in expected ranges?

#### 4. Orphan Files
- Plans without parent phase
- Debug sessions with status `investigating` > 7 days without update
- Quick tasks without entry in STATE.md

### Status Levels

| Status | Meaning |
|--------|-------------|
| **🟢 HEALTHY** | All in order, no errors or warnings |
| **🟡 DEGRADED** | Functional but with warnings — attention recommended |
| **🔴 BROKEN** | Critical files missing or inconsistent state — action required |

### Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Yapu Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: 🟢 HEALTHY | 🟡 DEGRADED | 🔴 BROKEN
Errors: {N} | Warnings: {N} | Info: {N}
```

**If there are errors:**
```
## Errors (action required)
- ⛔ Missing STATE.md — no state tracking
  Fix: Create STATE.md with `yapu-plan` or `--repair`

## Warnings
- ⚠️ Missing config.json — using defaults
  Fix: Create with `--repair` or manually
- ⚠️ 2 debug sessions inactive > 7 days
  Fix: Resolve or archive manually
```

### Auto-repair (if `--repair`)

Automatic repair actions:
```
## Performed repairs
- ✓ config.json: Created with default values
- ✓ STATE.md: Regenerated from ROADMAP.md
- ✓ phases/ directory created
```

**Only repairs issues marked as `repairable`.** Never invents content — uses defaults and minimal structure.

## MODE 2: CONTEXT UTILIZATION (`--context`)

Evaluates context window usage to optimize long sessions.

### Necessary Input
- `tokens_used` — tokens consumed in the current session
- `context_window` — total size of the model's context window

If the runtime does not expose these values, ask the user:
```
Approximate tokens used? Context window size?
```

### Utilization Levels

| % Use | Status | Recommendation |
|-------|--------|---------------|
| 0-60% | 🟢 Normal | Continue normally |
| 60-80% | 🟡 Warning | Consider a new session for large tasks |
| 80-100% | 🔴 Critical | Start a new session — risk of degradation |

### Output
```
Context utilization: {N}% ({status})
{recommendation if warning or critical}
```

## ANTI-PATTERNS

- ❌ **Ignoring DEGRADED** — accumulated warnings become BROKEN
- ❌ **Auto-repair without reviewing** — verify what was repaired after `--repair`
- ❌ **Mixing modes** — directory health and context are independent diagnostics
- ❌ **Running health on a project without `.planning/`** — first initialize with `yapu-map`


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
