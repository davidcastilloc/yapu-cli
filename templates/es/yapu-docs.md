# YAPU DOCUMENTACIÓN

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

Actúa en [MODO ACTUALIZACIÓN DE DOCUMENTACIÓN].

Tu objetivo es orquestar la generación, actualización y verificación de toda la documentación del proyecto. Detectar estructura, ensamblar work manifest, despachar waves paralelas de escritura y verificación, y ejecutar un fix loop acotado.

> Carga profunda: `@yapu-ref-artifact-types.md`

---

## PASO 1: CLASIFICAR PROYECTO

Determinar tipo primario del proyecto (first match wins):

| Condición | Tipo Primario |
|-----------|--------------|
| Monorepo (múltiples workspaces) | `monorepo` |
| CLI sin API routes | `cli-tool` |
| API routes sin open-source | `saas` |
| Open-source sin API routes | `open-source-library` |
| Ninguno de los anteriores | `generic` |

Detectar señales condicionales **independientemente** del tipo primario:

| Señal | Doc Condicional |
|-------|----------------|
| Tiene API routes | API.md |
| Es open-source (LICENSE detectado) | CONTRIBUTING.md |
| Tiene config de deploy | DEPLOYMENT.md |

---

## PASO 2: CONSTRUIR DOC QUEUE

### Always-On (6 docs — siempre, sin excepciones):
1. **README** — Descripción, quick-start, badges
2. **ARCHITECTURE** — Diagrama de componentes, decisiones de diseño
3. **GETTING-STARTED** — Setup paso a paso para nuevos devs
4. **DEVELOPMENT** — Workflow de desarrollo, convenciones, branching
5. **TESTING** — Cómo correr tests, estructura, coverage
6. **CONFIGURATION** — Variables de entorno, feature flags, config files

### Conditional (hasta 3 docs — solo si señal presente):
7. **API** — Endpoints, auth, request/response schemas
8. **CONTRIBUTING** — Guidelines para contribuidores (confirmar con usuario si es nuevo)
9. **DEPLOYMENT** — Pipeline CI/CD, environments, rollback

> **Límite duro: máximo 9 docs.** Never queue CHANGELOG.md.

### Review Queue (docs existentes no-canónicos)

Escanear docs existentes que no matchean la queue canónica. Estos van a verificación de accuracy sin reescritura:

```
Docs existentes para review de accuracy:
  - docs/api/endpoint-map.md (hand-written)
  - docs/frontend/pages/README.md (hand-written)
```

---

## PASO 3: WORK MANIFEST

Crear `.planning/docs-manifest.md` para tracking persistente:

```markdown
## Doc Work Manifest

| # | Doc | Mode | Status | Wave |
|---|-----|------|--------|------|
| 1 | README | create | pending | 1 |
| 2 | ARCHITECTURE | update | pending | 1 |
| 3 | API | create | pending | 2 |
```

Modes:
- **create** — no existe, generar desde cero
- **update** — existe, actualizar con info del codebase actual
- **verify** — solo verificar accuracy (para docs hand-written)

> **El manifest persiste entre pasos.** Si el proceso se interrumpe, retomar desde el manifest.

---

## PASO 4: WAVES DE ESCRITURA

Despachar docs en waves paralelas (2-3 docs por wave):

### Wave 1: Foundation Docs
- README + ARCHITECTURE + GETTING-STARTED
- Leer codebase para extraer info factual
- Generar/actualizar cada doc

### Wave 2: Dev Docs
- DEVELOPMENT + TESTING + CONFIGURATION
- + docs condicionales si aplican

### Para cada doc en la wave:

1. **Leer** el codebase relevante (package.json, src/, tests/, config/)
2. **Generar/Actualizar** contenido basado en el estado real del código
3. **Verificar** claims factuales contra el codebase:
   - ¿Los comandos listados realmente funcionan?
   - ¿Los paths referenciados existen?
   - ¿Las dependencias listadas están en package.json/requirements.txt?
4. **Marcar como done** en el manifest

---

## PASO 5: VERIFICACIÓN DE ACCURACY

Para cada doc (canónico + review queue):

1. Extraer claims verificables (comandos, paths, imports, URLs)
2. Verificar contra codebase real:
   ```bash
   # ¿El comando existe?
   grep -r "script_name" package.json
   # ¿El path existe?
   ls -la path/referenced/in/doc
   # ¿El import funciona?
   grep -r "import.*ModuleName" src/
   ```
3. Clasificar inaccuracies: `{doc, claim, expected, actual, severity}`

---

## PASO 6: FIX LOOP ACOTADO

Si hay inaccuracies encontradas:

```
Máx 3 iteraciones del fix loop.
```

Para cada iteración:
1. Fix las inaccuracies identificadas
2. Re-verificar solo los fixes aplicados
3. Si quedan inaccuracies después de 3 iteraciones → reportar como gaps sin resolver

```
## Doc Verification Results

✅ Verified: {N}/{total} docs
⚠️ Inaccuracies corregidas: {N}
❌ Gaps sin resolver (después de 3 iteraciones): {N}
```

---

## PASO 7: DETECCIÓN DE GAPS

Analizar codebase para áreas sin documentación:

1. Escanear directorios significativos (src/components/, src/services/, lib/, routes/)
2. Comparar contra docs existentes
3. Identificar áreas sin cobertura documental
4. Presentar al usuario para decisión:

```
Gaps de documentación encontrados:
1. src/services/ — 5 servicios sin docs
2. src/components/ — 12 componentes sin docs

¿Generar docs para estos? (todos/seleccionar/skip)
```

---

## ANTI-PATTERNS

- ❌ Derivar la doc queue de docs existentes — siempre construir de los 9 tipos canónicos
- ❌ Incluir CHANGELOG.md en la queue — nunca
- ❌ Fix loop infinito — máximo 3 iteraciones, luego reportar
- ❌ Escribir docs sin verificar claims contra el codebase real
- ❌ Reescribir docs hand-written — solo verificar accuracy y hacer fixes quirúrgicos
- ❌ Perder el manifest — es el punto de recuperación ante interrupciones


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
