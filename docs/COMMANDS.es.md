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

      Tareas:
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

    4 artefactos sincronizados, 0 errores.
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

## 10. `yapu board`

Lanza el **Yapu Command Center (C2)** — un dashboard web local sin dependencias para monitoreo en tiempo real y control interactivo del proyecto.

### Uso

```bash
yapu board [--port N]
```

### Parámetros

| Parámetro | Requerido | Descripción |
|---|---|---|
| `--port` | No | Puerto HTTP del servidor local (por defecto: `4040`) |

### Comportamiento

- Inicia un servidor HTTP local con `node:http` y **cero dependencias externas**.
- Sirve una interfaz web premium con tema oscuro en `http://localhost:4040`.
- Abre automáticamente el navegador predeterminado.
- **Streaming en tiempo real** mediante Server-Sent Events (SSE):
  - Vigila `STATE.md` con `fs.watch` y envía actualizaciones instantáneas cuando el archivo cambia.
  - Transmite entradas del transcript del brain (feed neuronal) de la sesión activa de Antigravity.
  - Canaliza `stdout`/`stderr` de los comandos ejecutados hacia la consola del navegador.
- **Gestión interactiva de tareas**: Haz clic en los checkboxes de tareas en la interfaz para alternar su estado en `STATE.md` (escrituras atómicas).
- **Ejecución de comandos**: Ejecuta comandos yapu autorizados directamente desde la interfaz web.
- **Seguridad**: Solo los siguientes comandos son ejecutables desde la UI (lista blanca):
  `plan`, `execute`, `status`, `check`, `health`, `sync`, `handoff`, `snapshot`, `gc`, `rescue`.
  Cualquier otro comando retorna `403 Forbidden`.

### Diseño de la Interfaz

| Panel | Contenido |
|---|---|
| **Izquierdo** | Fase activa, barra de progreso, checklist interactivo de tareas |
| **Derecho** | Consola con pestañas: Feed Neuronal (logs del brain) + Salida de Proceso (resultados de comandos) |
| **Inferior** | Barra de comandos con botones de acción (Plan, Execute, Check, Health, Sync, etc.) |

### Ejemplo de Salida (Terminal)

```
🪺 Iniciando Yapu Command Center...
🌐 C2 escuchando en http://localhost:4040
  → http://localhost:4040

  Press Ctrl+C to stop.
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
  board [--port N] Lanza el Command Center (C2) web interactivo

Ejecuta 'yapu <comando> --help' para más información sobre un comando.
```
