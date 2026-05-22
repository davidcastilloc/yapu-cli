# PROJECT CONTEXT - ANTIGRAVITY YAPU

## 1. Overview
YapuCli is a lightweight context-engineering and static memory structuring framework for the Antigravity console. It exists to combat context rot by organizing development into isolated phases via a triad of Markdown files (`PROJECT.md`, `ROADMAP.md`, `STATE.md`).

## 2. Core Tech Stack
- **Runtime:** Node.js (v18+)
- **Format:** Native ES Modules (ESM)
- **Linter:** ESLint (Modern Flat Config)
- **Testing:** Node.js Native Test Runner (`node:test` and `node:assert`)

## 3. Architectural Rules (Commandments)
- **Zero external production dependencies:** The main CLI must not require any dependencies in `package.json` `dependencies` to remain ultra-fast and portable.
- **Strict data protection:** The `yapu init` command must never overwrite existing files in the user's workspace.
- **Natively guaranteed quality:** Any new development or refactor of the CLI must have integration test coverage using Node.js native modules.
- **Zero obsolete references:** Disused terms (references to "GSD" or "get-shit-done") are not allowed in active code or final documentation.
