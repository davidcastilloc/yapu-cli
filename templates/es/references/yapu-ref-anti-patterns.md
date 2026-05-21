# Anti-Patrones Universales

> Referencia cargada bajo demanda vía `@yapu-ref-anti-patterns.md`.
> 29 reglas que aplican a TODOS los workflows y agentes Yapu. Los workflows individuales pueden añadir reglas adicionales.

---

## Presupuesto de Contexto

1. **Nunca** leer archivos de definición de agente (`agents/*.md`) — `subagent_type` los carga automáticamente. Leerlos en el orquestador desperdicia contexto.
2. **Nunca** insertar archivos grandes en prompts de subagentes — indicarles que los lean desde disco. Cada agente tiene su propia ventana de contexto.
3. **Profundidad de lectura escala con ventana de contexto** — Verificar `context_window` en `.planning/config.json`. Con < 500K: leer solo frontmatter, campos de estado o resúmenes. Con ≥ 500K: lectura completa permitida cuando se necesita para decisiones inline.
4. **Delegar** trabajo pesado a subagentes — el orquestador enruta, no construye, analiza, investiga ni verifica.
5. **Advertencia proactiva de pausa**: Si el contexto consumido es significativo (lecturas de archivos grandes, múltiples resultados de subagentes), advertir: "El presupuesto de contexto se está agotando. Considere hacer checkpoint del progreso."

## Lectura de Archivos

6. **Profundidad de lectura de SUMMARY.md escala con context window** — Con < 500K: solo frontmatter de SUMMARYs previos. Con ≥ 500K: lectura completa para fases de dependencia directa. Dependencias transitivas (2+ fases atrás) siempre solo frontmatter.
7. **Nunca** leer archivos PLAN.md completos de otras fases — solo el plan de la fase actual.
8. **Nunca** leer archivos de `.planning/logs/` — solo el workflow de salud los lee.
9. **No** releer contenido completo cuando el frontmatter es suficiente — el frontmatter contiene status, key_files, commits y provides. Excepción: con ≥ 500K, releer el cuerpo es aceptable cuando se necesita contenido semántico.

## Reglas de Subagentes

10. **NUNCA** usar tipos de agente genéricos (`general-purpose`, `Explore`, `Plan`, `Bash`, etc.) — SIEMPRE usar `subagent_type: "yapu-{agent}"`. Los agentes Yapu tienen prompts con contexto de proyecto, logging de auditoría y contexto de workflow. Los agentes genéricos bypasean todo esto.
11. **No** re-litigar decisiones ya fijadas en CONTEXT.md (o PROJECT.md ## Context) — respetar decisiones bloqueadas incondicionalmente.

## Anti-Patrones de Preguntas

> Referencia completa en `@yapu-ref-questioning.md`.

12. **No** caminar por checklists — preguntar ítems uno por uno de una lista es el anti-patrón #1. Usar profundidad progresiva: empezar amplio, profundizar donde sea interesante.
13. **No** usar jerga corporativa — evitar "alineación de stakeholders", "sinergizar", "deliverables". Usar lenguaje directo.
14. **No** aplicar restricciones prematuras — no estrechar el espacio de soluciones antes de entender el problema. Preguntar sobre el problema primero, luego restringir.

## Gestión de Estado

15. **No escribir/editar STATE.md o ROADMAP.md directamente para mutaciones.** Usar siempre los handlers de estado registrados (ej. `state.update`, `state.advance-plan`, `roadmap.update-plan-progress`) o la API programática. La escritura directa bypasea la lógica de actualización segura y es insegura en entornos multi-sesión. Excepción: creación inicial de STATE.md desde template.

## Reglas de Comportamiento

16. **No** crear artefactos que el usuario no aprobó — confirmar siempre antes de escribir nuevos documentos de planificación.
17. **No** modificar archivos fuera del scope declarado del workflow — verificar la lista files_modified del plan.
18. **No** sugerir múltiples acciones sin prioridad clara — una sugerencia principal, alternativas listadas como secundarias.
19. **No** usar `git add .` o `git add -A` — hacer staging de archivos específicos únicamente.
20. **No** incluir información sensible (API keys, passwords, tokens) en documentos de planificación o commits.

## Recuperación de Errores

21. **Detección de git lock**: Antes de cualquier operación git, si falla con "Unable to create lock file", verificar `.git/index.lock` estancado y avisar al usuario para que lo elimine (no eliminar automáticamente).
22. **Config fallback**: La carga de config retorna `null` silenciosamente con JSON inválido. Si el workflow depende de valores de config, verificar null y advertir: "config.json inválido o ausente — ejecutando con valores por defecto."
23. **Recuperación de estado parcial**: Si STATE.md referencia un directorio de fase que no existe, no proceder silenciosamente. Advertir al usuario y sugerir diagnosticar el desajuste.

## Reglas Específicas de Yapu

24. **No** verificar `mode === 'auto'` o `mode === 'autonomous'` — Yapu usa flag `yolo` en config. Verificar `yolo: true` para modo autónomo, ausencia o `false` para modo interactivo.
25. **Los archivos de plan DEBEN seguir el patrón `{padded_phase}-{NN}-PLAN.md`** (ej. `01-01-PLAN.md`). Nunca usar `PLAN-01.md`, `plan-01.md`, ni ninguna otra variación — la detección de herramientas depende de este patrón exacto.
26. **No empezar a ejecutar el siguiente plan antes de escribir el SUMMARY.md del plan actual** — planes siguientes pueden referenciarlo vía `@` includes.

## Reglas iOS / Apple Platform

27. **NUNCA usar `Package.swift` + `.executableTarget` como build system principal para apps iOS.** Los executable targets de SPM producen binarios CLI de macOS, no bundles `.app` de iOS. Usar XcodeGen (`project.yml` + `xcodegen generate`) para crear un `.xcodeproj` correcto.
28. **Verificar disponibilidad de APIs de SwiftUI antes de usar.** Muchas APIs requieren versión mínima de iOS específica (ej. `NavigationSplitView` es iOS 16+, `@Observable` requiere iOS 17). Si un plan usa una API que excede el `IPHONEOS_DEPLOYMENT_TARGET` declarado, elevar el target o añadir guards `#available`.
29. **Preferir la API programática** para orquestación cuando exista un handler; al usar CLI legacy, usar el nombre de archivo correcto del tooling de Yapu.
