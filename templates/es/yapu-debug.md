# YAPU DEPURACIÓN ESTRUCTURADA

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

Actúa en [ MODO DEPURACIÓN ESTRUCTURADA ].

Tu objetivo es diagnosticar y resolver bugs usando el método científico: observar síntomas, formular hipótesis, diseñar experimentos, evaluar evidencia. Las sesiones se persisten en `.planning/debug/` para continuación entre contextos.

> Carga profunda: `@yapu-thinking-debug.md`

## PRINCIPIO CLAVE: DIAGNOSTICAR ANTES DE REPARAR

Sin diagnóstico: "No carga la página" → adivinar fix → probablemente incorrecto.
Con diagnóstico: "No carga la página" → "useEffect sin dependency array" → fix preciso.

## SUBCOMANDOS

### `new <descripción>` — Nueva sesión de debug

1. **Recoger síntomas:**
   - ¿Qué debería pasar vs. qué pasa?
   - ¿Es reproducible? ¿Cuándo empezó?
   - ¿Hay errores en consola/logs?

2. **Generar slug:** kebab-case del problema, máx 30 chars, solo `[a-z0-9-]`

3. **Crear `.planning/debug/{slug}.md`:**
   ```yaml
   ---
   status: investigating
   trigger: "{descripción del usuario}"
   created: {fecha}
   updated: {fecha}
   ---
   ## Current Focus
   - hypothesis: "{hipótesis inicial basada en síntomas}"
   - test: "{experimento para validar/invalidar}"
   - expecting: "{resultado esperado si hipótesis es correcta}"
   - next_action: "{primer paso concreto}"

   ## Evidence
   (vacío — se llena durante investigación)

   ## Eliminated
   (hipótesis descartadas con razón)

   ## Resolution
   - root_cause:
   - fix:
   - verification:
   - files_changed: []
   ```

4. **Ejecutar loop de investigación** (ver Flujo de Debug abajo)

### `list` — Listar sesiones activas

```bash
ls .planning/debug/*.md 2>/dev/null | grep -v resolved
```

Mostrar tabla formateada:
```
Sesiones de Debug Activas
─────────────────────────────────────────
  #  Slug                    Status         Updated
  1  auth-token-null         investigating  2026-04-12
     hypothesis: JWT decode falla con claims anidados
     next: Agregar logging en jwt.verify()
─────────────────────────────────────────
Usa `debug continue <slug>` para reanudar.
```

Si no hay sesiones: "No hay sesiones activas de debug."

### `status <slug>` — Detalles de una sesión

Sanitizar slug: `^[a-z0-9][a-z0-9-]*$`, máx 30 chars, rechazar `..`, `/`, `\`.
Buscar en `.planning/debug/{slug}.md` → si no existe, buscar en `resolved/`.
Mostrar: frontmatter + focus actual + conteo de evidencia + conteo de eliminados.

### `continue <slug>` — Reanudar sesión existente

Sanitizar slug. Leer archivo. Mostrar estado actual. Retomar desde `next_action`.

## FLUJO DE DEBUG (Loop de Investigación)

```
┌──────────────────────────────────────────┐
│  OBSERVAR → HIPOTETIZAR → EXPERIMENTAR  │
│         → EVALUAR → DECIDIR             │
└──────────────────────────────────────────┘
```

### Paso 1: Formular hipótesis
- Basada en síntomas y evidencia recopilada
- Debe ser **falseable** — si no puedes diseñar un test que la invalide, refina

### Paso 2: Diseñar experimento
- Un cambio, una variable — aislar el factor
- Definir resultado esperado ANTES de ejecutar
- Preferir: agregar logging > leer código > modificar código

### Paso 3: Ejecutar y registrar evidencia
```markdown
## Evidence
- timestamp: {fecha}
  hypothesis: "{la hipótesis testeada}"
  test: "{qué se hizo}"
  result: "{qué pasó}"
  conclusion: supports|refutes|inconclusive
```

### Paso 4: Evaluar y decidir

| Resultado | Acción |
|-----------|--------|
| **Soporta** hipótesis | Profundizar — ¿es la causa raíz o solo un síntoma? |
| **Refuta** hipótesis | Mover a `## Eliminated`, formular nueva hipótesis |
| **Inconcluso** | Diseñar experimento más específico |

### Paso 5: Checkpoint (cada 2-3 ciclos)
Actualizar `## Current Focus` con hipótesis actual y next_action. Esto permite continuación en otro contexto.

## 4 ESTRATEGIAS DE REPARACIÓN

Cuando identificas la causa raíz, aplica la estrategia apropiada:

| Estrategia | Cuándo usar |
|------------|-------------|
| **Retry** | Error transiente, race condition, timing issue |
| **Decompose** | Problema complejo — dividir en sub-problemas |
| **Prune** | Complejidad innecesaria causa el bug — simplificar |
| **Escalate** | Requiere decisión de arquitectura o input humano |

## DIAGNÓSTICO PARALELO (múltiples gaps)

Cuando UAT o verificación revelan múltiples problemas:

1. Crear una sesión de debug **por gap**
2. Cada sesión investiga independientemente
3. Recopilar root causes de todas las sesiones
4. Actualizar el artefacto padre con diagnósticos

## RESOLUCIÓN

Al encontrar y verificar el fix:
1. Actualizar `status: resolved` en frontmatter
2. Llenar sección `## Resolution` completa
3. Mover archivo a `.planning/debug/resolved/{slug}.md`
4. Commit:
   ```bash
   git add -A
   git commit -m "fix: {descripción concisa del fix}"
   ```

## ANTI-PATRONES

- ❌ **Shotgun debugging** — cambiar cosas al azar esperando que funcione
- ❌ **Hipótesis no falseable** — "algo está mal con el server"
- ❌ **Saltar a la solución** — implementar fix sin confirmar causa raíz
- ❌ **Ignorar evidencia** — descartar resultados que contradicen tu teoría


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
