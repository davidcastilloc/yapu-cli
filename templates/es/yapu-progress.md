# YAPU PROGRESS (PROGRESO Y NAVEGACIÓN)

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

Actúa en [MODO PROGRESO Y NAVEGACIÓN].

Tu objetivo es responder "¿Dónde estoy? ¿Qué sigue?" con un reporte de estado enriquecido y ruteo inteligente a la siguiente acción. Máquina de estados con 6 rutas posibles.

> Carga profunda: `@yapu-ref-gates.md`, `@yapu-ref-artifact-types.md`

## PASO 1: CARGAR CONTEXTO

1. Verifica existencia de `.planning/` → si no existe: "No hay proyecto. Inicializa primero." → salir
2. Lee `STATE.md` → posición actual, decisiones, blockers
3. Lee `ROADMAP.md` → estructura de fases, progreso
4. Lee `PROJECT.md` → nombre del proyecto, descripción

**Si `ROADMAP.md` falta pero `PROJECT.md` existe:** Milestone completado y archivado → ir a **Ruta F**.
**Si faltan ambos:** "No hay proyecto. Inicializa primero." → salir

## PASO 2: SAFETY GATES

Ejecuta gates antes de rutear. Salir en el primer bloqueo a menos que `--force`.

| Gate | Condición | Acción |
|------|-----------|--------|
| **Checkpoint** | `.continue-here.md` existe | ⛔ "Checkpoint no resuelto. Léelo, resuélvelo, bórralo." |
| **Error** | `STATE.md` → `status: error` | ⛔ "Proyecto en estado de error. Resuélvelo primero." |
| **Verificación** | `VERIFICATION.md` con `FAIL` sin override | ⛔ "Failures de verificación no resueltos." |

## PASO 3: ANALIZAR Y CONTAR

Para la fase actual:
```bash
# Contar artefactos en directorio de fase
PLANS=$(ls .planning/phases/{current}/*-PLAN.md 2>/dev/null | wc -l)
SUMMARIES=$(ls .planning/phases/{current}/*-SUMMARY.md 2>/dev/null | wc -l)
```

Obtener también:
- 2-3 SUMMARY.md más recientes → "trabajo reciente"
- Todos pendientes
- Sesiones de debug activas

## PASO 4: PRESENTAR REPORTE

```markdown
# {Nombre del Proyecto}

**Progreso:** [████████░░] {P}%
**Fase:** {N} de {total} — {nombre}
**Plan:** {M} de {total_plans} — {status}

## Trabajo Reciente
- [Fase X, Plan Y]: {resumen en una línea}
- [Fase X, Plan Z]: {resumen en una línea}

## Posición Actual
CONTEXT: {✓ | —}
PLANS: {completados}/{total}

## Decisiones Clave
- {decisión} — {razonamiento}

## Blockers
- {blocker o "ninguno"}

## Qué Sigue
{Determinado por la máquina de estados}
```

## PASO 5: RUTEAR (Máquina de Estados)

### Evaluación de condiciones

| Condición | Ruta |
|-----------|------|
| `SUMMARIES < PLANS` (planes sin ejecutar) | **Ruta A** |
| `SUMMARIES == PLANS && PLANS > 0` (fase completa) | → Paso 6 (verificar/completar) |
| `PLANS == 0` (fase no planificada) | **Ruta B** |
| UAT con gaps diagnosticados | **Ruta E** |
| Milestone completo | **Ruta F** |

---

### Ruta A: Plan sin ejecutar existe

Encuentra el primer PLAN.md sin SUMMARY.md correspondiente.

```
▶ Siguiente: {fase}-{plan}: {Nombre del Plan}
  {resumen del objetivo del plan}

  Ejecuta: yapu-execute
```

---

### Ruta B: Fase necesita planificación

Verifica si existe `CONTEXT.md` para la fase.

**Si CONTEXT.md existe:**
```
▶ Siguiente: Fase {N} — {Nombre}
  ✓ Contexto recopilado, listo para planificar

  Ejecuta: yapu-plan
```

**Si CONTEXT.md NO existe:**
```
▶ Siguiente: Fase {N} — {Nombre}
  Necesita recopilar contexto primero

  Ejecuta: yapu-discuss
  Alternativa: yapu-plan (saltar discusión)
```

---

### Ruta C: Fase completa → Verificar

```
▶ Siguiente: Verificar Fase {N}
  Todos los planes ejecutados. Verificar objetivo logrado.

  Ejecuta: yapu-verify
```

---

### Ruta D: Completar milestone

```
▶ Siguiente: Completar milestone {version}
  Todas las fases verificadas.

  Ejecuta: Archivar y cerrar milestone
```

---

### Ruta E: UAT gaps necesitan fixes

```
⚠ UAT Gaps en Fase {N}
  {count} gaps requieren planes de fix.

  Ejecuta: yapu-plan --gaps
```

---

### Ruta F: Entre milestones

```
Milestone anterior completado y archivado.
No hay ROADMAP.md activo.

  Ejecuta: Crear nuevo milestone o ROADMAP.md
```

## PASO 6: VERIFICACIÓN DE COMPLETITUD CROSS-PHASE

Antes de declarar una fase completa, escanea fases anteriores por deuda:

| Tipo de deuda | Detección |
|---------------|-----------|
| Planes sin SUMMARY | PLAN.md sin SUMMARY.md correspondiente |
| Verification failures | VERIFICATION.md con FAIL sin override |
| Context sin planes | CONTEXT.md sin PLAN.md |

Si hay deuda → mostrar como **WARNING** (no blocker):
```
⚠ Deuda de verificación ({N} archivos en fases anteriores)
  Fase {X}: {count} pendientes
```

## OUTPUT

- **Artefacto**: Ninguno (es read-only)
- **Acción**: Ruteo automático a la siguiente skill de Yapu


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
