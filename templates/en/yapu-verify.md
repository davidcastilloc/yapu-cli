# YAPU VERIFICATION

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

Act in [VERIFICATION MODE].

Your objective is to verify that the codebase **achieves the phase goal**, not just that the tasks were completed. Completing tasks ≠ achieving the goal.

> Deep load: `@yapu-ref-verification-patterns.md`, `@yapu-ref-examples-verifier.md`, `@yapu-thinking-verification.md`

## CORE PRINCIPLE: Goal-Backward Verification

```
1. What must be TRUE for the goal to be achieved?
2. What must EXIST for those truths to hold?
3. What must be CONNECTED for those artifacts to work?
4. What must tests PROVE for there to be evidence?

→ Verify each level against the actual codebase.
```

## STEP 1: LOAD CONTEXT

1. Read `STATE.md` — phase goal, completed tasks
2. Read `ROADMAP.md` — original goal of the active phase
3. Read `PROJECT.md` — project context
4. List created/modified files:
   ```bash
   git log --name-only --format="" -20 | sort -u
   ```

## STEP 2: ESTABLISH MUST-HAVES

Derive must-haves from the phase goal (NOT from the tasks):

```markdown
### Must-Haves for: [phase goal]

**Observable truths** (3-7 verifiable behaviors):
1. [behavior that must be true]
2. ...

**Required artifacts** (concrete files):
1. [path/to/file] — [what it must contain]
2. ...

**Critical connections** (wiring where stubs hide):
1. [file A] imports and uses [file B]
2. ...
```

## STEP 3: 4-LEVEL VERIFICATION

For each artifact, verify progressively:

| Level | Check | Method | Status |
|-------|-------|--------|--------|
| **L1: Exists** | Does the file exist on disk? | `[ -f path/to/file ]` | MISSING / ✓ |
| **L2: Substantive** | Does it have real content (not stub)? | `wc -l`, review content | STUB / ✓ |
| **L3: Connected** | Is it imported AND used? | `grep -r "import.*name" src/` | ORPHANED / ✓ |
| **L4: Tested** | Are there tests exercising it? | `grep -r "name" **/*.test.*` | UNTESTED / ✓ |

### Table of Compound States

| Exists | Substantive | Connected | Final status |
|--------|-----------|-----------|--------------|
| ✓ | ✓ | ✓ | ✓ VERIFIED |
| ✓ | ✓ | ✗ | ⚠️ ORPHANED |
| ✓ | ✗ | — | ✗ STUB |
| ✗ | — | — | ✗ MISSING |

### Grep-backed Evidence

**ALL verification must have executable evidence.** Do not accept "I checked and it looks good":

```bash
# L1: Existence
[ -f src/components/Chat.tsx ] && echo "EXISTS" || echo "MISSING"

# L2: Substantiveness (>10 lines, has real logic)
wc -l src/components/Chat.tsx
grep -c "function\|const\|class\|export" src/components/Chat.tsx

# L3: Wiring (imported AND used outside its file)
grep -r "import.*Chat" src/ --include="*.ts" --include="*.tsx" | grep -v "Chat.tsx"
grep -r "Chat" src/ --include="*.ts" --include="*.tsx" | grep -v "import" | grep -v "Chat.tsx"

# L4: Test coverage
grep -r "Chat" src/ --include="*.test.*" --include="*.spec.*"
```

## STEP 4: VERIFY TRUTHS

For each observable truth in Step 2:

- **✓ VERIFIED** — all supporting artifacts pass L1-L3
- **✗ FAILED** — any artifact is MISSING/STUB/ORPHANED
- **? UNCERTAIN** — requires human verification (e.g. visual behavior)

## STEP 5: GENERATE REPORT

```markdown
## Verification Report — [phase]

### Result: [PASSED | FAILED | PARTIAL]

#### Verified Truths
| # | Truth | Status | Evidence |
|---|--------|--------|-----------|
| 1 | [truth] | ✓/✗/? | [command and result] |

#### Verified Artifacts
| Path | L1 | L2 | L3 | L4 | Status |
|------|----|----|----|----|--------|
| [path] | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | [status] |

#### Gaps Found
- [gap 1]: [description and severity]

#### Actions Required
- [action 1]: [what to do to close the gap]
```

## STEP 6: ACT ON RESULTS

| Result | Action |
|-----------|--------|
| **PASSED** | Mark phase complete in `ROADMAP.md`, update `STATE.md` |
| **FAILED** | Repair gaps yourself if minor. If major → escalate to user |
| **PARTIAL** | Document what happened and what is missing. Ask the user if they accept or want to repair |

## VERIFICATION OVERRIDE

The user can override a FAILED with justification:
- Document the reason for override in STATE.md
- Mark as `PASSED (override: [reason])`
- This is legitimate for: flaky tests, low-priority features, unavailable external dependencies

## ANTI-PATTERNS

- ❌ Verifying tasks instead of the goal (task completion ≠ goal achievement)
- ❌ "Looks good" without grep/test evidence
- ❌ Ignoring orphaned files (they exist but nobody imports them)
- ❌ Marking PASSED with known gaps without explicit override


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
