# Taxonomía de Gates

> Referencia cargada bajo demanda vía `@yapu-ref-gates.md`.
> Tipos canónicos de gates usados en todos los workflows Yapu. Cada punto de validación mapea a uno de estos cuatro tipos.

---

## Tipos de Gate

### Pre-flight Gate
**Propósito:** Valida precondiciones antes de iniciar una operación.
**Comportamiento:** Bloquea entrada si condiciones no se cumplen. No se crea trabajo parcial.
**Recuperación:** Corregir la precondición faltante, luego reintentar.
**Ejemplos:**
- Fase de planificación verifica REQUIREMENTS.md antes de planificar
- Fase de ejecución valida que PLAN.md existe antes de ejecutar
- Fase de discusión confirma que la fase existe en ROADMAP.md

### Revision Gate
**Propósito:** Evalúa calidad del output y enruta a revisión si es insuficiente.
**Comportamiento:** Loop de vuelta al productor con feedback específico. Acotado por cap de iteraciones.
**Recuperación:** El productor atiende el feedback; el checker re-evalúa. El loop también escala tempranamente si el conteo de issues no disminuye entre iteraciones consecutivas (detección de estancamiento). Después de max iteraciones, escala incondicionalmente.
**Ejemplos:**
- Plan-checker revisando PLAN.md (máx 3 iteraciones)
- Verificador comprobando entregables de fase contra criterios de éxito

### Escalation Gate
**Propósito:** Presenta issues irresolubles al desarrollador para decisión.
**Comportamiento:** Pausa el workflow, presenta opciones, espera input humano.
**Recuperación:** El desarrollador elige acción; el workflow resume en la ruta seleccionada.
**Ejemplos:**
- Loop de revisión agotado después de 3 iteraciones
- Conflicto de merge durante limpieza de worktree
- Requerimiento ambiguo que necesita clarificación

### Abort Gate
**Propósito:** Termina la operación para prevenir daño o desperdicio.
**Comportamiento:** Detiene inmediatamente, preserva estado, reporta razón.
**Recuperación:** El desarrollador investiga causa raíz, corrige, reinicia desde checkpoint.
**Ejemplos:**
- Ventana de contexto críticamente baja durante ejecución
- STATE.md en estado de error bloqueando avance
- Verificación encuentra entregables críticos faltantes

---

## Matriz de Gates

| Workflow | Fase | Tipo de Gate | Artefactos Verificados | Comportamiento en Falla |
|----------|------|-------------|----------------------|------------------------|
| plan-phase | Entry | Pre-flight | REQUIREMENTS.md, ROADMAP.md | Bloquear con mensaje de archivo faltante |
| plan-phase | Revisión | Revision | Calidad de PLAN.md | Loop a planificador (máx 3) |
| plan-phase | Post-revisión | Escalation | Issues no resueltos | Presentar al desarrollador |
| execute-phase | Entry | Pre-flight | PLAN.md | Bloquear con mensaje de plan faltante |
| execute-phase | Completar | Revision | Completitud de SUMMARY.md | Re-ejecutar tareas incompletas |
| verify-work | Entry | Pre-flight | SUMMARY.md | Bloquear con mensaje de summary faltante |
| verify-work | Evaluación | Escalation | Criterios fallidos | Presentar gaps al desarrollador |
| next | Entry | Abort | Estado de error, checkpoints | Detener con diagnóstico |

---

## Implementando Gates

- **Pre-flight** gates pertenecen a puntos de entrada de workflows. Son checks baratos y determinísticos que previenen trabajo desperdiciado. Si puedes verificar una precondición con un check de existencia de archivo o lectura de config, usa un pre-flight gate.
- **Revision** gates pertenecen después de un paso productor donde la calidad varía. Siempre emparejar con un cap de iteraciones para prevenir loops infinitos. El cap debe reflejar el costo de cada iteración — operaciones costosas obtienen menos reintentos.
- **Escalation** gates pertenecen donde la resolución automática es imposible o ambigua. Son la válvula de seguridad entre revision loops y abort. Presentar al desarrollador opciones claras y contexto suficiente para decidir.
- **Abort** gates pertenecen a puntos donde continuar causaría daño, desperdiciaría recursos significativos, o produciría output sin sentido. Deben preservar estado para que el trabajo pueda resumirse después de corregir la causa raíz.

**Heurística de selección:** Empezar con pre-flight. Si el check ocurre después de producir trabajo, es un revision gate. Si el revision loop no puede resolver el issue, escalar. Si continuar es peligroso, abort.
