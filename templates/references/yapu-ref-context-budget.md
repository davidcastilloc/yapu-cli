# Reglas de Presupuesto de Contexto

Reglas estándar para mantener el contexto del orquestador lean. Referencia para workflows que spawnen subagentes o lean contenido significativo.

---

## Reglas Universales

1. **Nunca** leer archivos de definición de agentes (`agents/*.md`) — el tipo de subagente los auto-carga
2. **Nunca** inline archivos grandes en prompts de subagentes — decir a los agentes que lean archivos desde disco
3. **Profundidad de lectura escala con context window:**
   - **< 500k tokens (default 200k):** leer solo frontmatter, campos de status, o resúmenes. Nunca leer cuerpos completos de SUMMARY.md, VERIFICATION.md, o RESEARCH.md
   - **≥ 500k tokens (modelo 1M):** PUEDE leer cuerpos completos de output de subagentes cuando el contenido se necesita para presentación inline o toma de decisiones
4. **Delegar** trabajo pesado a subagentes — el orquestador rutea, no ejecuta
5. **Warning proactivo:** Si ya consumiste contexto significativo, avisar: "El presupuesto de contexto se está agotando. Considera hacer checkpoint."

## Profundidad de Lectura por Context Window

| Context Window | Output de Subagente | SUMMARY.md | VERIFICATION.md | PLAN.md (otras fases) |
|---------------|---------------------|------------|-----------------|----------------------|
| < 500k (200k) | Solo frontmatter | Solo frontmatter | Solo frontmatter | Solo fase actual |
| ≥ 500k (1M) | Cuerpo completo permitido | Cuerpo completo permitido | Cuerpo completo permitido | Solo fase actual |

**Cómo verificar:** Leer `.planning/config.json` e inspeccionar `context_window`. Si el campo no existe, tratar como 200k (default conservador).

---

## Tiers de Degradación de Contexto

Monitorear uso de contexto y ajustar comportamiento:

| Tier | Uso | Comportamiento |
|------|-----|---------------|
| **PEAK** | 0-30% | Operaciones completas. Leer cuerpos, spawner múltiples agentes, inline resultados. |
| **GOOD** | 30-50% | Operaciones normales. Preferir lecturas de frontmatter, delegar agresivamente. |
| **DEGRADING** | 50-70% | Economizar. Lecturas solo-frontmatter, inline mínimo, advertir al usuario. |
| **POOR** | 70%+ | Modo emergencia. Checkpoint de progreso inmediato. No nuevas lecturas salvo críticas. |

---

## Señales de Degradación

La calidad se degrada gradualmente antes de que disparen umbrales de pánico:

- **Completación parcial silenciosa** — agente dice que el task está hecho pero la implementación está incompleta. Self-check verifica existencia de archivo pero no completitud semántica. Siempre verificar que output cumple must_haves del plan, no solo que archivos existen.
- **Vaguedad creciente** — agente empieza a usar frases como "appropriate handling" o "standard patterns" en vez de código específico. Indica presión de contexto antes de que disparen warnings.
- **Pasos omitidos** — agente omite pasos que normalmente seguiría. Si success criteria tiene 8 ítems pero reporta 5, sospechar presión de contexto.

> **Limitación fundamental:** El orquestador no puede verificar correctitud semántica del output de agentes — solo completitud estructural. Mitigar con must_haves.truths y verificación por spot-check.
