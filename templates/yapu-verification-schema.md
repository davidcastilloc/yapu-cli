# Schema: Reporte de Verificación — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-VERIFICATION.md`
> Verificación goal-backward de resultados de fase.

## Plantilla

```markdown
---
phase: XX-name
verified: YYYY-MM-DDTHH:MM:SSZ
status: passed | gaps_found | human_needed
score: N/M must-haves verified
---

# Fase {X}: {Nombre} — Reporte de Verificación

**Goal de Fase:** {goal del ROADMAP.md}
**Verificado:** {timestamp}
**Status:** {passed | gaps_found | human_needed}

## Logro del Goal

### Observable Truths

| # | Truth | Status | Evidencia |
|---|-------|--------|-----------|
| 1 | {truth de must_haves} | ✓ VERIFIED | {qué lo confirmó} |
| 2 | {truth de must_haves} | ✗ FAILED | {qué está mal} |
| 3 | {truth de must_haves} | ? UNCERTAIN | {por qué no se puede verificar} |

**Score:** {N}/{M} truths verificados

### Required Artifacts

| Artefacto | Esperado | Status | Detalles |
|-----------|----------|--------|----------|
| `src/components/X.tsx` | Componente Y | ✓ EXISTS + SUBSTANTIVE | Exporta X, renderiza Y, sin stubs |
| `src/app/api/x/route.ts` | CRUD | ✗ STUB | Archivo existe pero POST retorna placeholder |

**Artefactos:** {N}/{M} verificados

### Key Link Verification

| From | To | Via | Status | Detalles |
|------|----|-----|--------|----------|
| Component.tsx | /api/endpoint | fetch en useEffect | ✓ WIRED | Línea 23: `fetch(...)` con manejo de respuesta |
| Input.tsx | /api/endpoint POST | onSubmit | ✗ NOT WIRED | onSubmit solo llama console.log |

**Wiring:** {N}/{M} conexiones verificadas

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| {REQ-01}: {descripción} | ✓ SATISFIED | - |
| {REQ-02}: {descripción} | ✗ BLOCKED | API route es stub |
| {REQ-03}: {descripción} | ? NEEDS HUMAN | No verificable programáticamente |

**Coverage:** {N}/{M} requirements satisfechos

## Anti-Patterns Encontrados

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| src/api/route.ts | 12 | `// TODO: implement` | ⚠️ Warning | Indica incompleto |
| src/components/X.tsx | 45 | `return <div>Placeholder</div>` | 🛑 Blocker | No renderiza contenido |

**Anti-patterns:** {N} encontrados ({blockers} blockers, {warnings} warnings)

## Verificación Humana Requerida

[Si no se necesita:]
Ninguna — todos los items verificables chequeados programáticamente.

[Si se necesita:]

### 1. {Nombre del Test}
**Test:** {Qué hacer}
**Esperado:** {Qué debería pasar}
**Por qué humano:** {Por qué no se puede verificar programáticamente}

## Resumen de Gaps

[Si no hay gaps:]
**No se encontraron gaps.** Goal de fase logrado. Listo para proceder.

[Si hay gaps:]

### Critical Gaps (Bloquean Progreso)

1. **{Nombre del gap}**
   - Falta: {qué falta}
   - Impacto: {por qué bloquea el goal}
   - Fix: {qué necesita pasar}

### Non-Critical Gaps (Pueden Diferirse)

1. **{Nombre del gap}**
   - Issue: {qué está mal}
   - Impacto: {impacto limitado porque...}
   - Recomendación: {fix ahora o diferir}

## Recommended Fix Plans

[Solo si gaps_found:]

### {phase}-{next}-PLAN.md: {Nombre del Fix}
**Objetivo:** {Qué arregla}
**Tasks:**
1. {Task para arreglar gap}
2. {Task de verificación}
**Scope estimado:** {Small / Medium}

---

## Verification Metadata

**Enfoque:** Goal-backward (derivado del goal de fase)
**Fuente must-haves:** {PLAN.md frontmatter | derivado del ROADMAP.md}
**Checks automáticos:** {N} pasaron, {M} fallaron
**Checks humanos requeridos:** {N}
**Tiempo total:** {duración}

---
*Verificado: {timestamp}*
*Verificador: Yapu (subagent)*
```

## Valores de Status

| Status | Significado |
|--------|------------|
| `passed` | Todos los must-haves verificados, sin blockers |
| `gaps_found` | Uno o más critical gaps encontrados |
| `human_needed` | Checks automáticos pasan pero se requiere verificación humana |

## Severidad

| Emoji | Nivel | Significado |
|-------|-------|------------|
| 🛑 | Blocker | Previene logro del goal, debe arreglarse |
| ⚠️ | Warning | Indica incompleto pero no bloquea |
| ℹ️ | Info | Notable pero no problemático |
