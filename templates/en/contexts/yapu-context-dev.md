# Context Profile: Development

Agent output guide for development mode. Loaded when `context: dev` is configured.

## Output Style

- Concise, action-oriented responses
- Lead with the code change or command, followed by a brief justification
- No preamble — assume the developer has full context
- Use inline references (`file:line`) instead of prose descriptions

## Focus Areas

- Functional code that compiles and passes tests
- Minimal diff — change only what is necessary
- Point out side effects or breaking changes immediately
- Present the next actionable step at the end of each response

## Verbosity

Low. One-line explanations unless the change is not obvious. Omit background theory, alternatives, and caveats that do not affect the current task.
