# Taxonomía de Artefactos Yapu

Todos los tipos de artefactos en la taxonomía de planificación. Cada tipo tiene forma, ciclo de vida, ubicación y mecanismo de consumo definidos. Un artefacto bien formateado que ningún workflow lee es inerte — el mecanismo de consumo es lo que le da significado.

---

## Artefactos Core

### ROADMAP.md
- **Forma**: Milestone + listado de fases con goals y refs canónicos
- **Ciclo de vida**: Creado → Actualizado por milestone → Archivado
- **Ubicación**: `.planning/ROADMAP.md`
- **Consumido por**: plan-phase, discuss-phase, execute-phase, progress, state

### STATE.md
- **Forma**: Tracker de posición actual (fase, plan, progreso, decisiones)
- **Ciclo de vida**: Actualizado continuamente durante el proyecto
- **Ubicación**: `.planning/STATE.md`
- **Consumido por**: Todos los workflows de orquestación; resume-project, progress, next

### REQUIREMENTS.md
- **Forma**: Criterios de aceptación numerados con tabla de trazabilidad
- **Ciclo de vida**: Creado al inicio → Actualizado conforme se satisfacen reqs
- **Ubicación**: `.planning/REQUIREMENTS.md`
- **Consumido por**: discuss-phase, plan-phase, generación de CONTEXT.md; executor marca como complete

### CONTEXT.md (por fase)
- **Forma**: Formato de 6 secciones: domain, decisions, canonical_refs, code_context, specifics, deferred
- **Ciclo de vida**: Creado antes de planificación → Usado durante planning/ejecución → Reemplazado por siguiente fase
- **Ubicación**: `.planning/phases/XX-name/XX-CONTEXT.md`
- **Consumido por**: plan-phase (lee decisions), execute-phase (lee code_context y canonical_refs)

### PLAN.md (por plan)
- **Forma**: Frontmatter + objective + tasks con tipos + success criteria + output spec
- **Ciclo de vida**: Creado por planificador → Ejecutado → SUMMARY.md producido
- **Ubicación**: `.planning/phases/XX-name/XX-YY-PLAN.md`
- **Consumido por**: Executor; commits referencian plan IDs

### SUMMARY.md (por plan)
- **Forma**: Frontmatter con dependency graph + narrativa + desviaciones + self-check
- **Ciclo de vida**: Creado al completar plan → Leído por planes subsecuentes
- **Ubicación**: `.planning/phases/XX-name/XX-YY-SUMMARY.md`
- **Consumido por**: Orquestador (progreso), planificador (contexto para planes futuros)

### HANDOFF.json / .continue-here.md
- **Forma**: Estado de pausa estructurado (JSON machine-readable + Markdown human-readable)
- **Ciclo de vida**: Creado en pausa → Consumido en resume → Reemplazado en siguiente pausa
- **Ubicación**: `.planning/HANDOFF.json` + `.planning/phases/XX-name/.continue-here.md`
- **Consumido por**: resume-project workflow

---

## Artefactos Extendidos

### DISCUSSION-LOG.md (por fase)
- **Forma**: Audit trail de suposiciones y correcciones de discuss-phase
- **Ciclo de vida**: Creado en discusión → Registro read-only
- **Ubicación**: `.planning/phases/XX-name/XX-DISCUSSION-LOG.md`
- **Consumido por**: Revisión humana; no leído por workflows automatizados

### VERIFICATION.md (por fase)
- **Forma**: Resultados de verificación con gaps y deferred items
- **Ciclo de vida**: Creado post-ejecución → Input para gap closure si hay gaps
- **Ubicación**: `.planning/phases/XX-name/XX-VERIFICATION.md`
- **Consumido por**: Gap closure mode, orquestador para decisiones

### SPIKE.md / DESIGN.md (por spike)
- **Forma**: Pregunta de investigación + metodología + hallazgos + recomendación
- **Ciclo de vida**: Creado → Investigado → Decidido → Archivado
- **Ubicación**: `.planning/spikes/SPIKE-NNN/`
- **Consumido por**: Planificador cuando el spike es referenciado

---

## Artefactos de Referencia Permanente

### METHODOLOGY.md
- **Forma**: Referencia permanente — frameworks interpretativos (lenses) reutilizables que aplican entre fases
- **Ciclo de vida**: Creado → Activo → Reemplazado (cuando un lens se sustituye por uno mejor)
- **Ubicación**: `.planning/METHODOLOGY.md` (project-scoped, no phase-scoped)
- **Contenido**: Lenses nombrados, cada uno documenta:
  - Qué diagnostica (clase de problema que detecta)
  - Qué recomienda (clase de respuesta que prescribe)
  - Cuándo aplicar (condiciones trigger)

**Por qué importa el consumo:** Un METHODOLOGY.md que ningún workflow lee es inerte. Los lenses solo surten efecto cuando un agente los carga en su contexto de razonamiento antes del análisis.

### Ejemplo de lens entry

```markdown
## Bayesian Updating

**Diagnostica:** Decisiones tomadas con priors obsoletos — suposiciones formadas temprano que la evidencia contradijo, pero que permanecen en el plan.

**Recomienda:** Antes de confirmar una suposición, preguntar: "¿Qué evidencia me haría cambiar esto?" Si ninguna evidencia podría cambiarlo, es una creencia, no una suposición.

**Aplicar cuando:** Cualquier suposición lleva label Confident pero se formó antes de cambios arquitectónicos recientes.
```
