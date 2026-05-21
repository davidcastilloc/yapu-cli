# Schema: Phase Research — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-RESEARCH.md`
> Comprehensive research of the ecosystem before planning, featuring an architectural responsibility map.

**Purpose:** Document what Yapu needs to know to implement a phase correctly — not just "which library" but "how experts build this."

## Template

```markdown
# Phase [X]: [Name] — Research

**Researched:** [date]
**Domain:** [primary problem domain/technology]
**Confidence:** [HIGH/MEDIUM/LOW]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
[Copy from CONTEXT.md — these are NON-NEGOTIABLE]
- [Decision 1]
- [Decision 2]

### Yapu Discretion
[Areas where researcher/planner can choose]
- [Area 1]

### Deferred Ideas (OUT OF SCOPE)
[DO NOT research or plan these]
- [Deferred 1]

[If CONTEXT.md does not exist: "No user constraints — all decisions at Yapu's discretion"]
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

Map each phase capability to its architectural tier before researching frameworks.

| Capability | Primary Tier | Secondary Tier | Reasoning |
|------------|--------------|-----------------|-------------|
| [capability] | [Browser/Client, Frontend Server, API/Backend, CDN/Static, Database/Storage] | [secondary or —] | [why this tier] |

[If single-tier application: "Single-tier application — all capabilities reside in [tier]"]
</architectural_responsibility_map>

<research_summary>
## Summary

[2-3 executive paragraphs]
- What was researched
- What the standard approach is
- Key recommendations

**Primary Recommendation:** [actionable guide one-liner]
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|----------|---------|-----------|-------------------|
| [name] | [ver] | [what it does] | [why experts use it] |

### Supporting
| Library | Version | Purpose | When to Use |
|----------|---------|-----------|-------------|
| [name] | [ver] | [what it does] | [use case] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|-----------|-------------|----------|
| [standard] | [alternative] | [when the alternative makes sense] |

**Installation:**
\`\`\`bash
npm install [packages]
\`\`\`
</standard_stack>

<architecture_patterns>
## Architectural Patterns

### System Architecture Diagram
[Diagram showing data flow, NOT file listings]

### Recommended Project Structure
\`\`\`
src/
├── [folder]/        # [purpose]
├── [folder]/        # [purpose]
└── [folder]/        # [purpose]
\`\`\`

### Pattern 1: [Name]
**What:** [description]
**When to use:** [conditions]

### Anti-Patterns to Avoid
- **[Anti-pattern]:** [why it is bad, what to do instead]
</architecture_patterns>

<dont_hand_roll>
## Do Not Hand-Roll

| Problem | Do Not Build | Use Instead | Why |
|----------|-------------|-------------------|---------|
| [problem] | [what you would build] | [library] | [edge cases, complexity] |
</dont_hand_roll>

---
*Phase: XX-name*
*Research completed: [date]*
```

## Key Sections

| Section | Purpose |
|---------|-----------|
| User Constraints | Honor locked decisions from CONTEXT.md |
| Architectural Responsibility Map | Prevent misassignment of tiers |
| Standard Stack | Libraries used by experts, not just the trendy ones |
| Don't Hand-Roll | Problems that seem simple but have existing robust solutions |
| Anti-Patterns | Common mistakes to avoid |
