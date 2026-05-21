# Anti-Patrones del Planificador

> Referencia para agentes planificadores Yapu. Cargada bajo demanda vía `@yapu-ref-planner-anti-patterns.md`.

---

## Anti-Patrones de Checkpoints

### ❌ Malo — Pedir al humano que automatice

```xml
<task type="checkpoint:human-action">
  <action>Deploy to Vercel</action>
  <instructions>Visit vercel.com, import repo, click deploy...</instructions>
</task>
```

**Por qué es malo:** Vercel tiene CLI. El agente debe ejecutar `vercel --yes`. Nunca pedir al usuario hacer lo que se puede automatizar vía CLI/API.

### ❌ Malo — Demasiados checkpoints

```xml
<task type="auto">Create schema</task>
<task type="checkpoint:human-verify">Check schema</task>
<task type="auto">Create API</task>
<task type="checkpoint:human-verify">Check API</task>
```

**Por qué es malo:** Fatiga de verificación. No pedir al usuario que verifique cada paso pequeño. Combinar en un solo checkpoint al final del trabajo significativo.

### ✅ Bueno — Checkpoint único de verificación

```xml
<task type="auto">Create schema</task>
<task type="auto">Create API</task>
<task type="auto">Create UI</task>
<task type="checkpoint:human-verify">
  <what-built>Complete auth flow (schema + API + UI)</what-built>
  <how-to-verify>Test full flow: register, login, access protected page</how-to-verify>
</task>
```

### ❌ Malo — Mezclar checkpoints con implementación

Un plan no debe intercalar múltiples tipos de checkpoint con tareas de implementación. Los checkpoints pertenecen a fronteras naturales de verificación, no esparcidos por todas partes.

---

## Ejemplos de Especificidad

| DEMASIADO VAGO | JUSTO |
|----------------|-------|
| "Add authentication" | "Add JWT auth with refresh rotation using jose library, store in httpOnly cookie, 15min access / 7day refresh" |
| "Create the API" | "Create POST /api/projects accepting {name, description}, validates name length 3-50 chars, returns 201 with project object" |
| "Style the dashboard" | "Add Tailwind classes to Dashboard.tsx: grid layout (3 cols on lg, 1 on mobile), card shadows, hover states on action buttons" |
| "Handle errors" | "Wrap API calls in try/catch, return {error: string} on 4xx/5xx, show toast via sonner on client" |
| "Set up the database" | "Add User and Project models to schema.prisma with UUID ids, email unique constraint, createdAt/updatedAt timestamps, run prisma db push" |

**Test de especificidad:** ¿Podría una instancia diferente del agente ejecutar la tarea sin hacer preguntas clarificadoras? Si no, agregar más detalle.

---

## Anti-Patrones de Sección Context

### ❌ Malo — Encadenamiento reflexivo de SUMMARYs

```markdown
<context>
@.planning/phases/01-foundation/01-01-SUMMARY.md
@.planning/phases/01-foundation/01-02-SUMMARY.md  <!-- ¿Plan 02 realmente necesita el output de Plan 01? -->
@.planning/phases/01-foundation/01-03-SUMMARY.md  <!-- La cadena crece, el contexto se hincha -->
</context>
```

**Por qué es malo:** Los planes frecuentemente son independientes. El encadenamiento reflexivo desperdicia contexto. Solo referenciar SUMMARYs previos cuando el plan genuinamente usa tipos/exports de ese plan previo o una decisión de él afecta el plan actual.

### ✅ Bueno — Contexto selectivo

```markdown
<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/01-foundation/01-01-SUMMARY.md  <!-- Usa tipo User definido en Plan 01 -->
</context>
```

---

## Anti-Patrones de Reducción de Alcance

**Lenguaje prohibido en acciones de tareas:**
- "v1", "v2", "simplified version", "static for now", "hardcoded for now"
- "future enhancement", "placeholder", "basic version", "minimal implementation"
- "will be wired later", "dynamic in future phase", "skip for now"

Si una decisión de CONTEXT.md dice "display cost calculated from billing table in impulses", el plan debe entregar exactamente eso. No "static label /min" como "v1". Si la fase es demasiado compleja, recomendar un split de fase en vez de reducir alcance silenciosamente.
