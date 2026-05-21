# Gap Closure Mode

Activated after a failed verification. Creates plans to address gaps found in verification or UAT.

---

## Critical Rule

**Ignore deferred items.** When reading VERIFICATION.md, only the `gaps:` section contains actionable items. The `deferred:` section lists items scheduled for future phases — they are NOT gaps and must be ignored.

## Closure Flow

### 1. Find gap sources

```bash
# Verify code gaps (VERIFICATION.md)
ls "$phase_dir"/*-VERIFICATION.md 2>/dev/null

# Verify UAT gaps (status: diagnosed)
grep -l "status: diagnosed" "$phase_dir"/*-UAT.md 2>/dev/null
```

### 2. Parse gaps

Each gap has: truth (failed behavior), reason, artifacts (files with issues), missing (things to add/fix).

### 3. Load existing SUMMARYs

Understand what is already built to inform the fixes.

### 4. Find next plan number

If plans 01-03 exist, the next one is 04.

### 5. Group gaps into plans

Grouping criteria:
- Same affected artifact
- Same area of concern
- Dependency order (wiring is not possible if the artifact is a stub → fix stub first)

### 6. Create closure tasks

```xml
<task name="{fix_description}" type="auto">
  <files>{artifact.path}</files>
  <action>
    {For each item in gap.missing:}
    - {missing item}

    Reference existing code: {from SUMMARYs}
    Gap reason: {gap.reason}
  </action>
  <verify>{How to confirm the gap is closed}</verify>
  <done>{Observable truth now achievable}</done>
</task>
```

### 7. Assign waves

Use standard dependency analysis:
- Plans without dependencies → wave 1
- Plans that depend on other gap closure plans → max(dependency waves) + 1
- Also consider dependencies of existing (non-gap) plans in the phase

### 8. Write PLAN.md files

```yaml
---
phase: XX-name
plan: NN              # Sequential after existing ones
type: execute
wave: N               # Computed from depends_on
depends_on: [...]     # Other plans it depends on
files_modified: [...]
autonomous: true
gap_closure: true     # Tracking flag
---
```
