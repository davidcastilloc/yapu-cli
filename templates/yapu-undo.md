# YAPU REVERSIÓN SEGURA

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

Actúa en [ MODO REVERSIÓN SEGURA ].

Tu objetivo es revertir cambios de forma segura usando `git revert` — **JAMÁS `git reset`**. La historia se preserva siempre. Cada reversión pasa por un gate de confirmación y verificación de dependencias.

> Carga profunda: `@yapu-ref-git-integration.md`

## REGLA ABSOLUTA

```
╔══════════════════════════════════════════════╗
║  NUNCA usar git reset --hard                 ║
║  NUNCA usar git reset --soft (para revertir) ║
║  SIEMPRE usar git revert --no-commit         ║
║  SIEMPRE preservar historia                  ║
╚══════════════════════════════════════════════╝
```

**¿Por qué?** `git reset` destruye historia compartida. `git revert` crea un commit nuevo que deshace los cambios — trazable, auditable, reversible.

## MODOS DE USO

### `--last N` — Selección interactiva de commits recientes

```bash
git log --oneline --no-merges -${N:-10}
```

Filtrar commits que sigan formato convencional `type(scope): message`.

Mostrar lista numerada:
```
Commits recientes:
  1. abc1234 feat(04-01): implement auth endpoint
  2. def5678 docs(03-02): complete plan summary
  3. ghi9012 fix(02-03): correct validation logic

¿Cuáles revertir? (números separados por coma, o 'all')
```

### `--phase NN` — Revertir toda una fase

Buscar commits de la fase en el manifiesto o por git log:
```bash
# Primero: intentar .planning/.phase-manifest.json
# Fallback: buscar por scope en git log
git log --oneline --no-merges | grep -E "\(0*${NN}(-[0-9]+)?\):" | head -50
```

### `--plan NN-MM` — Revertir un plan específico

```bash
git log --oneline --no-merges | grep -E "\(${NN}-${MM}\)" | head -50
```

## FLUJO DE REVERSIÓN

### Paso 1: Reunir commits candidatos

Según el modo elegido, obtener lista de hashes.

Si no hay commits que coincidan: "No se encontraron commits para {target}. Verifica el número de fase/plan."

### Paso 2: Análisis de dependencias

**ANTES de revertir, verificar dependencias:**

```bash
# Para cada commit candidato, ver qué archivos toca
git diff-tree --no-commit-id --name-only -r {hash}
```

Detectar si commits posteriores (NO en la lista de reversión) dependen de archivos creados o modificados por los commits candidatos.

```
Dependency Analysis
─────────────────────────────
Commits a revertir: 3
Archivos afectados: 7

⚠️  Dependencias detectadas:
  - auth.js (creado en abc1234) es importado por routes.js (commit posterior xyz789)
  - middleware.js (modificado en def567) tiene cambios dependientes en ghi012

Opciones:
  1. Revertir todo (incluir dependientes)
  2. Revertir solo los commits seleccionados (puede romper build)
  3. Cancelar
```

### Paso 3: Gate de confirmación (OBLIGATORIO)

**Nunca revertir sin confirmación explícita del usuario.**

```
═══════════════════════════════════════
  CONFIRMACIÓN DE REVERSIÓN
═══════════════════════════════════════

Se revertirán {N} commits:
  1. abc1234 feat(04-01): implement auth endpoint
  2. def5678 docs(03-02): complete plan summary

Archivos que cambiarán:
  - src/auth.js (eliminado)
  - src/middleware.js (restaurado a versión anterior)
  - tests/auth.test.js (eliminado)

¿Proceder? [Sí, revertir] / [No, cancelar]
```

### Paso 4: Ejecutar reversión

```bash
# Revertir en orden inverso (más reciente primero)
for hash in $(echo "$COMMITS" | tac); do
  git revert --no-commit "$hash"
done

# Verificar que el resultado es coherente
# (build, tests básicos)

# Commit único con el revert
git commit -m "revert: undo {scope} ({N} commits)

Reverted commits:
- {hash1} {message1}
- {hash2} {message2}
"
```

### Paso 5: Actualizar estado

Si `.planning/STATE.md` existe:
- Actualizar tareas revertidas (marcar como `[ ]` de nuevo si aplica)
- Agregar nota de reversión en sección de historial

### Paso 6: Reportar

```
Reversión completada
─────────────────────────────
Commits revertidos: {N}
Commit de reversión: {nuevo_hash}
Archivos afectados: {M}
Build status: ✅ pasa | ⚠️ requiere atención
```

## ANTI-PATRONES

- ❌ **`git reset --hard`** — destruye historia, irrecuperable en branches compartidos
- ❌ **Revertir sin confirmar** — siempre gate de confirmación
- ❌ **Ignorar dependencias** — revertir un commit del que otros dependen rompe el build
- ❌ **Revertir commits de merge** — complejidad extra, requiere `-m 1` y análisis cuidadoso


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
