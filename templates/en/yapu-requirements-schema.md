# Schema: Requirements — Yapu

> Format for `.planning/REQUIREMENTS.md`
> Checkable requirements that define "done" with REQ-IDs and a traceability table.

## Template

```markdown
# Requirements: [Project Name]

**Defined:** [date]
**Core Value:** [from PROJECT.md]

## v1 Requirements

Requirements for the initial release. Each maps to roadmap phases.

### [Category 1]

- [ ] **[CAT]-01**: [Requirement description — user-centric, testable, atomic]
- [ ] **[CAT]-02**: [Requirement description]
- [ ] **[CAT]-03**: [Requirement description]

### [Category 2]

- [ ] **[CAT]-01**: [Requirement description]
- [ ] **[CAT]-02**: [Requirement description]

### [Category 3]

- [ ] **[CAT]-01**: [Requirement description]
- [ ] **[CAT]-02**: [Requirement description]

## v2 Requirements

Deferred to a future release. Tracked but not in the current roadmap.

### [Category]

- **[CAT]-01**: [Description]
- **[CAT]-02**: [Description]

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|-------|
| [Feature] | [Why excluded] |
| [Feature] | [Why excluded] |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|------|--------|
| [CAT]-01 | Phase 1 | Pending |
| [CAT]-02 | Phase 1 | Pending |
| [CAT]-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: [X] total
- Mapped to phases: [Y]
- Unmapped: [Z] ⚠️

---
*Requirements defined: [date]*
*Last updated: [date] after [trigger]*
```

## REQ-ID Format

- **Pattern:** `[CATEGORY]-[NUMBER]` (AUTH-01, CONTENT-02, SOCIAL-03)
- **Description:** User-centric, testable, atomic
- **Checkbox:** Only for v1 (v2 are not actionable yet)

## Typical Categories

AUTH, CONTENT, SOCIAL, PROFILE, NOTIF, MODR, PAYMENT, ADMIN, INFRA

## Status Values

| Status | Meaning |
|--------|------------|
| Pending | Not started |
| In Progress | Active phase |
| Complete | Requirement verified |
| Blocked | Waiting on external factor |

## Evolution

**After each completed phase:**
1. Mark covered requirements as Complete
2. Update traceability status
3. Note requirements that changed scope

**After updating the roadmap:**
1. Verify that all v1 requirements remain mapped
2. Add new requirements if scope expanded
3. Move to v2/out of scope if descoped

**v1 → v2:** Move if deferred. **v2 → v1:** Requires roadmap update.
