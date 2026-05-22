# Context - YapuCli

> **Format**: this document is machine-greppable. Each operational fact is a
> single-line predicate (`CLASS.subkey=value`). Agent briefs cite predicates
> by ID verbatim — never paraphrase from this file.

## 1. Core Architecture and Memory Triad

YAPU.architecture.core=Yapu is a lightweight context-engineering framework for Antigravity CLI designed to prevent context rot.
YAPU.architecture.memory-triad=Yapu structures context using a triad of three static files: PROJECT.md, ROADMAP.md, and STATE.md in the project root.
YAPU.architecture.project-md=PROJECT.md defines the project vision, technology stack, and strict architecture mandaments. It is permanent and rarely changes.
YAPU.architecture.roadmap-md=ROADMAP.md defines the sequential phases of the project. Development focus is restricted to one active phase at a time.
YAPU.architecture.state-md=STATE.md stores short-term execution state, including the active phase name, precise technical tasks, and execution notes.
YAPU.architecture.system-directive=The execute.md directive in .antigravity/workflows/execute.md serves as the operational system prompt for the agent.
YAPU.architecture.state-machine-flag=STATE.md contains an operational mode flag that tracks whether the current context is PLANIFICACIÓN, EJECUCIÓN, VERIFICACIÓN, or FORENSE.

## 2. CLI Tooling and Commands

YAPU.cli.executable=The global or local CLI command is called `yapu` and is defined in `bin/cli.js`.
YAPU.cli.init-command=Running `yapu init` copies the templates (PROJECT.md, ROADMAP.md, STATE.md) and 40+ workflow directives, 11 schemas, 25 references, 3 contexts, 5 codebase templates to the user's workspace.
YAPU.cli.overwrite-protection=The `yapu init` command never overwrites existing target files to prevent data loss.
YAPU.cli.status-command=Running `yapu status` parses STATE.md and reports the active mode, phase, tasks list, and Specs status.
YAPU.cli.archive-command=Running `yapu archive` programmatically moves completed [x] tasks from STATE.md to HISTORY.md and resets the tasks block.
YAPU.cli.install-hooks-command=Running `yapu install-hooks` deploys Yapu Guard into .git/hooks/pre-commit with executable permissions.
YAPU.cli.yapu-guard=Yapu Guard is a native Node.js pre-commit script that scans staged files against PROJECT.md architectural mandaments.
YAPU.cli.provider-command=Running `yapu provider` displays a diagnostic of all detected AI CLI providers (Antigravity, Claude Code, Codex) with installation status, data paths, and active provider.
YAPU.cli.multi-provider=Yapu supports multiple AI CLI providers via `lib/providers.js`. The active provider is resolved by priority: explicit config > auto-detect (executable + data) > default (antigravity).
YAPU.cli.lib-modules=The CLI is composed of 5 library modules: `artifacts.js`, `board.js`, `dashboard.js`, `i18n.js`, `providers.js`.
YAPU.cli.command-count=22 commands total (including subcommands).
PROVIDERS.supported=antigravity, claude, codex

## 3. Workflow and System Prompt Execution Rules

YAPU.workflow.focus=The agent must only work on the active task marked as pending `[ ]` in STATE.md.
YAPU.workflow.skills=The agent uses its native Antigravity CLI tools (e.g. read, write, run command) to complete tasks.
YAPU.workflow.verification=All code must be validated with tests and compiled locally before completing any task.
YAPU.workflow.completion=When a task is done, the agent marks it as complete `[x]` in STATE.md and clears temporary execution logs.
YAPU.workflow.state-guard=The execution workflow template (yapu-execute.md) enforces the operational mode check, immediately aborting execution on state mismatches.
YAPU.workflow.squads=The active workflows include specialised squads (secops, dba, ui, forensics) with strictly defined behavioral boundaries.
