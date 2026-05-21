# Code Conventions Template

Template for `.planning/codebase/CONVENTIONS.md` — code style and patterns.

**Purpose:** Document how code is written in this codebase. Prescriptive guide for the agent to match the existing style.

---

## Template

```markdown
# Code Conventions

**Analysis Date:** [YYYY-MM-DD]

## Naming Patterns

**Files:**
- [Pattern: e.g., "kebab-case for all files"]
- [Test files: e.g., "*.test.ts alongside source"]
- [Components: e.g., "PascalCase.tsx for React components"]

**Functions:**
- [Pattern: e.g., "camelCase for all functions"]
- [Async: e.g., "no special prefix for async functions"]
- [Handlers: e.g., "handleEventName for event handlers"]

**Variables:**
- [Pattern: e.g., "camelCase for variables"]
- [Constants: e.g., "UPPER_SNAKE_CASE for constants"]
- [Private: e.g., "_prefix for private members" or "no prefix"]

**Types:**
- [Interfaces: e.g., "PascalCase, no I prefix"]
- [Type aliases: e.g., "PascalCase"]
- [Enums: e.g., "PascalCase name, UPPER_CASE values"]

## Code Style

**Formatting:**
- [Tool: e.g., "Prettier with .prettierrc"]
- [Line length: e.g., "100 characters max"]
- [Quotes: e.g., "single quotes"]
- [Semicolons: e.g., "required" or "omitted"]

**Linting:**
- [Tool: e.g., "ESLint with eslint.config.js"]
- [Rules: e.g., "extends @typescript-eslint/recommended"]
- [Run: e.g., "npm run lint"]

## Import Organization

**Order:**
1. [e.g., "External packages (react, express)"]
2. [e.g., "Internal modules (@/lib, @/services)"]
3. [e.g., "Relative imports (., ..)"]
4. [e.g., "Type imports (import type {})"]

**Grouping:**
- [e.g., "Blank line between groups"]
- [e.g., "Alphabetical within each group"]

**Path Aliases:**
- [e.g., "@/ maps to src/"]

## Error Handling

**Patterns:**
- [Strategy: e.g., "throw errors, catch at boundaries"]
- [Custom errors: e.g., "extend Error class, named *Error"]
- [Async: e.g., "use try/catch, no .catch() chains"]

**Error Types:**
- [When to throw: e.g., "invalid input, missing dependencies"]
- [When to return: e.g., "expected failures return Result<T, E>"]
- [Logging: e.g., "log error with context before throwing"]

## Logging

**Framework:** [e.g., "pino logger from lib/logger.ts"]
**Levels:** [e.g., "debug, info, warn, error"]

**Patterns:**
- [Format: e.g., "structured logging with context object"]
- [Where: e.g., "log at service boundaries, not in utils"]
- [Rule: e.g., "no console.log in committed code"]

## Comments

**When to Comment:**
- [e.g., "explain why, not what"]
- [e.g., "document business rules and edge cases"]
- [e.g., "avoid obvious comments"]

**JSDoc/TSDoc:**
- [e.g., "required for public APIs, optional for internal"]

**TODO Comments:**
- [Format: e.g., "// TODO: description"]

## Function Design

**Size:** [e.g., "keep under 50 lines, extract helpers"]

**Parameters:**
- [e.g., "max 3 parameters, use object for more"]
- [e.g., "destructure objects in parameter list"]

**Return Values:**
- [e.g., "explicit returns, return early for guard clauses"]

## Module Design

**Exports:**
- [e.g., "named exports preferred"]
- [e.g., "export public API from index.ts"]

**Barrel Files:**
- [e.g., "index.ts re-exports public API"]
- [e.g., "avoid circular dependencies"]

---

*Conventions analysis: [date]*
*Update when patterns change*
```

## Usage Guide

**What to include:**
- Naming patterns observed in the codebase
- Formatting rules (Prettier config, linting rules)
- Import organization
- Error handling strategy
- Logging and comment approach
- Function and module design patterns

**What NOT to include:**
- Architecture decisions → that goes in ARCHITECTURE.md
- Technology choices → that goes in STACK.md
- Testing patterns → that goes in TESTING.md
- File organization → that goes in STRUCTURE.md

**How to fill out this template:**
1. Review .prettierrc, .eslintrc, or similar configs
2. Examine 5-10 representative source files
3. Search for consistency: if 80%+ follows a pattern, document it
4. Be prescriptive: "Use X" not "Sometimes Y is used"
5. Note deviations: "Legacy code uses Y, new code must use X"
6. Keep under ~150 lines total
