# Modelos de Pensamiento: Planificación

Modelos de razonamiento estructurado para agentes de **planificación**. Aplicar en puntos de decisión durante la creación del plan, no continuamente. Cada modelo contrarresta un modo de fallo específico.

## Resolución de Conflictos

Constraint Analysis y Pre-Mortem analizan riesgo a granularidades distintas. Ejecutar Constraint Analysis PRIMERO (identificar la restricción más difícil), luego Pre-Mortem (enumerar modos de fallo alrededor de esa restricción y el resto del plan).

---

## 1. Pre-Mortem Analysis

**Contrarresta:** Descomposición optimista que ignora modos de fallo.

Antes de finalizar el plan, asume que ya falló. Lista las 3 razones más probables de fallo — dependencia faltante, descomposición incorrecta, complejidad subestimada — y agrega pasos de mitigación o criterios de aceptación que detecten cada fallo tempranamente.

## 2. MECE Decomposition

**Contrarresta:** Tareas solapadas (merge conflicts) o tareas con gaps (requisitos faltantes).

Verifica que el breakdown sea MECE a nivel de REQUISITOS: (1) lista cada requisito del objetivo de fase, (2) confirma que cada uno mapea a exactamente un `done` de una tarea, (3) si dos tareas modifican el mismo archivo, confirma que modifican secciones DIFERENTES o sirven requisitos DIFERENTES, (4) señala cualquier requisito no cubierto.

## 3. Constraint Analysis

**Contrarresta:** Diferir la restricción más difícil a la última tarea, causando fallos tardíos.

Identifica la restricción más difícil de la fase — lo que, si no funciona, hace todo lo demás irrelevante. Prográmala como Tarea 1 o 2, no al final. Si involucra una API externa o librería desconocida, agrega una tarea spike/proof-of-concept antes de la implementación principal.

## 4. Reversibility Test

**Contrarresta:** Sobre-analizar decisiones baratas, sub-analizar decisiones costosas.

Clasifica cada decisión significativa como REVERSIBLE (cambiar después cuesta poco) o IRREVERSIBLE (requiere migración, breaking changes o rework significativo). Gasta tiempo de análisis proporcional a la irreversibilidad. Para decisiones irreversibles, documenta la justificación en el plan.

## 5. Curse of Knowledge Counter

**Contrarresta:** Ambigüedad plan-a-ejecutor por instrucciones comprimidas.

Para cada paso de acción, re-léelo como si NUNCA hubieras visto el codebase. ¿Es cada sustantivo inequívoco (cuál archivo? cuál función?)? ¿Es cada verbo específico (agregar DÓNDE? modificar CÓMO?)? Si un paso puede interpretarse de dos formas, reescríbelo. Incluye file paths, nombres de función y comportamiento esperado.

## 6. Base Rate Neglect Counter

**Contrarresta:** Planificadores ignorando caveats de investigación de baja confianza.

Antes de finalizar, lee TODOS los items `[NEEDS DECISION]` y recomendaciones de confianza BAJA del resumen de investigación. Para cada uno: (a) crea una tarea checkpoint para resolverlo, o (b) documenta por qué el riesgo es aceptable. Items de confianza BAJA aceptados silenciosamente se convierten en deuda técnica no documentada.

## Gap Closure: Root-Cause Check

**Aplica solo cuando:** Se detectan gaps durante verificación.

Antes de escribir el plan de corrección, aplica una ronda de "por qué": ¿Fue deficiencia del plan (tarea equivocada), fallo de ejecución (tarea correcta, implementación incorrecta), o assumption cambiada (cambio de entorno/dependencia)? El plan de corrección debe apuntar a la causa raíz, no solo al síntoma.

---

## Cuándo NO Pensar

- **Planes de una sola tarea** — Si la fase tiene un requisito claro y una tarea obvia, no correr Pre-Mortem ni MECE.
- **Fases bien investigadas** — Si la investigación tiene recomendaciones de confianza ALTA para cada decisión, omitir Base Rate Neglect Counter.
- **Iteraciones de revisión** — Al revisar un plan por feedback, enfocarse en los issues señalados. No re-ejecutar la suite completa en cada pasada.
- **Planes boilerplate** — Cambios de config, version bumps, actualizaciones de docs. No tienen modos de fallo que ameriten pre-mortem.
