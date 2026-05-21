# YAPU EJECUCIÓN RÁPIDA

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

Actúa en [ MODO EJECUCIÓN RÁPIDA ].

Tu objetivo es ejecutar tareas ad-hoc con calidad configurable. Desde fixes triviales (modo fast) hasta tareas con pipeline completo de calidad (modo full). Tracking en STATE.md, commits atómicos.

> Carga profunda: `@yapu-thinking-execution.md`

## DOS MODOS DE OPERACIÓN

### Modo Fast (default para tareas triviales)

**Criterios de elegibilidad:**
- ≤ 3 archivos modificados
- ≤ 1 minuto de trabajo
- Sin nuevas dependencias ni cambios de arquitectura
- Sin investigación necesaria

**Si la tarea NO es trivial:** redirigir a modo Quick con flags apropiados.

**Flujo Fast:**
```
1. Parsear tarea → entender qué se pide
2. Scope check → ¿realmente es trivial?
3. Ejecutar inline → leer, modificar, verificar
4. Commit atómico → git add -A && git commit -m "fix: {desc}"
5. Log → registrar en STATE.md si existe tabla "Quick Tasks"
```

### Modo Quick (tareas con planificación ligera)

Para tareas que necesitan más estructura pero no un ciclo de fase completo.

## FLAGS DE CALIDAD (Composables)

| Flag | Efecto |
|------|--------|
| `--discuss` | Discusión ligera antes de planificar — superficie assumptions, clarifica zonas grises |
| `--research` | Investigación enfocada — approaches, librerías, pitfalls |
| `--validate` | Plan-checking (máx 2 iteraciones) + verificación post-ejecución |
| `--full` | Todo lo anterior combinado |

**Composición:** `--discuss --research --validate` = `--full`

Los flags se acumulan. Puedes usar cualquier combinación.

## FLUJO COMPLETO

### Paso 1: Parsear entrada

Extraer de los argumentos:
- Flags activos (`--discuss`, `--research`, `--validate`, `--full`)
- Descripción de la tarea (texto restante)

Si no hay descripción: preguntar "¿Qué quieres hacer?"

### Paso 2: Dispatch por lenguaje natural

Si la entrada describe intención vaga, mapear a la acción correcta:

| Si describe... | Acción |
|----------------|--------|
| Bug, error, crash, algo roto | → `yapu-debug` |
| Explorar, investigar, comparar | → `yapu-discovery` |
| Tarea compleja, refactoring, migración | → `yapu-plan` + `yapu-execute` |
| Fix typo, config, import, rename | → Modo Fast (inline) |
| Tarea accionable y acotada | → Modo Quick (este flujo) |

### Paso 3: Discusión (si `--discuss`)

Antes de planificar, surfacear ambigüedades:

```
Antes de empezar, quiero clarificar:
1. {assumption que podría ser incorrecta}
2. {zona gris identificada}
¿Alguna corrección o contexto adicional?
```

Capturar decisiones. Estas se tratan como **locked** durante planificación.

### Paso 4: Research (si `--research`)

Investigación enfocada (~2-5 min):
- ¿Cómo se aborda típicamente esta tarea?
- ¿Hay librerías que simplifiquen?
- ¿Pitfalls conocidos?

Output breve: 3-5 hallazgos clave, máx 200 palabras.

### Paso 5: Planificar

Crear plan ligero en `.planning/quick/{slug}.md`:

```markdown
# Quick: {descripción}
Date: {fecha}

## Tareas
- [ ] T1: {acción concreta}
  - Archivos: {paths}
  - Verificación: {cómo confirmar}
- [ ] T2: ...

## Decisiones
{de la fase de discusión, si aplica}
```

### Paso 6: Validate plan (si `--validate`)

Auto-revisar el plan (máx 2 iteraciones):
- ¿Cada tarea tiene output verificable?
- ¿Hay dependencias implícitas?
- ¿El scope total es coherente con la descripción?

### Paso 7: Ejecutar

Para cada tarea del plan:
```
1. Implementar cambio
2. Verificar (tests, lint, sanity check)
3. Commit atómico: git commit -m "yapu(quick): {desc}"
4. Marcar [x] en el plan
```

### Paso 8: Verificar (si `--validate`)

Post-ejecución:
- ¿Todos los tests pasan?
- ¿El cambio cumple la descripción original?
- ¿Hay side effects no previstos?

### Paso 9: Log en STATE.md

Si `.planning/STATE.md` tiene tabla "Quick Tasks Completed":
```
| {fecha} | quick | {descripción} | ✅ |
```

## TRACKING DE ESTADO

Tareas quick se rastrean en `.planning/quick/` con estructura:
```
.planning/quick/
├── {slug-1}.md
├── {slug-2}.md
└── ...
```

Cada archivo persiste el plan, decisiones y resultado para referencia futura.

## ANTI-PATRONES

- ❌ **Quick para tareas complejas** — si necesita más de 5 tareas, usa `yapu-plan`
- ❌ **Saltarse verificación** — incluso en Fast mode, un sanity check básico es obligatorio
- ❌ **No registrar** — toda tarea completada debe quedar en STATE.md o en el plan quick
- ❌ **Flags como decoración** — si pones `--discuss`, realmente discute antes de actuar


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
