# YAPU AUTONOMOUS (EJECUCIÓN AUTÓNOMA)

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

Actúa en [MODO AUTÓNOMO].

Tu objetivo es ejecutar fases del milestone de forma autónoma: discuss → plan → execute → verify por fase. Re-lees `ROADMAP.md` después de cada fase para detectar fases insertadas dinámicamente. Pausas solo para decisiones explícitas del usuario.

> Carga profunda: `@yapu-ref-gates.md`, `@yapu-ref-anti-patterns.md`, `@yapu-ref-continuation-format.md`

## INVARIANTE: UN SOLO PASE POR INVOCACIÓN

Cada invocación autónoma ejecuta **una fase completa** (discuss→plan→execute→verify). Al terminar, reporta resultados y sugiere continuar — NO encadena automáticamente la siguiente fase sin confirmación del usuario.

## PASO 1: INICIALIZAR

### Flags
| Flag | Efecto |
|------|--------|
| `--from N` | Empezar desde fase N |
| `--to N` | Detenerse después de fase N |
| `--only N` | Ejecutar solo fase N |
| `--interactive` | Discuss inline con preguntas, plan+execute en background |

### Precondiciones
1. Lee `ROADMAP.md` → si no existe: error → "No hay ROADMAP.md. Corre `yapu-map` primero."
2. Lee `STATE.md` → si no existe: error → "No hay STATE.md. Inicializa el proyecto primero."
3. Extrae: `milestone_version`, `milestone_name`, `phase_count`, `completed_phases`

### Banner
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTÓNOMO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Milestone: {version} — {name}
 Fases: {total} total, {completed} completas
```

## PASO 2: DESCUBRIR FASES

1. Analiza `ROADMAP.md` → obtén array de fases
2. Filtra a fases incompletas (`status !== "complete"`)
3. Aplica filtros `--from`, `--to`, `--only` si están presentes
4. Ordena por número ascendente
5. Si no quedan fases: "Todas las fases completas. Nada que hacer." → salir

### Mostrar plan de fases
```
| # | Fase | Estado |
|---|------|--------|
| 5 | Skill Scaffolding | En Progreso |
| 6 | Smart Discuss | No Iniciada |
```

## PASO 3: SAFETY GATES (antes de cada fase)

Ejecuta estas comprobaciones antes de proceder. Salir en el primer bloqueo a menos que se pase `--force`.

| Gate | Condición | Acción |
|------|-----------|--------|
| **Checkpoint no resuelto** | `.continue-here.md` existe | ⛔ Leer, resolver, borrar antes de continuar |
| **Estado de error** | `STATE.md` muestra `status: error` | ⛔ Resolver error primero |
| **Verificación fallida** | `VERIFICATION.md` tiene `FAIL` sin override | ⛔ Resolver failures antes de avanzar |

### Guard de ejecuciones consecutivas
Si el agente ha ejecutado 3+ fases sin input del usuario → **PAUSA FORZADA**:
```
"Se han ejecutado {N} fases consecutivas sin input.
Revisemos el estado antes de continuar."
```

## PASO 4: EJECUTAR FASE

Para la fase actual, ejecuta secuencialmente:

### Banner de progreso
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTÓNOMO ▸ Fase {N}/{T}: {Nombre} [████░░░░] {P}%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4a. Discuss
- Si `CONTEXT.md` existe → skip ("Contexto existe — saltando discuss")
- Si no → ejecuta `yapu-discuss --auto` para generar CONTEXT.md sin preguntas interactivas
- En modo `--interactive`: ejecuta discuss con preguntas al usuario

### 4b. Plan
- Si planes existen → skip ("Planes existen — saltando planificación")
- Si no → ejecuta `yapu-plan` usando CONTEXT.md como input

### 4c. Execute
- Para cada plan sin SUMMARY.md correspondiente:
  - Ejecuta `yapu-execute` contra ese plan
  - Verifica que SUMMARY.md se generó
  - Si falla → marca como blocker, pasar al siguiente plan o parar

### 4d. Verify
- Ejecuta `yapu-verify` contra la fase
- Si hay failures críticos → pausa y reporta al usuario
- Si pasa → marca fase como completa

## PASO 5: TRANSICIÓN DE FASE

1. **Re-leer `ROADMAP.md`** — detectar fases insertadas dinámicamente
2. Actualizar `STATE.md` con progreso
3. Si `--only N` → "Fase {N} completa" → salir
4. Si quedan fases y no hay bloqueos → reportar y sugerir continuar

### Reporte de transición
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YAPU ► AUTÓNOMO ▸ Fase {N} COMPLETA ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Completada: {nombre de fase}
 Siguiente: Fase {N+1} — {nombre}
 Progreso: [████████░░] {P}%

 ¿Continuar con la siguiente fase?
```

## ANTI-PATRONES

| Anti-Patrón | Prevención |
|-------------|------------|
| Encadenar sin revisar | Re-leer ROADMAP después de cada fase |
| Ignorar failures de verify | Pausa obligatoria en failures críticos |
| Ejecutar sin contexto | CONTEXT.md es prerequisito para plan |
| Correr infinitamente | Cap de fases consecutivas sin input |
| Asumir completitud | Verificar SUMMARY.md existe para cada plan |

## OUTPUT

- **Artefactos por fase**: CONTEXT.md, PLAN.md, SUMMARY.md, VERIFICATION.md
- **Estado**: `STATE.md` actualizado después de cada fase
- **Siguiente paso**: Siguiente fase o reporte final del milestone


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
