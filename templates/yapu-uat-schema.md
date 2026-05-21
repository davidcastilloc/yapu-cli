# Schema: User Acceptance Testing — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-UAT.md`
> Tracking persistente de sesiones UAT con estado entre sesiones.

## Plantilla

```markdown
---
status: testing | partial | complete | diagnosed
phase: XX-name
source: [lista de SUMMARY.md files testeados]
started: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Test
<!-- SOBREESCRIBIR cada test — muestra dónde estamos -->

number: [N]
name: [nombre del test]
expected: |
  [qué debería observar el usuario]
awaiting: user response

## Tests

### 1. [Nombre del Test]
expected: [comportamiento observable — qué debería ver el usuario]
result: [pending]

### 2. [Nombre del Test]
expected: [comportamiento observable]
result: pass

### 3. [Nombre del Test]
expected: [comportamiento observable]
result: issue
reported: "[respuesta verbatim del usuario]"
severity: major

### 4. [Nombre del Test]
expected: [comportamiento observable]
result: skipped
reason: [por qué se saltó]

### 5. [Nombre del Test]
expected: [comportamiento observable]
result: blocked
blocked_by: server | physical-device | release-build | third-party | prior-phase
reason: [por qué bloqueado]

## Summary

total: [N]
passed: [N]
issues: [N]
pending: [N]
skipped: [N]
blocked: [N]

## Gaps

<!-- YAML format para consumo downstream -->
- truth: "[comportamiento esperado del test]"
  status: failed
  reason: "User reported: [respuesta verbatim]"
  severity: blocker | major | minor | cosmetic
  test: [N]
  root_cause: ""       # Llenado por diagnóstico
  artifacts: []        # Llenado por diagnóstico
  missing: []          # Llenado por diagnóstico
  debug_session: ""    # Llenado por diagnóstico
```

## Reglas por Sección

| Sección | Disciplina | Detalle |
|---------|-----------|---------|
| Frontmatter `status` | OVERWRITE | testing → partial → complete → diagnosed |
| Frontmatter `phase/source/started` | IMMUTABLE | Set al crear |
| Current Test | OVERWRITE | Completamente en cada transición de test |
| Tests `result` | OVERWRITE | Cuando el usuario responde |
| Summary | OVERWRITE | Conteos después de cada respuesta |
| Gaps | APPEND | Solo cuando se encuentra issue (YAML) |

## Valores de Result

| Valor | Significado |
|-------|------------|
| `[pending]` | Aún no testeado |
| `pass` | Confirmado funcionando |
| `issue` | Problema encontrado (agregar `reported` + `severity`) |
| `skipped` | Saltado (agregar `reason`) |
| `blocked` | No testeable (agregar `blocked_by` + `reason`) |

## Guía de Severidad

Severidad INFERIDA del lenguaje natural del usuario, nunca preguntada:

| El usuario describe | Inferir |
|--------------------|---------|
| Crash, error, excepción, falla completamente, inutilizable | blocker |
| No funciona, nada pasa, comportamiento incorrecto, falta | major |
| Funciona pero..., lento, raro, menor, pequeño issue | minor |
| Color, font, spacing, alineación, visual, se ve mal | cosmetic |

**Default: major** (default seguro)

## Ciclo de Vida

1. **Creación:** Extraer tests de SUMMARY.md → status `testing` → todos `[pending]`
2. **Durante testing:** Presentar test → usuario responde → actualizar result → actualizar Summary
3. **Issue encontrado:** Append a Gaps en YAML → inferir severity
4. **Completado:** status → `complete` → commit
5. **Parcial:** status → `partial` si quedan items outstanding
6. **Diagnóstico:** Después de complete, si hay gaps → investigar → llenar `root_cause` en cada gap → status → `diagnosed`
