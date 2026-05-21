# Patrones de Prompt para Gates

> Referencia cargada bajo demanda vía `@yapu-ref-gate-prompts.md`.
> Patrones de prompt reutilizables para checks de gate estructurados en workflows y agentes.

---

## Reglas

- `header` debe ser máximo 12 caracteres
- `multiSelect` siempre es `false` para checks de gate
- Siempre manejar el caso "Other" (usuario escribió respuesta libre en vez de seleccionar)
- Máximo 4 opciones por prompt — si se necesitan más, usar flujo de 2 pasos

---

## 1. approve-revise-abort
Gate de 3 opciones para aprobación de planes, cierre de gaps.
- question: "Approve these {noun}?"
- header: "Approve?"
- options: Approve | Request changes | Abort

## 2. yes-no
Confirmación simple de 2 opciones para re-planificación, rebuild, reemplazar planes, commit.
- question: "{Specific question about the action}"
- header: "Confirm"
- options: Yes | No

## 3. stale-continue
Gate de frescura de 2 opciones para advertencias de obsolescencia.
- question: "{Artifact} may be outdated. Refresh or continue?"
- header: "Stale"
- options: Refresh | Continue anyway

## 4. yes-no-pick
Selección de 3 opciones para selección de seeds, inclusión de ítems.
- question: "Include {items} in planning?"
- header: "Include?"
- options: Yes, all | Let me pick | No

## 5. multi-option-failure
Handler de falla de 4 opciones para fallos de build.
- question: "Plan {id} failed. How should we proceed?"
- header: "Failed"
- options: Retry | Skip | Rollback | Abort

## 6. multi-option-escalation
Escalamiento de 4 opciones (max retries excedidos).
- question: "Phase {N} has failed verification {attempt} times. How should we proceed?"
- header: "Escalate"
- options: Accept gaps | Re-plan | Debug | Retry

## 7. multi-option-gaps
Handler de gaps de 4 opciones para gaps encontrados en revisión.
- question: "{count} verification gaps need attention. How should we proceed?"
- header: "Gaps"
- options: Auto-fix | Override | Manual | Skip

## 8. multi-option-priority
Selección de prioridad de 4 opciones para gaps de milestone.
- question: "Which gaps should we address?"
- header: "Priority"
- options: Must-fix only | Must + should | Everything | Let me pick

## 9. toggle-confirm
Confirmación de 2 opciones para habilitar/deshabilitar features booleanas.
- question: "Enable {feature_name}?"
- header: "Toggle"
- options: Enable | Disable

## 10. action-routing
Hasta 4 acciones sugeridas con selección (estado, resume workflows).
- question: "What would you like to do next?"
- header: "Next Step"
- options: {primary action} | {alternative 1} | {alternative 2} | Something else
- Nota: Generar opciones dinámicamente del estado del workflow. Siempre incluir "Something else" como última opción.

## 11. scope-confirm
Confirmación de 3 opciones para validación de alcance de tarea rápida.
- question: "This task looks complex. Proceed as quick task or use full planning?"
- header: "Scope"
- options: Quick task | Full plan | Revise

## 12. depth-select
Selección de profundidad de 3 opciones para preferencias de workflow de planificación.
- question: "How thorough should planning be?"
- header: "Depth"
- options: Quick (3-5 phases, skip research) | Standard (5-8 phases, default) | Comprehensive (8-12 phases, deep research)

## 13. context-handling
Handler de 3 opciones para CONTEXT.md existente en workflow de discusión.
- question: "Phase {N} already has a CONTEXT.md. How should we handle it?"
- header: "Context"
- options: Overwrite | Append | Cancel

## 14. gray-area-option
Template dinámico para presentar opciones de áreas grises en workflow de discusión.
- question: "{Gray area title}"
- header: "Decision"
- options: {Option 1} | {Option 2} | Let Claude decide
- Nota: Opciones generadas en runtime. Siempre incluir "Let Claude decide" como última opción.
