# Command Reference - YapuCli 🪺

Complete documentation of all available commands in YapuCli.

> [!NOTE]
> All commands auto-detect the active AI provider session (Antigravity, Claude Code, or Codex). Use `--brain-path` for manual override.

---

## 1. `yapu init`

Initializes the project planning structure.

### Usage

```bash
yapu init
```

### Behavior

- Creates the `.planning/` directory with **11 subdirectories**:
  - `codebase`, `phases`, `debug`, `debug/resolved`, `seeds`, `notes`, `todos`, `research`, `quick`, `spikes`
- Generates base files from templates:
  - `.planning/STATE.md`
  - `.planning/ROADMAP.md`
  - `.planning/config.json`
- Creates files with initial headers:
  - `.planning/REQUIREMENTS.md`
  - `.planning/METHODOLOGY.md`
- Copies `PROJECT.md`, `ROADMAP.md`, and `STATE.md` to the project root (backward compatibility).
- Dynamically copies **all** workflow files `yapu-*.md` to `.agents/skills/`.
- Copies references to `.agents/skills/references/`.
- Copies contexts to `.agents/skills/contexts/`.
- Copies codebase templates to `.agents/skills/codebase/`.
- **Never overwrites existing files.**

### Example Output

```termynal
🪺 Initializing YapuCli...

✅ .planning/ directory scaffolded.
✅ STATE.md initialized.
✅ ROADMAP.md initialized.
✅ config.json initialized.
✅ REQUIREMENTS.md initialized.
✅ METHODOLOGY.md initialized.
✅ Memoria: PROJECT.md inicializada.
✅ Memoria: ROADMAP.md inicializada.
✅ Memoria: STATE.md inicializada.
✅ Directorio .agents/skills/ creado.

🪺 Deploying complete arsenal of fibers...
🔥 10 workflows loaded in .agents/skills/
```

---

## 2. `yapu status`

Displays the current project status by reading the planning files.

### Usage

```bash
yapu status
```

### Behavior

- Reads `STATE.md` from the project root.
- Extracts and displays:
  - Current **operational mode**.
  - Active **phase** of the project.
  - **Task list** (pending and completed).
- Verifies the integrity of `PROJECT.md` and `ROADMAP.md`, showing `OK` or `MISSING` for each.
- **Error**: If `STATE.md` is not found, the command fails with an error message.

### Example Output

```termynal
=== 🪺 YAPU SYSTEM STATUS ===

[ OPR MODE  ] : FORENSICS
[ PHASE     ] : Phase 2 - Core Implementation
---------------------------------
[ TASKS     ] :
  [x] Setup base structure
  [ ] Implement sync command
  [ ] Write unit tests
---------------------------------
[ SPECS     ] : PROJECT.md (OK) | ROADMAP.md (OK)

=================================
```

---

## 3. `yapu archive`

Archives completed tasks from `STATE.md` to history.

### Usage

```bash
yapu archive
```

### Behavior

- Extracts completed tasks (`[x]`) from `STATE.md`.
- Appends them to `HISTORY.md` with a timestamp.
- Cleans the tasks section of `STATE.md`, removing the archived tasks.
- **Error**: Fails if `STATE.md` is not found or if there are no completed tasks to archive.

### Example Output

```termynal
🪺 Executing Archiving System (Yapu Context Freeze)...

✅ Tasks successfully archived in HISTORY.md (3 tasks).
✅ STATE.md has been cleaned and prepared for the next phase.
```


> [!WARNING]
> Requires `STATE.md` to exist with completed tasks. Run `yapu init` first.

---

## 4. `yapu install-hooks`

Installs git hooks to validate project directives.

### Usage

```bash
yapu install-hooks
```

### Behavior

- **Requires** a `.git` directory to exist in the project (must be a Git repository).
- Copies the `templates/pre-commit` template to `.git/hooks/pre-commit`.
- Sets execution permissions (`chmod 755`) on the hook.
- The installed `pre-commit` hook validates `PROJECT.md` directives before each commit.
- **Error**: Fails if the `.git` directory does not exist.

### Example Output

```termynal
🪺 Installing Yapu Guard in Git Hooks...

✅ Yapu Guard: .git/hooks/pre-commit installed successfully.
```


> [!TIP]
> The pre-commit hook validates PROJECT.md directives before each commit, preventing accidental policy violations.

---

## 5. `yapu health`

Validates the integrity of the colony (the YapuCli workspace).

### Usage

```bash
yapu health
```

### Behavior

- **Validates core memory files**: PROJECT.md, ROADMAP.md, STATE.md.
- **Validates nest structure (.planning/)**: verifies that the folder exists and contains the 10 standard subdirectories (`codebase`, `phases`, `debug`, etc.).
- **Validates base specifications**: verifies existence of STATE.md, ROADMAP.md, REQUIREMENTS.md, METHODOLOGY.md, and config.json in .planning/.
- **Validates JSON syntax**: analyzes that `.planning/config.json` has a valid JSON format and is free of syntax errors.
- **Validates Yapu Guard**: checks if the pre-commit hook is installed at `.git/hooks/pre-commit` and if it has execution permissions.
- **Validates semantic consistency**: verifies that `STATE.md` contains the declarations for `ACTIVE PHASE` and `CURRENT OPERATIONAL MODE`.
- Returns exit code `0` if the workspace is 100% healthy, or `1` if it detects critical errors requiring repair.

### Example Output

```termynal
=== 🪺 YAPU WORKSPACE HEALTH CHECK ===

[+] Checking core memory files...
  ✅ PROJECT.md exists
  ✅ ROADMAP.md exists
  ✅ STATE.md exists

[+] Checking .planning/ colony structure...
  ✅ .planning/ directory exists
  ✅ All 10 required subdirectories exist
  ✅ .planning/STATE.md exists
  ✅ .planning/ROADMAP.md exists
  ✅ .planning/REQUIREMENTS.md exists
  ✅ .planning/METHODOLOGY.md exists
  ✅ .planning/config.json exists
  ✅ config.json has valid JSON format

[+] Checking Yapu Guard (Git Hooks)...
  ✅ Active git repository detected
  ✅ Pre-commit hook installed at .git/hooks/pre-commit
  ✅ Pre-commit hook is executable

[+] Checking Memory Integrity...
  ✅ Operational mode declared in STATE.md
  ✅ Active phase declared in STATE.md

=============================================
🔥 Workspace is 100% HEALTHY! The colony is thriving. 🪺
```

---

## 6. `yapu check`

Scans the workspace memory for anti-patterns and contradictions (Phase 5 diagnostics).

### Usage

```bash
yapu check
```

### Behavior

- Reads `.planning/PROJECT.md` and `.planning/STATE.md`.
- Analyzes content for common anti-patterns such as:
  - **Unresolved placeholders**: `TBD`, `TODO`, `[Insert...]` in Core Value or descriptions.
  - **Empty Tasks**: Flags if the active phase lacks defined technical tasks.
  - **Contradictions**: Flags if the declared active phase is unknown or undefined.
- Prints a diagnostic report with warnings for each anti-pattern found.
- Returns exit code `0` even if warnings are found (acts as an advisory tool).

### Example Output

```termynal
=== 🪺 YAPU WORKSPACE DIAGNOSTICS (PHASE 5) ===

[+] Scanning memory triad for anti-patterns...
⚠️  Anti-pattern detected: Unresolved placeholder (TBD, TODO, [Insert...]) in PROJECT.md (line 14)
⚠️  Anti-pattern detected: No active tasks defined in STATE.md

❌ Diagnostics complete: 2 anti-pattern(s) detected.
```

---

## 7. `yapu sync`

Syncs artifacts from an Antigravity brain directory to the project.

### Usage

```bash
yapu sync [--brain-path <path>]
```

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `--brain-path` | No | Path to the Antigravity brain directory (if omitted, the active session is auto-detected) |

### Behavior

- Reads the artifacts from the specified brain directory.
- Maps the artifacts to files within `.planning/`:

| Artifact Type | Destination |
|---|---|
| `implementation_plan` | `.planning/current-plan.md` |
| `task` | `.planning/current-tasks.md` |
| `walkthrough` | `.planning/current-walkthrough.md` |
| Custom Artifacts | `.planning/artifacts/{name}.md` |

- **Requires** the `.planning/` directory to exist beforehand (run `yapu init` first).
- Reports the number of synced artifacts and any errors encountered.

### Example Output

```
🧠 Active brain auto-detected: /home/user/.gemini/antigravity-cli/brain/abc123/

🪺 Syncing brain of Antigravity → .planning/...

✅ Synced: implementation_plan
✅ Synced: task
✅ Synced: walkthrough
✅ Synced: api_design

🪺 Sync complete: 4 artifacts synced.
```

---

## 8. `yapu handoff`

Generates handoff files to continue the work in another session or context.

### Usage

```bash
yapu handoff [--brain-path <path>]
```

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `--brain-path` | No | Path to the brain directory for additional context (if omitted, the active session is auto-detected) |

### Behavior

- Reads `.planning/STATE.md` to determine the current position of the project.
- Generates two handoff files:

| File | Format | Purpose |
|---|---|---|
| `.planning/HANDOFF.json` | JSON | Machine-readable state |
| `.planning/.continue-here.md` | Markdown | Human-readable summary |

- If `--brain-path` is provided, incorporates additional context from the Antigravity brain into the generated files.

### Example Output

```termynal
🪺 Generating handoff for the next session...

✅ HANDOFF.json generated: .planning/HANDOFF.json
✅ .continue-here.md generated: .planning/.continue-here.md

🪺 Handoff ready. The next session will resume automatically.
```

---

## 9. `yapu brain`

Inspects the content of an Antigravity brain directory. It has two subcommands: `list` and `log`.

---


<!-- tabs:start -->
#### **brain list**

Lists the artifacts stored in a brain directory.

#### Usage

```bash
yapu brain list [--path <path>]
```

#### Parameters

| Parameter | Required | Description |
|---|---|---|
| `--path` | No | Path to the brain directory (if omitted, the active session is auto-detected) |

#### Behavior

- Scans the brain directory looking for `*.metadata.json` files.
- Checks both the root and the `artifacts/` subdirectory.
- For each artifact shows:
  - **Name** of the artifact
  - **Type** (`implementation_plan`, `task`, `walkthrough`, `other`)
  - **Summary** (summary)
  - **Last updated** (`updatedAt`)

#### Example Output

```termynal
=== 🪺 YAPU BRAIN INSPECTOR ===

[ ARTIFACTS ] : 3 found

  📄 main_plan
     Type: implementation_plan
     Summary: API implementation plan
     Updated: 2026-05-21T10:30:00.000Z

  📄 sprint_tasks
     Type: task
     Summary: Current sprint tasks
     Updated: 2026-05-21T11:00:00.000Z

  📄 auth_walkthrough
     Type: walkthrough
     Summary: Authentication module guide
     Updated: 2026-05-20T15:45:00.000Z

=================================
```

---

#### **brain log**

Displays recent conversation log entries.

#### Usage

```bash
yapu brain log [--path <path>] [-n N]
```

#### Parameters

| Parameter | Required | Description |
|---|---|---|
| `--path` | No | Path to the brain directory (if omitted, the active session is auto-detected) |
| `-n` | No | Number of entries to display (default: 20) |

#### Behavior

- Parses the conversation log (`transcript.jsonl` or `overview.txt`) of the brain directory.
- Displays the last **N** entries (20 by default).
- Each entry includes:
  - **Icon**: `👤` for user messages, `🤖` for model responses
  - **Step index**
  - **Type** of entry
  - **Preview** of the content

#### Example Output

```termynal
=== 🪺 YAPU BRAIN LOG (last 5 entries) ===

  👤 [12] USER_INPUT: Implement the authentication endpoint...
  🤖 [13] PLANNER_RESPONSE: I will create the auth module with JWT...
  🤖 [14] RUN_COMMAND: npm run test...
  🤖 [15] VIEW_FILE: src/auth/handler.ts...
  👤 [16] USER_INPUT: Add expiration token validation...

=================================
```

<!-- tabs:end -->

---

## 10. `yapu board`

Launches the **Yapu Command Center (C2)** — a zero-dependency, local web-based dashboard for real-time project monitoring and interactive control.

### Usage

```bash
yapu board [--port N]
```

### Parameters

| Parameter | Required | Description |
|---|---|---|
| `--port` | No | HTTP port for the local server (default: `4040`) |

### Behavior

- Starts a local HTTP server on `node:http` with **zero external dependencies**.
- Serves a premium dark-themed web UI at `http://localhost:4040`.
- Automatically opens your default browser.
- **Real-time streaming** via Server-Sent Events (SSE):
  - Watches `STATE.md` with `fs.watch` and pushes updates instantly when the file changes.
  - Streams brain transcript entries (neural feed) from the active Antigravity session.
  - Pipes `stdout`/`stderr` from spawned commands to the browser console.
- **Interactive task management**: Click task checkboxes in the UI to toggle their status in `STATE.md` (atomic writes).
- **Command execution**: Run whitelisted yapu commands directly from the web interface.
- **Security**: Only the following commands are executable from the UI (whitelist):
  `plan`, `execute`, `status`, `check`, `health`, `sync`, `handoff`, `snapshot`, `gc`, `rescue`.
  Any other command returns `403 Forbidden`.

> [!ATTENTION]
> Only whitelisted commands can be executed from the web UI. Any other command returns `403 Forbidden`.

### UI Layout

| Panel | Content |
|---|---|
| **Left** | Active phase, progress bar, interactive task checklist |
| **Right** | Tabbed console: Neural Feed (brain logs) + Process Output (command results) |
| **Bottom** | Command bar with action buttons (Plan, Execute, Check, Health, Sync, etc.) |

### Example Output (Terminal)

```termynal
🪺 Starting Yapu Command Center...
🌐 C2 listening on http://localhost:4040
  → http://localhost:4040

  Press Ctrl+C to stop.
```

---

## 14. `yapu provider`

Diagnostic command to inspect detected AI CLI providers.

### Usage

```bash
yapu provider
```

### Behavior

- Scans the system for known AI CLI providers: **Antigravity CLI**, **Claude Code**, and **Codex CLI**.
- For each provider, checks:
  - Whether the executable is installed in PATH
  - Whether the data directory exists (e.g., `~/.gemini/antigravity-cli/brain/`, `~/.claude/projects/`, `~/.codex/sessions/`)
  - Number of sessions/conversations found
- Shows which provider is currently **active** and whether it was auto-detected or explicitly configured.
- Provider selection priority: explicit `provider` config in `yapu-config.json` > auto-detect (executable + data) > default (antigravity)

### Example Output

```termynal
=== 🪺 YAPU PROVIDER DIAGNOSTICS ===
🔍 Detected providers:
  ✅ Antigravity CLI  → ~/.gemini/antigravity-cli/brain (60 sessions)
  ✅ Claude Code  → ~/.claude/projects (4 sessions)
  ✅ Codex CLI  → ~/.codex/sessions (1 sessions)
  ⚡ Active: Antigravity CLI (auto-detected)
```

### Configuration

Set the `provider` field in `.planning/config.json` under `workflow`:

```json
{
  "workflow": {
    "provider": "auto"
  }
}
```

Valid values: `"auto"` (default), `"antigravity"`, `"claude"`, `"codex"`.

---

## General Help

Executing `yapu` without arguments displays the help screen listing all available commands:

```bash
yapu
```

```termynal
🪺 YapuCli Framework

Usage:
  yapu init              -> Founds the colony (.planning/ + complete skills).
  yapu status            -> Radiography of the project.
  yapu health            -> Validates workspace integrity.
  yapu check             -> Diagnostics: scans memory for anti-patterns (Phase 5).
  yapu archive           -> End of season (freezes tasks in HISTORY.md).
  yapu install-hooks     -> Deploys the hornet's nest (Yapu Guard).
  yapu sync              -> Syncs Antigravity brain → .planning/ (auto-detected).
  yapu handoff           -> Generates handoff for the next session (auto-detected).
  yapu brain <list|log>  -> Inspects Antigravity brain (auto-detected).
  yapu board [--port N]  -> Web Command Center (C2) — interactive dashboard.
  yapu provider          -> Diagnostics of detected AI providers in the system.
```
