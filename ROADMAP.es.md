# ROADMAP DEL PROYECTO - ANTIGRAVITY YAPU

Este documento define el ciclo de vida del desarrollo de **Yapu** en fases aisladas.

- [x] **Fase 1: Estructuración y CLI Base**
  - Diseñar los prompts de directivas base (`yapu-map.md`, `yapu-plan.md`, `yapu-execute.md`, `yapu-verify.md`).
  - Crear el script CLI `bin/cli.js` para automatizar la inicialización del entorno (`yapu init`).
- [x] **Fase 2: Expansión de Habilidades de Interrogatorio**
  - Implementar la skill de arquitectura táctica (`yapu-grill-me.md`).
  - Implementar la skill de documentación profunda (`yapu-grill-docs.md`).
  - Integrar las nuevas habilidades en el flujo de copia de `bin/cli.js`.
- [x] **Fase 3: Infraestructura de Calidad**
  - Configurar herramientas de formateo y validación estática de código (ESLint moderno).
  - Implementar una suite de pruebas automatizadas con el test runner nativo de Node.js.
  - Garantizar la cobertura para la inyección segura de plantillas del CLI y prevención de colisiones.
- [x] **Fase 4: Expansión Elite**
  - Diseñar los workflows especializados (`yapu-secops.md`, `yapu-dba.md`, `yapu-ui.md`).
  - Diseñar el modo forense detective (`yapu-forensics.md`).
  - Implementar los comandos `yapu archive` y `yapu install-hooks` en el CLI.
- [x] **Fase 5: Herramienta de Chequeo y Diagnóstico**
  - Diseñar el comando `yapu check` para verificar si un espacio de trabajo tiene una tríada de memoria íntegra y sin referencias prohibidas.
- [x] **Fase 6: Agentes Autónomos & Resiliencia**
  - [x] Implementar `yapu dash` para un dashboard TUI sin dependencias.
  - [x] Implementar `yapu gc` para condensar fases contextuales antiguas en LORE.md.
  - [x] Implementar `yapu rescue` para Auto-Heal en pipelines CI/CD.
  - [x] Implementar `yapu-chaos.md` para Ingeniería de Resiliencia Autónoma.
- [x] **Fase 7: Soporte Multi-Proveedor**
  - [x] Diseñar e implementar `lib/providers.js` — registro centralizado de proveedores IA CLI (Antigravity, Claude Code, Codex).
  - [x] Refactorizar `lib/artifacts.js` — generalizar `detectBrainPath()` con auto-detección multi-proveedor y fallback.
  - [x] Actualizar `yapu swarm` — detección dinámica de proveedor y spawn de CLI con flag `--provider`.
  - [x] Implementar `yapu provider` — comando de diagnóstico mostrando proveedores instalados, rutas de datos y selección activa.
  - [x] Actualizar templates de `yapu-config.json` — agregar campo `"provider": "auto"` a la config de workflow.
