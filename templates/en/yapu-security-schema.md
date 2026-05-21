# Schema: Phase Security — Yapu

> Format for `.planning/phases/XX-name/{phase_num}-SECURITY.md`
> Threat modeling registration (STRIDE) per-phase with trust boundaries and audit trail.

## Template

```markdown
---
phase: {N}
slug: {phase-slug}
status: draft | verified
threats_open: 0
asvs_level: 1
created: {date}
---

# Phase {N} — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| {boundary} | {description} | {data type / sensitivity} |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|-----------|-----------|-------------|------------|--------|
| T-{N}-01 | {STRIDE category} | {component} | {mitigate / accept / transfer} | {control or reference} | open |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**STRIDE Categories:**
- **S**poofing — Identity theft
- **T**ampering — Data modification
- **R**epudiation — Denying actions
- **I**nformation Disclosure — Information leakage
- **D**enial of Service — Service denial
- **E**levation of Privilege — Privilege escalation

---

## Accepted Risks Log

| Risk ID | Threat Ref | Reasoning | Accepted By | Date |
|---------|------------|-------------|--------------|-------|

*Accepted risks do not resurface in future audits.*
*If none: "No accepted risks."*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|----------------|---------------|--------|------|--------|
| {YYYY-MM-DD} | {N} | {N} | {N} | {name / agent} |

---

## Sign-Off

- [ ] All threats have a disposition (mitigate / accept / transfer)
- [ ] Accepted risks are documented in the Accepted Risks Log
- [ ] `threats_open: 0` confirmed
- [ ] `status: verified` set in frontmatter

**Approval:** {pending / verified YYYY-MM-DD}
```

## ASVS Levels

| Level | Purpose | When to Use |
|-------|----------|-------------|
| 1 | Opportunistic — basic controls | MVP, internal projects |
| 2 | Standard — most applications | Production with user data |
| 3 | Advanced — high security | Fintech, healthcare, government |
