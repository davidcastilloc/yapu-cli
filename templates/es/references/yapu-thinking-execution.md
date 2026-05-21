# Modelos de Pensamiento: Ejecución

Modelos de razonamiento estructurado para agentes de **ejecución**. Aplicar en puntos de decisión durante la ejecución de tareas, no continuamente. Cada modelo contrarresta un modo de fallo específico.

## Resolución de Conflictos

Forcing Function y First Principles ambos empujan hacia "hazlo ahora". Ejecutar First Principles PRIMERO (entender la restricción), Forcing Function SEGUNDO (crear el mecanismo). Secuenciales, no competitivos.

---

## 1. Circle of Concern vs Circle of Control

**Contrarresta:** Ejecutor intentando arreglar cosas fuera de su scope — bugs upstream, tech debt no relacionada, issues de infraestructura.

Antes de modificar código no listado explícitamente en el plan, pregunta: ¿Está en mi Circle of Control (scope del plan) o mi Circle of Concern (cosas que noto pero no debo arreglar)? Si es Concern: documéntalo como nota de desviación, NO lo arregles. El trabajo del ejecutor es construir lo que el plan dice, no mejorar el codebase. Scope creep por arreglos "ya que estoy aquí" es la causa #1 de desbordes del ejecutor.

## 2. Forcing Function

**Contrarresta:** Diferir decisiones difíciles al runtime en vez de resolverlas en build time.

Cuando encuentres un requisito ambiguo o punto de integración poco claro, crea un forcing function que haga la decisión explícita AHORA en vez de esconderla detrás de un TODO o check en runtime. Ejemplos: tipo `never` en TypeScript para forzar switches exhaustivos, assertion en build-time para config requerida, interface que fuerce a callers a manejar casos de error. Si la decisión realmente no puede hacerse en build time, documéntala como desviación — no la difieras silenciosamente.

## 3. First Principles Thinking

**Contrarresta:** Copiar patrones de código existente sin entender si aplican a la tarea actual.

Antes de copiar un patrón de otro archivo, descompone POR QUÉ existe: ¿Qué restricción satisface? ¿Tu tarea actual tiene la misma restricción? Si no, el patrón puede ser cargo cult. Construye tu implementación desde los requisitos reales de la tarea, no desde el ejemplo existente más cercano. En caso de duda, los pasos de acción del plan definen qué construir.

## 4. Occam's Razor

**Contrarresta:** Sobre-ingeniería de tareas simples con abstracciones, generics o future-proofing innecesarios.

Antes de agregar una capa de abstracción, parámetro genérico, factory pattern u opción de configuración, pregunta: ¿El plan REQUIERE esta flexibilidad? Si el plan dice "crea una función que haga X", crea una función que haga X — no un framework configurable y extensible. La implementación más simple que satisfaga la condición `done` del plan es la correcta.

## 5. Chesterton's Fence

**Contrarresta:** Remover o modificar código existente sin entender por qué fue escrito así.

Antes de remover, reemplazar o modificar significativamente código existente, determina POR QUÉ existe. Revisa: git blame del commit que lo introdujo, comentarios explicando la razón, test cases que lo ejercitan. Si el propósito no está claro, consérvalo y agrega un comentario notando la incertidumbre — NO remuevas código cuyo propósito no entiendes.

---

## Cuándo NO Pensar

- **Acciones directas del plan** — Si el plan dice "crea archivo X con contenido Y" y la acción es inequívoca, ejecútala directamente.
- **Siguiendo patrones establecidos** — Si el codebase tiene un patrón claro y consistente y el plan dice agregar otro, sigue el patrón. Chesterton's Fence aplica para remover patrones, no para seguirlos.
- **Edits triviales** — Agregar un import, corregir un typo, actualizar un número de versión. Son cambios mecánicos sin decisiones de diseño.
- **Ejecutando comandos de verificación** — Ejecutar steps de verify es procedural. Solo invocar modelos si un paso falla y necesitas decidir cómo responder.
