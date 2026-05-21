# YAPU EXTRACCIÓN DE CONOCIMIENTO

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

Actúa en [ MODO EXTRACCIÓN DE CONOCIMIENTO ].

Tu objetivo es extraer decisiones, lecciones, patrones y sorpresas de los artefactos de fases completadas. Captura conocimiento institucional que se perdería entre fases. Opcionalmente, promueve items recurrentes a documentos permanentes del proyecto.

> Carga profunda: `@yapu-thinking-planning.md`, `@yapu-ref-artifact-types.md`

## PRINCIPIO: CAPTURAR ANTES DE OLVIDAR

El conocimiento más valioso se genera durante la ejecución — decisiones implícitas, lecciones de errores, patrones descubiertos. Si no se extrae explícitamente, se pierde cuando el contexto expira.

## FASE 1: RECOPILAR ARTEFACTOS

### Artefactos requeridos
- `{phase_dir}/*-PLAN.md` — planes de la fase
- `{phase_dir}/*-SUMMARY.md` — resúmenes de ejecución

Si PLAN.md o SUMMARY.md no existen: "Artefactos requeridos faltantes. PLAN.md y SUMMARY.md son necesarios para extracción."

### Artefactos opcionales (leer si existen)
- `{phase_dir}/*-VERIFICATION.md` — resultados de verificación
- `{phase_dir}/*-UAT.md` — resultados de user acceptance testing
- `.planning/STATE.md` — estado del proyecto con decisiones y blockers

Registrar artefactos faltantes en metadata del output.

## FASE 2: EXTRAER EN 4 CATEGORÍAS

### 1. Decisiones
Decisiones técnicas y arquitectónicas tomadas durante la fase.

**Buscar en:**
- Decisiones explícitas en PLAN.md o SUMMARY.md
- Elecciones de tecnología y su rationale
- Trade-offs evaluados
- Decisiones registradas en STATE.md

**Formato por item:**
```markdown
### {Nombre de la decisión}
- **Qué:** {qué se decidió}
- **Por qué:** {rationale}
- **Source:** {artefacto origen, e.g. "03-01-PLAN.md"}
```

### 2. Lecciones
Cosas aprendidas durante ejecución que no se sabían antes.

**Buscar en:**
- Complejidad inesperada en SUMMARY.md
- Issues descubiertos en VERIFICATION.md
- Approaches fallidos documentados
- Feedback de UAT que reveló gaps

**Formato por item:**
```markdown
### {Nombre de la lección}
- **Qué:** {qué se aprendió}
- **Contexto:** {circunstancias}
- **Source:** {artefacto origen}
```

### 3. Patrones
Patterns reutilizables, approaches o técnicas descubiertas.

**Buscar en:**
- Patterns de implementación exitosos en SUMMARY.md
- Patterns de testing en VERIFICATION.md / UAT.md
- Patterns de workflow que funcionaron bien
- Patterns de organización de código

**Formato por item:**
```markdown
### {Nombre del pattern}
- **Pattern:** {descripción}
- **Cuándo usar:** {condiciones de aplicación}
- **Source:** {artefacto origen}
```

### 4. Sorpresas
Hallazgos inesperados, comportamientos o resultados.

**Buscar en:**
- Cosas que tomaron más o menos tiempo del estimado
- Dependencias o interacciones inesperadas
- Edge cases no anticipados en planificación
- Performance que difirió de expectativas

**Formato por item:**
```markdown
### {Nombre de la sorpresa}
- **Qué:** {qué fue sorprendente}
- **Impacto:** {efecto que tuvo}
- **Source:** {artefacto origen}
```

## FASE 3: GENERAR LEARNINGS.md

```markdown
---
phase: {número de fase}
phase_name: "{nombre}"
date: {fecha}
artifacts_analyzed:
  - {lista de artefactos leídos}
missing_artifacts:
  - {artefactos opcionales no encontrados}
---
# Learnings: Phase {N} — {nombre}

## Decisions
{items extraídos}

## Lessons
{items extraídos}

## Patterns
{items extraídos}

## Surprises
{items extraídos}
```

Guardar en: `{phase_dir}/{padded}-LEARNINGS.md`

## FASE 4: GRADUACIÓN CROSS-PHASE (Opcional)

Cuando existen LEARNINGS.md de múltiples fases (≥3), buscar items recurrentes para promover a documentos permanentes.

### Clustering por similaridad léxica

1. Recopilar LEARNINGS.md de las últimas N fases (default: 5)
2. Tokenizar: lowercase, strip puntuación, remover stop words
3. Similaridad Jaccard: `|A ∩ B| / |A ∪ B|` ≥ 0.25 = mismo cluster
4. Filtrar: solo clusters con ≥3 fases distintas como fuente

### Destinos de promoción

| Categoría | Destino |
|-----------|---------|
| **Decisions** recurrentes | `PROJECT.md` → `## Validated Decisions` |
| **Patterns** recurrentes | `PATTERNS.md` → sección apropiada |
| **Lessons** recurrentes | `PROJECT.md` → `## Invariants` |
| **Surprises** recurrentes | ⚠️ Flag para revisión humana |
| **UNIVERSAL Lessons** | `~/.yapu/global-patterns.md` (Patrones que aplican a TODOS los proyectos futuros) |

### Gate de confirmación

**Nunca promover sin aprobación explícita:**

```
📚 Graduación — items recurrentes detectados:

  1. [PATTERN] "Error boundary en cada componente async"
     Aparece en fases 2, 4, 5 — Sugerir: PATTERNS.md
  
  2. [DECISION] "Validación en boundary, no en modelo"
     Aparece en fases 1, 3, 5 — Sugerir: PROJECT.md

  3. [UNIVERSAL] "Nunca guardar secretos en .env sin agregarlos a .gitignore"
     Aparece en fases 1 y 4 — Sugerir: ~/.yapu/global-patterns.md

¿Promover? [Todos] / [Seleccionar] / [Diferir] / [Descartar]
```

Items descartados o diferidos se registran para no re-surfacear:
```yaml
graduation_backlog:
  - cluster_id: "{hash}"
    status: "dismissed|deferred"
    deferred_until: "phase-{N}"
```

## ANTI-PATRONES

- ❌ **Extraer sin fuente** — todo item DEBE tener atribución a un artefacto específico
- ❌ **Duplicar lo obvio** — extraer solo insights no triviales
- ❌ **Promover sin validar** — la graduación requiere confirmación humana
- ❌ **Ignorar sorpresas recurrentes** — son síntomas de problemas estructurales


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
