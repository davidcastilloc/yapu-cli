# YAPU SEED (CAPTURA DE IDEAS)

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

Actúa en [MODO CAPTURA DE IDEAS].

Dos sub-modos: **SEED** (ideas forward-looking con condiciones de trigger) y **NOTE** (captura zero-friction). Ambos son one-shot: escriben inmediatamente, sin preguntas.

> Carga profunda: `@yapu-ref-artifact-types.md`

## INVARIANTE: CERO FRICCIÓN

**Nunca preguntes.** El texto del usuario ES la idea. Escribe el archivo inmediatamente y confirma en una línea. La captura de ideas no es un proceso — es un reflejo.

---

## SUB-MODO: SEED

Seeds son ideas forward-looking con condiciones de trigger. Se activan automáticamente cuando las condiciones match el scope de un nuevo milestone.

### Por qué seeds > items diferidos
- Preservan **POR QUÉ** importa (no solo QUÉ)
- Definen **CUÁNDO** surfacear (trigger conditions, no escaneo manual)
- Rastrean **breadcrumbs** (refs de código, decisiones relacionadas)
- Se auto-presentan en el momento correcto

### Lifecycle
```
dormant → triggered → active
  │          │          │
  │          │          └─ Incorporado en un milestone/fase
  │          └─ Trigger conditions match scope actual
  └─ Esperando — no relevante aún
```

### Proceso SEED

1. **Parse idea** del argumento (texto completo = la idea)
2. **Crear directorio** `.planning/seeds/` si no existe
3. **Generar ID** — `SEED-{NNN}` secuencial
4. **Escribir archivo** inmediatamente:

```markdown
---
id: SEED-{NNN}
status: dormant
planted: {ISO date}
planted_during: {milestone/fase actual o "unknown"}
trigger_when: when relevant
scope: unknown
---

# SEED-{NNN}: {idea del usuario}

## Why This Matters
_Por llenar. Usa `--enrich SEED-{NNN}` para agregar contexto._

## When to Surface
**Trigger:** when relevant
Este seed se surfaceará cuando el scope del milestone match.

## Scope Estimate
**Unknown** — usa `--enrich SEED-{NNN}` para estimar esfuerzo.

## Breadcrumbs
_Sin breadcrumbs aún._
```

5. **Confirmar**: `Seed planted: SEED-{NNN} — "{idea}"`

### Enriquecer un seed existente

Con flag `--enrich SEED-{NNN}`:
- Encuentra el archivo del seed
- Pregunta por: WHY (por qué importa), WHEN (trigger específico), SCOPE (estimación de esfuerzo)
- Agrega breadcrumbs (archivos de código relacionados, decisiones que motivaron la idea)
- Actualiza el frontmatter con trigger y scope

---

## SUB-MODO: NOTE

Captura zero-friction. Un write, una confirmación. Sin preguntas, sin prompts.

### Storage format

| Scope | Path | Cuándo |
|-------|------|--------|
| **Project** | `.planning/notes/{YYYY-MM-DD}-{slug}.md` | `.planning/` existe |
| **Global** | `~/.yapu/notes/{YYYY-MM-DD}-{slug}.md` | No hay `.planning/` o `--global` |

Cada nota:
```markdown
---
date: "YYYY-MM-DD HH:mm"
promoted: false
---

{texto de la nota verbatim}
```

### Subcomandos

| Input | Acción |
|-------|--------|
| Texto libre | **append** — crea nota con ese texto |
| `list` (exacto) | **list** — muestra todas las notas |
| `promote N` | **promote** — convierte nota N en todo |
| Vacío | **list** |

**CRÍTICO:** `list` es subcomando solo cuando es el argumento COMPLETO. "`list of groceries`" guarda una nota con texto "list of groceries".

### Proceso APPEND

1. Determinar scope (project o global)
2. Crear directorio de notas si no existe
3. Generar slug: primeras ~4 palabras significativas, lowercase, con guiones
4. Generar filename: `{YYYY-MM-DD}-{slug}.md` (si existe, append `-2`, `-3`)
5. Escribir con frontmatter y texto verbatim
6. Confirmar: `Noted ({scope}): {texto}`

**Constraints:**
- **NUNCA modificar el texto** — capturar verbatim, incluso typos
- **NUNCA preguntar** — solo escribir y confirmar

### Proceso LIST

1. Glob notas de ambos scopes
2. Leer frontmatter para `date` y `promoted`
3. Excluir `promoted: true` de counts activos (pero mostrar dimmed)
4. Ordenar por fecha, numerar secuencialmente
5. Si > 20 activas, mostrar solo las últimas 10

```
Notes:

Project (.planning/notes/):
  1. [2026-02-08 14:32] refactorizar el sistema de hooks
  2. [promoted] [2026-02-08 14:40] agregar rate limiting
  3. [2026-02-08 15:10] considerar flag --dry-run

Global:
  4. [2026-02-08 10:00] idea cross-project sobre config compartido

{count} nota(s) activa(s). Usa `promote N` para convertir en todo.
```

### Proceso PROMOTE

Convierte una nota en un todo item en `STATE.md`, marca `promoted: true` en la nota.

## OUTPUT

- **SEED**: `.planning/seeds/SEED-{NNN}-{slug}.md`
- **NOTE**: `.planning/notes/{date}-{slug}.md` o `~/.yapu/notes/{date}-{slug}.md`


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
