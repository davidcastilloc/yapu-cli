# YAPU EXPLORATION & PROTOTYPING

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

Act in [EXPLORATION & PROTOTYPING MODE].

Your objective is to explore ideas through two sub-modes: (1) Sketch for throwaway HTML mockups with comparable variants, (2) Spike for focused technical experiments with Given/When/Then validation. Both support frontier mode ("what should I explore?").

---

## SUB-MODE 1: SKETCH — Throwaway HTML Mockups

Explore design directions through throwaway HTML mockups before committing to implementation. Each sketch produces 2-3 variants for comparison.

### Step 1: Routing

Parse arguments:
- `--quick` → skip mood intake, go direct
- `frontier` or empty → **FRONTIER MODE** (see below)
- Any other text → design idea to sketch

### Step 2: Mood Intake (if not --quick)

Explore design intent with 3 questions (one at a time):

1. **Feel:** "How should it feel? Give me adjectives, emotions, or a vibe."
2. **References:** "What apps or sites have a similar feel to what you imagine?"
3. **Core Action:** "What is the most important action a user does here?"

Reflect briefly after each answer. Proceed only when the user says go.

### Step 3: Setup

```bash
mkdir -p .planning/sketches/themes
ls -d .planning/sketches/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1  # next number
```

### Step 4: Decompose into Design Questions

Break the idea into 2-5 design questions:

| Sketch | Design Question | Approach | Risk |
|--------|-------------------|----------|--------|
| 001 | Sidebar or top-nav layout? | Two variants | Affects entire navigation |
| 002 | Cards or table for data? | Three variants | Information density |

### Step 5: Build Variants

For each sketch, generate **2-3 variants** as standalone HTML files:

```
.planning/sketches/001-layout/
├── README.md          # Design question, variants, winner
├── variant-a.html     # Sidebar layout
├── variant-b.html     # Top-nav layout
└── variant-c.html     # Hybrid (optional)
```

**HTML construction rules:**
- **Standalone** — single .html file, no external dependencies
- **Tab switching** — include tabs at the top to navigate between variants without changing files
- **Theme system** — CSS custom properties for dark/light mode toggle
- **Interactivity** — hover states, transitions, basic click handlers with vanilla JS
- **Realistic data** — use plausible names, numbers, and content, no lorem ipsum

### Step 6: README per Sketch

```markdown
## Sketch 001: {name}

**Design question:** {question}
**Variants:** A ({description}), B ({description}), C ({description})

### Decision
**Winner:** {variant chosen by the user}
**Reason:** {why}
**Tags:** #layout #navigation
```

### Step 7: Wrap-Up

Consolidate design decisions in `.planning/sketches/MANIFEST.md`:

```markdown
## Design Manifest

| # | Sketch | Winner | Design Decision |
|---|--------|--------|----------------|
| 001 | Layout | B | Top-nav for mobile-first consistency |
| 002 | Data display | A | Cards for better scannability |
```

---

## SUB-MODE 2: SPIKE — Focused Technical Experiments

Explore technical feasibility through focused experiments. Produce verified knowledge for the actual build.

### Step 1: Routing

- `frontier` or empty → **FRONTIER MODE** (see below)
- `--quick` → skip intake, go direct
- Any text → idea to spike

### Step 2: Setup

```bash
mkdir -p .planning/spikes
ls -d .planning/spikes/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1  # next number
```

### Step 3: Define Spike with Given/When/Then

For each spike, define validation before building:

```markdown
## Spike 001: {name}

**Question:** Is {X} feasible?
**Integration risk:** {high/medium/low}

### Validation
- **Given:** {preconditions}
- **When:** {action/experiment}
- **Then:** {expected result proving feasibility}

### Verdict
- **VALIDATED** — works as expected
- **PARTIAL** — works with limitations: {which}
- **INVALIDATED** — does not work: {why and alternative}
```

### Step 4: Execute Spike

1. **Research** — research approach before writing code
2. **Build** — implement minimum necessary to validate
3. **Test** — execute defined Given/When/Then
4. **Document** — record result with evidence

### Step 5: Integration Risk Analysis

After each spike, evaluate:

| Risk | Question |
|--------|----------|
| Shared resources | Does it share APIs, DB, or state with other spikes? |
| Data handoffs | Does it produce output that another component consumes? |
| Timing | Does it have sequence dependencies? |
| Contention | Does it compete for connections, rate limits, memory? |

---

## FRONTIER MODE (shared Sketch + Spike)

When there is no argument or `frontier` / `"what should I explore?"` is passed:

### For Sketches — Analyze Design Landscape

1. Read `.planning/sketches/MANIFEST.md` + all READMEs
2. Search for:
   - **Visual consistency gaps** — two sketches made independent choices not tested together
   - **State combinations** — individual states validated but not in sequence
   - **Responsive gaps** — validated on one viewport, untested on others
   - **Theme coherence** — individual components OK but not composed in full-page

3. Search for boundaries:
   - Unsketched screens assumed but unexplored
   - Interaction patterns (transitions, loading, drag-and-drop)
   - Edge case UI (0 items, 1000 items, errors, slow connection)
   - Alternative directions for sketches "fine but not great"

### For Spikes — Analyze Technical Landscape

1. Read `.planning/spikes/MANIFEST.md` + READMEs + `CONVENTIONS.md`
2. Search for **integration spikes**:
   - Spikes touching same API/DB but tested independently
   - Assumed compatible data handoffs but never tested
   - Timing dependencies in actual flow
   - Resource contention when combined

3. Search for **frontier spikes**:
   - Capabilities assumed but untested
   - Discovered dependencies revealing new questions
   - Alternative approaches for PARTIAL or INVALIDATED spikes
   - Adjacent capabilities that would improve the idea

### Present & Execute

Propose concrete candidates (with name, question, risk), ask which ones to execute, and proceed directly to the build.

---

## ANTI-PATTERNS

- ❌ Mockups with external dependencies — always standalone HTML
- ❌ Lorem ipsum — always use realistic data
- ❌ Spikes without Given/When/Then — define validation BEFORE building
- ❌ Exploring without recording — everything remains in MANIFEST.md
- ❌ Frontier mode without existing landscape — needs previous sketches/spikes to analyze
- ❌ Validating spike as VALIDATED without executing the Then — requires executable evidence


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
