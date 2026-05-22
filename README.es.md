<p align="center">
  <img src="yapu-banner.png" alt="YapuCli — Context Engineering Framework" width="600">
</p>

<p align="center">
  <strong>🇺🇸 <a href="README.md">Read in English</a></strong>
</p>

# YapuCli 🪺

**Framework de ingeniería de contexto y memoria estática para Antigravity CLI.**
Conectado directamente al brain de Antigravity.

> Inspirado en el **yapú** (*Psarocolius decumanus*), ave venezolana que teje nidos colgantes de más de un metro que desafían la gravedad.
> Antigravity es el árbol — Yapu teje el nido de memoria. 🪺

---

## 🚀 Instalación

```bash
npm install -g @davidsd/yapu-cli
```

**Zero dependencies** — solo `node:fs` y `node:path`.

🤖 **¿Eres una IA (o usas una)?** Carga el [Prompt Instalador para LLMs](docs/LLM_INSTALLER.es.md) en tu agente para que instale, configure y asimile las reglas de Yapu automáticamente.

💡 **¿Quieres conocer el flujo de trabajo?** Lee la [Guía de Flujo de Trabajo para Vibe Coders](docs/WORKFLOW.es.md) para aprender a integrar Yapu en tu día a día con Cursor/Cline/Windsurf.

---

## 🧠 Memoria Dual — La Arquitectura Central

El brain de Antigravity es **efímero** (por conversación). El directorio `.planning/` es **persistente** (por proyecto, vive en git). Yapu es el puente que sincroniza ambos mundos.

```
┌─────────────────────────┐       yapu sync        ┌─────────────────────────┐
│   🧠 Antigravity Brain  │ ◄────────────────────► │   🪺 .planning/         │
│   (efímero, por sesión) │       yapu handoff      │   (persistente, en git) │
└────────────┬────────────┘                         └────────────┬────────────┘
             │                                                   │
             │            ┌───────────────────┐                  │
             └───────────►│  Tríada de Memoria │◄────────────────┘
                           │  PROJECT · ROADMAP │
                           │      · STATE       │
                           └───────────────────┘
```

**Sync automático:** cada workflow tiene bloques **Pre-Sync** (lee estado heredado) y **Post-Sync** (persiste progreso). El LLM nunca pierde el hilo entre sesiones.

---

## 📜 La Tríada de Memoria

| Archivo         | Rol                  | Descripción                                                     |
|-----------------|----------------------|-----------------------------------------------------------------|
| `PROJECT.md`    | 🏛️ La Visión        | Stack, reglas arquitectónicas y mandamientos intocables.         |
| `ROADMAP.md`    | 🗺️ El Plan Macro    | Fases secuenciales del proyecto. Prohibido saltar de fase.       |
| `STATE.md`      | ⚡ Estado Operativo  | Modo activo, fase actual y tareas técnicas de corta duración.    |

---

## 🛠️ Comandos del CLI (10)

```bash
yapu init              # 🪺 Funda la colonia (.planning/ + skills completos)
yapu status            # 📊 Radiografía del proyecto
yapu dash              # 📟 Monitor TUI en tiempo real (Zero-dependency)
yapu gc                # 🗑️ Recolector de basura contextual (comprime historial)
yapu rescue <log>      # 🚑 Auto-Heal: lee un error de CI/CD y prepara un fix
yapu archive           # 📦 Fin de temporada (congela tareas en HISTORY.md)
yapu install-hooks     # 🐝 Despliega el avispero (Yapu Guard)
yapu sync              # 🔄 Sincroniza brain de Antigravity → .planning/
yapu handoff           # 🤝 Genera handoff para la siguiente sesión
yapu brain <list|log>  # 🔍 Inspecciona el brain de Antigravity
```

### Detalle de Comandos

- **`yapu init`** — Scaffolds `.planning/` con 11 subdirectorios + 5 archivos base. Copia 41 workflows, 25 referencias, 3 contextos y 5 plantillas de codebase a `.agents/skills/`. También copia `PROJECT.md`, `ROADMAP.md` y `STATE.md` a la raíz del proyecto. Nunca sobreescribe archivos existentes.
- **`yapu status`** — Lee `STATE.md` y reporta modo operacional, fase activa, lista de tareas e integridad de specs.
- **`yapu dash`** — Renderiza un monitor interactivo TUI a 60FPS leyendo el `ROADMAP.md` y los logs de la IA (Sin dependencias).
- **`yapu gc`** — Archiva fases antiguas de `.planning/phases/` y prepara la compresión de tokens (Contextual Garbage Collector).
- **`yapu rescue <log>`** — Crea instantáneamente una sesión de depuración e instrucción de Auto-Heal para tu IA basada en un log de error.
- **`yapu archive`** — Congela tareas completadas de `STATE.md` en `HISTORY.md` con marca de tiempo.
- **`yapu install-hooks`** — Despliega **Yapu Guard**, hook pre-commit nativo ultrarrápido (<1.5s).
- **`yapu sync --brain-path <path>`** — Fallback manual: sincroniza artefactos del brain de Antigravity a `.planning/`.
- **`yapu handoff`** — Genera `HANDOFF.json` + `.continue-here.md` para continuidad de sesión.
- **`yapu brain list --path <path>`** — Lista artefactos del brain con tipo, resumen y fecha.
- **`yapu brain log --path <path> -n N`** — Muestra las últimas N entradas del log de conversación.

---

## ⚡ Flujos de Agentes Autónomos Incluidos
Además de la organización, YapuCli instala plantillas avanzadas (`.agents/skills/`) para que tu IA trabaje como un equipo completo:
- **LORE_MASTER**: Condensa miles de tokens de contexto en un solo `LORE.md` ultradenso.
- **GUARDIÁN DE PRODUCCIÓN**: Workflow de Auto-Heal que se acciona mediante `yapu rescue` en CI/CD.
- **CHAOS MONKEY (`yapu-chaos.md`)**: Ingeniería de Resiliencia Autónoma. Ordénale a tu IA ejecutar este modo para que inyecte latencia y rompa dependencias intencionalmente, y luego repare la arquitectura para lograr una degradación elegante (Graceful Degradation).

---

## 📂 Estructura de `.planning/`

```
.planning/
├── STATE.md
├── ROADMAP.md
├── REQUIREMENTS.md
├── METHODOLOGY.md
├── config.json
├── codebase/       # 7 docs de análisis (generados por yapu-map)
├── phases/         # CONTEXT.md, PLAN.md, SUMMARY.md por fase
├── debug/          # Tracking de sesiones de debug
├── seeds/          # Ideas forward-looking
├── notes/
├── todos/
├── research/
├── quick/
└── spikes/
```

---

## ⚡ Arsenal de Skills (85 archivos)

**41 workflows · 11 schemas · 25 referencias · 3 contextos · 5 plantillas de codebase**

### 1. Flujo Base 🪺
`map` · `plan` · `execute` · `verify`

### 2. Interrogación (Grill) 🔥
`grill-me` · `grill-docs` · `spec`

### 3. Escuadrones de Élite 🎯
`secops` · `dba` · `ui` · `forensics`

### 4. Descubrimiento 🔬
`discovery` · `discuss` · `research`

### 5. Gestión de Sesión 📋
`resume` · `progress` · `session-report` · `handoff`

### 6. Utilidades 🔧
`debug` · `seed` · `quick` · `thread` · `health` · `audit` · `code-review` · `docs` · `tests` · `undo` · `ship` · `sketch` · `autonomous` · `learnings`

---

## 🧪 Tests e Infraestructura

10/10 pruebas de integración · ESLint clean

```bash
npm run test    # Suite completa de integración
npm run lint    # Validación estática
```

---

## 🪺 Filosofía

> *El yapú no improvisa: cada fibra del nido tiene un propósito estructural.*

Yapu aplica el mismo principio al contexto del LLM — memoria estática explícita, sincronización determinista y cero dependencias externas. El agente siempre sabe dónde está, qué hizo y qué sigue.

---

<p align="center"><strong>YapuCli 🪺</strong> — El nido que desafía la gravedad.</p>
