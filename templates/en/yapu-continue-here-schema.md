# Schema: Session Resume — Yapu

> Format for `.planning/phases/XX-name/.continue-here.md`
> Session resume artifact featuring `decisions_made` to prevent re-debate.

**This file is DELETED after resuming — it is not permanent storage.**

## Template

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress | blocked | almost_done
last_updated: YYYY-MM-DDTHH:MM:SSZ
---

<current_state>
[Where exactly are we? What is the immediate context?]
</current_state>

<completed_work>
[What was completed this session — be specific]

- Task 1: [name] — Done
- Task 2: [name] — Done
- Task 3: [name] — In progress, [what was done]
</completed_work>

<remaining_work>
[What is left in this phase]

- Task 3: [name] — [what is missing]
- Task 4: [name] — Not started
- Task 5: [name] — Not started
</remaining_work>

<decisions_made>
[Key decisions and why — so the next session does NOT re-debate]

- Decided to use [X] because [reason]
- Chose [approach] over [alternative] because [reason]
</decisions_made>

<blockers>
[Anything stuck or waiting on external factors]

- [Blocker 1]: [status/workaround]
</blockers>

<context>
[Mental state, "vibe", anything that helps resume smoothly]

[What were you thinking about? What was the plan?
This is the "resume exactly where you left off" context.]
</context>

<next_action>
[The very first thing to do upon resuming]

Start with: [specific action]
</next_action>
```

## Frontmatter Fields

| Field | Purpose |
|-------|-----------|
| `phase` | Directory name (e.g.: `02-authentication`) |
| `task` | Current task number |
| `total_tasks` | Number of tasks in the phase |
| `status` | `in_progress`, `blocked`, `almost_done` |
| `last_updated` | ISO timestamp |

## Guidelines

- **Be specific** so a fresh instance of Yapu understands immediately
- Include **WHY** decisions were made, not just what
- `<decisions_made>` is CRITICAL — prevents loops of re-debate
- `<next_action>` must be actionable without reading anything else
- This file is **DELETED** after a successful resume
