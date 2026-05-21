# Continuation Format

Standard format for presenting next steps after completing a command or workflow.

---

## Base Structure

```
---

## ▶ Next Up

**{identifier}: {name}** — {one-line description}

`/clear` then:

`{copy-paste command}`

---

**Also available:**
- `{alternative option 1}` — description
- `{alternative option 2}` — description

---
```

## Formatting Rules

1. **Always show what it is** — name + description, never just a command
2. **Extract context from source** — ROADMAP.md for phases, PLAN.md `<objective>` for plans
3. **Command in inline code** — backticks, easy to copy-paste
4. **`/clear` first** — always show `/clear` before the command
5. **"Also available" not "Other options"** — sounds more app-like
6. **Visual separators** — `---` top and bottom to stand out

---

## Variants

### Execute Next Plan

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry

`/clear` then:

`yapu:execute-phase 2`

---

**Also available:**
- Review plan before executing
- List phase assumptions

---
```

### Last Plan of the Phase

Add a note that it is the last plan and what follows:

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry
<sub>Final plan in Phase 2</sub>

`/clear` then:

`yapu:execute-phase 2`

---

**After completing:**
- Phase 2 → Phase 3 transition
- Next: **Phase 3: Core Features** — User dashboard and settings

---
```

### Plan a Phase

```
---

## ▶ Next Up

**Phase 2: Authentication** — JWT login flow with refresh tokens

`/clear` then:

`yapu:plan-phase 2`

---

**Also available:**
- `yapu:discuss-phase 2` — gather context first
- Review roadmap

---
```

### Phase Complete, Next Ready

```
---

## ✓ Phase 2 Complete

3/3 plans executed

## ▶ Next Up

**Phase 3: Core Features** — User dashboard, settings, and data export

`/clear` then:

`yapu:plan-phase 3`

---

**Also available:**
- `yapu:discuss-phase 3` — gather context first
- Review what Phase 2 built

---
```

### Milestone Complete

```
---

## 🎉 Milestone v1.0 Complete

All 4 phases shipped

## ▶ Next Up

**Start v1.1** — questioning → research → requirements → roadmap

`/clear` then:

`yapu:new-milestone`

---
```

---

## Anti-patterns

### ✗ Command only (no context)
```
## To Continue
Run `/clear`, then paste:
yapu:execute-phase 2
```
The user does not know what 02-03 is.

### ✗ Fenced code blocks for commands
```
```
yapu:plan-phase 3
```
```
Fenced blocks within templates create nesting ambiguity. Use inline backticks.

### ✗ "Other options" language
```
Other options:
- Review roadmap
```
Sounds like an afterthought. Use "Also available:" instead.
