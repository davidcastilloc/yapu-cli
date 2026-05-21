# Integración Git

Estrategia de commits atómicos por task con formato semántico.

---

## Principio Core

**Commitear outcomes, no proceso.**

El git log debe leerse como un changelog de lo que se envió, no un diario de actividad de planificación.

---

## Puntos de Commit

| Evento | ¿Commit? | Por qué |
|--------|----------|---------|
| BRIEF + ROADMAP creados | SÍ | Inicialización del proyecto |
| PLAN.md creado | NO | Intermedio — commit con plan completion |
| RESEARCH.md creado | NO | Intermedio |
| **Task completado** | SÍ | Unidad atómica de trabajo (1 commit por task) |
| **Plan completado** | SÍ | Commit de metadata (SUMMARY + STATE + ROADMAP) |
| Handoff creado | SÍ | Estado WIP preservado |

---

## Formatos de Commit

### Inicialización del Proyecto

```
docs: initialize [project-name] ([N] phases)

[One-liner del PROJECT.md]

Phases:
1. [phase-name]: [goal]
2. [phase-name]: [goal]
3. [phase-name]: [goal]
```

### Task Completion (durante ejecución de plan)

Cada task obtiene su propio commit inmediatamente después de completarse.

```
{type}({phase}-{plan}): {task-name}

- [Key change 1]
- [Key change 2]
- [Key change 3]
```

**Tipos de commit:**
- `feat` — New feature/functionality
- `fix` — Bug fix
- `test` — Test-only (TDD RED phase)
- `refactor` — Code cleanup (TDD REFACTOR phase)
- `perf` — Performance improvement
- `chore` — Dependencies, config, tooling

**Ejemplos:**

```bash
# Task estándar
git add src/api/auth.ts src/types/user.ts
git commit -m "feat(08-02): create user registration endpoint

- POST /auth/register validates email and password
- Checks for duplicate users
- Returns JWT token on success
"

# TDD - RED phase
git add src/__tests__/jwt.test.ts
git commit -m "test(07-02): add failing test for JWT generation

- Tests token contains user ID claim
- Tests token expires in 1 hour
- Tests signature verification
"

# TDD - GREEN phase
git add src/utils/jwt.ts
git commit -m "feat(07-02): implement JWT generation

- Uses jose library for signing
- Includes user ID and expiry claims
- Signs with HS256 algorithm
"
```

### Plan Completion (después de todos los tasks)

Un commit final de metadata captura plan completion.

```
docs({phase}-{plan}): complete [plan-name] plan

Tasks completed: [N]/[N]
- [Task 1 name]
- [Task 2 name]

SUMMARY: .planning/phases/XX-name/{phase}-{plan}-SUMMARY.md
```

**Nota:** Archivos de código NO incluidos — ya committeados per-task.

### Handoff (WIP)

```
wip: [phase-name] paused at task [X]/[Y]

Current: [task name]
[If blocked:] Blocked: [reason]
```

---

## Ejemplo de Git Log

```
# Fase 04 - Checkout
1a2b3c docs(04-01): complete checkout flow plan
4d5e6f feat(04-01): add webhook signature verification
7g8h9i feat(04-01): implement payment session creation

# Fase 03 - Products
3m4n5o docs(03-02): complete product listing plan
6p7q8r feat(03-02): add pagination controls
9s0t1u feat(03-02): implement search and filters

# Fase 02 - Auth
5y6z7a docs(02-02): complete token refresh plan
8b9c0d feat(02-02): implement refresh token rotation
1e2f3g test(02-02): add failing test for token refresh
4h5i6j docs(02-01): complete JWT setup plan
7k8l9m feat(02-01): add JWT generation and validation

# Initialization
5c6d7e docs: initialize ecommerce-app (5 phases)
```

Cada plan produce 2-4 commits (tasks + metadata). Claro, granular, bisectable.

---

## Anti-patterns

**No commitear (artefactos intermedios):**
- Creación de PLAN.md (commit con plan completion)
- RESEARCH.md (intermedio)
- Tweaks menores de planificación
- "Fixed typo in roadmap"

**Sí commitear (outcomes):**
- Cada task completion (feat/fix/test/refactor)
- Plan completion metadata (docs)
- Inicialización del proyecto (docs)

**Principio clave:** Commitear código funcional y outcomes enviados, no proceso de planificación.

---

## Por Qué Commits Per-Task

**Context engineering para AI:**
- Git history se convierte en fuente primaria de contexto para futuras sesiones
- `git log --grep="{phase}-{plan}"` muestra todo el trabajo de un plan
- `git diff <hash>^..<hash>` muestra cambios exactos por task

**Failure recovery:**
- Task 1 committed ✅, Task 2 failed ❌
- Siguiente sesión: ve task 1 completo, puede reintentar task 2
- Puede `git reset --hard` al último task exitoso

**Debugging:**
- `git bisect` encuentra el task exacto que falla
- `git blame` traza la línea al contexto específico del task
- Cada commit es independientemente revertable
