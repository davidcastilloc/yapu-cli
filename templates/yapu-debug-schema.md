# Schema: Sesión de Debug — Yapu

> Formato para `.planning/debug/[slug].md`
> Tracking de sesión de debug activa con disciplina append-only.

**Principio:** El archivo ES el cerebro de debugging. Yapu puede resumir perfectamente desde cualquier punto de interrupción.

## Plantilla

```markdown
---
status: gathering | investigating | fixing | verifying | awaiting_human_verify | resolved
trigger: "[input verbatim del usuario]"
created: [ISO timestamp]
updated: [ISO timestamp]
---

## Current Focus
<!-- SOBREESCRIBIR en cada actualización — siempre refleja AHORA -->

hypothesis: [teoría actual siendo testeada]
test: [cómo se está testeando]
expecting: [qué significa el resultado si true/false]
next_action: [siguiente paso inmediato — ser específico, NO "continuar investigando"]
reasoning_checkpoint: null  <!-- poblado antes de cada intento de fix -->
tdd_checkpoint: null        <!-- poblado cuando tdd_mode está activo -->

## Symptoms
<!-- Escrito durante gathering, luego INMUTABLE -->

expected: [qué debería pasar]
actual: [qué pasa realmente]
errors: [mensajes de error si hay]
reproduction: [cómo reproducir]
started: [cuándo se rompió / siempre roto]

## Eliminated
<!-- APPEND only — previene re-investigar después de /clear -->

- hypothesis: [teoría que estaba equivocada]
  evidence: [qué la refutó]
  timestamp: [cuándo se eliminó]

## Evidence
<!-- APPEND only — hechos descubiertos durante investigación -->

- timestamp: [cuándo se encontró]
  checked: [qué se examinó]
  found: [qué se observó]
  implication: [qué significa esto]

## Resolution
<!-- SOBREESCRIBIR conforme evoluciona el entendimiento -->

root_cause: [vacío hasta encontrar]
fix: [vacío hasta aplicar]
verification: [vacío hasta verificar]
files_changed: []
```

## Reglas por Sección

| Sección | Disciplina | Propósito |
|---------|-----------|-----------|
| `status` | OVERWRITE | Refleja fase actual del debug |
| `trigger` | IMMUTABLE | Input verbatim del usuario, nunca cambia |
| Current Focus | OVERWRITE | Siempre refleja qué está haciendo Yapu AHORA |
| Symptoms | IMMUTABLE | Punto de referencia de qué estamos arreglando |
| Eliminated | APPEND only | Previene re-investigar dead ends |
| Evidence | APPEND only | Construye el caso para root cause |
| Resolution | OVERWRITE | Se actualiza conforme se prueban fixes |

## Ciclo de Vida

```
gathering → investigating → fixing → verifying → awaiting_human_verify → resolved
                ↑                        |
                └── si verificación falla ┘
```

1. **Creación:** Trigger del input del usuario → status `gathering` → recopilar síntomas
2. **Investigación:** OVERWRITE Current Focus con cada hipótesis → APPEND Evidence → APPEND Eliminated si falla
3. **Fixing:** Confirmar root_cause → aplicar fix → actualizar Resolution
4. **Verificación:** Verificar automáticamente → si falla, volver a investigating
5. **Awaiting human:** Self-verification pasa → solicitar confirmación del usuario
6. **Resolución:** Usuario confirma → mover a `.planning/debug/resolved/`

## Comportamiento de Resume

Cuando Yapu lee este archivo después de pérdida de contexto:

1. Parse frontmatter → saber status
2. Leer Current Focus → saber exactamente qué estaba pasando
3. Leer Eliminated → saber qué NO reintentar
4. Leer Evidence → saber qué se ha aprendido
5. Continuar desde `next_action`

## Constraint de Tamaño

- Evidence entries: 1-2 líneas cada una, solo hechos
- Eliminated: breve — hipótesis + por qué falló
- Sin prosa narrativa — solo datos estructurados
- Si evidence crece mucho (10+ entries), verificar si hay ciclos
