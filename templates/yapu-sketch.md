# YAPU EXPLORACIÓN Y PROTOTIPADO

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

Actúa en [MODO EXPLORACIÓN Y PROTOTIPADO].

Tu objetivo es explorar ideas a través de dos sub-modos: (1) Sketch para mockups HTML desechables con variantes comparables, (2) Spike para experimentos técnicos enfocados con validación Given/When/Then. Ambos soportan modo frontier ("¿qué debería explorar?").

---

## SUB-MODO 1: SKETCH — Mockups HTML Desechables

Explora direcciones de diseño a través de mockups HTML throwaway antes de comprometerse con la implementación. Cada sketch produce 2-3 variantes para comparación.

### Paso 1: Routing

Parsear argumentos:
- `--quick` → saltar intake de mood, ir directo
- `frontier` o vacío → **MODO FRONTIER** (ver abajo)
- Cualquier otro texto → la idea de diseño a sketchar

### Paso 2: Mood Intake (si no es --quick)

Explorar la intención de diseño con 3 preguntas (una a la vez):

1. **Feel:** "¿Cómo debería sentirse? Dame adjetivos, emociones, o un vibe."
2. **Referencias:** "¿Qué apps o sitios tienen un feel similar a lo que imaginás?"
3. **Acción core:** "¿Cuál es la acción más importante que un usuario hace aquí?"

Reflejar brevemente después de cada respuesta. Proceder solo cuando el usuario diga go.

### Paso 3: Setup

```bash
mkdir -p .planning/sketches/themes
ls -d .planning/sketches/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1  # próximo número
```

### Paso 4: Descomponer en Design Questions

Romper la idea en 2-5 preguntas de diseño:

| Sketch | Pregunta de Diseño | Approach | Riesgo |
|--------|-------------------|----------|--------|
| 001 | ¿Layout sidebar o top-nav? | Dos variantes | Afecta toda la navegación |
| 002 | ¿Cards o table para data? | Tres variantes | Densidad de información |

### Paso 5: Construir Variantes

Para cada sketch, generar **2-3 variantes** como archivos HTML standalone:

```
.planning/sketches/001-layout/
├── README.md          # Pregunta de diseño, variantes, winner
├── variant-a.html     # Sidebar layout
├── variant-b.html     # Top-nav layout
└── variant-c.html     # Hybrid (opcional)
```

**Reglas de construcción HTML:**
- **Standalone** — un solo archivo .html, sin dependencias externas
- **Tab switching** — incluir tabs en la parte superior para navegar entre variantes sin cambiar de archivo
- **Theme system** — CSS custom properties para dark/light mode toggle
- **Interactividad** — hover states, transitions, click handlers básicos con vanilla JS
- **Datos realistas** — usar nombres, números y contenido plausible, no lorem ipsum

### Paso 6: README por Sketch

```markdown
## Sketch 001: {nombre}

**Pregunta de diseño:** {pregunta}
**Variantes:** A ({descripción}), B ({descripción}), C ({descripción})

### Decisión
**Winner:** {variante elegida por el usuario}
**Razón:** {por qué}
**Tags:** #layout #navigation
```

### Paso 7: Wrap-Up

Consolidar decisiones de diseño en `.planning/sketches/MANIFEST.md`:

```markdown
## Design Manifest

| # | Sketch | Winner | Design Decision |
|---|--------|--------|----------------|
| 001 | Layout | B | Top-nav para coherencia mobile-first |
| 002 | Data display | A | Cards para mejor scannability |
```

---

## SUB-MODO 2: SPIKE — Experimentos Técnicos Enfocados

Explorar factibilidad técnica a través de experimentos enfocados. Producir conocimiento verificado para el build real.

### Paso 1: Routing

- `frontier` o vacío → **MODO FRONTIER** (ver abajo)
- `--quick` → saltar intake, ir directo
- Cualquier texto → la idea a spikear

### Paso 2: Setup

```bash
mkdir -p .planning/spikes
ls -d .planning/spikes/[0-9][0-9][0-9]-* 2>/dev/null | sort | tail -1  # próximo número
```

### Paso 3: Definir Spike con Given/When/Then

Para cada spike, definir la validación antes de construir:

```markdown
## Spike 001: {nombre}

**Pregunta:** ¿Es factible {X}?
**Riesgo de integración:** {alto/medio/bajo}

### Validación
- **Given:** {precondiciones}
- **When:** {acción/experimento}
- **Then:** {resultado esperado que prueba factibilidad}

### Veredicto
- **VALIDATED** — funciona como se esperaba
- **PARTIAL** — funciona con limitaciones: {cuáles}
- **INVALIDATED** — no funciona: {por qué y alternativa}
```

### Paso 4: Ejecutar Spike

1. **Research** — investigar approach antes de escribir código
2. **Build** — implementar el mínimo necesario para validar
3. **Test** — ejecutar el Given/When/Then definido
4. **Document** — registrar resultado con evidencia

### Paso 5: Análisis de Riesgo de Integración

Después de cada spike, evaluar:

| Riesgo | Pregunta |
|--------|----------|
| Recursos compartidos | ¿Comparte APIs, DB o state con otros spikes? |
| Data handoffs | ¿Produce output que otro componente consume? |
| Timing | ¿Tiene dependencias de secuencia? |
| Contención | ¿Compite por connections, rate limits, memoria? |

---

## MODO FRONTIER (compartido Sketch + Spike)

Cuando no hay argumento o se pasa `frontier` / `"¿qué debería explorar?"`:

### Para Sketches — Analizar Landscape de Diseño

1. Leer `.planning/sketches/MANIFEST.md` + todos los READMEs
2. Buscar:
   - **Gaps de consistencia visual** — dos sketches hicieron elecciones independientes no testeadas juntas
   - **Combinaciones de estado** — estados individuales validados pero no en secuencia
   - **Gaps responsive** — validado en un viewport, falta probar otros
   - **Coherencia de theme** — componentes individuales OK pero no compuestos en full-page

3. Buscar fronteras:
   - Screens no-sketcheados asumidos pero inexplorados
   - Patrones de interacción (transitions, loading, drag-and-drop)
   - UI de edge cases (0 ítems, 1000 ítems, errores, conexión lenta)
   - Direcciones alternativas para sketches "fine but not great"

### Para Spikes — Analizar Landscape Técnico

1. Leer `.planning/spikes/MANIFEST.md` + READMEs + `CONVENTIONS.md`
2. Buscar **integration spikes**:
   - Spikes que tocan el mismo API/DB pero testeados independientemente
   - Data handoffs asumidos compatibles pero nunca probados
   - Dependencias de timing en el flow real
   - Contención de recursos cuando se combinan

3. Buscar **frontier spikes**:
   - Capabilities asumidas pero no probadas
   - Dependencias descubiertas que revelan nuevas preguntas
   - Approaches alternativos para spikes PARTIAL o INVALIDATED
   - Capabilities adyacentes que mejorarían la idea

### Presentar y Ejecutar

Proponer candidates concretos (con nombre, pregunta, riesgo), preguntar cuáles ejecutar, y proceder directamente al build.

---

## ANTI-PATTERNS

- ❌ Mockups con dependencias externas — siempre standalone HTML
- ❌ Lorem ipsum — usar datos realistas siempre
- ❌ Spikes sin Given/When/Then — definir validación ANTES de construir
- ❌ Explorar sin registrar — todo queda en MANIFEST.md
- ❌ Frontier mode sin landscape existente — necesita sketches/spikes previos para analizar
- ❌ Validar spike como VALIDATED sin ejecutar el Then — requiere evidencia ejecutable


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
