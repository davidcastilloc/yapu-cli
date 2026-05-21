# YAPU CODE REVIEW (REVISIÓN DE CÓDIGO)

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

Actúa en [MODO REVISIÓN DE CÓDIGO].

Tu objetivo es revisar archivos fuente cambiados durante una fase por bugs, issues de seguridad y problemas de calidad. Después, opcionalmente aplica auto-fixes iterativos (capped a 3 rondas). Output: `REVIEW.md` + opcional `REVIEW-FIX.md`.

> Carga profunda: `@yapu-ref-common-bugs.md`, `@yapu-ref-verification-patterns.md`

---

## PARTE 1: REVISIÓN

### PASO 1: INICIALIZAR

1. Identifica la fase a revisar (del argumento)
2. Lee `STATE.md` → fase activa, estado
3. Valida que la fase exista en `ROADMAP.md` → si no: error y salir

**Flags opcionales:**
| Flag | Efecto |
|------|--------|
| `--files=a.ts,b.ts` | Override de scope de archivos (Tier 1) |
| `--depth=quick\|standard\|deep` | Profundidad de revisión |

### PASO 2: RESOLVER SCOPE DE ARCHIVOS

Tres tiers con precedencia explícita:

#### Tier 1 — `--files` override (máxima prioridad)

Si `--files` está presente:
- Separar por coma en lista de archivos
- **Validar** cada path está dentro del repo (prevenir path traversal)
- Verificar existencia de cada archivo
- Saltear Tiers 2 y 3

#### Tier 2 — Extracción de SUMMARY.md (primario)

Si `--files` NO está presente:
- Buscar `*-SUMMARY.md` en el directorio de la fase
- Extraer paths de `key_files.created` y `key_files.modified`
- Si no se extraen archivos → caer a Tier 3

#### Tier 3 — Git diff fallback

Si no hay SUMMARY.md o no contiene paths:
- Determinar commit base de la fase via `git log --grep`
- `git diff --name-only {base}..HEAD`
- **Exclusiones automáticas:** `.planning/`, `ROADMAP.md`, `STATE.md`, `*-SUMMARY.md`, `*-PLAN.md`, lock files
- Si no hay base confiable → **fail closed** (no usar `HEAD~N` arbitrario) → pedir `--files`

#### Post-procesamiento (todos los tiers)

Filtrar archivos resultantes:
- Remover paths de `.planning/` y artefactos
- Remover archivos inexistentes (ya borrados)
- Deduplicar
- Si quedan 0 archivos → "No hay archivos para revisar" → salir

### PASO 3: EJECUTAR REVISIÓN

Para cada archivo en scope:

| Categoría | Qué buscar |
|-----------|------------|
| **Bugs** | Null refs, race conditions, off-by-one, errores de lógica |
| **Seguridad** | Injection, auth bypass, secrets expuestos, path traversal |
| **Calidad** | Code smells, complejidad excesiva, duplicación, naming |
| **Correctitud** | ¿El código hace lo que dice que hace? ¿Edge cases? |

**Severidad de findings:**

| Nivel | Descripción | Auto-fix? |
|-------|-------------|-----------|
| 🔴 **Critical** | Bug o vulnerability activo | Sí |
| 🟡 **Warning** | Problema potencial, debería arreglarse | Sí |
| 🟢 **Info** | Mejora sugerida, no urgente | No (por default) |

### PASO 4: GENERAR REVIEW.md

Escribir `{phase_dir}/{padded_phase}-REVIEW.md`:

```markdown
# Code Review: Fase {N} — {Nombre}

## Summary
- Archivos revisados: {count}
- Findings: {critical} critical, {warnings} warnings, {info} info
- Scope: {tier usado}

## Findings

### 🔴 Critical

#### [CR-001] {Título del finding}
- **Archivo:** `{path}:{line}`
- **Descripción:** {qué está mal}
- **Impacto:** {qué puede pasar}
- **Fix sugerido:** {cómo arreglarlo}

### 🟡 Warning
...

### 🟢 Info
...

## Files Reviewed
- `{path}` — {resumen de estado}
```

---

## PARTE 2: AUTO-FIX

### PASO 5: DETERMINAR QUÉ ARREGLAR

**Scope de fixes:**
- Default: solo 🔴 Critical + 🟡 Warning
- Con `--all`: también 🟢 Info

**Prerequisito:** REVIEW.md debe existir → si no: "Corre `yapu-code-review` primero."

### PASO 6: APLICAR FIXES (Máx 3 rondas)

```
Ronda 1: Aplicar fixes → Re-review archivos afectados
Ronda 2: Arreglar regresiones → Re-review
Ronda 3: Fixes finales → Si aún hay issues: documentar como residuales
```

**En cada ronda:**
1. Aplicar el fix sugerido en REVIEW.md
2. Verificar que el fix no introduce regresiones
3. Re-revisar solo los archivos modificados en esta ronda
4. Si aparecen nuevos findings → siguiente ronda
5. Si no hay nuevos findings → terminado

**CAP ESTRICTO: 3 rondas.** Después de 3 rondas, cualquier issue restante se documenta como residual en REVIEW-FIX.md — no se intenta arreglar más.

### PASO 7: GENERAR REVIEW-FIX.md

Escribir `{phase_dir}/{padded_phase}-REVIEW-FIX.md`:

```markdown
# Code Review Fix: Fase {N}

## Rondas ejecutadas: {N}/3

## Fixes Aplicados
1. [CR-001] {título} — ✅ Fixed
   - Archivo: `{path}`
   - Cambio: {descripción del fix}

2. [CR-003] {título} — ✅ Fixed
   ...

## Residual (no arreglado)
- [CR-002] {título} — ⚠️ Requiere decisión de diseño
  Razón: {por qué no se pudo auto-fix}

## Regresiones Detectadas y Resueltas
- Ronda 2: Fix de CR-001 causó {issue} → resuelto en ronda 2
```

## ANTI-PATRONES

| Anti-Patrón | Prevención |
|-------------|------------|
| Revisar artefactos de planning | Excluir `.planning/`, `STATE.md`, etc. |
| Usar HEAD~N arbitrario | Fail closed — pedir `--files` si no hay base |
| Fix loops infinitos | Cap estricto de 3 rondas |
| Ignorar regresiones | Re-review después de cada fix |
| Revisar sin scope | Siempre resolver scope antes de empezar |

## OUTPUT

- **Artefactos**: `{padded_phase}-REVIEW.md` + `{padded_phase}-REVIEW-FIX.md` (si auto-fix)
- **Siguiente paso**: `yapu-verify` si hay fixes, o continuar con la fase


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
