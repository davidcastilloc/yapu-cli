# Patrones Comunes de Bugs

> Referencia cargada bajo demanda vía `@yapu-ref-common-bugs.md`.
> Checklist de patrones de bugs frecuentes para escanear antes de formar hipótesis. Ordenados por frecuencia. Cubren ~80% de bugs en todos los stacks tecnológicos.

---

## Null / Undefined Access

- **Null property access** — acceder propiedad en `null` o `undefined`, falta null check u optional chaining
- **Missing return value** — función retorna `undefined` en vez del valor esperado, falta `return` o branch incorrecto
- **Destructuring null** — destructuring de array/object en `null`/`undefined`, API retornó shape de error en vez de data
- **Undefaulted optional** — parámetro opcional usado sin default, caller omitió argumento

## Off-by-One / Boundary

- **Wrong loop bound** — loop empieza en 1 en vez de 0, o termina en `length` en vez de `length - 1`
- **Fence-post error** — "N items necesitan N-1 separadores" mal contado
- **Inclusive vs exclusive** — boundary de rango `<` vs `<=`, índice final de slice/substring
- **Empty collection** — `.length === 0` cae a lógica que asume items existentes

## Async / Timing

- **Missing await** — función async llamada sin `await`, obtiene objeto Promise en vez de valor resuelto
- **Race condition** — dos operaciones async leen/escriben mismo estado sin coordinación
- **Stale closure** — callback captura valor viejo de variable, no el actual
- **Initialization order** — event handler dispara antes de que setup complete
- **Leaked timer** — timeout/interval no limpiado, dispara después de que componente/contexto se destruya

## State Management

- **Shared mutation** — object/array modificado in-place afecta otros consumidores
- **Stale render** — estado actualizado pero UI no re-renderizada, falta trigger reactivo o referencia incorrecta
- **Dual source of truth** — mismos datos almacenados en dos lugares, uno se desincroniza
- **Invalid transition** — state machine permite transición sin guard condition

## Import / Module

- **Circular dependency** — módulo A importa B, B importa A, uno obtiene `undefined`
- **Export mismatch** — default vs named export, `import X` vs `import { X }`
- **Wrong extension** — `.js` vs `.cjs` vs `.mjs`, `.ts` vs `.tsx`
- **Path case sensitivity** — funciona en Windows/macOS, falla en Linux
- **Missing extension** — ESM requiere extensiones explícitas en imports

## Type / Coercion

- **String vs number compare** — `"5" > "10"` es `true` (lexicográfico), `5 > 10` es `false`
- **Implicit coercion** — `==` en vez de `===`, sorpresas truthy/falsy (`0`, `""`, `[]`)
- **Numeric precision** — `0.1 + 0.2 !== 0.3`, integers grandes pierden precisión
- **Falsy valid value** — valor es `0` o `""` que es válido pero falsy

## Environment / Config

- **Missing env var** — variable de entorno faltante o valor incorrecto en dev vs prod vs CI
- **Hardcoded path** — funciona en una máquina, falla en otra
- **Port conflict** — puerto ya en uso, proceso previo aún corriendo
- **Permission denied** — usuario/grupo diferente en deployment
- **Missing dependency** — no en package.json o no instalado

## Data Shape / API Contract

- **Changed response shape** — backend actualizado, frontend espera formato viejo
- **Wrong container type** — array donde se espera object o viceversa, `data` vs `data.results` vs `data[0]`
- **Missing required field** — campo requerido omitido en payload
- **Date format mismatch** — ISO string vs timestamp vs locale string
- **Encoding mismatch** — UTF-8 vs Latin-1, URL encoding, HTML entities

## Regex / String

- **Sticky lastIndex** — regex flag `g` con `.test()` luego `.exec()`, `lastIndex` no reseteado
- **Missing escape** — `.` matchea cualquier char, `$` es especial, backslash necesita doble
- **Greedy overmatch** — `.*` come delimitadores, necesita `.*?`

## Error Handling

- **Swallowed error** — `catch {}` vacío o loguea pero no rethrow/handle
- **Wrong error type** — catchea base `Error` cuando se necesita tipo específico
- **Error in handler** — código de cleanup tira, enmascarando error original
- **Unhandled rejection** — falta `.catch()` o try/catch alrededor de `await`

## Scope / Closure

- **Variable shadowing** — scope interno declara mismo nombre, oculta variable externa
- **Loop variable capture** — todos los closures comparten mismo `var i`, usar `let` o bind
- **Lost this binding** — callback pierde contexto, necesita `.bind()` o arrow function

---

## Mapa de Síntoma → Categoría

| Síntoma | Verificar Primero |
|---------|------------------|
| "Cannot read property of undefined/null" | Null/Undefined Access |
| "X is not a function" | Import/Module, Type/Coercion |
| Funciona a veces, falla a veces | Async/Timing, State Management |
| Funciona localmente, falla en CI/prod | Environment/Config |
| Datos incorrectos mostrados | Data Shape, State Management |
| Off by one item / falta último item | Off-by-One/Boundary |
| "Unexpected token" / parse error | Data Shape, Type/Coercion |
| Memory leak / uso creciente de recursos | Async/Timing (cleanup), Scope/Closure |
| Infinite loop / max call stack | State Management, Async/Timing |

---

## Cómo Usar Este Checklist

1. **Antes de formar cualquier hipótesis**, escanear las categorías relevantes basándose en el síntoma
2. **Matchear síntoma a patrón** — si el bug involucra "undefined is not an object", verificar Null/Undefined primero
3. **Cada patrón verificado es un candidato a hipótesis** — verificar o eliminar con evidencia
4. **Si ningún patrón matchea**, proceder a investigación abierta
