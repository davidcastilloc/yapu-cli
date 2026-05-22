# CURRENT STATE (ANTIGRAVITY MEMORY)

**ACTIVE PHASE:** Phase 7: Multi-Provider Support (Completed)

## Tasks of the Current Phase
- [x] Task 1: Design and implement `lib/providers.js` — centralized provider registry for AI CLI backends (Antigravity, Claude Code, Codex).
- [x] Task 2: Refactor `lib/artifacts.js` — generalize `detectBrainPath()` with multi-provider auto-detection and fallback.
- [x] Task 3: Update `yapu swarm` — dynamic provider detection and CLI spawning with `--provider` flag support.
- [x] Task 4: Implement `yapu provider` — diagnostic command showing installed providers, data paths, and active selection.
- [x] Task 5: Update `yapu-config.json` templates (en + es) — add `"provider": "auto"` field to workflow config.
- [x] Task 6: Update `lib/i18n.js` — add provider-related i18n keys and make hardcoded paths generic.
- [x] Task 7: Full test suite verification — 29/29 tests passing with zero regressions.

## Execution Context (Notes for the Agent)
- Antigravity CLI remains the default provider — zero breaking changes to existing behavior.
- Provider resolution priority: explicit config > auto-detect (executable + data) > fallback (antigravity).
- `yapu swarm --provider claude` spawns Claude Code; `yapu swarm --provider codex` spawns Codex CLI.
- All documentation updated: README (en/es), ROADMAP (en/es), CONTEXT (en/es), COMMANDS (en/es).
