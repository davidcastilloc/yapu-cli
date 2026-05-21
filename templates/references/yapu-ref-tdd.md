# TDD: Test-Driven Development

TDD es sobre calidad de diseño, no métricas de cobertura. El ciclo red-green-refactor obliga a pensar en comportamiento antes de implementación.

**Principio:** Si puedes describir el comportamiento como `expect(fn(input)).toBe(output)` antes de escribir `fn`, TDD mejora el resultado.

**Insight clave:** El trabajo TDD es inherentemente más pesado — requiere 2-3 ciclos de ejecución (RED → GREEN → REFACTOR), cada uno con lecturas de archivos, ejecución de tests, y debugging potencial.

---

## Cuándo Usar TDD

**Candidatos TDD (crear plan TDD):**
- Lógica de negocio con inputs/outputs definidos
- API endpoints con contratos request/response
- Transformaciones de datos, parsing, formatting
- Reglas de validación y constraints
- Algoritmos con comportamiento testeable
- Máquinas de estado y workflows
- Funciones utilitarias con specs claras

**Omitir TDD (usar plan estándar):**
- UI layout, styling, componentes visuales
- Cambios de configuración
- Glue code conectando componentes existentes
- Scripts one-off y migraciones
- CRUD simple sin lógica de negocio
- Prototipado exploratorio

**Heurística:** ¿Puedes escribir `expect(fn(input)).toBe(output)` antes de escribir `fn`?
→ Sí: Plan TDD  |  → No: Plan estándar

---

## Ciclo Red-Green-Refactor

### RED — Escribir test que falla
1. Crear archivo de test siguiendo convenciones del proyecto
2. Escribir test describiendo comportamiento esperado
3. Ejecutar test — DEBE fallar
4. Si pasa: el feature existe o el test está mal. Investigar.
5. Commit: `test({phase}-{plan}): add failing test for [feature]`

### GREEN — Implementar para pasar
1. Escribir código mínimo para que el test pase
2. Sin cleverness, sin optimización — solo hacerlo funcionar
3. Ejecutar test — DEBE pasar
4. Commit: `feat({phase}-{plan}): implement [feature]`

### REFACTOR (si necesario)
1. Limpiar implementación si hay mejoras obvias
2. Ejecutar tests — DEBEN seguir pasando
3. Solo commit si hay cambios: `refactor({phase}-{plan}): clean up [feature]`

**Resultado:** Cada plan TDD produce 2-3 commits atómicos.

---

## Gate Enforcement

| Gate | Requerido | Commit Pattern | Validación |
|------|-----------|---------------|------------|
| RED | Sí | `test({phase}-{plan}): ...` | Test existe Y falla antes de implementación |
| GREEN | Sí | `feat({phase}-{plan}): ...` | Test pasa después de implementación |
| REFACTOR | No | `refactor({phase}-{plan}): ...` | Tests siguen pasando después de cleanup |

### Reglas Fail-Fast

1. **GREEN inesperado en fase RED:** Si el test pasa antes de escribir código → STOP. Investigar.
2. **Commit RED faltante:** Si no hay commit `test(...)` antes de `feat(...)` → violación de disciplina TDD.
3. **REFACTOR rompe tests:** Deshacer refactor inmediatamente. Refactorear en pasos más pequeños.

---

## Calidad de Tests

**Testear comportamiento, no implementación:**
- ✓ "returns formatted date string"
- ✗ "calls formatDate helper with correct params"

**Un concepto por test:**
- ✓ Tests separados para input válido, vacío, malformado
- ✗ Un solo test revisando todos los edge cases

**Nombres descriptivos:**
- ✓ "should reject empty email", "returns null for invalid ID"
- ✗ "test1", "handles error", "works correctly"

**Sin detalles de implementación:**
- ✓ Testear API pública, comportamiento observable
- ✗ Mockear internals, testear métodos privados

---

## Setup de Test Framework

Si no existe framework de test, configurar como parte de la fase RED:

| Proyecto | Framework | Instalación |
|----------|-----------|-------------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

Setup es costo one-time incluido en el primer plan TDD.

---

## Presupuesto de Contexto

Planes TDD apuntan a **~40% de uso de contexto** (menor que el ~50% de planes estándar). El back-and-forth de RED→GREEN→REFACTOR es inherentemente más pesado que ejecución lineal de tasks.

Un feature por plan TDD. Si los features son triviales para batching, son triviales para omitir TDD.
