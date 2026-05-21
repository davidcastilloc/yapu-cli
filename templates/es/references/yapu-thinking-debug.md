# Modelos de Pensamiento: Debug

Modelos de razonamiento estructurado para agentes de **debug**. Aplicar en puntos de decisión durante la investigación, no continuamente. Cada modelo contrarresta un modo de fallo específico.

## Resolución de Conflictos

Fault Tree y Hypothesis-Driven son secuenciales: Fault Tree PRIMERO (generar el árbol de causas posibles), Hypothesis-Driven SEGUNDO (testear cada rama sistemáticamente). Fault Tree provee el mapa; Hypothesis-Driven provee la disciplina para recorrerlo.

---

## 1. Fault Tree Analysis

**Contrarresta:** Saltar a conclusiones sin mapear sistemáticamente los paths de fallo.

Antes de testear cualquier hipótesis, construye un fault tree: comienza con el síntoma observado como nodo raíz, luego ramifica en todas las causas posibles por nivel (hardware, software, configuración, datos, entorno). Usa gates AND/OR — algunos fallos requieren múltiples condiciones (AND), otros tienen triggers independientes (OR). Este árbol se convierte en tu roadmap de investigación. Prioriza ramas por probabilidad y testeabilidad, pero NO podes ramas solo porque parezcan improbables — causas improbables que son fáciles de testear deben testearse temprano.

## 2. Hypothesis-Driven Investigation

**Contrarresta:** Hacer cambios aleatorios esperando que algo funcione — el anti-pattern de "shotgun debugging".

Para cada hipótesis del fault tree, sigue el protocolo estricto:
1. **PREDICT** — "Si la hipótesis H es correcta, entonces el test T debería producir resultado R"
2. **TEST** — Ejecuta exactamente un test
3. **OBSERVE** — Registra el resultado real
4. **CONCLUDE** — matched = SOPORTADA, failed = ELIMINADA, inesperado = nueva evidencia

Nunca saltes el paso PREDICT — sin predicción, no puedes distinguir un resultado significativo del ruido. Nunca cambies más de una variable por test.

## 3. Occam's Razor

**Contrarresta:** Perseguir explicaciones elaboradas cuando las simples no han sido descartadas.

Antes de investigar bugs complejos de interacción multi-componente, race conditions o issues a nivel framework, verifica las explicaciones simples primero: typo en nombre de variable, path incorrecto, import faltante, valor de config incorrecto, cache obsoleta, variable de entorno equivocada. Estas causas "aburridas" son la mayoría de los bugs. Solo escala a hipótesis complejas DESPUÉS de eliminar las simples. Si tu hipótesis actual requiere 3+ cosas fallando simultáneamente, retrocede y busca un single-point failure.

## 4. Counterfactual Thinking

**Contrarresta:** Fallar en aislar causalidad por no preguntar "¿qué pasa si cambio solo esto?"

Cuando tengas una hipótesis sobre la causa raíz, construye un contrafactual: "Si cambio SOLO esta variable/config/línea, el bug debería desaparecer (o aparecer)." Ejecuta el test contrafactual. Si el bug persiste después de tu cambio dirigido, tu hipótesis es incorrecta. Si desaparece, tienes evidencia causal fuerte. Esto es más poderoso que correlación ("el bug apareció después del deploy X") porque testea el mecanismo, no solo la línea temporal.

---

## Cuándo NO Pensar

- **Bugs obvios de causa única** — Si el error message nombra el archivo exacto, línea y causa (ej. `TypeError: Cannot read property 'x' of undefined at foo.js:42`), arréglalo directamente.
- **Reproduciendo un fix conocido** — Si ya sabes la causa raíz de una investigación previa, salta directamente al fix.
- **Typos, imports faltantes, paths incorrectos** — Si Occam's Razor lo resolvería inmediatamente, aplica el fix sin invocar el modelo completo.
- **Leyendo logs de error** — Leer y entender output de error es debugging normal, no un "punto de decisión." Solo invocar modelos cuando hay múltiples hipótesis plausibles.
