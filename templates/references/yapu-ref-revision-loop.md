# Patrón de Loop de Revisión

> Referencia cargada bajo demanda vía `@yapu-ref-revision-loop.md`.
> Patrón estándar para revisión iterativa de agentes con feedback. Usado cuando un checker/validator encuentra issues y el agente productor necesita revisar su output.

---

## Patrón: Check-Revise-Escalate (máx 3 iteraciones)

Este patrón aplica cuando:
1. Un agente produce output (planes, imports, planes de cierre de gaps)
2. Un checker/validator evalúa ese output
3. Se encuentran issues que necesitan revisión

### Flujo

```
prev_issue_count = Infinity
iteration = 0

LOOP:
  1. Ejecutar checker/validator en output actual
  2. Leer resultados del checker
  3. Si PASSED o solo issues nivel INFO:
     -> Aceptar output, salir del loop
  4. Si issues BLOCKER o WARNING encontrados:
     a. iteration += 1
     b. Si iteration > 3:
        -> Escalar al usuario (ver "Después de 3 Iteraciones")
     c. Parsear conteo de issues del output del checker
     d. Si issue_count >= prev_issue_count:
        -> Escalar al usuario: "Revision loop stalled (issue count not decreasing)"
     e. prev_issue_count = issue_count
     f. Re-spawn el agente productor con feedback del checker adjuntado
     g. Después de revisión, ir a LOOP
```

### Tracking de Issue Count

Trackear el número de BLOCKER + WARNING issues retornados por el checker en cada iteración. Si el conteo no disminuye entre iteraciones consecutivas, el agente productor está estancado y más iteraciones no ayudarán. Cortar temprano y escalar al usuario.

Mostrar progreso de iteración antes de cada re-spawn de revisión:
`Revision iteration {N}/3 -- {blocker_count} blockers, {warning_count} warnings`

### Estructura del Prompt de Re-spawn

Al re-spawnear el agente productor para revisión, pasar los issues del checker en formato YAML:

```
<checker_issues>
Los issues abajo están en formato YAML. Cada uno tiene: dimension, severity, finding,
affected_field, suggested_fix. Atender TODOS los issues BLOCKER. Atender issues WARNING
donde sea factible.

{YAML issues block del output del checker — pasado textualmente}
</checker_issues>

<revision_instructions>
Atender TODOS los issues BLOCKER y WARNING identificados arriba.
- Para cada BLOCKER: hacer el cambio requerido
- Para cada WARNING: atender o explicar por qué es aceptable
- NO introducir nuevos issues mientras se corrigen los existentes
- Preservar todo contenido no señalado por el checker
Esta es iteración de revisión {N} de máx 3. Iteración previa tenía {prev_count}
issues. Debe reducir el conteo o el loop terminará.
</revision_instructions>
```

### Después de 3 Iteraciones

Si issues persisten después de 3 ciclos de revisión:

1. Presentar issues restantes al usuario
2. Usar gate prompt (pattern: yes-no de `@yapu-ref-gate-prompts.md`):
   - question: "Issues remain after 3 revision attempts. Proceed with current output?"
   - header: "Proceed?"
   - options:
     - label: "Proceed anyway" — description: "Accept output with remaining issues"
     - label: "Adjust approach" — description: "Discuss a different approach"
3. Si "Proceed anyway": aceptar output actual y continuar
4. Si "Adjust approach" u "Other": discutir con usuario, luego re-entrar al paso productor con contexto actualizado

### Variaciones por Workflow

| Workflow | Agente Productor | Agente Checker | Notas |
|----------|-----------------|----------------|-------|
| plan-phase | yapu-planner | yapu-plan-checker | Prompt de revisión vía planner-revision |
| execute-phase | yapu-executor | yapu-verifier | Verificación post-ejecución |
| discuss-phase | orchestrator | yapu-plan-checker | Revisión inline por orquestador |

---

## Notas Importantes

- **Issues nivel INFO siempre son aceptables** — no disparan revisión
- **Cada iteración obtiene un spawn fresco de agente** — no intentar continuar en el mismo contexto
- **Feedback del checker debe ser inlined** — el agente de revisión necesita ver exactamente qué falló
- **No tragarse issues silenciosamente** — siempre presentar el estado final al usuario después de salir del loop
