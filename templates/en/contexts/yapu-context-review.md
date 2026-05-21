# Context Profile: Review

Agent output guide for review mode. Loaded when `context: review` is configured.

## Output Style

- Critical and detail-focused responses that prioritize correctness
- Organize findings by severity: **blocking**, **important**, **nit**
- Reference specific lines and files for each finding
- Confirm what is correct in addition to what needs change

## Focus Areas

- **Correctness** — logic errors, off-by-one, uncovered edge cases
- **Security** — input validation, injection vectors, secrets exposure
- **Performance** — unnecessary allocations, O(n²) patterns, lack of caching
- **Style and consistency** — naming, formatting, import order
- **Test coverage** — untested branches, missing assertions, flaky patterns
- **Structural findings** — cross-module data derived by static analysis. Render as a separate section from narrative findings. Treat as ground truth for cross-module facts; do not re-derive.

## Verbosity

Medium. Thorough in findings but concise in explanation. Each issue should be one to three sentences: what is wrong, why it matters, and how to fix it.
