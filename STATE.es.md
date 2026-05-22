# ESTADO ACTUAL (MEMORIA DE ANTIGRAVITY)

**FASE ACTIVA:** Fase 7: Soporte Multi-Proveedor (Completada)

## Tareas de la Fase Actual
- [x] Tarea 1: Diseñar e implementar `lib/providers.js` — registro centralizado de proveedores IA CLI (Antigravity, Claude Code, Codex).
- [x] Tarea 2: Refactorizar `lib/artifacts.js` — generalizar `detectBrainPath()` con auto-detección multi-proveedor y fallback.
- [x] Tarea 3: Actualizar `yapu swarm` — detección dinámica de proveedor y spawn de CLI con flag `--provider`.
- [x] Tarea 4: Implementar `yapu provider` — comando de diagnóstico mostrando proveedores instalados, rutas de datos y selección activa.
- [x] Tarea 5: Actualizar templates de `yapu-config.json` (en + es) — agregar campo `"provider": "auto"` a config de workflow.
- [x] Tarea 6: Actualizar `lib/i18n.js` — agregar claves i18n de proveedores y hacer rutas hardcodeadas genéricas.
- [x] Tarea 7: Verificación completa del test suite — 29/29 tests pasando con cero regresiones.

## Contexto de Ejecución (Notas para el Agente)
- Antigravity CLI sigue siendo el proveedor por defecto — cero cambios breaking al comportamiento existente.
- Prioridad de resolución de proveedor: config explícita > auto-detección (ejecutable + datos) > fallback (antigravity).
- `yapu swarm --provider claude` spawna Claude Code; `yapu swarm --provider codex` spawna Codex CLI.
- Toda la documentación actualizada: README (en/es), ROADMAP (en/es), CONTEXT (en/es), COMMANDS (en/es).
