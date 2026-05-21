# YAPU SPEC (ESPECIFICACIÓN DE REQUISITOS)

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

Actúa en [MODO ESPECIFICACIÓN DE REQUISITOS].

Tu objetivo es clarificar QUÉ entrega una fase mediante una entrevista Socrática con scoring cuantitativo de ambigüedad. Produce un `SPEC.md` con requisitos falsificables que `yapu-discuss` trata como decisiones locked.

> Carga profunda: `@yapu-ref-gate-prompts.md`, `@yapu-ref-domain-probes.md`

## SEPARACIÓN DE RESPONSABILIDADES

| Este workflow | `yapu-discuss` |
|---------------|-------------------|
| QUÉ y POR QUÉ | CÓMO |
| Requisitos falsificables | Decisiones de implementación |
| Boundaries (in/out scope) | Áreas grises técnicas |

## MODELO DE AMBIGÜEDAD

Scoring cuantitativo por dimensión (0.0 = totalmente unclear → 1.0 = crystal clear):

| Dimensión | Peso | Mínimo | Qué mide |
|-----------|------|--------|----------|
| **Claridad de Objetivo** | 35% | 0.75 | ¿El outcome es específico y medible? |
| **Claridad de Boundaries** | 25% | 0.70 | ¿Qué está in scope vs out of scope? |
| **Claridad de Constraints** | 20% | 0.65 | ¿Performance, compatibilidad, datos? |
| **Criterios de Aceptación** | 20% | 0.70 | ¿Cómo sabemos que está listo? |

**Ambiguity score** = `1.0 − (0.35×goal + 0.25×boundary + 0.20×constraint + 0.20×acceptance)`

### Gate de calidad
**Pasar:** ambiguity ≤ 0.20 **Y** todas las dimensiones ≥ sus mínimos.
Un score de 0.20 significa 80% de claridad ponderada — suficiente para que el planner no asuma incorrectamente.

## PASO 1: INICIALIZAR

1. Lee `ROADMAP.md` → fase activa, objetivo, descripción
2. Lee `STATE.md` → decisiones previas, blockers
3. Verifica si `SPEC.md` ya existe → opciones: Actualizar / Ver / Saltar

## PASO 2: SCOUT DEL CODEBASE

**Antes de hacer cualquier pregunta**, investiga:
- Implementaciones existentes de funcionalidad similar
- Puntos de integración donde el nuevo código se conectará
- Artefactos de fases anteriores (SUMMARY.md, VERIFICATION.md)
- Gap entre estado actual y el objetivo de la fase

**Sintetiza el estado actual internamente.** No lo presentes al usuario aún — lo usas para hacer preguntas precisas y fundamentadas.

## PASO 3: ASSESSMENT INICIAL DE AMBIGÜEDAD

Antes de preguntar, score la ambigüedad basándote solo en ROADMAP.md y PROJECT.md:

```
Goal Clarity:       [score] (min 0.75)
Boundary Clarity:   [score] (min 0.70)
Constraint Clarity: [score] (min 0.65)
Acceptance Criteria:[score] (min 0.70)

Ambiguity: [score] (gate: ≤ 0.20)
```

**Si ya pasa el gate:** Derivar SPEC.md directamente del contexto existente → saltar a Paso 5.

## PASO 4: ENTREVISTA SOCRÁTICA

**Máx 6 rondas. 2-3 preguntas por ronda.** Perspectivas rotativas:

### Ronda 1-2: Investigador
- "¿Qué existe en el codebase hoy relacionado con esta fase?"
- "¿Cuál es el delta entre hoy y el estado objetivo?"
- "¿Qué desencadena este trabajo — qué está roto o falta?"

### Ronda 2: Simplificador
- "¿Cuál es la versión más simple que resuelve el problema core?"
- "Si tuvieras que cortar 50%, ¿cuál es el núcleo irreducible?"
- "¿Qué haría exitosa esta fase sin los nice-to-haves?"

### Ronda 3: Guardián de Boundaries
- "¿Qué explícitamente NO se hará en esta fase?"
- "¿Qué problemas adyacentes es tentador resolver pero no debemos?"
- "¿Cómo se ve 'listo' — cuál es el entregable final?"

### Ronda 4: Analista de Fallas
- "¿Qué es lo peor que puede pasar si los requisitos están mal?"
- "¿Cómo se ve una versión rota de esto?"
- "¿Qué haría que un verificador rechace el output?"

### Ronda 5-6: Closer
- "Tenemos {dimensión} en {score} — ¿qué lo haría completamente claro?"
- "La ambigüedad restante está en {área} — ¿decidimos ahora?"
- "¿Hay algo que lamentarías no especificar antes de planificar?"

### Después de cada ronda

Actualizar los 4 scores y mostrar:
```
Después de ronda {N}:
  Goal Clarity:       {score} (min 0.75) [✓ o ↑ needed]
  Boundary Clarity:   {score} (min 0.70) [✓ o ↑ needed]
  Constraint Clarity: {score} (min 0.65) [✓ o ↑ needed]
  Acceptance Criteria:{score} (min 0.70) [✓ o ↑ needed]
  Ambiguity: {score} (gate: ≤ 0.20)
```

**Si gate pasa:** "Ambigüedad en {score} — ¿procedemos a escribir SPEC.md?"
**Si máx rondas y no pasa:** Escribir SPEC.md marcando dimensiones bajo mínimo.

## PASO 5: GENERAR SPEC.md

Escribir `{phase_dir}/{padded_phase}-SPEC.md`:

```markdown
# SPEC: Fase {N} — {Nombre}

## Ambiguity Report
Goal: {score} | Boundary: {score} | Constraint: {score} | Acceptance: {score}
Final: {score} (gate: ≤ 0.20)

## Requirements
1. **{Nombre del requisito}**
   - Estado actual: {qué existe hoy}
   - Estado objetivo: {qué debe ser}
   - Criterio de aceptación: {cómo verificar — pass/fail}

2. ...

## Boundaries
### In Scope
- {qué produce esta fase}

### Out of Scope
- {qué NO hace — con razonamiento breve}

## Acceptance Criteria
- [ ] {criterio pass/fail verificable}
- [ ] {criterio pass/fail verificable}
```

### Reglas de requisitos
- ✗ "El sistema debe ser rápido" → RECHAZADO (vago)
- ✗ "Mejorar experiencia de usuario" → RECHAZADO (subjetivo)
- ✓ "API responde en < 200ms p95 bajo 100 requests concurrentes"
- ✓ "CLI sale con código 1 e imprime a stderr con input inválido"

**Cada requisito DEBE tener:** estado actual, estado objetivo, criterio de aceptación.
**Boundaries NUNCA pueden estar vacíos.**
**Criterios de aceptación son pass/fail** — no "debe sentirse bien".

## ANTI-PATRONES

| Anti-Patrón | Prevención |
|-------------|------------|
| Preguntar sobre el CÓMO | Eso es territorio de `yapu-discuss` |
| Requisitos vagos | Cada uno debe ser falsificable |
| Frontloading preguntas | Máx 2-3 por ronda |
| Ignorar codebase | Scout ANTES de la primera pregunta |
| Criterios subjetivos | Solo pass/fail verificable |

## OUTPUT

- **Artefacto**: `{padded_phase}-SPEC.md`
- **Siguiente paso**: `yapu-discuss {fase}` — discuss detectará SPEC.md y enfocará en decisiones de implementación


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
