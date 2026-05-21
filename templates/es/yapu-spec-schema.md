# Schema: Especificación de Fase — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-SPEC.md`
> Lockea requirements antes de discuss-phase, con scoring de ambigüedad.

**Principio clave:** Cada requirement debe ser falsificable — puedes escribir un test o check que pruebe que se cumplió o no. Requirements vagos como "mejorar performance" no son permitidos.

**Consumidores downstream:**
- `discuss-phase` — Lee SPEC.md al inicio; trata Requirements y Boundaries como locked
- Planificador — Lee requirements locked para restringir scope del plan
- Verificador — Usa acceptance criteria como checks pass/fail explícitos

## Plantilla

```markdown
# Fase [X]: [Nombre] — Especificación

**Creado:** [fecha]
**Ambiguity score:** [score] (gate: ≤ 0.20)
**Requirements:** [N] locked

## Goal

[Una oración precisa — específica y medible. NO "mejorar X" — sino "X cambia de A a B".]

## Background

[Estado actual del codebase — qué existe hoy, qué está roto o faltando, qué dispara este trabajo. Basado en realidad del código, no descripción abstracta.]

## Requirements

1. **[Label corto]**: [Declaración específica, testeable.]
   - Current: [qué existe o NO existe hoy]
   - Target: [en qué debe convertirse después de esta fase]
   - Acceptance: [check pass/fail concreto — cómo un verificador confirma que se cumplió]

2. **[Label corto]**: [Declaración específica, testeable.]
   - Current: [qué existe hoy]
   - Target: [qué debe ser]
   - Acceptance: [check pass/fail concreto]

## Boundaries

**In scope:**
- [Lista explícita de qué produce esta fase]
- [Cada item es un deliverable o comportamiento concreto]

**Out of scope:**
- [Qué NO hace esta fase] — [razón breve]
- [Problemas adyacentes excluidos] — [razón breve]

## Constraints

[Performance, compatibilidad, volumen de datos, dependencias, plataforma.
Si no hay: "Sin constraints adicionales más allá de convenciones estándar del proyecto."]

## Acceptance Criteria

- [ ] [Criterio pass/fail — unambiguo, verificable]
- [ ] [Criterio pass/fail]
- [ ] [Criterio pass/fail]

[Cada criterio debe ser un checkbox que resuelve a PASS o FAIL.
Nada de "debería sentirse bien", "se ve razonable", o "generalmente funciona".]

## Ambiguity Report

| Dimensión | Score | Mín | Status | Notas |
|-----------|-------|-----|--------|-------|
| Goal Clarity | | 0.75 | | |
| Boundary Clarity | | 0.70 | | |
| Constraint Clarity | | 0.65 | | |
| Acceptance Criteria | | 0.70 | | |
| **Ambiguity** | | ≤0.20 | | |

Status: ✓ = cumple mínimo, ⚠ = bajo mínimo (planner trata como assumption)

## Interview Log

[Decisiones clave durante la entrevista Socrática.]

| Ronda | Perspectiva | Resumen de pregunta | Decisión locked |
|-------|------------|---------------------|-----------------|
| 1 | Investigador | [qué se preguntó] | [qué se decidió] |
| 2 | Simplificador | [qué se preguntó] | [qué se decidió] |
| 3 | Boundary Keeper | [qué se preguntó] | [qué se decidió] |

---
*Fase: [XX-name]*
*Spec creado: [fecha]*
```

## Rúbrica de Ambiguity Scoring

| Dimensión | 0.0 (máx ambigüedad) | 0.5 | 1.0 (cristalino) |
|-----------|----------------------|-----|-------------------|
| Goal Clarity | "Mejorar la app" | "Agregar auth" | "Users se registran con email/password, reciben verificación, pueden resetear password" |
| Boundary Clarity | Sin boundaries | Boundaries parciales | In/out scope explícitos con razones |
| Constraint Clarity | Sin constraints mencionados | Algunos límites implícitos | Cada constraint con tipo + valor + razón |
| Acceptance Criteria | "Debería funcionar" | Checkboxes genéricos | Cada criterio es check pass/fail con valores concretos |

**Gate:** Ambiguity score ≤ 0.20 para proceder. Si > 0.20, se necesitan más preguntas de clarificación.
