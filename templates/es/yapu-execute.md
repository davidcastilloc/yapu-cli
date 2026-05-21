# YAPU EXECUTION

---

## § Pre-Sync: Carga de Contexto Heredado

Antes de ejecutar cualquier acción de este workflow:

1. **Lee `.planning/STATE.md`** si existe → Identifica la fase activa, plan actual y progreso.
2. **Lee `.planning/HANDOFF.json`** si existe → Retoma el estado exacto de la sesión anterior.
3. **Lee `.planning/.continue-here.md`** si existe → Contexto humano de continuación.
4. **Lee `.planning/phases/{fase-activa}/CONTEXT.md`** si existe → Decisiones y contexto de la fase.

> Si `.planning/` no existe, solicita al usuario ejecutar `yapu init` antes de continuar.
> Si `HANDOFF.json` existe, DEBES leerlo y reportar al usuario el estado heredado antes de proceder.

---

Actúa en [MODO EJECUCIÓN].

Tu objetivo es ejecutar las tareas del plan en `STATE.md` de forma atómica, con commits por tarea y verificación inmediata. Cada tarea completada debe dejar el codebase en estado funcional.

> Carga profunda: `@yapu-thinking-execution.md`, `@yapu-ref-checkpoints.md`

## REGLA CERO: VERIFICACIÓN DE ESTADO

```
1. Lee STATE.md
2. Si el [ MODO DE OPERACIÓN ACTUAL ] NO es "PLANIFICADO" o "EJECUCIÓN":
   → ABORTA: "⚠️ Conflicto de estado. Modo actual: {modo}. Cambia la bandera en STATE.md o corre yapu-plan."
3. Si no hay tareas pendientes (todas [x]):
   → ABORTA: "✅ Todas las tareas completadas. Corre yapu-verify."
4. Actualiza modo a "EJECUCIÓN"
```

## INVARIANTE DE CLOSE-OUT ATÓMICO

Para cada tarea ejecutada, el único orden de cierre válido es:

```
código de producción → commit → marcar [x] en STATE.md
```

**Estado ilegal:** existe un commit de producción para una tarea pero STATE.md no la marca como completada. Si detectas esta condición al iniciar, repara el estado antes de continuar.

## FLUJO DE EJECUCIÓN POR TAREA

Para cada tarea pendiente `[ ]` en STATE.md, en orden:

### 1. Leer y comprender
- Lee la descripción de la tarea, output esperado y archivos involucrados
- Verifica que las dependencias están completadas

### 2. Implementar
- Haz cambios atómicos usando tus tools de escritura
- Sigue las convenciones detectadas en `PROJECT.md` o `.planning/codebase/CONVENTIONS.md`

### 3. Verificar inmediatamente
- Ejecuta el comando de verificación definido en la tarea
- Corre linter y tests relevantes:
  ```bash
  # Ejemplo — adapta al stack del proyecto
  npm test -- --related  # o pytest, go test, cargo test, etc.
  ```

### 4. Commit atómico
```bash
git add -A
git commit -m "yapu: T{N} - {descripción breve de la tarea}"
```

### 5. Marcar completada
- Cambia `[ ]` a `[x]` en STATE.md para esta tarea

### 6. Drift gate
- Si la tarea modificó archivos fuera del scope esperado, documéntalo como desviación en STATE.md

## NODE-REPAIR: CUANDO UNA TAREA FALLA

Si una tarea no pasa verificación, aplica esta escalera de reparación:

| Estrategia | Cuándo | Acción |
|-----------|--------|--------|
| **Retry** | Error menor, typo, import faltante | Corregir y re-verificar (máx 2 intentos) |
| **Decompose** | Tarea demasiado grande o compleja | Dividir en sub-tareas y ejecutar por partes |
| **Prune** | Feature no esencial que bloquea | Implementar versión mínima, documentar deuda |
| **Escalate** | Requiere decisión humana o info externa | PARAR, reportar al usuario con contexto preciso |

### Formato de escalamiento
```
🚨 BLOQUEADOR en T{N}: {nombre}
   Problema: {descripción precisa}
   Intentos: {qué probé y qué falló}
   Necesito: {decisión/info específica del usuario}
```

## DRIFT GATE (Post-Ejecución)

Al completar TODAS las tareas:

1. **Verifica coherencia final:**
   ```bash
   git log --oneline -10  # commits de esta sesión
   git diff --stat HEAD~{N}  # archivos tocados vs. plan
   ```

2. **Compara archivos tocados vs. plan original** — si hay archivos modificados no listados en el plan, documenta la desviación

3. **Actualiza STATE.md:**
   - Modo → "EJECUTADO"
   - Resumen de lo completado
   - Desviaciones documentadas (si las hay)

## REGLAS ESTRICTAS

- ✅ Un commit por tarea completada
- ✅ Tests pasan antes de marcar [x]
- ✅ Desviaciones documentadas explícitamente
- ❌ NUNCA marcar [x] sin verificación
- ❌ NUNCA hacer commits masivos multi-tarea
- ❌ NUNCA continuar si una dependencia falló
- ❌ NUNCA modificar ROADMAP.md durante ejecución


---

## § Post-Sync: Persistencia de Estado

Al completar la ejecución de este workflow:

1. **Actualiza `.planning/STATE.md`** con el progreso realizado:
   - Marca tareas completadas `[x]`
   - Actualiza la fase activa si cambió
   - Registra decisiones clave tomadas en esta sesión

2. **Escribe artifacts de la fase** según corresponda:
   - Si generaste un plan → `.planning/phases/{fase}/XX-YY-PLAN.md`
   - Si completaste ejecución → `.planning/phases/{fase}/XX-YY-SUMMARY.md`
   - Si generaste verificación → `.planning/phases/{fase}/XX-VERIFICATION.md`

3. **Genera `.planning/.continue-here.md`** con:
   - Qué se hizo en esta sesión
   - Qué queda pendiente
   - Blocking constraints (si hay)
   - Siguiente acción recomendada

4. **Elimina `.planning/HANDOFF.json`** si lo consumiste exitosamente.
