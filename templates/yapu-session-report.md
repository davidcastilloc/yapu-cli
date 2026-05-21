# YAPU REPORTE DE SESIÓN

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

Actúa en [MODO REPORTE DE SESIÓN].

Tu objetivo es generar un resumen post-sesión capturando trabajo realizado, outcomes logrados y uso estimado de recursos. Escribe el reporte en `.planning/reports/` para revisión humana.

---

## PASO 1: RECOLECTAR DATOS DE SESIÓN

### Git Activity
```bash
# Commits recientes (últimas 24h o desde último reporte)
git log --oneline --since="24 hours ago" --no-merges 2>/dev/null || echo "Sin commits recientes"

# Estadísticas de archivos cambiados
git diff --stat HEAD~10 HEAD 2>/dev/null | tail -1 || echo "Sin diff disponible"

# Timestamps para estimar duración
git log --format="%ai" --since="24 hours ago" 2>/dev/null | head -1  # primer commit
git log --format="%ai" -1 2>/dev/null                                 # último commit
```

### Estado del Proyecto
```bash
cat STATE.md 2>/dev/null        # Fase actual, progreso, blockers, decisiones
cat ROADMAP.md 2>/dev/null      # Milestone y goals
```

### Reportes Previos
```bash
ls -la .planning/reports/SESSION_REPORT*.md 2>/dev/null || echo "Sin reportes previos"
```

---

## PASO 2: ESTIMAR USO (Heurísticas)

> **Nota:** Estimaciones basadas en señales observables. Counts exactos de tokens requieren instrumentación a nivel de API.

| Señal Observable | Estimación |
|-----------------|------------|
| Cada commit | ≈ 1 ciclo plan (research + plan + execute + verify) |
| Cada archivo PLAN.md | ≈ 2,000-5,000 tokens de contexto |
| Cada SUMMARY.md | ≈ 1,000-2,000 tokens generados |
| Subagents usados | Multiplicador ~1.5x por tipo |

---

## PASO 3: GENERAR REPORTE

```bash
mkdir -p .planning/reports
```

Determinar filename:
- Si no existen reportes previos → `SESSION_REPORT.md`
- Si existen → `YYYYMMDD-session-report.md` (fecha de hoy)

Escribir con este formato:

```markdown
# Yapu Session Report

**Generado:** {timestamp ISO}
**Proyecto:** {nombre del proyecto desde PROJECT.md o directorio}
**Milestone:** {N} — {nombre del milestone desde ROADMAP.md}

---

## Resumen de Sesión

**Duración estimada:** {primer a último commit, o "Sesión única"}
**Progreso de fase:** {desde STATE.md}
**Planes ejecutados:** {count de summaries escritos}
**Commits realizados:** {count desde git log}

## Trabajo Realizado

### Fases Tocadas
{Lista de fases trabajadas con breve descripción}

### Outcomes Clave
{Bullet list: archivos creados, features implementados, bugs arreglados}

### Decisiones Tomadas
{Desde la tabla de decisiones en STATE.md, si hubo nuevas}

## Archivos Cambiados

{Resumen de git diff stat: archivos modificados, creados, eliminados}

## Blockers y Pendientes

{Blockers activos desde STATE.md}
{TODOs creados durante la sesión}

## Uso Estimado de Recursos

| Métrica | Estimado |
|---------|----------|
| Commits | {N} |
| Archivos cambiados | {N} |
| Planes ejecutados | {N} |
| Subagents spawned | {estimado} |

> **Nota:** Las estimaciones de tokens y costo requieren instrumentación a nivel de API.
> Estas métricas reflejan actividad observable de la sesión únicamente.

---

*Generado por Yapu — session-report*
```

---

## PASO 4: PRESENTAR RESULTADO

```
## Reporte de Sesión Generado

📄 `.planning/reports/{filename}.md`

### Highlights
- **Commits:** {N}
- **Archivos cambiados:** {N}
- **Progreso de fase:** {X}%
- **Planes ejecutados:** {N}
```

Si es el primer reporte:
```
💡 Ejecuta yapu-session-report al final de cada sesión para construir un historial de actividad del proyecto.
```

---

## ANTI-PATTERNS

- ❌ Inventar métricas de tokens — solo reportar lo observable
- ❌ Sobrescribir reportes previos — usar filenames con fecha
- ❌ Omitir blockers — son la información más valiosa para la siguiente sesión
- ❌ Reportar sin leer STATE.md — es la fuente de verdad del progreso


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
