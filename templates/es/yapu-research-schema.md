# Schema: Research de Fase — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-RESEARCH.md`
> Research comprehensivo del ecosistema antes de planning, con mapa de responsabilidad arquitectónica.

**Propósito:** Documentar qué necesita saber Yapu para implementar bien una fase — no solo "qué librería" sino "cómo construyen esto los expertos."

## Plantilla

```markdown
# Fase [X]: [Nombre] — Research

**Investigado:** [fecha]
**Dominio:** [tecnología/dominio del problema principal]
**Confianza:** [HIGH/MEDIUM/LOW]

<user_constraints>
## Constraints del Usuario (de CONTEXT.md)

### Decisiones Locked
[Copiar de CONTEXT.md — estas son NON-NEGOTIABLE]
- [Decisión 1]
- [Decisión 2]

### Discreción de Yapu
[Áreas donde investigador/planner pueden elegir]
- [Área 1]

### Ideas Diferidas (OUT OF SCOPE)
[NO investigar ni planear estas]
- [Diferida 1]

[Si no existe CONTEXT.md: "Sin constraints del usuario — todas las decisiones a discreción de Yapu"]
</user_constraints>

<architectural_responsibility_map>
## Mapa de Responsabilidad Arquitectónica

Mapear cada capability de la fase a su tier arquitectónico antes de investigar frameworks.

| Capability | Tier Primario | Tier Secundario | Razonamiento |
|------------|--------------|-----------------|-------------|
| [capability] | [Browser/Client, Frontend Server, API/Backend, CDN/Static, Database/Storage] | [secondary o —] | [por qué este tier] |

[Si aplicación single-tier: "Aplicación single-tier — todas las capabilities residen en [tier]"]
</architectural_responsibility_map>

<research_summary>
## Resumen

[2-3 párrafos ejecutivos]
- Qué se investigó
- Cuál es el enfoque estándar
- Recomendaciones clave

**Recomendación principal:** [one-liner de guía actionable]
</research_summary>

<standard_stack>
## Stack Estándar

### Core
| Librería | Versión | Propósito | Por Qué Estándar |
|----------|---------|-----------|-------------------|
| [nombre] | [ver] | [qué hace] | [por qué la usan expertos] |

### Supporting
| Librería | Versión | Propósito | Cuándo Usar |
|----------|---------|-----------|-------------|
| [nombre] | [ver] | [qué hace] | [caso de uso] |

### Alternativas Consideradas
| En vez de | Podría Usar | Tradeoff |
|-----------|-------------|----------|
| [estándar] | [alternativa] | [cuándo la alternativa tiene sentido] |

**Instalación:**
\`\`\`bash
npm install [packages]
\`\`\`
</standard_stack>

<architecture_patterns>
## Patrones de Arquitectura

### Diagrama de Arquitectura del Sistema
[Diagrama mostrando flujo de datos, NO listados de archivos]

### Estructura de Proyecto Recomendada
\`\`\`
src/
├── [folder]/        # [propósito]
├── [folder]/        # [propósito]
└── [folder]/        # [propósito]
\`\`\`

### Patrón 1: [Nombre]
**Qué:** [descripción]
**Cuándo usar:** [condiciones]

### Anti-Patrones a Evitar
- **[Anti-patrón]:** [por qué es malo, qué hacer en su lugar]
</architecture_patterns>

<dont_hand_roll>
## No Construir a Mano

| Problema | No Construir | Usar En Su Lugar | Por Qué |
|----------|-------------|-------------------|---------|
| [problema] | [lo que construirías] | [librería] | [edge cases, complejidad] |
</dont_hand_roll>

---
*Fase: XX-name*
*Research completado: [fecha]*
```

## Secciones Clave

| Sección | Propósito |
|---------|-----------|
| User Constraints | Honrar decisiones locked de CONTEXT.md |
| Architectural Responsibility Map | Prevenir misassignment de tiers |
| Standard Stack | Librerías que usan los expertos, no las trendy |
| Don't Hand-Roll | Problemas que parecen simples pero tienen soluciones existentes |
| Anti-Patterns | Errores comunes que evitar |
