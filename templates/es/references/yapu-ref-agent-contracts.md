# Contratos de Agentes

Marcadores de completación y schemas de handoff para agentes Yapu. Los workflows usan estos marcadores para detectar completación y rutear apropiadamente.

---

## Registro de Agentes

| Agente | Rol | Marcadores de Completación |
|--------|-----|---------------------------|
| yapu-planner | Creación de planes | `## PLANNING COMPLETE` |
| yapu-executor | Ejecución de planes | `## PLAN COMPLETE`, `## CHECKPOINT REACHED` |
| yapu-researcher | Investigación de fase | `## RESEARCH COMPLETE`, `## RESEARCH BLOCKED` |
| yapu-plan-checker | Validación de planes | `## VERIFICATION PASSED`, `## ISSUES FOUND` |
| yapu-debugger | Investigación de debug | `## DEBUG COMPLETE`, `## ROOT CAUSE FOUND`, `## CHECKPOINT REACHED` |
| yapu-roadmapper | Creación/revisión de roadmap | `## ROADMAP CREATED`, `## ROADMAP REVISED`, `## ROADMAP BLOCKED` |
| yapu-verifier | Verificación post-ejecución | `## Verification Complete` (title case) |

## Reglas de Marcadores

1. **Marcadores ALL-CAPS** (ej: `## PLANNING COMPLETE`) son la convención estándar
2. **Marcadores Title-case** (ej: `## Verification Complete`) existen en el verifier — intencional, no un bug
3. **Marcadores no-estándar** (ej: `## PARTIAL`, `## ESCALATE`) indican resultados parciales que requieren juicio del orquestador
4. **Agentes sin marcadores** escriben artefactos directamente a disco o retornan datos estructurados (JSON/secciones) que el caller parsea
5. Los marcadores deben aparecer como headings H2 (`## `) al inicio de una línea en el output final del agente

---

## Contratos de Handoff Clave

### Planner → Executor (vía PLAN.md)

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| Frontmatter | Sí | phase, plan, type, wave, depends_on, files_modified, autonomous, requirements |
| `<objective>` | Sí | Qué logra el plan |
| `<tasks>` | Sí | Lista ordenada de tasks con type, files, action, verify, acceptance_criteria |
| `<verification>` | Sí | Pasos de verificación general |
| `<success_criteria>` | Sí | Criterios de completación medibles |

### Executor → Verifier (vía SUMMARY.md)

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| Frontmatter | Sí | phase, plan, subsystem, tags, key-files, metrics |
| Tabla de commits | Sí | Hashes y descripciones de commits por task |
| Sección de deviations | Sí | Issues auto-corregidos o "None" |
| Self-Check | Sí | PASSED o FAILED con detalles |

---

## Patrones Regex de Workflows

Los workflows hacen match de estos marcadores para detectar completación:

**plan-phase matchea:**
- `## RESEARCH COMPLETE` / `## RESEARCH BLOCKED`
- `## PLANNING COMPLETE`
- `## CHECKPOINT REACHED`
- `## VERIFICATION PASSED` / `## ISSUES FOUND`

**execute-phase matchea:**
- `## PHASE COMPLETE`
- `## Self-Check: FAILED`

> **NOTA:** `## PLAN COMPLETE` es el marcador del executor, pero execute-phase no lo matchea via regex. En cambio, detecta completación del executor via spot-checks (existencia de SUMMARY.md, estado de git commits). Esto es comportamiento intencional.
