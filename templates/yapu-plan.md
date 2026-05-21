# YAPU PLANNING (PLANIFICACIÓN AVANZADA)

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

Actúa en [MODO PLANIFICACIÓN AVANZADA].

Tu objetivo es crear un plan de ejecución atómico, verificable y libre de ambigüedad en `STATE.md`. El plan pasa por: Auditoría de Fuentes → Descomposición MECE → Revisión → Gate de Calidad.

> Carga profunda: `@yapu-ref-source-audit.md`, `@yapu-ref-planner-anti-patterns.md`, `@yapu-thinking-planning.md`

## INVARIANTE: NO EJECUTAR CÓDIGO

Este modo **planifica solamente**. No escribas, modifiques ni ejecutes código de producción. Si detectas impulso de implementar, DETENTE.

## FASE 1: AUDITORÍA DE FUENTES (Source Audit)

Antes de planificar, verifica que tienes contexto suficiente:

1. **Lee `PROJECT.md`** — ¿Existe? ¿Está actualizado? ¿Refleja el estado real?
2. **Lee `ROADMAP.md`** — Identifica la fase activa y su objetivo
3. **Revisa el código fuente** de entry points actuales
4. **Verifica coherencia** — ¿`PROJECT.md` contradice lo que ves en el código?

### Gate de Fuentes
| Fuente | Estado | Acción si falta |
|--------|--------|-----------------|
| `PROJECT.md` | ¿Existe y es preciso? | Si no → corre `yapu-map` primero |
| `ROADMAP.md` | ¿Tiene fases claras? | Si no → corre `yapu-grill-me` primero |
| Código fuente | ¿Puedes leerlo? | Si no → verifica permisos/paths |

**Si falta contexto crítico:** Hazme 2-3 preguntas directas sobre lógica de negocio no documentada, variables de entorno o dependencias antes de continuar. Espera respuestas.

## FASE 2: DESCOMPOSICIÓN MECE

Descompón la fase activa del `ROADMAP.md` en tareas atómicas usando principios MECE (Mutuamente Exclusivas, Colectivamente Exhaustivas):

### Reglas de descomposición
- **Cada tarea tiene un único output verificable** (archivo creado, test pasando, endpoint respondiendo)
- **Sin solapamiento** — dos tareas no deben tocar el mismo archivo para el mismo propósito
- **Exhaustividad** — la suma de tareas debe cubrir 100% del objetivo de la fase
- **Tamaño atómico** — cada tarea es completable en una sesión de ejecución (15-45 min de trabajo agente)
- **Orden de dependencia** — si tarea B necesita output de tarea A, A va primero

### Formato de tarea en STATE.md

```markdown
## Fase Activa: [nombre de la fase]
Objetivo: [objetivo medible]

### Tareas
- [ ] **T1: [nombre descriptivo]**
  - Output: [qué produce concretamente]
  - Archivos: [paths que toca]
  - Verificación: [comando o check para confirmar completitud]
  - Dependencia: [ninguna | T#]

- [ ] **T2: [nombre descriptivo]**
  ...
```

## FASE 3: REVISIÓN (Revision Loop)

Antes de entregar el plan, auto-revisa contra estos checks (máx 3 iteraciones):

### Checklist de calidad del plan
- [ ] ¿Cada tarea tiene verificación concreta? (no "revisar que funcione")
- [ ] ¿Las dependencias entre tareas son correctas y no circulares?
- [ ] ¿Hay tareas que son realmente 2+ tareas disfrazadas?
- [ ] ¿El plan cubre el objetivo completo de la fase?
- [ ] ¿Alguna tarea toca un archivo que otra tarea también modifica? → resolver conflicto
- [ ] ¿Las tareas son suficientemente pequeñas para ejecución atómica?

### Si encuentra defectos
1. Documenta el defecto encontrado
2. Corrige el plan
3. Re-evalúa (máx 3 ciclos)
4. Si después de 3 ciclos aún hay defectos → escálalos como notas en el plan

## FASE 4: GATE DE CALIDAD (Plan Checker)

Validación final antes de marcar el plan como listo:

| Check | Criterio | Falla → |
|-------|----------|---------|
| Completitud | Todas las tareas cubren el objetivo | Agregar tareas faltantes |
| Atomicidad | Cada tarea ≤ 1 sesión de trabajo | Dividir tareas grandes |
| Verificabilidad | Cada tarea tiene check ejecutable | Agregar comandos de verificación |
| Coherencia | No hay contradicciones internas | Resolver conflictos |
| Closed-phase | ¿La fase ya fue completada? | ABORT — no replanificar fases cerradas |

## OUTPUT

1. Escribe el plan en `STATE.md` con el formato de tareas
2. Actualiza el `[ MODO DE OPERACIÓN ACTUAL ]` a "PLANIFICADO"
3. **DETENTE. No ejecutes código.**

## ANTIPATRONES

- ❌ **Tareas vagas**: "configurar el backend" → ¿qué archivos? ¿qué output?
- ❌ **Verificación ausente**: "crear componente" sin test o check
- ❌ **Mega-tareas**: una tarea que toca 10+ archivos
- ❌ **Planificar sin leer**: hacer plan sin auditar fuentes primero
- ❌ **Scope creep**: agregar features que no están en la fase del ROADMAP


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
