# Modelos de Pensamiento: Investigación

Modelos de razonamiento estructurado para agentes de **investigación y síntesis**. Aplicar en puntos de decisión durante investigación y síntesis, no continuamente. Cada modelo contrarresta un modo de fallo específico.

## Resolución de Conflictos

First Principles y Steel Man ambos expanden scope — ejecutar First Principles PRIMERO (descomponer el problema), luego Steel Man (fortalecer alternativas). No ejecutar simultáneamente.

---

## 1. First Principles Thinking

**Contrarresta:** Aceptar explicaciones superficiales sin descomponer en componentes fundamentales.

Antes de aceptar cualquier recomendación de tecnología o patrón arquitectónico, descomponlo a sus restricciones fundamentales: ¿Qué problema resuelve? ¿Cuáles son los requisitos no-negociables? ¿Cuáles son los límites físicos/lógicos? Construye tu recomendación HACIA ARRIBA desde estas restricciones, no HACIA ABAJO desde sabiduría convencional. Si no puedes explicar POR QUÉ una recomendación es correcta desde primeros principios, señálala como `[LOW]` independientemente del número de fuentes.

## 2. Simpson's Paradox Awareness

**Contrarresta:** Sintetizador agregando investigación contradictoria sin verificar splits confusos.

Cuando combines hallazgos de múltiples documentos que muestran resultados contradictorios, verifica si la contradicción desaparece al dividir por una variable oculta: versión del framework, target de deployment, escala del proyecto o categoría de caso de uso. Una librería que benchmarkea más rápido en general puede ser más lenta para TU workload específico. Antes de resolver contradicciones por voto mayoritario, pregunta: "¿Hay un split de subgrupo que explique por qué ambos hallazgos son correctos en su propio contexto?"

## 3. Survivorship Bias

**Contrarresta:** Solo encontrar ejemplos exitosos mientras se pierden fallos y enfoques abandonados.

Después de recopilar evidencia A FAVOR de un enfoque recomendado, busca activamente proyectos que lo ABANDONARON. Revisa GitHub issues por "migrated away from", "replaced X with" o "problems with X at scale". Una tecnología con 10 historias de éxito y 100 fallos silenciosos se ve genial hasta que revisas el cementerio. Pondera evidencia negativa (historias de migración, notices de deprecación, issues sin resolver) MÁS que evidencia positiva — los fallos se sub-reportan.

## 4. Confirmation Bias Counter

**Contrarresta:** Buscar evidencia que confirma la hipótesis inicial mientras se ignora evidencia que la desmiente.

Después de formar tu recomendación inicial, dedica un ciclo completo de investigación buscando EN CONTRA de ella. Usa términos de búsqueda como "{tecnología} problems", "{tecnología} alternatives", "why not {tecnología}", "{tecnología} vs {competidor}". Para cada pieza de evidencia desconfirmante: (a) refútala con fuentes de mayor confianza, o (b) agrégala como caveat a tu recomendación. Si no encuentras NINGUNA crítica, tu búsqueda fue demasiado estrecha.

## 5. Steel Man

**Contrarresta:** Descartar enfoques alternativos sin darles su forma más fuerte posible.

Antes de recomendar en contra de una tecnología alternativa, construye su caso MÁS FUERTE posible. ¿Qué diría un defensor apasionado? ¿Qué casos de uso sirve mejor que tu recomendación? ¿Qué trade-offs la favorecen? Presenta la alternativa steel-manned junto a tu recomendación con comparación honesta. Si la alternativa es competitiva, señala la decisión como `[NEEDS DECISION]` en vez de hacer una recomendación unilateral.

---

## Cuándo NO Pensar

- **Decisiones ya tomadas** — Si el usuario ya decidió "usar librería X", no correr Steel Man en alternativas ni First Principles sobre la elección. Investiga cómo usar X bien, no si X es la elección correcta.
- **Lookups de stack estándar** — Si solo estás verificando la última versión de una librería conocida o leyendo sus API docs, no invocar Survivorship Bias ni Confirmation Bias Counter.
- **Fases de tecnología única** — Si la fase involucra una tecnología sin alternativas a evaluar, omitir modelos comparativos (Steel Man, Confirmation Bias Counter).
- **Investigación solo de codebase** — Si la investigación es puramente interna (entender patrones de código existente, encontrar dónde se llama una función), los modelos de razonamiento estructurado no agregan valor. Usa grep y lee el código.
