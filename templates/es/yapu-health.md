# YAPU DIAGNÓSTICO DE INTEGRIDAD

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

Actúa en [ MODO DIAGNÓSTICO DE INTEGRIDAD ].

Tu objetivo es validar la integridad del workspace de planificación (`.planning/`) y reportar problemas accionables. Dos modos ortogonales: integridad de directorio y utilización de contexto.

> Carga profunda: `@yapu-ref-artifact-types.md`

## DOS MODOS (INDEPENDIENTES)

| Modo | Flag | Qué valida |
|------|------|------------|
| **Directory Health** | (default) | Estructura `.planning/`, archivos faltantes, config inválida, estado inconsistente |
| **Context Utilization** | `--context` | Uso del context window del modelo, recomendaciones de gestión |

Los modos son **ortogonales** — nunca mezclar output de ambos en una ejecución.

## MODO 1: DIRECTORY HEALTH (Default)

### Flags opcionales
- `--repair` — auto-reparar issues que son reparables
- `--backfill` — regenerar archivos faltantes con valores default

### Checks de integridad

#### 1. Archivos core
| Archivo | Requerido | Si falta |
|---------|-----------|----------|
| `.planning/STATE.md` | ✅ | ⛔ BROKEN — no hay tracking de estado |
| `.planning/ROADMAP.md` | ✅ | ⚠️ DEGRADED — no hay dirección |
| `.planning/PROJECT.md` | Recomendado | ⚠️ Warning — correr `yapu-map` |
| `.planning/config.json` | Recomendado | ⚠️ Warning — usar defaults |

#### 2. Coherencia de estado
- ¿`STATE.md` referencia fases que existen en `ROADMAP.md`?
- ¿Las tareas marcadas `[x]` tienen commits correspondientes?
- ¿Hay fases en ROADMAP sin directorio en `.planning/phases/`?
- ¿Hay directorios de fase huérfanos (no referenciados en ROADMAP)?

#### 3. Configuración válida
- Si `config.json` existe: ¿es JSON válido?
- ¿Los valores de configuración están en rangos esperados?

#### 4. Archivos huérfanos
- Plans sin fase padre
- Debug sessions con status `investigating` > 7 días sin actualización
- Quick tasks sin entrada en STATE.md

### Niveles de estado

| Estado | Significado |
|--------|-------------|
| **🟢 HEALTHY** | Todo en orden, sin errores ni warnings |
| **🟡 DEGRADED** | Funcional pero con warnings — atención recomendada |
| **🔴 BROKEN** | Archivos críticos faltantes o estado inconsistente — requiere acción |

### Output format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Yapu Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: 🟢 HEALTHY | 🟡 DEGRADED | 🔴 BROKEN
Errors: {N} | Warnings: {N} | Info: {N}
```

**Si hay errores:**
```
## Errores (requieren acción)
- ⛔ STATE.md faltante — sin tracking de estado
  Fix: Crear STATE.md con `yapu-plan` o `--repair`

## Warnings
- ⚠️ config.json faltante — usando defaults
  Fix: Crear con `--repair` o manualmente
- ⚠️ 2 debug sessions inactivas > 7 días
  Fix: Resolver o archivar manualmente
```

### Auto-repair (si `--repair`)

Acciones de reparación automática:
```
## Reparaciones realizadas
- ✓ config.json: Creado con valores default
- ✓ STATE.md: Regenerado desde ROADMAP.md
- ✓ Directorio phases/ creado
```

**Solo repara issues marcados como `repairable`.** Nunca inventa contenido — usa defaults y estructura mínima.

## MODO 2: CONTEXT UTILIZATION (`--context`)

Evalúa el uso del context window para optimizar sesiones largas.

### Input necesario
- `tokens_used` — tokens consumidos en la sesión actual
- `context_window` — tamaño total del context window del modelo

Si el runtime no expone estos valores, preguntar al usuario:
```
¿Tokens aproximados usados? ¿Tamaño del context window?
```

### Niveles de utilización

| % Uso | Estado | Recomendación |
|-------|--------|---------------|
| 0-60% | 🟢 Normal | Continuar normalmente |
| 60-80% | 🟡 Warning | Considerar nueva sesión para tareas grandes |
| 80-100% | 🔴 Critical | Iniciar nueva sesión — riesgo de degradación |

### Output
```
Context utilization: {N}% ({estado})
{recomendación si warning o critical}
```

## ANTI-PATRONES

- ❌ **Ignorar DEGRADED** — los warnings acumulados se convierten en BROKEN
- ❌ **Auto-repair sin revisar** — verifica qué se reparó después de `--repair`
- ❌ **Mezclar modos** — directory health y context son diagnósticos independientes
- ❌ **Correr health en proyecto sin `.planning/`** — primero inicializar con `yapu-map`


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
