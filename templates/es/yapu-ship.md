# YAPU ENVÍO Y PR

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

Actúa en [ MODO ENVÍO Y PR ].

Tu objetivo es crear un Pull Request limpio en GitHub a partir de trabajo completado. Verifica precondiciones, genera PR body rico desde artefactos de planificación, y filtra archivos transientes para que los reviewers vean solo lo relevante.

> Carga profunda: `@yapu-ref-git-integration.md`

## FLUJO DE ENVÍO

### Paso 1: Inicializar

Detectar rama base para PRs:
```bash
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|^refs/remotes/origin/||')
BASE_BRANCH="${BASE_BRANCH:-main}"
CURRENT_BRANCH=$(git branch --show-current)
```

### Paso 2: Preflight Checks (todos deben pasar)

| Check | Comando | Si falla |
|-------|---------|----------|
| **Verificación pasó** | Buscar `status: pass` en `*-VERIFICATION.md` | ⛔ Bloquear — completar verificación primero |
| **Working tree limpio** | `git status --short` | ⚠️ Pedir commit o stash |
| **En feature branch** | `$CURRENT_BRANCH != $BASE_BRANCH` | ⚠️ Advertir — debería estar en feature branch |
| **Remote configurado** | `git remote -v` | ⛔ Error — no se puede crear PR sin remote |
| **`gh` CLI disponible** | `which gh && gh auth status` | ⛔ Dar instrucciones de setup |

```
Preflight Results
─────────────────────────────
✅ Verificación: pass
✅ Working tree: clean
✅ Branch: feature/auth-system
✅ Remote: origin → github.com/user/repo
✅ gh CLI: authenticated
─────────────────────────────
```

**Si algún check crítico (⛔) falla → DETENER y reportar cómo resolver.**

### Paso 3: Push branch

```bash
git push origin ${CURRENT_BRANCH} 2>&1
# Si falla:
git push --set-upstream origin ${CURRENT_BRANCH} 2>&1
```

Reportar: "Pushed `{branch}` ({N} commits ahead of `{BASE_BRANCH}`)"

### Paso 4: Generar PR Body

Auto-generar desde artefactos de planificación:

**Título:**
```
Phase {N}: {nombre de la fase}
```

**Body estructura:**
```markdown
## Resumen
{Objetivo de la fase desde ROADMAP.md}

## Cambios realizados
{Lista de tareas completadas desde STATE.md / SUMMARY.md}

## Verificación
{Status desde VERIFICATION.md — pass/fail + detalles}

## Tests
{Tests ejecutados y resultados}

## Archivos modificados
{Lista agrupada por componente}
```

### Paso 5: Filtrar archivos transientes (PR Branch limpio)

Clasificar commits para crear una rama PR limpia:

**Archivos ESTRUCTURALES (se incluyen en PR):**
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/MILESTONES.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/milestones/**`

**Archivos TRANSIENTES (se excluyen del PR):**
- `.planning/phases/**` (PLAN.md, SUMMARY.md, CONTEXT.md, RESEARCH.md)
- `.planning/quick/**`
- `.planning/research/**`
- `.planning/debug/**`
- `.planning/seeds/**`
- `.planning/todos/**`

**Clasificación de commits:**
| Tipo | ¿Incluir? |
|------|-----------|
| **Commits de código** (tocan archivos fuera de `.planning/`) | ✅ Sí |
| **Commits estructurales** (solo STATE/ROADMAP/PROJECT) | ✅ Sí |
| **Commits transientes** (solo archivos de fases/debug/quick) | ❌ No |
| **Commits mixtos** (código + planning) | ✅ Sí (lo transiente viene junto) |

**Crear rama PR filtrada:**
```bash
PR_BRANCH="${CURRENT_BRANCH}-pr"
git checkout -b "$PR_BRANCH" "$BASE_BRANCH"
# Cherry-pick solo commits incluidos
git cherry-pick {hash-1} {hash-2} ...
```

### Paso 6: Crear PR

```bash
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$PR_BRANCH" \
  --title "{título generado}" \
  --body "{body generado}"
```

Mostrar resultado:
```
PR creado: {URL}
Branch: {PR_BRANCH} → {BASE_BRANCH}
Commits: {N} (de {M} total, {M-N} transientes filtrados)
```

## ANTI-PATRONES

- ❌ **Enviar sin verificación** — SIEMPRE requiere verification pass
- ❌ **PR con artefactos transientes** — PLAN.md, SUMMARY.md son ruido para reviewers
- ❌ **Push a main** — siempre feature branch → PR → merge
- ❌ **PR body vacío** — los artefactos de planificación existen para esto, úsalos


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
