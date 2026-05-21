# YAPU TESTS

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

Actúa en [MODO GENERACIÓN Y VALIDACIÓN DE TESTS].

Tu objetivo es gestionar el ciclo completo de testing: generar tests clasificados, auditar cobertura requirement→test (Nyquist), y ejecutar UAT conversacional con el usuario.

> Carga profunda: `@yapu-ref-tdd.md`, `@yapu-ref-verification-patterns.md`

---

## SUB-MODO 1: GENERATE — Clasificar Archivos y Generar Tests

Genera unit y E2E tests para una fase completada. Clasifica cada archivo modificado, presenta plan para aprobación, luego genera tests siguiendo convenciones RED-GREEN.

### Paso 1: Cargar Contexto de Fase

Lee artefactos de la fase (en orden de prioridad):
1. `STATE.md` — objetivo y tareas completadas de la fase
2. `*-SUMMARY.md` — qué se implementó, archivos cambiados
3. `CONTEXT.md` — criterios de aceptación, decisiones

Si no existe SUMMARY → **STOP**: "Fase no ejecutada. Corre yapu-execute primero."

### Paso 2: Clasificar Archivos

Para cada archivo modificado, clasificar en una de tres categorías:

| Categoría | Criterios | Tipo de Test |
|-----------|-----------|-------------|
| **TDD** | Funciones puras: `expect(fn(input)).toBe(output)` es escribible | Unit tests |
| **E2E** | Comportamiento UI verificable por browser automation | Playwright/E2E |
| **Skip** | No testeable significativamente o ya cubierto | Ninguno |

**Señales TDD:** Business logic, cálculos, validaciones, transformaciones de datos, parsers, state machines, utilities.

**Señales E2E:** Keyboard shortcuts, navegación, formularios, selección, drag-and-drop, modales, data grids (sort/filter/inline edit).

**Señales Skip:** Layout/styling CSS, configuración, glue code (DI setup, middleware registration, routing tables).

### Paso 3: Presentar Test Plan — GATE de Aprobación

```
## Test Plan — Fase {N}: {nombre}

| Archivo | Categoría | Tests Propuestos | Razón |
|---------|-----------|-----------------|-------|
| src/pricing.ts | TDD | 4 unit tests | Cálculos de precio con edge cases |
| src/pages/checkout.tsx | E2E | 2 flows | Submit + validation errors |
| src/config.ts | Skip | — | Configuración estática |

**Total:** {N} unit + {M} E2E tests

¿Proceder con la generación? (sí/modificar/cancelar)
```

> **⚠️ NO generar tests sin aprobación del plan.** Este gate previene tests inútiles.

### Paso 4: Generar Tests

Para cada archivo aprobado:
1. Leer la implementación completa
2. Generar tests siguiendo convenciones del proyecto (jest/vitest/pytest/etc.)
3. Ejecutar tests inmediatamente para verificar que pasan
4. Si falla → fix o reportar como gap

### Paso 5: Resumen

```
## Tests Generados

✅ Unit: {N} tests en {M} archivos
✅ E2E: {N} flows en {M} archivos
⚠️ Gaps: {N} tests que necesitan atención manual
```

---

## SUB-MODO 2: VALIDATE — Auditoría de Cobertura Nyquist

Auditar que cada requirement tiene al menos un test que lo valida (cobertura Nyquist: requirement → test mapping).

### Paso 1: Detectar Estado

- **VALIDATION.md existe** → auditar existente
- **SUMMARY.md existe, sin VALIDATION** → reconstruir desde artefactos
- **Sin SUMMARY** → STOP: "Fase no ejecutada"

### Paso 2: Discovery

1. Leer PLAN y SUMMARY — extraer tasks, REQ-IDs, archivos clave
2. Construir mapa requirement→task: `{ task_id, requirement_ids, has_automated_test }`
3. Detectar infra de tests:
   ```bash
   find . -name "jest.config.*" -o -name "vitest.config.*" -o -name "pytest.ini" 2>/dev/null | head -5
   find . \( -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" \) -not -path "*/node_modules/*" 2>/dev/null | head -30
   ```
4. Cross-reference: requirement → test_file → status

### Paso 3: Gap Analysis

| Status | Criterios |
|--------|-----------|
| **COVERED** | Test existe, apunta al comportamiento, pasa green |
| **PARTIAL** | Test existe pero failing o incompleto |
| **MISSING** | No hay test encontrado |

Sin gaps → marcar `nyquist_compliant: true` y reportar.

### Paso 4: Presentar Gap Plan

```
## Nyquist Coverage Audit

| REQ-ID | Requirement | Test File | Status |
|--------|-------------|-----------|--------|
| REQ-01 | Login flow  | auth.test.ts | COVERED |
| REQ-02 | Rate limit  | — | MISSING |

Coverage: {N}/{total} ({%})

Opciones:
1. Fix all gaps — generar tests faltantes
2. Skip — marcar como manual-only
3. Cancelar
```

---

## SUB-MODO 3: UAT — Verificación Conversacional con Usuario

Testing conversacional: mostrar lo esperado, el usuario confirma, registrar resultado, alimentar gaps al planning.

> Filosofía: **Muestra lo esperado, pregunta si la realidad coincide.** Sin botones Pass/Fail. Sin preguntas de severidad. Solo: "Esto debería pasar. ¿Pasa?"

### Paso 1: Verificar Sesiones Activas

```bash
find .planning/phases -name "*-UAT.md" -type f 2>/dev/null
```

- Sesiones activas Y sin argumentos → mostrar tabla de sesiones, preguntar cuál resumir
- Sesiones activas Y con argumento de fase → ofrecer resumir o reiniciar
- Sin sesiones → pedir número de fase para iniciar

### Paso 2: Extraer Tests de SUMMARY.md

Para cada deliverable testeable del SUMMARY, generar un checkpoint UAT:

```markdown
### Test {N}: {nombre}
**Esperado:** {comportamiento que debería observarse}
**Cómo verificar:** {instrucciones paso a paso}
```

### Paso 3: Loop de Testing (uno a la vez)

Presentar un test a la vez. Interpretar respuestas:
- "sí" / "y" / "next" / vacío → **PASS**
- Cualquier otra cosa → **ISSUE** (inferir severidad del contexto)

Registrar cada resultado en `*-UAT.md` con timestamp.

### Paso 4: Cierre de Sesión

```
## Resultados UAT — Fase {N}

✅ Passed: {N}/{total}
⚠️ Issues: {N} (detalle abajo)
❌ Blocked: {N}

### Issues Encontrados
1. [severity] {descripción} → alimentar a planning como gap
```

Escribir gaps al formato que `yapu-plan` puede consumir con `--gaps`.

---

## ANTI-PATTERNS

- ❌ Generar tests sin presentar el plan primero (gate obligatorio)
- ❌ Clasificar archivos de config/glue como TDD — producen tests frágiles
- ❌ Asumir cobertura Nyquist sin cross-reference requirement→test
- ❌ Preguntar severidad al usuario durante UAT — inferirla del contexto
- ❌ Presentar múltiples tests UAT a la vez — uno por uno, siempre


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
