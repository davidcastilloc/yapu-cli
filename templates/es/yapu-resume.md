# YAPU RESUME (CONTINUIDAD DE SESIÓN)

---

## § Pre-Sync: Carga de Contexto Heredado

Antes de ejecutar cualquier acción de este workflow:

1. **Lee `.planning/STATE.md`** si existe → Identifica la fase activa, plan actual y progreso.
2. **Lee `.planning/HANDOFF.json`** si existe → Retoma el estado exacto de la sesión anterior.
3. **Lee `.planning/.continue-here.md`** si existe → Contexto humano de continuación.
4. **Lee `.planning/phases/{fase-activa}/CONTEXT.md`** si existe → Decisiones y contexto de la fase.

> Si `.planning/` no existe, solicita al usuario ejecutar `yapu init` antes de continuar.
> Si `HANDOFF.json` existe, DEBES leerlo y reportar al usuario el estado heredado antes de proceder.

---

Actúa en [MODO CONTINUIDAD DE SESIÓN].

Dos sub-modos: **PAUSE** (preservar estado para la siguiente sesión) y **RESUME** (restaurar contexto y continuar). El estado se persiste en formato dual: JSON (machine-readable) + Markdown (human-readable).

> Carga profunda: `@yapu-ref-continuation-format.md`, `@yapu-ref-checkpoints.md`

---

## SUB-MODO: PAUSE

Crea `HANDOFF.json` + `.continue-here.md` para preservar estado completo entre sesiones.

### PASO 1: DETECTAR CONTEXTO

Determina qué tipo de trabajo se está pausando:

| Contexto detectado | Destino del handoff |
|--------------------|---------------------|
| Fase activa | `.planning/phases/XX-name/.continue-here.md` |
| Spike activo | `.planning/spikes/SPIKE-NNN/.continue-here.md` |
| Investigación | `.planning/.continue-here.md` |
| Default (sin contexto claro) | `.planning/.continue-here.md` — notar ambigüedad |

### PASO 2: RECOPILAR ESTADO

Recopila estos 9 elementos:

1. **Posición actual** — fase, plan, tarea
2. **Trabajo completado** — qué se hizo esta sesión
3. **Trabajo pendiente** — qué queda en el plan/fase actual
4. **Decisiones tomadas** — decisiones clave y razonamiento
5. **Blockers/issues** — lo que está atascado
6. **Acciones humanas pendientes** — cosas que necesitan intervención manual
7. **Procesos en background** — servidores/watchers corriendo
8. **Archivos modificados** — cambios no commiteados
9. **Blocking constraints** — anti-patrones descubiertos por falla real (no predicciones)

### PASO 3: ESCRIBIR HANDOFF.json

```json
{
  "version": "1.0",
  "timestamp": "{ISO}",
  "phase": "{phase_number}",
  "phase_name": "{name}",
  "plan": "{current_plan}",
  "task": "{current_task}",
  "total_tasks": "{total}",
  "status": "paused",
  "completed_tasks": [
    {"id": 1, "name": "...", "status": "done"},
    {"id": 2, "name": "...", "status": "in_progress", "progress": "..."}
  ],
  "remaining_tasks": [
    {"id": 3, "name": "...", "status": "not_started"}
  ],
  "blockers": [{"description": "...", "type": "technical|human_action|external"}],
  "human_actions_pending": [{"action": "...", "blocking": true}],
  "decisions": [{"decision": "...", "rationale": "..."}],
  "uncommitted_files": [],
  "next_action": "{primera acción específica al resumir}",
  "context_notes": "{estado mental, enfoque, en qué estabas pensando}"
}
```

### PASO 4: ESCRIBIR .continue-here.md

```markdown
---
context: [phase|spike|research|default]
phase: XX-name
task: 3
total_tasks: 7
status: in_progress
last_updated: {timestamp}
---

# BLOCKING CONSTRAINTS — Leer Antes de Cualquier Cosa

> No son sugerencias. Cada constraint fue descubierto por falla real.

- [ ] CONSTRAINT: [nombre] — [qué es] — [mitigación estructural]

## Critical Anti-Patterns

| Pattern | Descripción | Severity | Prevención |
|---------|-------------|----------|------------|
| [nombre] | [qué es y cómo se manifestó] | blocking | [mecanismo estructural] |
| [nombre] | [qué es y cómo se manifestó] | advisory | [guía para evitarlo] |

**Severity:** `blocking` = el agente debe demostrar comprensión antes de continuar. `advisory` = contexto importante, no bloquea.

## Estado Actual
[Dónde exactamente estamos]

## Trabajo Completado
- Tarea 1: [nombre] — Done
- Tarea 2: [nombre] — En progreso ({detalle})

## Trabajo Pendiente
- Tarea 3: [nombre]
- Tarea 4: [nombre]

## Siguiente Acción
[Acción específica e inmediata al resumir]
```

---

## SUB-MODO: RESUME

Restaura contexto completo para responder "¿Dónde estábamos?" instantáneamente.

### PASO 1: CARGAR ESTADO

1. Lee `STATE.md` → posición, progreso, decisiones, blockers
2. Lee `PROJECT.md` → qué es esto, requisitos, constraints
3. Busca `HANDOFF.json` → fuente primaria de resumption
4. Busca `.continue-here.md` → contexto humano-legible

### PASO 2: DETECTAR TRABAJO INCOMPLETO

Prioridad de detección:

| Fuente | Qué buscar | Acción |
|--------|------------|--------|
| `HANDOFF.json` | `status: "paused"`, `blockers`, `human_actions_pending` | Surfacear inmediatamente |
| `.continue-here.md` | Blocking constraints, tareas en progreso | Demostrar comprensión de constraints `blocking` |
| Planes sin SUMMARY | Plan ejecutado pero no completado | Marcar como incompleto |
| `git status` | Archivos modificados no commiteados | Validar vs `uncommitted_files` del handoff |

### PASO 3: VERIFICAR BLOCKING CONSTRAINTS

Si `.continue-here.md` tiene constraints con `severity: blocking`:

**OBLIGATORIO** — Para cada constraint blocking, responde:
1. **¿Qué es este anti-patrón?** — Descríbelo en tus propias palabras
2. **¿Cómo se manifestó?** — Explica la falla específica
3. **¿Qué mecanismo estructural lo previene?** — No basta con "lo reconozco"

**No procedas hasta demostrar comprensión de todos los constraints blocking.**

### PASO 4: PRESENTAR RESUMEN DE RESUMPTION

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► RESUMIENDO SESIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Proyecto: {nombre}
 Fase: {N} — {nombre}
 Plan: {M} de {total}
 Tarea: {T} de {total_tasks}

 Última acción: {next_action del handoff}
 Blockers: {count o "ninguno"}

 Siguiente: {acción inmediata}
```

### PASO 5: RUTEAR

- Si hay handoff con `next_action` → ejecutar esa acción
- Si hay planes sin ejecutar → `yapu-execute`
- Si no hay planes → `yapu-progress` para determinar siguiente paso
- Limpiar `HANDOFF.json` y `.continue-here.md` una vez restaurado el contexto

## OUTPUT

- **PAUSE**: `HANDOFF.json` + `.continue-here.md`
- **RESUME**: Contexto restaurado + siguiente acción ejecutándose


---

## § Post-Sync: Persistencia de Estado

Al completar la ejecución de este workflow:

1. **Actualiza `.planning/STATE.md`** con el progreso realizado:
   - Marca tareas completadas `[x]`
   - Actualiza la fase activa si cambió
   - Registra decisiones clave tomadas en esta sesión

2. **Escribe artifacts de la fase** según corresponda:
   - Si generaste un plan → `.planning/phases/{fase}/XX-YY-PLAN.md`
   - Si completaste ejecución → `.planning/phases/{fase}/XX-YY-SUMMARY.md`
   - Si generaste verificación → `.planning/phases/{fase}/XX-VERIFICATION.md`

3. **Genera `.planning/.continue-here.md`** con:
   - Qué se hizo en esta sesión
   - Qué queda pendiente
   - Blocking constraints (si hay)
   - Siguiente acción recomendada

4. **Elimina `.planning/HANDOFF.json`** si lo consumiste exitosamente.
