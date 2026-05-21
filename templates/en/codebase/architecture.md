# Architecture Template

Template for `.planning/codebase/ARCHITECTURE.md` — conceptual organization of the code.

**Purpose:** Document how the code is organized at a conceptual level. Complements STRUCTURE.md (physical location of files).

---

## Template

```markdown
# Architecture

**Analysis Date:** [YYYY-MM-DD]

## Overall Pattern

**Type:** [Pattern name: e.g., "Monolithic CLI", "Serverless API", "Full-stack MVC"]

**Key Characteristics:**
- [Characteristic 1: e.g., "Single executable"]
- [Characteristic 2: e.g., "Stateless request handling"]
- [Characteristic 3: e.g., "Event-driven"]

## Layers

**[Layer Name]:**
- Purpose: [What this layer does]
- Contains: [Types of code: e.g., "route handlers", "business logic"]
- Depends on: [What it uses: e.g., "data layer only"]
- Used by: [What uses it: e.g., "API routes"]

**[Layer Name]:**
- Purpose: [What it does]
- Contains: [Code types]
- Depends on: [What it uses]
- Used by: [What uses it]

## Data Flow

**[Flow Name] (e.g., "HTTP Request", "CLI Command", "Event Processing"):**

1. [Entry point: e.g., "User runs command"]
2. [Processing step: e.g., "Router matches path"]
3. [Processing step: e.g., "Controller validates input"]
4. [Processing step: e.g., "Service executes logic"]
5. [Output: e.g., "Response returned"]

**State Management:**
- [How state is managed: e.g., "Stateless", "Database per request", "In-memory cache"]

## Key Abstractions

**[Abstraction Name]:**
- Purpose: [What it represents]
- Examples: [e.g., "UserService, ProjectService"]
- Pattern: [e.g., "Singleton", "Factory", "Repository"]

## Entry Points

**[Entry Point]:**
- Location: [e.g., "src/index.ts"]
- Triggers: [What invokes it: e.g., "CLI invocation", "HTTP request"]
- Responsibilities: [What it does: e.g., "Parse args, route to command"]

## Error Handling

**Strategy:** [e.g., "Exception bubbling to top-level handler"]

**Patterns:**
- [e.g., "try/catch at controller level"]
- [e.g., "Error codes returned to user"]

## Cross-Cutting Concerns

**Logging:** [e.g., "Winston logger, injected per-request"]
**Validation:** [e.g., "Zod schemas at API boundary"]
**Authentication:** [e.g., "JWT middleware on protected routes"]

---

*Architecture analysis: [date]*
*Update when major patterns change*
```

## Usage Guide

**What to include:**
- Overall architectural pattern (monolith, microservices, layered, etc.)
- Conceptual layers and their relationships
- Data flow / request lifecycle
- Key abstractions and patterns
- Entry points and error handling
- Cross-cutting concerns (logging, auth, validation)

**What NOT to include:**
- Exhaustive file listings → that goes in STRUCTURE.md
- Technology choices → that goes in STACK.md
- Line-by-line code walkthroughs
- Implementation details of specific features

**File paths ARE welcome** — include paths as concrete examples of abstractions with backticks: `src/services/user.ts`. This makes the document actionable for the agent during planning.

**How to fill out this template:**
1. Read the main entry points (index, server, main)
2. Identify layers by reading imports/dependencies
3. Trace the typical execution of a request/command
4. Notice recurring patterns (services, controllers, repositories)
5. Keep descriptions conceptual, not mechanical
