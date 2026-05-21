# Tipos de Checkpoints

> Referencia cargada bajo demanda vía `@yapu-ref-checkpoints.md`.
> Los planes se ejecutan autónomamente. Los checkpoints formalizan puntos de interacción donde se necesita verificación o decisión humana.

---

## Principio Central

**Si el agente puede ejecutarlo, el agente lo ejecuta.** Los checkpoints son para verificación y decisiones, no para trabajo manual.

**Reglas de oro:**
1. Si el agente puede ejecutarlo con CLI/API, lo ejecuta
2. El agente prepara el entorno de verificación (servers, seeds, env vars)
3. El usuario solo hace lo que requiere juicio humano (checks visuales, evaluación UX)
4. Los secrets vienen del usuario, la automatización del agente
5. Auto-mode bypasea checkpoints de verify/decision — human-action siempre detiene (auth gates no pueden automatizarse)

---

## checkpoint:human-verify (90% — Más Común)

**Cuándo:** El agente completó trabajo automatizado, el humano confirma que funciona correctamente.

**Modo por defecto: `end-of-phase`.** Los proyectos nuevos NO detienen mid-flight en checkpoints de verificación. El planificador los suprime e incrusta los detalles en el bloque `<verify><human-check>` de la tarea `auto` relevante; el verificador los cosecha al final de fase y los consolida en un solo batch de UAT.

**Por qué es el default:** cada halt mid-flight cuesta un cold-start completo del executor (re-lectura de archivos de contexto al re-spawn) porque el contexto del subagente se descarta. Un plan con N human-verify checkpoints paga el costo de cold-start N+1 veces.

**Usar para:** Checks visuales de UI, flujos interactivos, verificación funcional, calidad de audio/video, suavidad de animaciones, testing de accesibilidad.

**Estructura:**
```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Qué automatizó y deployó el agente]</what-built>
  <how-to-verify>[Pasos exactos — URLs, comportamiento esperado]</how-to-verify>
  <resume-signal>[Cómo continuar — "approved", "yes", o describir issues]</resume-signal>
</task>
```

**Patrón clave:** El agente inicia el server ANTES del checkpoint:
```xml
<task type="auto">
  <name>Start dev server for verification</name>
  <action>Run `npm run dev` in background, wait for ready</action>
</task>
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Dashboard at http://localhost:3000/dashboard (server running)</what-built>
  <how-to-verify>
    Visit http://localhost:3000/dashboard and verify:
    1. Desktop (>1024px): Sidebar left, content right
    2. Mobile (375px): Single column, bottom nav
    3. No horizontal scroll at any size
  </how-to-verify>
</task>
```

---

## checkpoint:decision (9%)

**Cuándo:** El humano debe elegir algo que afecta la dirección de implementación.

**Usar para:** Selección de tecnología, decisiones de arquitectura, opciones de diseño, priorización de features, decisiones de data model.

**Estructura:**
```xml
<task type="checkpoint:decision" gate="blocking">
  <decision>[Qué se está decidiendo]</decision>
  <context>[Por qué importa esta decisión]</context>
  <options>
    <option id="option-a">
      <name>[Nombre]</name>
      <pros>[Beneficios]</pros>
      <cons>[Tradeoffs]</cons>
    </option>
  </options>
  <resume-signal>[Cómo indicar la elección]</resume-signal>
</task>
```

---

## checkpoint:human-action (1% — Raro)

**Cuándo:** La acción NO tiene CLI/API y requiere interacción solo-humana, O el agente encontró un auth gate durante automatización.

**Usar SOLO para:**
- **Auth gates** — agente intentó CLI/API pero necesita credenciales
- Links de verificación de email
- Códigos 2FA vía SMS
- Aprobaciones manuales de cuenta
- Flujos 3D Secure de tarjeta de crédito
- Aprobaciones OAuth en browser

**NO usar para trabajo manual pre-planificado:** Deploy (usar CLI), crear webhooks/databases (usar API/CLI), ejecutar builds/tests, crear archivos.

**Patrón clave — Auth Gate:**
El agente intenta automatización → error de auth → crea checkpoint:human-action dinámicamente → usuario autentica → agente reintenta → continúa.

```xml
<!-- El agente intentó deploy pero obtuvo error de auth -->
<task type="checkpoint:human-action" gate="blocking">
  <action>Authenticate Vercel CLI</action>
  <instructions>
    I tried to deploy but got authentication error.
    Run: vercel login
    Complete the browser authentication flow.
  </instructions>
  <verification>vercel whoami returns your account</verification>
</task>
<!-- Después de auth, el agente reintenta el deployment -->
```

**Distinción clave:**
- Pre-planned: "Necesito que hagas X" (incorrecto — el agente debería automatizar)
- Auth gate: "Intenté automatizar X pero necesito credenciales" (correcto — desbloquea automatización)

---

## checkpoint:tdd-review (Solo Modo TDD)

**Cuándo:** Todas las waves de una fase completan y `workflow.tdd_mode` está habilitado. Gate advisory — no bloquea ejecución.

**Usar para:** Verificar secuencia de commits RED/GREEN/REFACTOR, detectar violaciones de gate, revisar calidad de tests, confirmar implementaciones GREEN mínimas.

**Estructura:**
```xml
<task type="checkpoint:tdd-review" gate="advisory">
  <what-checked>TDD gate compliance for {count} plans in Phase {X}</what-checked>
  <gate-results>
    | Plan | RED | GREEN | REFACTOR | Status |
    |------|-----|-------|----------|--------|
    | {id} |  ✓  |   ✓   |    ✓     | Pass   |
  </gate-results>
  <violations>[Lista de violaciones, o "None"]</violations>
</task>
```

---

## Protocolo de Ejecución

Al encontrar `type="checkpoint:*"`:
1. **Detener inmediatamente** — no proceder a la siguiente tarea
2. **Mostrar checkpoint claramente** usando formato de caja
3. **Esperar respuesta del usuario** — no alucinar completitud
4. **Verificar si posible** — revisar archivos, ejecutar tests
5. **Resumir ejecución** — continuar solo después de confirmación

---

## Cuándo NO Usar Checkpoints

- Cosas que el agente puede verificar programáticamente (tests, builds)
- Operaciones de archivos
- Corrección de código (tests y static analysis)
- Cualquier cosa automatizable vía CLI/API
