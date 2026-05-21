# Ejemplos de Calibración: Verifier

Ejemplos positivos/negativos para calibrar el verifier. Muestran el nivel de evidencia multi-capa esperado y patrones de gap comunes.

---

## Ejemplos Positivos

### Ejemplo 1: Verificación multi-nivel con descubrimiento real de gap

**Input:** Must-have artifact: `workflows/context-bridge.md: >50 lines`

**Output:**

> **L1 (Existence):** EXISTS — `workflows/context-bridge.md` encontrado, 187 líneas.
> **L2 (Substantive):** SUBSTANTIVE — Sin marcadores TODO/FIXME, 4 secciones definidas (`updateContextTier`, `getContextBudget`, `injectContextWarning`, `resetTierState`), lógica no-trivial con reads de config y cálculos de threshold.
> **L3 (Wired):** WIRED — Referenciado por `workflows/execute-phase.md` en paso 3. Llamado por `agents/executor.md` vía @-reference include. Argumentos verificados: recibe planning directory path matching the expected parameter.
> **Status: PASSED**

**Por qué es bueno:** El verifier verificó los tres niveles independientemente con evidencia específica — file path, line count, exported symbols, import location, y verificación de argumentos. No se detuvo en "el archivo existe" sino que trazó el wiring hasta uso real con argumentos correctos.

### Ejemplo 2: Clasificación FAILED correcta con evidencia grep

**Input:** Must-have truth: `validate-commit.js rejects commits missing scope parentheses`

**Output:**

> **Method:** Ejecutó `grep -n "scope" bin/validate-commit.js` para localizar lógica de validación.
> **Evidence:** Líneas 34-41 muestran regex `/^(feat|fix|refactor|test|docs|chore|wip)\(/` que requiere paréntesis de apertura. Sin embargo, no hay test para paréntesis de cierre FALTANTE — el regex acepta `feat(: description` (sin contenido de scope ni cierre).
> **Ran:** `echo "feat(: test" | node bin/validate-commit.js` — exit code 0 (aceptado).
> **Status: FAILED** — Commit messages con scope vacío `feat(: desc)` son aceptados. La truth no se sostiene para el edge case de scope vacío.

**Por qué es bueno:** El verifier no confió en la intención del código — ejecutó un test real con un edge case input y reportó el fallo específico.

### Ejemplo 3: Wiring faltante detectado (patrón calibración)

**Input:** Must-have key_link: `check-subagent-output.js imports and calls feedback-loop.js extractFeedback()`

**Output:**

> **Method:** Ejecutó `grep -n "feedback-loop\|extractFeedback" bin/check-subagent-output.js`.
> **Evidence:** Zero matches. El archivo `feedback-loop.js` existe (172 líneas, substantive), y los tests pasan (229 líneas). Pero `check-subagent-output.js` nunca lo importa ni lo llama.
> **Cross-check:** `grep -rn "require.*feedback-loop" bin/` retorna zero resultados.
> **Status: FAILED** — El artefacto existe y está testeado, pero está completamente huérfano. El key_link "imports and calls" no se sostiene. Esto es un gap de **missing wiring**.

**Por qué es bueno:** El verifier capturó un patrón de calibración común: código que existe, está testeado, pero nunca está conectado al sistema. L1 y L2 pasan, pero L3 (wiring) falla.

### Ejemplo 4: Distinguiendo gaps de planning de fallos de ejecución

**Input:** Must-have truth: `All MSYS regex patterns consolidated into shared module`

**Output:**

> **Method:** Ejecutó `grep -rn "\/[a-zA-Z]\/" bin/` para encontrar regex inline MSYS.
> **Evidence:** 2 matches en `commands/misc.md` (líneas 26, 487). Estos NO estaban en el scope original del plan — fueron introducidos DESPUÉS de que se escribió el plan.
> **Assessment:** El executor completó correctamente todos los tasks planeados. El gap es un **issue de ordenamiento de planning**, no un fallo de ejecución.
> **Status: PASS_WITH_NOTES** — Executor hizo lo planeado. Regex sin consolidar anotado como follow-up, no como fallo de esta fase.

**Por qué es bueno:** El verifier distinguió entre lo que fue planeado vs. lo que existe ahora. Código que cambió DESPUÉS de la creación del plan es un gap de planning, no un fallo de executor.

---

## Patrones de Gap Derivados de Calibración

Basado en análisis del corpus de verificación (80% pass rate, 8 gaps):

| Patrón | Count | % de Gaps | Qué Verificar |
|--------|-------|-----------|---------------|
| Missing wiring | 3 | 37% | Archivo existe + testeado pero nunca importado/llamado por consumidor |
| Missing tests | 2 | 25% | Feature funciona pero test file excluido de CI o nunca se ejecuta |
| Otros | 3 | 38% | Config layer mismatches, issues de ordenamiento de planning, schema gaps |

---

## Ejemplos Negativos

### Ejemplo 1: Pass blanket sin evidencia per-criterio

**Input:** Must-haves: 5 truths, 3 artifacts, 2 key_links del frontmatter del plan.

**Output:**

> All must-haves have been verified. The implementation matches the plan requirements. Files exist and are properly connected. Status: PASSED.
> must_haves_checked: 10, must_haves_passed: 10

**Por qué es malo:** Ningún must-have individual está listado ni verificado. Sin file paths, sin line numbers, sin output de grep, sin breakdown level-by-level. El verifier restateó los must-haves como passing sin mostrar evidencia. Esto omitiría stubs, exports huérfanos, y wiring roto.

### Ejemplo 2: Check de existencia sin verificar sustancia ni wiring

**Input:** Must-have artifact: `bin/lib/audit-checks/index.cjs: >100 lines`

**Output:**

> **L1 (Existence):** EXISTS — File found at `bin/lib/audit-checks/index.cjs`, 142 lines.
> **Status: PASSED**

**Por qué es malo:** El verifier se detuvo en Level 1. El archivo tiene 142 líneas pero podría contener `// TODO: implement all checks` con stub functions retornando objetos vacíos. Level 2 (substantive) y Level 3 (wired) fueron omitidos. Un archivo que existe pero nunca se importa o contiene solo placeholder code no debería pasar.
