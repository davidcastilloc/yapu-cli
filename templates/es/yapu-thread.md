# YAPU THREADS

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

Actúa en [MODO HILOS PERSISTENTES].

Tu objetivo es gestionar hilos de contexto persistente para decisiones y trabajo que cruzan sesiones. Los threads sobreviven `/clear` y permiten retomar decisiones sin perder contexto.

---

## SUBCOMANDOS

| Subcomando | Invocación | Acción |
|------------|------------|--------|
| **list** | `thread` o `thread list` | Mostrar todos los threads |
| **list --open** | `thread list --open` | Solo open/in_progress |
| **list --resolved** | `thread list --resolved` | Solo resolved |
| **create** | `thread {descripción}` | Crear nuevo thread |
| **resume** | `thread {slug-existente}` | Retomar thread existente |
| **status** | `thread status {slug}` | Ver resumen de un thread |
| **close** | `thread close {slug}` | Marcar como resolved |

---

## ROUTING

Parsear argumentos para determinar modo:

- Vacío o `"list"` → **LIST**
- `"list --open"` / `"list --resolved"` → **LIST filtrado**
- `"close {slug}"` → **CLOSE**
- `"status {slug}"` → **STATUS**
- Si `.planning/threads/{arg}.md` existe → **RESUME**
- Cualquier otra cosa → **CREATE**

---

## SANITIZACIÓN DE SLUG

**Obligatoria** para todo slug antes de usarlo en paths:

```
Reglas:
- Solo [a-z0-9-] permitido
- Máximo 60 caracteres
- Rechazar si contiene ".." o "/"
- Strip caracteres no-printable y ANSI escape sequences
```

Si inválido → `"Slug inválido: {slug}"` → STOP.

> **⚠️ SEGURIDAD:** Nunca interpolar slugs raw en comandos shell. Sanitizar SIEMPRE primero.

---

## MODO LIST

```bash
ls .planning/threads/*.md 2>/dev/null
```

Para cada archivo, leer frontmatter (`status`, `updated`, `title`).

Presentar:

```
Hilos de Contexto
─────────────────────────────────────────────────
slug                      status        updated      title
auth-decision             open          2026-04-09   OAuth vs Session tokens
db-schema-v2              in_progress   2026-04-07   Connection pool sizing
frontend-build-tools      resolved      2026-04-01   Vite vs webpack
─────────────────────────────────────────────────
3 threads (2 open/in_progress, 1 resolved)
```

Sin threads → `"No hay threads. Crea uno con: yapu thread {descripción}"` → STOP.

---

## MODO CREATE

### Paso 1: Generar Slug

Del texto de descripción, generar slug semántico:
- Lowercase, sin acentos, espacios → hyphens
- Máx 60 chars, truncar en boundary de palabra

### Paso 2: Crear Archivo

```bash
mkdir -p .planning/threads
```

Escribir `.planning/threads/{slug}.md`:

```markdown
---
title: {título derivado de la descripción}
status: open
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

# Thread: {título}

## Contexto
{descripción original del usuario}

## Opciones Consideradas
<!-- Agregar opciones a medida que surjan -->

## Decisiones
<!-- Registrar decisiones con fecha y razón -->

## Log de Discusión
### {YYYY-MM-DD}
- Hilo creado: {descripción}
```

### Paso 3: Commit

```bash
git add .planning/threads/{slug}.md
git commit -m "docs: crear thread — {slug}"
```

---

## MODO RESUME

1. Leer `.planning/threads/{slug}.md` completo
2. Actualizar frontmatter: `status: in_progress`, `updated: {hoy}`
3. Mostrar contexto completo al usuario: título, opciones, decisiones previas, log
4. Continuar la conversación — agregar entradas al Log de Discusión
5. Si se toma una decisión → registrar en sección Decisiones con fecha

---

## MODO STATUS

```
Thread: {slug}
─────────────────────────────────
Title:   {title}
Status:  {status}
Created: {created}
Updated: {updated}

Decisiones: {N}
Entradas de log: {N}

Último entry: {preview de la última entrada}
```

---

## MODO CLOSE

1. Verificar que `.planning/threads/{slug}.md` existe
2. Actualizar frontmatter: `status: resolved`, `updated: {YYYY-MM-DD}`
3. Commit: `docs: resolver thread — {slug}`
4. Output: `Thread resuelto: {slug}`

---

## ESTADOS VÁLIDOS

```
open → in_progress → resolved
       ↑_______________|  (puede reabrirse con resume)
```

| Estado | Significado |
|--------|-------------|
| `open` | Creado, sin actividad reciente |
| `in_progress` | Activamente siendo discutido |
| `resolved` | Decisión tomada, cerrado |

---

## ANTI-PATTERNS

- ❌ Crear threads para decisiones triviales — solo para decisiones que cruzan sesiones
- ❌ Usar slugs sin sanitizar en paths de archivo
- ❌ Perder contexto previo al resumir — siempre leer el archivo completo antes de continuar
- ❌ Cerrar un thread sin registrar la decisión final en la sección Decisiones


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
