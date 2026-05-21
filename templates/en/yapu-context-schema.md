# Schema: Discussion Context — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-CONTEXT.md`
> Captures implementation decisions for downstream agents.

**Key principle:** Categories are NOT predefined. They emerge from what was discussed for THIS phase.

**Downstream consumers:**
- Researcher — Reads decisions to focus research
- Planner — Reads decisions to create specific tasks
- Verifier — Uses acceptance criteria as pass/fail checks

## Template

```markdown
# Phase [X]: [Name] — Context

**Collected:** [date]
**Status:** Ready for planning

<domain>
## Phase Boundary

[Clear statement of what this phase delivers — the scope anchor. Comes from ROADMAP.md and is fixed. The discussion clarifies implementation within this boundary.]
</domain>

<decisions>
## Implementation Decisions

### [Area 1 discussed]
- **D-01:** [Specific decision made]
- **D-02:** [Another decision if applicable]

### [Area 2 discussed]
- **D-03:** [Specific decision made]

### Yapu Discretion
[Areas where the user explicitly said "you decide" — Yapu has flexibility here]
</decisions>

<specifics>
## Specific Ideas

[Particular references, examples, or "I want it like X" moments. Product references, specific behaviors, interaction patterns.]

[If none: "No specific requirements — open to standard approaches"]
</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

[List each spec, ADR, feature doc, or design doc with full relative paths. Group by thematic area.]

### [Thematic Area 1]
- `path/to/spec.md` — [What this doc decides/defines]
- `path/to/doc.md` §N — [Specific section and what it covers]

### [Thematic Area 2]
- `path/to/feature-doc.md` — [What capability it defines]

[If there are no external specs: "No external specs — requirements captured entirely in decisions above"]
</canonical_refs>

<code_context>
## Insights from Existing Code

### Reusable Assets
- [Component/hook/utility]: [How it could be used in this phase]

### Established Patterns
- [Pattern]: [How it restricts/enables this phase]

### Integration Points
- [Where the new code connects to the existing system]
</code_context>

<deferred>
## Deferred Ideas

[Ideas that came up during discussion but belong to other phases. Captured so they are not lost, but explicitly out of scope.]

[If none: "None — the discussion stayed within the scope of the phase"]
</deferred>

---
*Phase: XX-name*
*Context collected: [date]*
```

## Content Guide

**Good content (concrete decisions):**
- "Card-based layout, not timeline"
- "Retry 3 times on network failure, then fail"
- "JSON for programmatic use, table for humans"

**Bad content (too vague):**
- "Should feel modern and clean"
- "Good user experience"
- "Fast and responsive"

**The `canonical_refs` section is MANDATORY.** If there are no external specs, state it explicitly.
