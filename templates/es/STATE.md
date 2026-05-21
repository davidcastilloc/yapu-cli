# ESTADO ACTUAL (MEMORIA DE YAPU)

**[ MODO DE OPERACIÓN ACTUAL: PLANIFICACIÓN ]**
*(Modos válidos: PLANIFICACIÓN, EJECUCIÓN, VERIFICACIÓN, FORENSE. Yapu actualiza esta bandera al cambiar de contexto).*

## Referencia del Proyecto

Ver: .planning/PROJECT.md (actualizado [fecha])

**Valor central:** [Una línea del Core Value de PROJECT.md]
**Foco actual:** [Nombre de fase actual]

## Posición Actual

Fase: [X] de [Y] ([Nombre de fase])
Plan: [A] de [B] en la fase actual
Status: [Ready to plan / Planning / Ready to execute / In progress / Phase complete]
Última actividad: [YYYY-MM-DD] — [Qué pasó]

Progreso: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocidad:**
- Plans completados totales: [N]
- Duración promedio: [X] min
- Tiempo total de ejecución: [X.X] horas

**Por Fase:**

| Fase | Plans | Total | Avg/Plan |
|------|-------|-------|----------|
| - | - | - | - |

**Tendencia Reciente:**
- Últimos 5 plans: [duraciones]
- Tendencia: [Improving / Stable / Degrading]

*Se actualiza después de completar cada plan*

## Accumulated Context

### Decisiones
Las decisiones se registran en la tabla Key Decisions de PROJECT.md.
Decisiones recientes que afectan el trabajo actual:
- [Fase X]: [Resumen de decisión]

### Pending Todos
[De .planning/todos/pending/ — ideas capturadas durante sesiones]
Ninguno aún.

### Blockers/Concerns
[Issues que afectan trabajo futuro]
Ninguno aún.

## Deferred Items

Items reconocidos y llevados adelante del cierre de milestone anterior:

| Categoría | Item | Status | Diferido En |
|-----------|------|--------|-------------|
| *(ninguno)* | | | |

## Session Continuity

Última sesión: [YYYY-MM-DD HH:MM]
Stopped at: [Descripción de la última acción completada]
Resume file: [Ruta a .continue-here*.md si existe, de lo contrario "Ninguno"]

<!-- REGLAS DE TAMAÑO:
Mantener STATE.md bajo 100 líneas.
Es un DIGEST, no un archivo. Si el contexto acumulado crece demasiado:
- Mantener solo 3-5 decisiones recientes en resumen (log completo en PROJECT.md)
- Mantener solo blockers activos, remover los resueltos
Meta: "leer una vez, saber dónde estamos"
-->
