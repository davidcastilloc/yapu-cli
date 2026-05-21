# Referencia de Comandos - YapuCli 🪺

Documentación completa de todos los comandos disponibles en YapuCli.

---

## 1. `yapu init`

Inicializa la estructura de planificación del proyecto.

### Uso

```bash
yapu init
```

### Comportamiento

- Crea el directorio `.planning/` con **11 subdirectorios**:
  - `codebase`, `phases`, `debug`, `debug/resolved`, `seeds`, `notes`, `todos`, `research`, `quick`, `spikes`
- Genera archivos base desde plantillas:
  - `.planning/STATE.md`
  - `.planning/ROADMAP.md`
  - `.planning/config.json`
- Crea archivos con encabezados iniciales:
  - `.planning/REQUIREMENTS.md`
  - `.planning/METHODOLOGY.md`
- Copia `PROJECT.md`, `ROADMAP.md` y `STATE.md` a la raíz del proyecto (compatibilidad hacia atrás).
- Copia dinámicamente **todos** los workflows `yapu-*.md` a `.agents/skills/`.
- Copia referencias a `.agents/skills/references/`.
- Copia contextos a `.agents/skills/contexts/`.
- Copia plantillas de codebase a `.agents/skills/codebase/`.
- **Nunca sobrescribe archivos existentes.**

### Ejemplo de salida

```
🪺 YapuCli - Inicializando proyecto...

✅ Estructura .planning/ creada
✅ Archivos base generados (STATE.md, ROADMAP.md, config.json)
✅ 12 workflows copiados a .agents/skills/
✅ 3 referencias copiadas a .agents/skills/references/
✅ 2 contextos copiados a .agents/skills/contexts/
✅ 4 plantillas de codebase copiadas a .agents/skills/codebase/
✅ Archivos raíz copiados (PROJECT.md, ROADMAP.md, STATE.md)

🎉 Proyecto inicializado correctamente.
```

---

## 2. `yapu status`

Muestra el estado actual del proyecto leyendo los archivos de planificación.

### Uso

```bash
yapu status
```

### Comportamiento

- Lee `STATE.md` desde la raíz del proyecto.
- Extrae y muestra:
  - **Modo operacional** actual.
  - **Fase activa** del proyecto.
  - **Lista de tareas** pendientes y completadas.
- Verifica la integridad de `PROJECT.md` y `ROADMAP.md`, mostrando `OK` o `MISSING` para cada uno.
- **Error**: Si `STATE.md` no se encuentra, el comando falla con un mensaje de error.

### Ejemplo de salida

```
🪺 YapuCli - Estado del Proyecto

📋 Modo operacional: BUILD
📍 Fase activa: Fase 2 - Implementación Core

📝 Tareas:
  [x] Configurar estructura base
  [ ] Implementar comando sync
  [ ] Escribir tests unitarios

📄 PROJECT.md: OK
📄 ROADMAP.md: OK
```

---

## 3. `yapu archive`

Archiva las tareas completadas de `STATE.md` al historial.

### Uso

```bash
yapu archive
```

### Comportamiento

- Extrae las tareas marcadas como completadas (`[x]`) de `STATE.md`.
- Las añade a `HISTORY.md` con una marca de tiempo (timestamp).
- Limpia la sección de tareas de `STATE.md`, removiendo las tareas archivadas.
- **Error**: Falla si `STATE.md` no se encuentra o si no hay tareas completadas para archivar.

### Ejemplo de salida

```
🪺 YapuCli - Archivando tareas completadas

📦 3 tareas archivadas en HISTORY.md
🧹 STATE.md limpiado

✅ Archivo completado.
```

---

## 4. `yapu install-hooks`

Instala git hooks para validar directivas del proyecto.

### Uso

```bash
yapu install-hooks
```

### Comportamiento

- **Requiere** que exista un directorio `.git` en el proyecto (debe ser un repositorio Git).
- Copia la plantilla `templates/pre-commit` a `.git/hooks/pre-commit`.
- Establece permisos de ejecución (`chmod 755`) en el hook.
- El hook `pre-commit` instalado valida las directivas de `PROJECT.md` antes de cada commit.
- **Error**: Falla si no existe el directorio `.git`.

### Ejemplo de salida

```
🪺 YapuCli - Instalando hooks

✅ Hook pre-commit instalado en .git/hooks/pre-commit
🔒 Permisos establecidos (755)

El hook validará PROJECT.md en cada commit.
```

---

## 5. `yapu health`

Valida la integridad de la colonia (el espacio de trabajo YapuCli).

### Uso

```bash
yapu health
```

### Comportamiento

- **Valida archivos de memoria raíz**: PROJECT.md, ROADMAP.md, STATE.md.
- **Valida estructura del nido (.planning/)**: verifica que la carpeta exista y contenga los 10 subdirectorios reglamentarios (`codebase`, `phases`, `debug`, etc.).
- **Valida especificaciones base**: verifica existencia de STATE.md, ROADMAP.md, REQUIREMENTS.md, METHODOLOGY.md y config.json en .planning/.
- **Valida sintaxis JSON**: analiza que `.planning/config.json` tenga un formato JSON válido y libre de errores sintácticos.
- **Valida Yapu Guard**: revisa si el hook de pre-commit está instalado en `.git/hooks/pre-commit` y si cuenta con permisos de ejecución.
- **Valida consistencia semántica**: verifica que `STATE.md` contenga las declaraciones de `FASE ACTIVA` y `MODO DE OPERACIÓN ACTUAL`.
- Retorna código de salida `0` si el espacio de trabajo es 100% saludable, o `1` si detecta errores críticos que requieran reparación.

### Ejemplo de salida

```
=== 🪺 YAPU WORKSPACE HEALTH CHECK ===

[+] Checking core memory files...
  ✅ PROJECT.md exists
  ✅ ROADMAP.md exists
  ✅ STATE.md exists

[+] Checking .planning/ colony structure...
  ✅ .planning/ directory exists
  ✅ All 10 required subdirectories exist
  ✅ .planning/STATE.md exists
  ✅ .planning/ROADMAP.md exists
  ✅ .planning/REQUIREMENTS.md exists
  ✅ .planning/METHODOLOGY.md exists
  ✅ .planning/config.json exists
  ✅ config.json has valid JSON format

[+] Checking Yapu Guard (Git Hooks)...
  ✅ Active git repository detected
  ✅ Pre-commit hook installed at .git/hooks/pre-commit
  ✅ Pre-commit hook is executable

[+] Checking Memory Integrity...
  ✅ Operational mode declared in STATE.md
  ✅ Active phase declared in STATE.md

=============================================
🔥 Workspace is 100% HEALTHY! The colony is thriving. 🪺
```

---

## 6. `yapu sync`

Sincroniza artefactos desde un directorio brain de Antigravity al proyecto.

### Uso

```bash
yapu sync [--brain-path <ruta>]
```

### Parámetros

| Parámetro | Requerido | Descripción |
|---|---|---|
| `--brain-path` | No | Ruta al directorio brain de Antigravity (si se omite, se auto-detecta la sesión activa) |

### Comportamiento

- Lee los artefactos del directorio brain especificado.
- Mapea los artefactos a archivos dentro de `.planning/`:

| Tipo de artefacto | Destino |
|---|---|
| `implementation_plan` | `.planning/current-plan.md` |
| `task` | `.planning/current-tasks.md` |
| `walkthrough` | `.planning/current-walkthrough.md` |
| Artefactos custom | `.planning/artifacts/{nombre}.md` |

- **Requiere** que el directorio `.planning/` exista previamente (ejecutar `yapu init` primero).
- Reporta la cantidad de artefactos sincronizados y cualquier error encontrado.

### Ejemplo de salida

```
🪺 YapuCli - Sincronizando artefactos

🔄 Leyendo brain: /home/user/.gemini/antigravity-cli/brain/abc123/

📥 Sincronizados:
  ✅ implementation_plan → .planning/current-plan.md
  ✅ task → .planning/current-tasks.md
  ✅ walkthrough → .planning/current-walkthrough.md
  ✅ custom: api_design → .planning/artifacts/api_design.md

✅ 4 artefactos sincronizados, 0 errores.
```

---

## 7. `yapu handoff`

Genera archivos de traspaso para continuar el trabajo en otra sesión o contexto.

### Uso

```bash
yapu handoff [--brain-path <ruta>]
```

### Parámetros

| Parámetro | Requerido | Descripción |
|---|---|---|
| `--brain-path` | No | Ruta al directorio brain para contexto adicional (si se omite, se auto-detecta la sesión activa) |

### Comportamiento

- Lee `.planning/STATE.md` para determinar la posición actual del proyecto.
- Genera dos archivos de traspaso:

| Archivo | Formato | Propósito |
|---|---|---|
| `.planning/HANDOFF.json` | JSON | Estado legible por máquina |
| `.planning/.continue-here.md` | Markdown | Resumen legible por humanos |

- Si se proporciona `--brain-path`, incorpora contexto adicional del brain de Antigravity en los archivos generados.

### Ejemplo de salida

```
🪺 YapuCli - Generando handoff

📄 Leyendo estado actual desde .planning/STATE.md...

📦 Archivos generados:
  ✅ .planning/HANDOFF.json (estado máquina)
  ✅ .planning/.continue-here.md (resumen humano)

🤝 Handoff listo. Comparte estos archivos para continuar el trabajo.
```

---

## 8. `yapu brain`

Inspecciona el contenido de un directorio brain de Antigravity. Tiene dos subcomandos: `list` y `log`.

---

### 8.1 `yapu brain list`

Lista los artefactos almacenados en un directorio brain.

#### Uso

```bash
yapu brain list [--path <ruta>]
```

#### Parámetros

| Parámetro | Requerido | Descripción |
|---|---|---|
| `--path` | No | Ruta al directorio brain (si se omite, se auto-detecta la sesión activa) |

#### Comportamiento

- Escanea el directorio brain en busca de archivos `*.metadata.json`.
- Revisa tanto la raíz como el subdirectorio `artifacts/`.
- Para cada artefacto muestra:
  - **Nombre** del artefacto
  - **Tipo** (`implementation_plan`, `task`, `walkthrough`, `other`)
  - **Resumen** (summary)
  - **Última actualización** (`updatedAt`)

#### Ejemplo de salida

```
🪺 YapuCli - Brain: Artefactos

📂 Brain: /home/user/.gemini/antigravity-cli/brain/abc123/

┌──────────────────────┬─────────────────────┬────────────────────────────────┬─────────────────────┐
│ Nombre               │ Tipo                │ Resumen                        │ Actualizado         │
├──────────────────────┼─────────────────────┼────────────────────────────────┼─────────────────────┤
│ plan_principal        │ implementation_plan │ Plan de implementación del API │ 2026-05-21 10:30:00 │
│ tareas_sprint         │ task                │ Tareas del sprint actual       │ 2026-05-21 11:00:00 │
│ walkthrough_auth      │ walkthrough         │ Guía del módulo de auth        │ 2026-05-20 15:45:00 │
└──────────────────────┴─────────────────────┴────────────────────────────────┴─────────────────────┘

📊 3 artefactos encontrados.
```

---

### 8.2 `yapu brain log`

Muestra las entradas recientes del log de conversación.

#### Uso

```bash
yapu brain log [--path <ruta>] [-n N]
```

#### Parámetros

| Parámetro | Requerido | Descripción |
|---|---|---|
| `--path` | No | Ruta al directorio brain (si se omite, se auto-detecta la sesión activa) |
| `-n` | No | Número de entradas a mostrar (por defecto: 20) |

#### Comportamiento

- Parsea el log de conversación (`transcript.jsonl` o `overview.txt`) del directorio brain.
- Muestra las últimas **N** entradas (20 por defecto).
- Cada entrada incluye:
  - **Ícono**: `👤` para mensajes del usuario, `🤖` para respuestas del modelo
  - **Índice del paso** (step index)
  - **Tipo** de entrada
  - **Vista previa** del contenido

#### Ejemplo de salida

```
🪺 YapuCli - Brain: Log de conversación

📂 Brain: /home/user/.gemini/antigravity-cli/brain/abc123/
📜 Mostrando últimas 5 entradas:

#12 👤 USER_INPUT      "Implementa el endpoint de autenticación..."
#13 🤖 MODEL_RESPONSE  "Voy a crear el módulo de auth con JWT..."
#14 🤖 TOOL_CALL       write_to_file → src/auth/handler.ts
#15 🤖 MODEL_RESPONSE  "He implementado el handler. Ahora voy a..."
#16 👤 USER_INPUT      "Agrega validación de tokens expirados"
```

---

## 9. `yapu menu` / `yapu dashboard`

Lanza el panel de control interactivo en terminal (TUI) de la colonia.

### Uso

```bash
yapu menu
yapu dashboard
```

### Comportamiento

- **Modo Interactivo (TTY)**:
  - Captura eventos del teclado en modo Raw de stdin.
  - Renderiza una interfaz de usuario estética en terminal (TUI) con bordes ANSI y colores temáticos de la naturaleza.
  - Presenta un resumen del nido en tiempo real cargado dinámicamente de `STATE.md` (Modo, Fase Activa, Tareas completadas/totales, Estado de Yapu Guard, y archivos de especificaciones raíz).
  - Permite navegar con las flechas direccionales (`↑` / `↓`) y presionar `Enter` para lanzar los comandos (`sync`, `health`, `archive`, `handoff`, `status`, `brain list`, `install-hooks`).
  - Al ejecutar una acción, muestra su salida directamente y provee una pausa interactiva ("Presiona cualquier tecla para regresar al panel...") para retornar fluidamente al menú.
  - Restaura de forma limpia el estado del cursor y el flujo de la terminal al salir (`q`, `Esc`, `Ctrl+C`).
- **Modo No Interactivo (fuera de TTY/Entorno de Tests)**:
  - Detecta la ausencia de TTY y muestra un resumen textual estático e informativo de los comandos sin suspender el proceso, previniendo cuelgues en entornos automatizados o pipelines de CI/CD.

### Ejemplo de interfaz interactiva

```
┌──────────────────────────────────────────────────────────────┐
│  🪺  C O N O T O   -   Y A P U C L I   D A S H B O A R D   │
└──────────────────────────────────────────────────────────────┘
📂 Nido Activo: /home/davidc/Documentos/DONE/yapu-cli
────────────────────────────────────────────────────────────────
📋 ESTADO DEL PROYECTO
  ├ Modo Operativo : BUILD
  ├ Fase Activa    : Fase 3 - Pruebas y Validación
  ├ Tareas Activas : 12/14 completadas (86%)
  ├ Yapu Guard Hook: ACTIVO
  └ Especificaciones: PROJECT.md (OK) | ROADMAP.md (OK)
────────────────────────────────────────────────────────────────
🛠️  ACCIONES DISPONIBLES (Navega con ↑/↓ y presiona Enter)

  👉  Sincronizar Colonia (yapu sync) 
     Diagnóstico de Salud (yapu health)
     Archivar Tareas Completadas (yapu archive)
     Preparar Handoff de Sesión (yapu handoff)
     Ver Estado Detallado (yapu status)
     Inspeccionar Brain (yapu brain list)
     Instalar Yapu Guard Hooks (yapu install-hooks)
     Salir del Avispero

────────────────────────────────────────────────────────────────
Instrucciones: ↑/↓ Navegar | Enter Seleccionar | Esc/q Salir
```

---

## Ayuda General

Al ejecutar `yapu` sin argumentos se muestra la pantalla de ayuda con todos los comandos disponibles:

```bash
yapu
```

```
🪺 YapuCli v1.0.0

Uso: yapu <comando> [opciones]

Comandos disponibles:
  init            Inicializa la estructura de planificación
  status          Muestra el estado actual del proyecto
  health          Valida la integridad del espacio de trabajo
  archive         Archiva tareas completadas
  install-hooks   Instala git hooks de validación
  sync            Sincroniza artefactos desde brain (auto-detectado)
  handoff         Genera archivos de traspaso (auto-detectado)
  brain           Inspecciona directorio brain (list, log) (auto-detectado)

Ejecuta 'yapu <comando> --help' para más información sobre un comando.
```
