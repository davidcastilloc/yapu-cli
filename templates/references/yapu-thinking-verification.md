# Modelos de Pensamiento: Verificación

Modelos de razonamiento estructurado para agentes de **verificación**. Aplicar durante pasadas de verificación, no continuamente. Cada modelo contrarresta un modo de fallo específico.

## Resolución de Conflictos

Inversion y Confirmation Bias Counter buscan fallos pero sirven propósitos diferentes. Ejecutar en secuencia:

1. **Inversion PRIMERO** (brainstorm): generar 3 formas en que esto podría estar mal
2. **Confirmation Bias Counter SEGUNDO** (check estructurado): encontrar un requisito parcial, un test engañoso, un error path sin cubrir

Inversion genera la lista; Confirmation Bias Counter es la disciplina para verificar los items.

---

## 1. Inversion

**Contrarresta:** Verificadores confirmando éxito en vez de buscar fallos.

En vez de verificar qué ESTÁ correcto, lista 3 formas específicas en que la implementación podría estar MAL a pesar de pasar tests: edge cases faltantes, pérdida silenciosa de datos, race conditions, error paths no manejados. Para cada una, escribe un check concreto (grep por patrón, test con input específico, verificar que existe manejo de error). Además, verifica si alguna desviación documentada cambia el significado de un must-have.

## 2. Chesterton's Fence

**Contrarresta:** Señalar código funcional como dead o innecesario.

Antes de señalar código existente como dead, redundante o sobre-complicado, determina POR QUÉ fue escrito así. Revisa git blame, comentarios, test cases y el plan que lo creó. Si la razón no está clara, señala como "propósito desconocido — recomendar conservar con WARNING, no remover".

## 3. Confirmation Bias Counter

**Contrarresta:** Verificadores predispuestos por claims del resumen a ver éxito.

Después de tu pasada inicial de verificación, haz una pasada de DISCONFIRMACIÓN: (1) encuentra un requisito que solo se cumple parcialmente, (2) encuentra un test que pasa pero no testea realmente el comportamiento declarado, (3) encuentra un error path sin cobertura de test. Reporta estos incluso si la verificación general pasa.

## 4. Planning Fallacy Calibration

**Contrarresta:** Aceptar planes sobre-dimensionados como razonables.

Para cada tarea estimada como "simple" o "pequeña", verifica: ¿toca más de 2 archivos? ¿Requiere entender una API desconocida? ¿Modifica infraestructura compartida? Si sí a cualquiera, señalar como probablemente subestimada. Planes con >5 tareas o tareas tocando >4 archivos por tarea están sobre-dimensionados.

## 5. Counterfactual Thinking

**Contrarresta:** Planes que asumen éxito en cada paso sin recuperación de errores.

Para cada plan, pregunta: "¿Qué pasaría si el ejecutor siguiera este plan EXACTAMENTE pero encontrara un fallo común: versión de dependencia incorrecta, API retornando formato inesperado, archivo ya modificado por plan anterior?" Si el plan no tiene path de contingencia, señalar como WARNING: "Sin path de recuperación de errores para tarea N."

---

## Cuándo NO Pensar

- **Re-verificación de items ya aprobados** — Solo necesitan check rápido de regresión (existencia + sanidad básica), no el tratamiento completo de Inversion + Confirmation Bias.
- **Checks binarios de existencia** — Si un must-have es "archivo X existe con >N líneas" y el archivo claramente existe, no correr Counterfactual Thinking.
- **Resultados de test directos** — Si los comandos de verify producen output claro pass/fail, aceptar el resultado. Solo invocar modelos cuando los resultados son ambiguos.
- **Issues nivel INFO** — No aplicar razonamiento estructurado para decidir si una observación INFO es realmente BLOCKER.
