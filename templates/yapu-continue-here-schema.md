# Schema: Session Resume — Yapu

> Formato para `.planning/phases/XX-name/.continue-here.md`
> Artefacto de resume de sesión con `decisions_made` para prevenir re-debate.

**Este archivo se ELIMINA después de resume — no es almacenamiento permanente.**

## Plantilla

```markdown
---
phase: XX-name
task: 3
total_tasks: 7
status: in_progress | blocked | almost_done
last_updated: YYYY-MM-DDTHH:MM:SSZ
---

<current_state>
[¿Dónde exactamente estamos? ¿Cuál es el contexto inmediato?]
</current_state>

<completed_work>
[Qué se completó esta sesión — ser específico]

- Task 1: [nombre] — Done
- Task 2: [nombre] — Done
- Task 3: [nombre] — In progress, [qué se hizo]
</completed_work>

<remaining_work>
[Qué queda en esta fase]

- Task 3: [nombre] — [qué falta]
- Task 4: [nombre] — Not started
- Task 5: [nombre] — Not started
</remaining_work>

<decisions_made>
[Decisiones clave y por qué — para que la próxima sesión NO re-debata]

- Decidimos usar [X] porque [razón]
- Elegimos [approach] sobre [alternativa] porque [razón]
</decisions_made>

<blockers>
[Algo atorado o esperando factores externos]

- [Blocker 1]: [status/workaround]
</blockers>

<context>
[Estado mental, "vibe", cualquier cosa que ayude a resumir suavemente]

[¿En qué estabas pensando? ¿Cuál era el plan?
Este es el contexto de "retoma exactamente donde te quedaste".]
</context>

<next_action>
[La primera cosa que hacer al resumir]

Empezar con: [acción específica]
</next_action>
```

## Campos del Frontmatter

| Campo | Propósito |
|-------|-----------|
| `phase` | Nombre del directorio (ej: `02-authentication`) |
| `task` | Número de task actual |
| `total_tasks` | Cuántas tasks en la fase |
| `status` | `in_progress`, `blocked`, `almost_done` |
| `last_updated` | ISO timestamp |

## Guías

- **Ser específico** para que una instancia fresca de Yapu entienda inmediatamente
- Incluir **POR QUÉ** se tomaron decisiones, no solo qué
- `<decisions_made>` es CRÍTICO — previene loops de re-debate
- `<next_action>` debe ser actionable sin leer nada más
- Este archivo se **ELIMINA** después de resume exitoso
