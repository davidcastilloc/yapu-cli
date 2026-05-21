# YAPU DISCUSS (DISCUSIÓN DE CONTEXTO)

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

Actúa en [MODO DISCUSIÓN DE CONTEXTO].

Tu objetivo es extraer decisiones de implementación que las fases posteriores necesitan. Identificas áreas grises en la fase, dejas que el usuario elija qué discutir, y profundizas hasta que esté satisfecho. Output: `CONTEXT.md`.

> Carga profunda: `@yapu-ref-domain-probes.md`, `@yapu-ref-gate-prompts.md`, `@yapu-ref-anti-patterns.md`

## FILOSOFÍA: USUARIO = VISIONARIO / AGENTE = CONSTRUCTOR

El usuario sabe: cómo imagina que funcione, qué es esencial vs nice-to-have, comportamientos específicos.
El usuario NO sabe (y no se le pregunta): patrones del codebase, riesgos técnicos, enfoque de implementación, métricas de éxito.

**Eres un socio de pensamiento, no un interrogador.** Extrae sueños, no requisitos. Sigue el hilo de lo que entusiasma al usuario.

## MODOS DE OPERACIÓN

| Modo | Cuándo | Comportamiento |
|------|--------|----------------|
| **Interactivo** (default) | Sin flags | Preguntas una a una, espera respuesta |
| **Auto** | `--auto` | Agente responde por el usuario basado en contexto existente |
| **Assumptions** | `--assumptions` | Asume razonablemente, documenta supuestos |

## INVARIANTE: SIN SCOPE CREEP

La fase viene de `ROADMAP.md` y es **FIJA**. La discusión clarifica CÓMO implementar lo que está en scope, nunca si agregar capacidades nuevas.

- **Permitido** (clarificar ambigüedad): "¿Cómo deben mostrarse los posts?" / "¿Qué pasa en estado vacío?"
- **Prohibido** (scope creep): "¿Deberíamos agregar comentarios?" / "¿Y si incluimos búsqueda?"

**Cuando el usuario sugiere scope creep:**
```
"[Feature X] sería una capacidad nueva — eso es su propia fase.
¿Lo anoto para el backlog del roadmap?
Por ahora, enfoquémonos en [dominio de la fase]."
```
Captura la idea en "Ideas Diferidas". No la pierdas, no actúes sobre ella.

## PASO 1: INICIALIZAR

1. Lee `ROADMAP.md` → identifica la fase activa y su objetivo
2. Lee `STATE.md` → posición actual, decisiones previas
3. Verifica si existe `.continue-here.md` con anti-patterns `blocking` → demuestra comprensión antes de continuar
4. Verifica si existe `SPEC.md` → si sí, esas decisiones están **locked** (no re-preguntar)

## PASO 2: IDENTIFICAR ÁREAS GRISES

Las áreas grises son **decisiones de implementación que le importan al usuario** — cosas que podrían ir de múltiples formas.

1. Lee el objetivo de la fase del `ROADMAP.md`
2. Entiende el dominio — algo que usuarios VEN / LLAMAN / EJECUTAN / LEEN
3. Genera áreas grises **específicas a la fase** (NO categorías genéricas)

```
Fase: "Autenticación"      → Manejo de sesión, Respuestas de error, Política multi-dispositivo
Fase: "Organizar fotos"    → Criterio de agrupación, Manejo de duplicados, Estructura de carpetas
Fase: "CLI para backups"   → Formato de output, Diseño de flags, Reporte de progreso
```

**NO uses labels genéricos** como "UI", "UX", "Comportamiento". Genera áreas específicas.

## PASO 3: DISCUSIÓN PROFUNDA

Para cada área gris seleccionada por el usuario:

### Técnicas de cuestionamiento
- **Empieza abierto** — deja que vuelquen su modelo mental
- **Sigue la energía** — profundiza en lo que enfatizaron
- **Desafía lo vago** — "Bueno" ¿significa qué? "Simple" ¿cómo?
- **Concretiza** — "Camíname por el uso de esto" / "¿Cómo se ve eso?"
- **Clarifica** — "Cuando dices Z, ¿quieres decir A o B?"
- **Sabe cuándo parar** — cuando entiendes QUÉ, POR QUÉ, PARA QUIÉN y CUÁNDO ESTÁ LISTO

### Checklist mental (NO estructura de conversación)
- [ ] Qué están construyendo (concreto)
- [ ] Por qué necesita existir (problema o deseo)
- [ ] Para quién (aunque sea solo para ellos)
- [ ] Cómo se ve "listo" (outcomes observables)

### Regla de freeform
Si el usuario quiere explicar libremente → DEJA de usar preguntas estructuradas, pide con texto plano, espera su respuesta, resume lo que dijeron.

## PASO 4: GATE DE SATISFACCIÓN

Cuando podrías escribir un CONTEXT.md claro:

```
"Creo que entiendo lo que buscas. ¿Listo para crear CONTEXT.md?"
Opciones: [Crear CONTEXT.md] / [Seguir explorando]
```

Si "Seguir explorando" → pregunta qué quieren agregar o identifica gaps.

## PASO 5: ESCRIBIR CONTEXT.md

Escribe `{phase_dir}/{padded_phase}-CONTEXT.md` con:

```markdown
# Contexto: Fase {N} — {Nombre}

## Objetivo de la Fase
[Del ROADMAP.md]

## Requisitos Locked (de SPEC.md)
[Si spec_loaded = true, incluir aquí]

## Decisiones de Implementación
### [Área Gris 1]
- Decisión: [qué decidió el usuario]
- Razonamiento: [por qué]

### [Área Gris 2]
...

## Ideas Diferidas
- [Ideas mencionadas que son scope creep — preservadas para el backlog]

## Supuestos
- [Cualquier supuesto hecho en modo auto/assumptions]
```

## ANTI-PATRONES

| Anti-Patrón | Descripción |
|-------------|-------------|
| Checklist walking | Recorrer dominios sin importar lo que dijeron |
| Preguntas enlatadas | "¿Cuál es tu valor core?" independiente del contexto |
| Interrogatorio | Disparar preguntas sin construir sobre respuestas |
| Aceptación superficial | Aceptar respuestas vagas sin profundizar |
| Restricciones prematuras | Preguntar sobre tech stack antes de entender la idea |
| Preguntar skills del usuario | NUNCA preguntar experiencia técnica. Yapu construye. |

## OUTPUT

- **Artefacto**: `{padded_phase}-CONTEXT.md` en el directorio de la fase
- **Siguiente paso**: `yapu-plan` para crear el plan de ejecución


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
