# YAPU GRILL-DOCS (EXTRACCIÓN DE CONTEXTO DOCUMENTAL)

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

Actúa en [MODO INTERROGATORIO DOCUMENTAL].

Tu objetivo es generar, actualizar y verificar toda la documentación del proyecto. Detectas la estructura de docs existente, armas un work manifest, escribes docs, verificas precisión contra el codebase, y corriges inexactitudes. Output: documentación completa y verificada.

## PASO 1: CLASIFICAR PROYECTO

Explora el proyecto para determinar su tipo y señales:

```bash
[ -f package.json ] && echo "HAS_PACKAGE_JSON"
ls src/routes src/api routes/ api/ 2>/dev/null && echo "HAS_API_ROUTES"
ls bin/ cli.* 2>/dev/null && echo "HAS_CLI_BIN"
[ -f LICENSE ] && echo "IS_OPEN_SOURCE"
ls Dockerfile docker-compose* fly.toml vercel.json 2>/dev/null && echo "HAS_DEPLOY_CONFIG"
ls pnpm-workspace.yaml lerna.json 2>/dev/null && echo "IS_MONOREPO"
ls **/*.test.* **/*.spec.* 2>/dev/null | head -1 && echo "HAS_TESTS"
```

| Condición | Tipo primario |
|-----------|--------------|
| Monorepo detectado | `monorepo` |
| CLI sin API | `cli-tool` |
| API sin open-source | `saas` |
| Open-source sin API | `library` |
| Ninguna | `generic` |

## PASO 2: ARMAR DOC QUEUE

### Docs always-on (6 — siempre se generan):

| # | Doc | Contenido |
|---|-----|-----------|
| 1 | `README.md` | Descripción, quick start, badges |
| 2 | `ARCHITECTURE.md` | Diseño del sistema, capas, decisiones |
| 3 | `GETTING-STARTED.md` | Setup paso a paso desde cero |
| 4 | `DEVELOPMENT.md` | Workflow de desarrollo, convenciones, scripts |
| 5 | `TESTING.md` | Cómo correr tests, estrategia, coverage |
| 6 | `CONFIGURATION.md` | Variables de entorno, config files, secrets |

### Docs condicionales (hasta 3 — solo si aplica):

| Señal | Doc |
|-------|-----|
| `HAS_API_ROUTES` | `API.md` — endpoints, auth, request/response schemas |
| `IS_OPEN_SOURCE` | `CONTRIBUTING.md` — cómo contribuir, PR guidelines |
| `HAS_DEPLOY_CONFIG` | `DEPLOYMENT.md` — proceso de deploy, environments |

**Máximo total: 9 docs.** CHANGELOG.md nunca se incluye.

## PASO 3: WORK MANIFEST

Crea un manifest que trackea el estado de cada doc:

```markdown
## Work Manifest

| Doc | Modo | Estado | Notas |
|-----|------|--------|-------|
| README.md | create/update | pending | — |
| ARCHITECTURE.md | create | pending | — |
| ... | ... | ... | ... |
```

- **create**: no existe, generar desde cero
- **update**: existe, actualizar con info del codebase
- **review**: existe (hand-written), verificar precisión

Persiste el manifest en `.planning/doc-manifest.md` para no perder estado entre pasos.

## PASO 4: GENERAR/ACTUALIZAR DOCS

Para cada doc en el manifest:

1. **Lee el codebase** para extraer información real — NO inventes
2. **Si es update**: preserva estructura existente, actualiza datos obsoletos
3. **Si es create**: usa información verificada del código
4. Marca como `done` en el manifest

### Reglas de calidad
- Cada path mencionado debe existir: `[ -f path ] || echo "WARNING: path not found"`
- Cada comando documentado debe funcionar
- Variables de entorno deben coincidir con `.env.example` o código

## PASO 5: VERIFICACIÓN DE PRECISIÓN

Para cada doc generado, verifica claims contra el codebase:

```bash
# ¿El comando documentado funciona?
# ¿Los paths mencionados existen?
# ¿Las variables de entorno están en el código?
grep -r "process.env.DB_URL\|os.environ" src/ | head -10
```

### Docs hand-written (review queue)
Para docs existentes que NO son del canon (ej. `docs/api/custom-flow.md`):
- Verifica que los paths, endpoints y comandos mencionados siguen siendo válidos
- Flag inexactitudes encontradas

## PASO 6: FIX LOOP (Bounded)

Si la verificación encuentra inexactitudes:

1. **Corrige** el doc con información real del codebase
2. **Re-verifica** la corrección
3. **Máximo 3 iteraciones** — si después de 3 ciclos aún hay errores, documenta los problemas restantes y escala

## PASO 7: PREGUNTAS AL USUARIO

Identifica agujeros que NO puedes resolver leyendo código:
- Lógica de negocio no documentada
- Pasos de despliegue que requieren secrets/accesos externos
- Decisiones de naming o branding

Hazme preguntas precisas. Con las respuestas, actualiza los docs.

## OUTPUT

1. Actualiza el manifest con estado final
2. Docs generados en la raíz del proyecto o `docs/`
3. Reporte de verificación: qué se verificó, qué falló, qué se corrigió

## ANTIPATRONES

- ❌ Documentación genérica que no refleja el proyecto real
- ❌ Paths o comandos que no existen en el codebase
- ❌ Ignorar docs hand-written existentes
- ❌ Fix loop infinito — máximo 3 iteraciones
- ❌ Inventar variables de entorno o endpoints


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
