# Thinking Models: Research

Structured reasoning models for **research and synthesis** agents. Apply at decision points during research and synthesis, not continuously. Each model counters a specific failure mode.

## Conflict Resolution

First Principles and Steel Man both expand scope — execute First Principles FIRST (decompose the problem), then Steel Man (strengthen alternatives). Do not execute simultaneously.

---

## 1. First Principles Thinking

**Counters:** Accepting superficial explanations without decomposing into fundamental components.

Before accepting any technology recommendation or architectural pattern, decompose it to its fundamental constraints: What problem does it solve? What are the non-negotiable requirements? What are the physical/logical limits? Build your recommendation UPWARDS from these constraints, not DOWNWARDS from conventional wisdom. If you cannot explain WHY a recommendation is correct from first principles, flag it as `[LOW]` regardless of the number of sources.

## 2. Simpson's Paradox Awareness

**Counters:** Synthesizer adding contradictory research without checking confusing splits.

When combining findings from multiple documents that show contradictory results, check if the contradiction disappears by splitting by a hidden variable: framework version, deployment target, project scale, or use-case category. A library that benchmarks faster overall might be slower for YOUR specific workload. Before resolving contradictions by majority vote, ask: "Is there a subgroup split that explains why both findings are correct in their own context?"

## 3. Survivorship Bias

**Counters:** Finding only successful examples while missing failures and abandoned approaches.

After gathering evidence IN FAVOR of a recommended approach, actively search for projects that ABANDONED it. Check GitHub issues for "migrated away from", "replaced X with", or "problems with X at scale". A technology with 10 success stories and 100 silent failures looks great until you check the graveyard. Weigh negative evidence (migration stories, deprecation notices, unresolved issues) MORE than positive evidence — failures are under-reported.

## 4. Confirmation Bias Counter

**Counters:** Searching for evidence that confirms the initial hypothesis while ignoring evidence that refutes it.

After forming your initial recommendation, dedicate a full research cycle searching AGAINST it. Use search terms like "{technology} problems", "{technology} alternatives", "why not {technology}", "{technology} vs {competitor}". For each piece of disconfirming evidence: (a) refute it with higher-confidence sources, or (b) add it as a caveat to your recommendation. If you find NO criticism, your search was too narrow.

## 5. Steel Man

**Counters:** Dismissing alternative approaches without giving them their strongest possible form.

Before recommending against an alternative technology, build its STRONGEST possible case. What would a passionate advocate say? What use cases does it serve better than your recommendation? What trade-offs favor it? Present the steel-manned alternative alongside your recommendation with an honest comparison. If the alternative is competitive, flag the decision as `[NEEDS DECISION]` instead of making a unilateral recommendation.

---

## When NOT to Think

- **Decisions already made** — If the user has already decided to "use library X", do not run Steel Man on alternatives or First Principles on the choice. Research how to use X well, not whether X is the right choice.
- **Standard stack lookups** — If you are only verifying the latest version of a known library or reading its API docs, do not invoke Survivorship Bias or Confirmation Bias Counter.
- **Single-technology phases** — If the phase involves a technology with no alternatives to evaluate, skip comparative models (Steel Man, Confirmation Bias Counter).
- **Codebase-only research** — If the research is purely internal (understanding existing code patterns, finding where a function is called), structured reasoning models do not add value. Use grep and read the code.
