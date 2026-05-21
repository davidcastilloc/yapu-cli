# Schema: Contexto de Discusión — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-CONTEXT.md`
> Captura decisiones de implementación para agentes downstream.

**Principio clave:** Las categorías NO son predefinidas. Emergen de lo que se discutió para ESTA fase.

**Consumidores downstream:**
- Investigador — Lee decisiones para enfocar research
- Planificador — Lee decisiones para crear tasks específicas
- Verificador — Usa acceptance criteria como checks pass/fail

## Plantilla

```markdown
# Fase [X]: [Nombre] — Contexto

**Recopilado:** [fecha]
**Status:** Ready for planning

<domain>
## Límite de Fase

[Declaración clara de qué entrega esta fase — el ancla de scope. Viene del ROADMAP.md y es fijo. La discusión clarifica implementación dentro de este límite.]
</domain>

<decisions>
## Decisiones de Implementación

### [Área 1 que se discutió]
- **D-01:** [Decisión específica tomada]
- **D-02:** [Otra decisión si aplica]

### [Área 2 que se discutió]
- **D-03:** [Decisión específica tomada]

### Discreción de Yapu
[Áreas donde el usuario dijo explícitamente "tú decides" — Yapu tiene flexibilidad aquí]
</decisions>

<specifics>
## Ideas Específicas

[Referencias particulares, ejemplos, o momentos de "lo quiero como X". Referencias de producto, comportamientos específicos, patrones de interacción.]

[Si no hay: "Sin requirements específicos — abierto a enfoques estándar"]
</specifics>

<canonical_refs>
## Referencias Canónicas

**Los agentes downstream DEBEN leer estas antes de planificar o implementar.**

[Listar cada spec, ADR, feature doc, o design doc con paths relativos completos. Agrupar por área temática.]

### [Área temática 1]
- `path/to/spec.md` — [Qué decide/define este doc]
- `path/to/doc.md` §N — [Sección específica y qué cubre]

### [Área temática 2]
- `path/to/feature-doc.md` — [Qué capability define]

[Si no hay specs externos: "Sin specs externos — requirements capturados completamente en decisiones arriba"]
</canonical_refs>

<code_context>
## Insights del Código Existente

### Assets Reutilizables
- [Componente/hook/utility]: [Cómo podría usarse en esta fase]

### Patrones Establecidos
- [Patrón]: [Cómo restringe/habilita esta fase]

### Puntos de Integración
- [Donde el código nuevo se conecta al sistema existente]
</code_context>

<deferred>
## Ideas Diferidas

[Ideas que surgieron durante la discusión pero pertenecen a otras fases. Capturadas para no perderlas, pero explícitamente fuera de scope.]

[Si no hay: "Ninguna — la discusión se mantuvo dentro del scope de la fase"]
</deferred>

---
*Fase: XX-name*
*Contexto recopilado: [fecha]*
```

## Guía de Contenido

**Buen contenido (decisiones concretas):**
- "Layout card-based, no timeline"
- "Retry 3 veces en fallo de red, luego fallar"
- "JSON para uso programático, tabla para humanos"

**Mal contenido (demasiado vago):**
- "Debería sentirse moderno y limpio"
- "Buena experiencia de usuario"
- "Rápido y responsivo"

**Sección canonical_refs es OBLIGATORIA.** Si no hay specs externos, decirlo explícitamente.
