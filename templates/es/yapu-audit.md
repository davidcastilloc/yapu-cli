# YAPU AUDITORÍA

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

Actúa en [MODO AUDITORÍA].

Tu objetivo es ejecutar auditorías del proyecto con tres sub-modos: (1) audit-fix para clasificar y reparar hallazgos automáticamente, (2) audit-milestone para verificar definition-of-done con trazabilidad REQ-ID, (3) audit-uat para detectar ítems UAT pendientes con detección de tests obsoletos.

> Carga profunda: `@yapu-ref-verification-patterns.md`, `@yapu-ref-source-audit.md`

---

## SUB-MODO 1: AUDIT-FIX — Pipeline Clasificar → Reparar

Pipeline autónomo: auditar → clasificar → fix → test → commit atómico.

### Paso 1: Recolectar Hallazgos

Escanear artefactos de verificación y UAT del proyecto:
```bash
find .planning/phases -name "*-UAT.md" -o -name "*-VERIFICATION.md" 2>/dev/null
```

Parsear cada hallazgo en un registro estructurado:
- **ID** — secuencial (F-01, F-02, ...)
- **description** — resumen conciso
- **severity** — high / medium / low
- **file_refs** — paths específicos referenciados

### Paso 2: Clasificar (errar hacia manual-only)

| Clasificación | Señales |
|---------------|---------|
| **auto-fixable** | Referencia archivo+línea específica, test faltante, export/import incorrecto, cambio single-file con comportamiento obvio |
| **manual-only** | Palabras como "considerar"/"evaluar"/"diseñar", cambios de arquitectura/API, scope ambiguo, múltiples enfoques válidos, concerns cross-cutting |
| **skip** | Severidad bajo el umbral configurado |

> **⚠️ REGLA DE ORO: Ante la duda, clasificar como manual-only.** Falso negativo (no arreglar algo arreglable) es barato. Falso positivo (arreglar algo que requiere diseño) es destructivo.

### Paso 3: Presentar Tabla de Clasificación

```
## Audit-Fix Classification

| # | Hallazgo | Severidad | Clasificación | Razón |
|---|----------|-----------|---------------|-------|
| F-01 | Missing export en index.ts | high | auto-fixable | Archivo específico, fix claro |
| F-02 | Sin error handling en payment | high | manual-only | Requiere decisiones de diseño |
```

Si es modo `--dry-run` → **STOP aquí**. La tabla es el output final.

### Paso 4: Fix Loop (máx 5 hallazgos por defecto)

Para cada auto-fixable, ordenado por severidad desc:

1. **Implementar** el cambio mínimo para resolver el hallazgo específico — sin refactoring colateral
2. **Ejecutar tests** relacionados inmediatamente
3. **Commit atómico** con ID del hallazgo: `fix: F-{ID} — {descripción}`
4. Si test falla → revertir y reclasificar como manual-only

### Paso 5: Resumen

```
## Resultados Audit-Fix

✅ Reparados: {N} de {total}
⚠️ Manual-only: {N} (requieren intervención humana)
❌ Revertidos: {N} (fix falló tests)
```

---

## SUB-MODO 2: AUDIT-MILESTONE — Verificación Definition-of-Done

Verifica que un milestone cumple su definición de done agregando verificaciones de fase, chequeando integración cross-phase y evaluando cobertura de requirements.

### Paso 1: Determinar Scope del Milestone

1. Lee `ROADMAP.md` para extraer: versión, nombre, fases, definition-of-done
2. Identifica todos los directorios de fase en scope
3. Extrae REQ-IDs mapeados a este milestone de `REQUIREMENTS.md`

### Paso 2: Leer Verificaciones de Fase

Para cada directorio de fase, leer `*-VERIFICATION.md`:

| Campo | Extraer |
|-------|---------|
| Status | passed / gaps_found |
| Gaps críticos | Blockers |
| Gaps no-críticos | Tech debt, deferred |
| Anti-patterns | TODOs, stubs, placeholders |
| Cobertura | REQ-IDs satisfechos/bloqueados |

> **Fase sin VERIFICATION.md = fase no verificada = BLOCKER.**

### Paso 3: Cross-Reference de 3 Fuentes (REQ-ID Traceability)

Para cada REQ-ID del milestone, cruzar tres fuentes independientes:

| Fuente | Propósito |
|--------|-----------|
| **REQUIREMENTS.md** | Definición original |
| **VERIFICATION.md** | Evidencia de cumplimiento |
| **Codebase real** | Grep/Read para confirmar implementación |

Un REQ-ID solo está **COVERED** si aparece en las 3 fuentes. Si falta en cualquiera → **GAP**.

### Paso 4: Reporte de Milestone

```markdown
## Milestone Audit: v{version} — {nombre}

| REQ-ID | Descripción | REQS.md | VERIF.md | Código | Status |
|--------|-------------|---------|----------|--------|--------|
| REQ-01 | Auth flow   | ✅      | ✅       | ✅     | COVERED |
| REQ-02 | Rate limit  | ✅      | ❌       | ✅     | GAP    |

**Veredicto:** {READY / NOT READY — con gaps listados}
```

---

## SUB-MODO 3: AUDIT-UAT — Ítems Pendientes Cross-Phase

Auditoría cross-phase de archivos UAT y verificación. Detecta ítems pendientes y tests obsoletos.

### Paso 1: Escanear Artefactos

```bash
find .planning/phases -name "*-UAT.md" -o -name "*-VERIFICATION.md" 2>/dev/null
```

Si no hay ítems pendientes → `✅ All Clear — sin ítems UAT pendientes.` → STOP.

### Paso 2: Categorizar por Accionabilidad

**Testeable AHORA** (sin dependencias externas):
- `pending` — tests nunca ejecutados
- `human_uat` — verificación humana pendiente
- `skipped_unresolved` — skipped sin razón clara de bloqueo

**Necesita Prerequisitos:**
- `server_blocked` — necesita servidor externo
- `device_needed` — dispositivo físico
- `build_needed` — build de release/preview
- `third_party` — servicio externo

### Paso 3: Detección de Tests Obsoletos

Para cada ítem "Testeable AHORA", verificar contra el codebase real:

- **stale** — el componente/función referenciado ya no existe
- **needs_update** — el código fue significativamente reescrito
- **active** — el test sigue siendo relevante

```bash
# Verificar existencia de archivos/funciones referenciadas
grep -r "{function_name}" src/ --include="*.ts" --include="*.tsx" -l
```

### Paso 4: Reporte y Plan de Acción

```
## UAT Audit Report

**{total} ítems pendientes en {N} archivos de {M} fases**

### Testeable Ahora ({N})
| # | Fase | Test | Descripción | Status |
|---|------|------|-------------|--------|

### Needs Prerequisites ({N})
| # | Fase | Test | Bloqueado Por | Descripción |

### Stale — cerrar ({N})
| # | Fase | Test | Por qué Obsoleto |

## Acciones Recomendadas
1. Cerrar ítems stale
2. Ejecutar tests activos (plan UAT abajo)
3. Cuando prerequisitos estén listos, re-testear ítems bloqueados
```

---

## ANTI-PATTERNS

- ❌ Clasificar como auto-fixable algo que requiere decisiones de diseño
- ❌ Arreglar más de 5 hallazgos sin re-evaluar
- ❌ Marcar un REQ-ID como COVERED sin verificar en las 3 fuentes
- ❌ Ignorar tests stale — contaminan las métricas de cobertura
- ❌ Correr audit-fix en modo no-dry-run sin haber revisado la clasificación primero


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
