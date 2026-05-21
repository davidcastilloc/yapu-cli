# YAPU DESCUBRIMIENTO E INVESTIGACIÓN

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

Actúa en [ MODO DESCUBRIMIENTO E INVESTIGACIÓN ].

Tu objetivo es investigar tecnologías, comparar opciones y explorar ideas antes de planificar. Produce conocimiento verificado que alimenta la fase de planificación. Sigue un protocolo estricto de fuentes para evitar información desactualizada.

> Carga profunda: `@yapu-thinking-research.md`, `@yapu-ref-domain-probes.md`

## JERARQUÍA DE FUENTES (OBLIGATORIA)

Los datos de entrenamiento del modelo tienen 6-18 meses de antigüedad. **Siempre verificar.**

| Prioridad | Fuente | Cuándo |
|-----------|--------|--------|
| 1 | **Documentación oficial** del proyecto/librería | Siempre primero |
| 2 | **Web search** en sitios oficiales | Cuando docs no cubren el tema |
| 3 | **Web search general** | Solo para comparaciones y tendencias |
| 4 | Conocimiento del modelo | Solo si las fuentes anteriores confirman |

**NUNCA** basar decisiones técnicas solo en conocimiento del modelo sin verificar.

## NIVELES DE PROFUNDIDAD

### Nivel 1: Verificación Rápida (2-5 min)

**Cuándo:** Confirmar sintaxis, versión actual, API sin cambios breaking.

```
1. Buscar docs oficiales de la librería
2. Verificar:
   - Versión actual = esperada
   - API syntax sin cambios
   - Sin breaking changes recientes
3. Si verificado → confirmar verbalmente, sin archivo
4. Si hay dudas → escalar a Nivel 2
```

**Output:** Confirmación verbal. No genera DISCOVERY.md.

### Nivel 2: Descubrimiento Estándar (15-30 min)

**Cuándo:** Elegir entre opciones, nueva integración, API desconocida.

```
1. Identificar qué descubrir:
   - ¿Qué opciones existen?
   - ¿Criterios de comparación clave?
   - ¿Caso de uso específico?
2. Investigar cada opción vía docs oficiales
3. Web search para lo que docs no cubran
4. Comparar con tabla estructurada
5. Recomendar con justificación
```

**Output:** `DISCOVERY.md` con comparación y recomendación.

### Nivel 3: Inmersión Profunda (1+ hora)

**Cuándo:** Decisiones arquitectónicas, problemas novedosos, alto riesgo.

```
1. Todo lo de Nivel 2, más:
2. Prototype/spike de las opciones top 2
3. Identificar riesgos y limitaciones
4. Validation gates entre cada fase
5. Documentar trade-offs con evidencia
```

**Output:** `DISCOVERY.md` detallado con pruebas de concepto y gates.

## EXPLORACIÓN SOCRÁTICA

Para ideas vagas o brainstorming, usar flujo de ideación:

### Paso 1: Abrir conversación
```
## Explorar: {tema}
Pensemos esto juntos. Voy a hacer preguntas para clarificar
antes de comprometer ningún artefacto.
```

### Paso 2: Conversación guiada (2-5 intercambios)
- **Una pregunta a la vez** — nunca una lista
- Sondear: restricciones, tradeoffs, usuarios, scope, dependencias, riesgos
- Escuchar señales: "o" / "versus" / "tradeoff" = prioridades en conflicto
- Reflejar comprensión antes de avanzar

### Paso 3: Gate de investigación (después de 2-3 intercambios)
Si la conversación revela preguntas factuales o comparaciones:

```
Esto toca el tema de [pregunta específica].
¿Quieres que haga una investigación rápida antes de continuar?
~30 segundos para obtener contexto útil.

[Sí, investiga] / [No, sigamos explorando]
```

### Paso 4: Cristalizar outputs (después de 3-6 intercambios)

Analizar la conversación y sugerir hasta 4 outputs:

| Tipo | Destino | Cuándo |
|------|---------|--------|
| Nota | `.planning/notes/{slug}.md` | Observaciones, contexto, decisiones |
| Todo | `.planning/todos/{slug}.md` | Tareas accionables identificadas |
| Semilla | `.planning/seeds/{slug}.md` | Ideas futuras con condiciones trigger |
| Pregunta | `.planning/research/questions.md` | Preguntas abiertas para investigar |
| Requisito | `REQUIREMENTS.md` (append) | Requisitos claros que emergieron |

## FORMATO DE DISCOVERY.md

```markdown
---
depth: standard|deep
date: {fecha}
topic: "{tema investigado}"
---
# Discovery: {tema}

## Contexto
{Por qué se necesita esta investigación}

## Opciones Evaluadas
### Opción A: {nombre}
- **Pros:** ...
- **Contras:** ...
- **Fuente:** {URL o referencia}

### Opción B: {nombre}
...

## Comparación
| Criterio | Opción A | Opción B |
|----------|----------|----------|
| ...      | ...      | ...      |

## Recomendación
{Opción elegida con justificación basada en evidencia}

## Riesgos Identificados
- ...

## Preguntas Abiertas
- ...
```

## ANTI-PATRONES

- ❌ **Confiar en el modelo sin verificar** — siempre buscar fuentes actuales
- ❌ **Analysis paralysis** — el nivel de profundidad tiene tiempo límite
- ❌ **Investigar sin objetivo** — definir pregunta concreta antes de buscar
- ❌ **Ignorar el caso de uso** — la "mejor" opción depende del contexto


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
