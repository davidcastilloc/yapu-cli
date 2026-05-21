# YAPU SEED (IDEAS CAPTURE)

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

Act in [IDEAS CAPTURE MODE].

Two sub-modes: **SEED** (forward-looking ideas with trigger conditions) and **NOTE** (zero-friction capture). Both are one-shot: write immediately, no questions.

> Deep load: `@yapu-ref-artifact-types.md`

## INVARIANT: ZERO FRICTION

**Never ask.** The user's text IS the idea. Write the file immediately and confirm in one line. Idea capture is not a process — it is a reflex.

---

## SUB-MODE: SEED

Seeds are forward-looking ideas with trigger conditions. They are activated automatically when conditions match the scope of a new milestone.

### Why seeds > deferred items
- They preserve **WHY** it matters (not just WHAT)
- They define **WHEN** to surface (trigger conditions, no manual scanning)
- They track **breadcrumbs** (code refs, related decisions)
- They auto-present at the right moment

### Lifecycle
```
dormant → triggered → active
  │          │          │
  │          │          └─ Incorporated in a milestone/phase
  │          └─ Trigger conditions match current scope
  └─ Waiting — not relevant yet
```

### SEED Process

1. **Parse idea** from argument (full text = the idea)
2. **Create directory** `.planning/seeds/` if it does not exist
3. **Generate ID** — sequential `SEED-{NNN}`
4. **Write file** immediately:

```markdown
---
id: SEED-{NNN}
status: dormant
planted: {ISO date}
planted_during: {current milestone/phase or "unknown"}
trigger_when: when relevant
scope: unknown
---

# SEED-{NNN}: {user's idea}

## Why This Matters
_To fill. Use `--enrich SEED-{NNN}` to add context._

## When to Surface
**Trigger:** when relevant
This seed will be surfaced when the milestone scope matches.

## Scope Estimate
**Unknown** — use `--enrich SEED-{NNN}` to estimate effort.

## Breadcrumbs
_No breadcrumbs yet._
```

5. **Confirm**: `Seed planted: SEED-{NNN} — "{idea}"`

### Enrich an existing seed

With `--enrich SEED-{NNN}` flag:
- Find the seed file
- Ask about: WHY (why it matters), WHEN (specific trigger), SCOPE (effort estimation)
- Add breadcrumbs (related code files, decisions that motivated the idea)
- Update the frontmatter with trigger and scope

---

## SUB-MODE: NOTE

Zero-friction capture. One write, one confirmation. No questions, no prompts.

### Storage format

| Scope | Path | When |
|-------|------|--------|
| **Project** | `.planning/notes/{YYYY-MM-DD}-{slug}.md` | `.planning/` exists |
| **Global** | `~/.yapu/notes/{YYYY-MM-DD}-{slug}.md` | No `.planning/` or `--global` |

Each note:
```markdown
---
date: "YYYY-MM-DD HH:mm"
promoted: false
---

{note text verbatim}
```

### Subcommands

| Input | Action |
|-------|--------|
| Free text | **append** — creates note with that text |
| `list` (exact) | **list** — displays all notes |
| `promote N` | **promote** — converts note N into todo |
| Empty | **list** |

**CRITICAL:** `list` is a subcommand only when it is the FULL argument. "`list of groceries`" saves a note with the text "list of groceries".

### APPEND Process

1. Determine scope (project or global)
2. Create notes directory if it does not exist
3. Generate slug: first ~4 significant words, lowercase, with hyphens
4. Generate filename: `{YYYY-MM-DD}-{slug}.md` (if exists, append `-2`, `-3`)
5. Write with frontmatter and verbatim text
6. Confirm: `Noted ({scope}): {text}`

**Constraints:**
- **NEVER modify the text** — capture verbatim, even typos
- **NEVER ask** — only write and confirm

### LIST Process

1. Glob notes from both scopes
2. Read frontmatter for `date` and `promoted`
3. Exclude `promoted: true` from active counts (but show dimmed)
4. Sort by date, number sequentially
5. If > 20 active, show only the last 10

```
Notes:

Project (.planning/notes/):
  1. [2026-02-08 14:32] refactor the hooks system
  2. [promoted] [2026-02-08 14:40] add rate limiting
  3. [2026-02-08 15:10] consider flag --dry-run

Global:
  4. [2026-02-08 10:00] cross-project idea on shared config

{count} active note(s). Use `promote N` to convert to todo.
```

### PROMOTE Process

Converts a note into a todo item in `STATE.md`, marks `promoted: true` in the note.

## OUTPUT

- **SEED**: `.planning/seeds/SEED-{NNN}-{slug}.md`
- **NOTE**: `.planning/notes/{date}-{slug}.md` or `~/.yapu/notes/{date}-{slug}.md`


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
