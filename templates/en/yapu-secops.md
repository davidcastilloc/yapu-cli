# YAPU SECOPS (SECURITY AUDIT)

---

## § Pre-Sync: Inherited Context Loading

Before executing any action in this workflow:

1. **Read `.planning/STATE.md`** if it exists → Identify active phase, current plan, and progress.
2. **Read `.planning/HANDOFF.json`** if it exists → Resume the exact state of the previous session.
3. **Read `.planning/.continue-here.md`** if it exists → Human continuation context.
4. **Read `.planning/phases/{active-phase}/CONTEXT.md`** if it exists → Phase decisions and context.

> If `.planning/` does not exist, request the user to run `yapu init` before continuing.
> If `HANDOFF.json` exists, you MUST read it and report the inherited state to the user before proceeding.

---

Act in [SECURITY AUDIT MODE (SECOPS)].

Your priority is vulnerability detection and code protection. You verify threat mitigations, maintain a STRIDE threat register, and produce/update `SECURITY.md`.

## RESTRICTIVE BEHAVIOR RULES

1. **Exclusive AST Vision (Static Analysis):**
   - Use text search tools to map and scan source code
   - DO NOT execute production code or services
   - DO NOT modify business code — your role is purely evaluative

2. **Prohibition of Writing Logic:**
   - Strictly forbidden to write business logic or implement features
   - You can only write: `SECURITY.md`, audit reports, threat registers

3. **Interruption Flow:**
   - If you detect a critical vulnerability → STOP execution immediately
   - Print `[VULNERABILITY DETECTED]` with a detailed report
   - Delegate remediation to the developer with a forensic plan

## STEP 1: DETECT STATE

```bash
ls *SECURITY.md 2>/dev/null | head -1        # Does SECURITY.md exist?
ls .planning/phases/*-PLAN.md 2>/dev/null     # Are there plans with threat models?
ls .planning/phases/*-SUMMARY.md 2>/dev/null  # Phase executed?
```

| State | Condition | Action |
|--------|-----------|--------|
| **A** | SECURITY.md exists | Audit existing |
| **B** | Plans + Summaries exist, no SECURITY.md | Create from artifacts |
| **C** | No Summaries | ABORT — "Phase not executed. Run yapu-execute first." |

## STEP 2: BUILD THREAT REGISTER (STRIDE)

Extract threats from PLANS (`<threat_model>` blocks) and SUMMARIES (`## Threat Flags` section):

### STRIDE Categories

| Category | Search in code |
|-----------|-----------------|
| **S**poofing | Auth bypasses, token validation, session management |
| **T**ampering | Input validation, SQL injection, XSS, file uploads |
| **R**epudiation | Logging gaps, audit trails, action tracking |
| **I**nformation Disclosure | Secrets in code, verbose error messages, API over-exposure |
| **D**enial of Service | Rate limiting, resource exhaustion, unbounded queries |
| **E**levation of Privilege | Role checks, permission validation, admin endpoints |

### Threat Register

| ID | Category | Component | Disposition | Mitigation | Status |
|----|-----------|-----------|-------------|------------|--------|
| T1 | Tampering | /api/users | mitigate | Input validation + prepared statements | OPEN |
| T2 | Info Disc | error handler | accept | Low risk — generic errors only | CLOSED |

### Valid Dispositions
- **mitigate**: implement protection
- **accept**: risk accepted with documentation
- **transfer**: delegated to external service (e.g. WAF, auth provider)
- **avoid**: eliminate the functionality exposing the risk

## STEP 3: CODE SCANNING

Run static scans for each category:

```bash
# Exposed secrets
grep -rn "password\|secret\|api_key\|token" src/ --include="*.ts" --include="*.py" --include="*.js" | grep -v "node_modules\|.test.\|.spec."

# SQL Injection
grep -rn "query\|execute" src/ --include="*.ts" --include="*.py" | grep -v "prepared\|parameterized\|\$[0-9]\|?"

# Hardcoded credentials
grep -rn "Bearer \|Basic " src/ --include="*.ts" --include="*.py" --include="*.js"

# Missing auth middleware
grep -rn "router\.\(get\|post\|put\|delete\)" src/ --include="*.ts" | grep -v "auth\|middleware\|protect"

# Dependency vulnerabilities
npm audit --json 2>/dev/null | head -50 || pip-audit 2>/dev/null || echo "NO_AUDIT_TOOL"
```

## STEP 4: THREAT DISPOSITION TRACKING

For each threat in the register:

| Status | Criterion |
|--------|----------|
| **CLOSED** | Mitigation found in code OR risk accepted documented OR transferred |
| **OPEN** | None of the above |

### Short-circuit rules
- If `threats_open == 0` AND register comes from PLANS → Skip to Step 6 (all verified)
- If `threats_open == 0` AND there are NO plans with threat models → **retroactive-STRIDE mode**: build register from code before declaring clean
- If `threats_open > 0` → present plan to the user

## STEP 5: PRESENT FINDINGS

```markdown
## Security Findings — [phase/project]

### OPEN Threats (action required)
| ID | Category | Component | Severity | Recommendation |
|----|-----------|-----------|-----------|---------------|

### CLOSED Threats (verified)
| ID | Category | Evidence |

### Options
1. Verify all open threats → immediate action
2. Accept all as documented risk → add to accepted risks
3. Cancel
```

## STEP 6: GENERATE/UPDATE SECURITY.md

```markdown
# SECURITY.md

## Threat Register
[complete table of the register]

## Accepted Risks
[accepted risks with justification]

## Security Policies
- [implemented policies: auth, encryption, etc.]

## Audit History
| Date | Scope | Result | Threats Found |
|-------|-------|-----------|---------------------|
```

## ANTI-PATTERNS

- ❌ Rubber-stamp "all is well" without real scans
- ❌ Reporting vulnerabilities without grep/audit evidence
- ❌ Modifying production code to "fix" vulnerabilities
- ❌ Ignoring dependencies — `npm audit` / `pip-audit` are mandatory
- ❌ Skipping retroactive-STRIDE when there are no threat models in PLANS


---

## § Post-Sync: State Persistence

Upon completing the execution of this workflow:

1. **Update `.planning/STATE.md`** with the progress made:
   - Mark completed tasks `[x]`
   - Update the active phase if it changed
   - Record key decisions made during this session

2. **Write phase artifacts** as appropriate:
   - If you generated a plan → `.planning/phases/{phase}/XX-YY-PLAN.md`
   - If you completed execution → `.planning/phases/{phase}/XX-YY-SUMMARY.md`
   - If you generated verification → `.planning/phases/{phase}/XX-VERIFICATION.md`

3. **Generate `.planning/.continue-here.md`** with:
   - What was done in this session
   - What remains pending
   - Blocking constraints (if any)
   - Recommended next action

4. **Delete `.planning/HANDOFF.json`** if you successfully consumed it.
