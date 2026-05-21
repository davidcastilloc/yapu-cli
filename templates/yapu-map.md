# YAPU CODE MAPPING

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

Actúa en [MODO MAPEO DE CODEBASE].

Tu objetivo es producir un mapa estructurado del proyecto en `.planning/codebase/` — 7 documentos que cubren dominios ortogonales. Cada documento es referencia para planificación y ejecución futura.

> Carga profunda: `@yapu-ref-mapping-domains.md`

## FILOSOFÍA

- **Calidad sobre brevedad** — incluye paths reales con backticks: `src/services/user.ts`
- **Mapeo paralelo por dominio** — contexto fresco por dominio evita contaminación de tokens
- **Siempre incluye file paths** — los documentos son material de referencia para el agente al planificar/ejecutar

## PASO 1: VERIFICAR ESTADO EXISTENTE

```bash
ls -la .planning/codebase/ 2>/dev/null || echo "NO_EXISTE"
git rev-parse HEAD 2>/dev/null  # SHA para drift detection
```

**Si `.planning/codebase/` existe:**
Pregunta al usuario:
1. **Refresh** — Borrar y remapear todo
2. **Update** — Actualizar documentos específicos
3. **Skip** — Usar mapa existente tal cual

**Si no existe:** Continúa a Paso 2.

## PASO 2: CREAR ESTRUCTURA

```bash
mkdir -p .planning/codebase
```

## PASO 3: MAPEO DE 7 DOMINIOS

Explora la base de código usando `tree`, `cat`, `grep`, `find` y produce estos 7 documentos:

| # | Documento | Foco | Contenido clave |
|---|-----------|------|-----------------|
| 1 | `STACK.md` | Tecnologías | Runtime, frameworks, package managers, versiones |
| 2 | `INTEGRATIONS.md` | Conexiones externas | APIs, DBs, servicios third-party, auth providers |
| 3 | `ARCHITECTURE.md` | Diseño del sistema | Capas, flujo de datos, boundaries, patrones (MVC, etc.) |
| 4 | `STRUCTURE.md` | Organización de archivos | Árbol de directorios anotado, entry points, config files |
| 5 | `CONVENTIONS.md` | Estilo y patrones | Naming, imports, error handling, logging patterns |
| 6 | `TESTING.md` | Estrategia de pruebas | Framework, coverage, test dirs, fixtures, CI integration |
| 7 | `CONCERNS.md` | Riesgos y deuda técnica | TODOs, hacks conocidos, dependencias desactualizadas, security gaps |

### Heurísticas de exploración por dominio

- **Stack**: `package.json`, `Cargo.toml`, `go.mod`, `requirements.txt`, `Gemfile`, Dockerfiles
- **Integrations**: busca URLs, connection strings, SDK imports, `.env*` files
- **Architecture**: entry points, middleware chains, router configs, service layers
- **Structure**: `tree -I node_modules -I .git -L 3`
- **Conventions**: primeros 50 líneas de 3-5 archivos representativos
- **Testing**: `*.test.*`, `*.spec.*`, `__tests__/`, jest/vitest/pytest configs
- **Concerns**: `grep -rn "TODO\|FIXME\|HACK\|DEPRECATED" src/`

## PASO 4: DRIFT STAMP

Cada documento DEBE incluir en su encabezado:

```yaml
---
last_mapped_commit: <HEAD SHA>
mapped_at: <ISO timestamp>
---
```

Esto permite detección de drift post-ejecución. Si el HEAD avanza más allá del SHA mapeado, el mapa necesita actualización incremental.

## PASO 5: RESUMEN Y ACTUALIZACIÓN DE PROJECT.md

1. Lista los 7 documentos creados con línea count
2. Sobrescribe `PROJECT.md` con un resumen ejecutivo basado en los hallazgos
3. **NO modifiques código fuente** — este modo es puramente analítico

## MODO INCREMENTAL (--paths)

Si se invoca con paths específicos (ej. después de ejecución):
- Limita exploración a los prefijos indicados
- Actualiza solo los documentos afectados
- Re-estampa el commit SHA

## ANTIPATRONES

- ❌ Mapeo superficial sin file paths concretos
- ❌ Documentos genéricos que podrían aplicar a cualquier proyecto
- ❌ Ignorar archivos de configuración o `.env.example`
- ❌ No incluir el drift stamp


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
