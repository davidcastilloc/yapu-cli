# Ejemplos de Calibración: Plan Checker

Ejemplos positivos/negativos para calibrar el plan-checker. Muestran el nivel de evidencia y precisión esperados.

---

## Ejemplos Positivos

### Ejemplo 1: BLOCKER por acción vaga sin nombres de archivo ni función

**Input:** Task del plan con action: "Implement the authentication feature for the API routes."

**Output:**

> ```yaml
> issues:
>   - dimension: task_completeness
>     severity: BLOCKER
>     finding: "Task T1 action says 'implement the authentication feature' without naming target files, functions to create, or middleware to apply. Executor cannot determine what to build."
>     affected_field: "<action>"
>     suggested_fix: "Specify: create authMiddleware in src/middleware/auth.js, apply to routes in src/routes/api.js lines 12-45, verify with integration test"
> ```

**Por qué es bueno:** El checker citó la dimensión específica (task_completeness), citó el texto problemático, explicó por qué es blocker (executor no puede determinar qué construir), y dio un fix concreto con paths de archivo y nombres de función. El finding es accionable.

### Ejemplo 2: BLOCKER por conflicto de archivos en la misma wave

**Input:** Dos planes en wave 1 — Plan 01 modifica `workflows/execute-phase.md`, Plan 02 también modifica `workflows/execute-phase.md`. Sin `depends_on` declarado.

**Output:**

> ```yaml
> issues:
>   - dimension: dependency_correctness
>     severity: BLOCKER
>     finding: "Plans 01 and 02 both modify workflows/execute-phase.md in wave 1 with no depends_on relationship. Concurrent execution will cause merge conflicts or lost changes."
>     affected_field: "files_modified"
>     suggested_fix: "Either move Plan 02 to wave 2 with depends_on: ['01'] or consolidate the file changes into a single plan"
> ```

**Por qué es bueno:** El checker identificó un problema estructural real — dos planes modificando el mismo archivo en la misma wave sin relación de dependencia. Citó dependency_correctness, nombró ambos planes, el archivo en conflicto, y proveyó dos fixes alternativos.

---

## Ejemplos Negativos

### Ejemplo 1: Todas las dimensiones pasan cuando faltan comandos verify

**Input:** Plan con 3 tasks. Task T2 tiene `<verify></verify>` (vacío). Task T3 tiene `<verify>echo "done"</verify>` (trivial, no distingue pass de fail).

**Output:**

> ## CHECK PASSED
> Plans: 1 | Tasks: 3 | Dimensions: 10 | Issues: 0

**Por qué es malo:** El checker omitió dos violaciones. verification_derivation requiere que comandos verify sean ejecutables y testeen output real — un verify block vacío es BLOCKER. `echo "done"` siempre retorna 0 sin importar el estado de implementación. Ambos debieron flaggearse.

### Ejemplo 2: Falso positivo INFO para un plan correctamente dimensionado

**Input:** Plan con 3 tasks, 6 archivos únicos, 1 dependencia. Todo dentro de límites.

**Output:**

> ```yaml
> issues:
>   - dimension: scope_sanity
>     severity: INFO
>     finding: "Plan has 3 tasks -- consider splitting into smaller plans for faster iteration"
>     affected_field: "task count"
>     suggested_fix: "Split tasks into separate plans"
> ```

**Por qué es malo:** El checker flaggeó un no-issue. scope_sanity permite 2-3 tasks por plan — 3 tasks está dentro de los límites. El checker aplicó preferencia personal ("smaller is better") en vez del threshold documentado. Esto desperdicia tiempo del planificador en falsos positivos y erosiona la confianza en el juicio del checker.
