# Checkpoint Types

> Reference loaded on demand via `@yapu-ref-checkpoints.md`.
> Plans are executed autonomously. Checkpoints formalize points of interaction where human verification or decision-making is required.

---

## Core Principle

**If the agent can execute it, the agent executes it.** Checkpoints are for verification and decisions, not for manual labor.

**Golden Rules:**
1. If the agent can execute it via CLI/API, it executes it.
2. The agent prepares the verification environment (servers, seeds, env vars).
3. The user only does what requires human judgment (visual checks, UX evaluation).
4. Secrets come from the user, automation comes from the agent.
5. Auto-mode bypasses verify/decision checkpoints — human-action always halts (auth gates cannot be automated).

---

## checkpoint:human-verify (90% — Most Common)

**When:** The agent has completed automated work, and the human confirms that it works correctly.

**Default mode: `end-of-phase`.** New projects DO NOT halt mid-flight for verification checkpoints. The planner suppresses them and embeds the details within the `<verify><human-check>` block of the relevant `auto` task; the verifier harvests them at the end of the phase and consolidates them into a single UAT batch.

**Why it is the default:** Each mid-flight halt costs a full cold-start of the executor (rereading context files upon re-spawning) because the subagent's context is discarded. A plan with N human-verify checkpoints pays the cold-start cost N+1 times.

**Use for:** Visual UI checks, interactive flows, functional verification, audio/video quality, animation smoothness, accessibility testing.

**Structure:**
```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[What the agent automated and deployed]</what-built>
  <how-to-verify>[Exact steps — URLs, expected behavior]</how-to-verify>
  <resume-signal>[How to continue — "approved", "yes", or describe issues]</resume-signal>
</task>
```

**Key pattern:** The agent starts the server BEFORE the checkpoint:
```xml
<task type="auto">
  <name>Start dev server for verification</name>
  <action>Run `npm run dev` in background, wait for ready</action>
</task>
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Dashboard at http://localhost:3000/dashboard (server running)</what-built>
  <how-to-verify>
    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar left, content right
    2. Mobile (375px): Single column, bottom nav
    3. No horizontal scroll at any size
  </how-to-verify>
</task>
```

---

## checkpoint:decision (9%)

**When:** The human must choose something that affects the implementation direction.

**Use for:** Technology selection, architectural decisions, design choices, feature prioritization, data model decisions.

**Structure:**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>[What is being decided]</decision>
  <context>[Why this decision matters]</context>
  <options>
    <option id="option-a">
      <name>[Name]</name>
      <pros>[Benefits]</pros>
      <cons>[Tradeoffs]</cons>
    </option>
  </options>
  <resume-signal>[How to indicate the choice]</resume-signal>
</task>
```

---

## checkpoint:human-action (1% — Rare)

**When:** The action has NO CLI/API and requires human-only interaction, OR the agent encountered an auth gate during automation.

**Use ONLY for:**
- **Auth gates** — agent tried CLI/API but needs credentials.
- Email verification links.
- 2FA codes via SMS.
- Manual account approvals.
- 3D Secure credit card flows.
- OAuth approvals in browser.

**DO NOT use for pre-planned manual work:** Deploy (use CLI), create webhooks/databases (use API/CLI), run builds/tests, create files.

**Key Pattern — Auth Gate:**
The agent attempts automation → auth error → creates `checkpoint:human-action` dynamically → user authenticates → agent retries → continues.

```xml
<!-- The agent attempted to deploy but got an auth error -->
<task type="checkpoint:human-action" gate="blocking">
  <action>Authenticate Vercel CLI</action>
  <instructions>
    I tried to deploy but got authentication error.
    Run: vercel login
    Complete the browser authentication flow.
  </instructions>
  <verification>vercel whoami returns your account</verification>
</task>
<!-- After auth, the agent retries the deployment -->
```

**Key Distinction:**
- Pre-planned: "I need you to do X" (incorrect — the agent should automate it).
- Auth gate: "I tried to automate X but need credentials" (correct — unlocks automation).

---

## checkpoint:tdd-review (TDD Mode Only)

**When:** All waves of a phase complete and `workflow.tdd_mode` is enabled. Advisory gate — does not block execution.

**Use for:** Verifying RED/GREEN/REFACTOR commit sequence, detecting gate violations, reviewing test quality, confirming minimal GREEN implementations.

**Structure:**
```xml
<task type="checkpoint:tdd-review" gate="advisory">
  <what-checked>TDD gate compliance for {count} plans in Phase {X}</what-checked>
  <gate-results>
    | Plan | RED | GREEN | REFACTOR | Status |
    |------|-----|-------|----------|--------|
    | {id} |  ✓  |   ✓   |    ✓     | Pass   |
  </gate-results>
  <violations>[List of violations, or "None"]</violations>
</task>
```

---

## Execution Protocol

Upon encountering `type="checkpoint:*"`:
1. **Halt immediately** — do not proceed to the next task.
2. **Display checkpoint clearly** using a box format.
3. **Wait for user response** — do not hallucinate completion.
4. **Verify if possible** — check files, run tests.
5. **Resume execution** — continue only after confirmation.

---

## When NOT to Use Checkpoints

- Things the agent can verify programmatically (tests, builds).
- File operations.
- Code correctness (tests and static analysis).
- Anything automatable via CLI/API.
