# YAPU VERIFICATION

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

Actúa en [MODO VERIFICACIÓN].

Tu objetivo es verificar que el codebase **logra el objetivo de la fase**, no solo que las tareas se completaron. Completar tareas ≠ lograr el objetivo.

> Carga profunda: `@yapu-ref-verification-patterns.md`, `@yapu-ref-examples-verifier.md`, `@yapu-thinking-verification.md`

## PRINCIPIO CENTRAL: Verificación Goal-Backward

```
1. ¿Qué debe ser VERDAD para que el objetivo se logre?
2. ¿Qué debe EXISTIR para que esas verdades se sostengan?
3. ¿Qué debe estar CONECTADO para que esos artefactos funcionen?
4. ¿Qué deben PROBAR los tests para que haya evidencia?

→ Verificar cada nivel contra el codebase real.
```

## PASO 1: CARGAR CONTEXTO

1. Lee `STATE.md` — objetivo de la fase, tareas completadas
2. Lee `ROADMAP.md` — goal original de la fase activa
3. Lee `PROJECT.md` — contexto del proyecto
4. Lista archivos creados/modificados:
   ```bash
   git log --name-only --format="" -20 | sort -u
   ```

## PASO 2: ESTABLECER MUST-HAVES

Deriva los "must-haves" del objetivo de la fase (NO de las tareas):

```markdown
### Must-Haves para: [objetivo de la fase]

**Verdades observables** (3-7 comportamientos verificables):
1. [comportamiento que debe ser verdad]
2. ...

**Artefactos requeridos** (archivos concretos):
1. [path/to/file] — [qué debe contener]
2. ...

**Conexiones críticas** (wiring donde se esconden los stubs):
1. [archivo A] importa y usa [archivo B]
2. ...
```

## PASO 3: VERIFICACIÓN EN 4 NIVELES

Para cada artefacto, verifica progresivamente:

| Nivel | Check | Método | Estado |
|-------|-------|--------|--------|
| **L1: Existe** | ¿El archivo existe en disco? | `[ -f path/to/file ]` | MISSING / ✓ |
| **L2: Sustantivo** | ¿Tiene contenido real (no stub)? | `wc -l`, revisar contenido | STUB / ✓ |
| **L3: Conectado** | ¿Está importado Y usado? | `grep -r "import.*name" src/` | ORPHANED / ✓ |
| **L4: Probado** | ¿Hay tests que lo ejercitan? | `grep -r "name" **/*.test.*` | UNTESTED / ✓ |

### Tabla de estados compuestos

| Existe | Sustantivo | Conectado | Estado final |
|--------|-----------|-----------|--------------|
| ✓ | ✓ | ✓ | ✓ VERIFIED |
| ✓ | ✓ | ✗ | ⚠️ ORPHANED |
| ✓ | ✗ | — | ✗ STUB |
| ✗ | — | — | ✗ MISSING |

### Evidencia respaldada por grep

**TODA verificación debe tener evidencia ejecutable.** No aceptar "revisé y se ve bien":

```bash
# L1: Existencia
[ -f src/components/Chat.tsx ] && echo "EXISTS" || echo "MISSING"

# L2: Sustantividad (>10 líneas, tiene lógica real)
wc -l src/components/Chat.tsx
grep -c "function\|const\|class\|export" src/components/Chat.tsx

# L3: Wiring (importado Y usado fuera de su archivo)
grep -r "import.*Chat" src/ --include="*.ts" --include="*.tsx" | grep -v "Chat.tsx"
grep -r "Chat" src/ --include="*.ts" --include="*.tsx" | grep -v "import" | grep -v "Chat.tsx"

# L4: Test coverage
grep -r "Chat" src/ --include="*.test.*" --include="*.spec.*"
```

## PASO 4: VERIFICAR VERDADES

Para cada verdad observable del Paso 2:

- **✓ VERIFIED** — todos los artefactos de soporte pasan L1-L3
- **✗ FAILED** — algún artefacto MISSING/STUB/ORPHANED
- **? UNCERTAIN** — requiere verificación humana (ej. comportamiento visual)

## PASO 5: GENERAR REPORTE

```markdown
## Reporte de Verificación — [fase]

### Resultado: [PASSED | FAILED | PARTIAL]

#### Verdades verificadas
| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | [verdad] | ✓/✗/? | [comando y resultado] |

#### Artefactos verificados
| Path | L1 | L2 | L3 | L4 | Estado |
|------|----|----|----|----|--------|
| [path] | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | [estado] |

#### Gaps encontrados
- [gap 1]: [descripción y severidad]

#### Acciones requeridas
- [acción 1]: [qué hacer para cerrar el gap]
```

## PASO 6: ACTUAR SOBRE RESULTADOS

| Resultado | Acción |
|-----------|--------|
| **PASSED** | Marca fase completa en `ROADMAP.md`, actualiza `STATE.md` |
| **FAILED** | Repara los gaps tú mismo si son menores. Si son mayores → escala al usuario |
| **PARTIAL** | Documenta qué pasó y qué falta. Pregunta al usuario si acepta o quiere reparar |

## OVERRIDE DE VERIFICACIÓN

El usuario puede overridear un FAILED con justificación:
- Documentar la razón del override en STATE.md
- Marcar como `PASSED (override: [razón])`
- Esto es legítimo para: tests flaky, features de baja prioridad, dependencias externas no disponibles

## ANTIPATRONES

- ❌ Verificar tareas en vez del objetivo (task completion ≠ goal achievement)
- ❌ "Se ve bien" sin evidencia grep/test
- ❌ Ignorar archivos orphaned (existen pero nadie los importa)
- ❌ Marcar PASSED con gaps conocidos sin override explícito


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
