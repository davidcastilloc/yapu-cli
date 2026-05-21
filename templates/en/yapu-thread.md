# YAPU THREADS

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

Act in [PERSISTENT THREADS MODE].

Your objective is to manage persistent context threads for decisions and work crossing sessions. Threads survive `/clear` and allow resuming decisions without losing context.

---

## SUBCOMMANDS

| Subcommand | Invocation | Action |
|------------|------------|--------|
| **list** | `thread` or `thread list` | Show all threads |
| **list --open** | `thread list --open` | Only open/in_progress |
| **list --resolved** | `thread list --resolved` | Only resolved |
| **create** | `thread {description}` | Create new thread |
| **resume** | `thread {existing-slug}` | Resume existing thread |
| **status** | `thread status {slug}` | View thread summary |
| **close** | `thread close {slug}` | Mark as resolved |

---

## ROUTING

Parse arguments to determine mode:

- Empty or `"list"` → **LIST**
- `"list --open"` / `"list --resolved"` → **Filtered LIST**
- `"close {slug}"` → **CLOSE**
- `"status {slug}"` → **STATUS**
- If `.planning/threads/{arg}.md` exists → **RESUME**
- Anything else → **CREATE**

---

## SLUG SANITIZATION

**Mandatory** for every slug before using it in paths:

```
Rules:
- Only [a-z0-9-] allowed
- Maximum 60 characters
- Reject if it contains ".." or "/"
- Strip non-printable characters and ANSI escape sequences
```

If invalid → `"Invalid slug: {slug}"` → STOP.

> **⚠️ SECURITY:** Never interpolate raw slugs in shell commands. ALWAYS sanitize first.

---

## LIST MODE

```bash
ls .planning/threads/*.md 2>/dev/null
```

For each file, read frontmatter (`status`, `updated`, `title`).

Present:

```
Context Threads
─────────────────────────────────────────────────
slug                      status        updated      title
auth-decision             open          2026-04-09   OAuth vs Session tokens
db-schema-v2              in_progress   2026-04-07   Connection pool sizing
frontend-build-tools      resolved      2026-04-01   Vite vs webpack
─────────────────────────────────────────────────
3 threads (2 open/in_progress, 1 resolved)
```

No threads → `"No threads. Create one with: yapu thread {description}"` → STOP.

---

## CREATE MODE

### Step 1: Generate Slug

From description text, generate semantic slug:
- Lowercase, no accents, spaces → hyphens
- Max 60 chars, truncate at word boundary

### Step 2: Create File

```bash
mkdir -p .planning/threads
```

Write `.planning/threads/{slug}.md`:

```markdown
---
title: {title derived from description}
status: open
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

# Thread: {title}

## Context
{user's original description}

## Options Considered
<!-- Add options as they arise -->

## Decisions
<!-- Record decisions with date and reason -->

## Discussion Log
### {YYYY-MM-DD}
- Thread created: {description}
```

### Step 3: Commit

```bash
git add .planning/threads/{slug}.md
git commit -m "docs: create thread — {slug}"
```

---

## RESUME MODE

1. Read entire `.planning/threads/{slug}.md`
2. Update frontmatter: `status: in_progress`, `updated: {today}`
3. Show full context to the user: title, options, previous decisions, log
4. Continue the conversation — add entries to Discussion Log
5. If a decision is made → record in Decisions section with date

---

## STATUS MODE

```
Thread: {slug}
─────────────────────────────────
Title:   {title}
Status:  {status}
Created: {created}
Updated: {updated}

Decisions: {N}
Log entries: {N}

Last entry: {preview of the last entry}
```

---

## CLOSE MODE

1. Verify that `.planning/threads/{slug}.md` exists
2. Update frontmatter: `status: resolved`, `updated: {YYYY-MM-DD}`
3. Commit: `docs: resolve thread — {slug}`
4. Output: `Thread resolved: {slug}`

---

## VALID STATES

```
open → in_progress → resolved
       ↑_______________|  (can be reopened with resume)
```

| State | Meaning |
|--------|-------------|
| `open` | Created, no recent activity |
| `in_progress` | Actively being discussed |
| `resolved` | Decision made, closed |

---

## ANTI-PATTERNS

- ❌ Creating threads for trivial decisions — only for decisions crossing sessions
- ❌ Using unsanitized slugs in file paths
- ❌ Losing previous context when resuming — always read the entire file before continuing
- ❌ Closing a thread without recording the final decision in the Decisions section


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
