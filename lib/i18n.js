import fs from 'node:fs';
import path from 'node:path';

export const SUPPORTED_LANGUAGES = ['es', 'en'];

let activeLanguage = null;

const TRANSLATIONS = {
  es: {
    init_start: '🪺 Inicializando YapuCli...\n',
    init_colony: '🪺 Fundando la colonia (.planning/)...',
    init_dir_scaffolded: '✅ Directorio .planning/ scaffoldeado.',
    init_file_created: '✅ {label} inicializado.',
    init_file_skipped: '⚠️  {label} ya existe (omitido).',
    init_skills_created: '✅ Directorio .agents/skills/ creado.',
    init_deploying_workflows: '\n🪺 Desplegando arsenal completo de fibras...',
    init_workflows_count: '🔥 {count} workflows cargados en .agents/skills/',
    init_references_count: '🔥 {count} referencias cargadas en .agents/skills/references/',
    init_contexts_count: '🔥 {count} contextos cargados en .agents/skills/contexts/',
    init_codebase_count: '🔥 {count} templates de codebase cargados en .agents/skills/codebase/',
    init_done: '\n🚀 ¡Colonia fundada! Yapu está listo para tejer.',

    archive_start: '🪺 Ejecutando Sistema de Archivo (Yapu Context Freeze)...\n',
    archive_no_state: '❌ Error: STATE.md no encontrado en el directorio raíz.',
    archive_no_completed: 'ℹ️  No se encontraron tareas completadas ([x]) en STATE.md para archivar.',
    archive_success: '✅ Tareas archivadas con éxito en HISTORY.md ({count} tareas).',
    archive_state_cleaned: '✅ STATE.md ha sido limpiado y preparado para la siguiente fase.',
    archive_state_warn: '⚠️  Advertencia: No se pudo formatear STATE.md automáticamente.',
    archive_entry_title: '\n# ARCHIVO DE CONTEXTO: {phase}\n',
    archive_entry_frozen: '*Congelado el:* {timestamp}\n\n',
    archive_entry_tasks: '### Tareas Técnicas Archivadas:\n',
    archive_next_phase_todo: '- [ ] [Definir Tarea 1 de la siguiente fase]\n',

    status_title: '=== 🪺 YAPU SYSTEM STATUS ===\n',
    status_no_state: '❌ Error: No se encontró STATE.md. Ejecuta "yapu init" primero.',
    status_opr_mode: '[ OPR MODE  ] : {mode}',
    status_phase: '[ PHASE     ] : {phase}',
    status_tasks: '[ TASKS     ] :',
    status_no_tasks: '  (No hay tareas definidas en STATE.md)',
    status_specs: '[ SPECS     ] : PROJECT.md ({project}) | ROADMAP.md ({roadmap})',
    status_footer: '\n=================================',
    status_read_error: '❌ Error leyendo la memoria de Yapu: {message}',

    hooks_start: '🪺 Instalando Yapu Guard en Git Hooks...\n',
    hooks_no_git: '❌ Error: Este directorio no es un repositorio Git activo (.git no encontrado).',
    hooks_success: '✅ Yapu Guard: .git/hooks/pre-commit instalado con éxito.',
    hooks_chmod_warn: '⚠️  No se pudieron asignar permisos ejecutables automáticamente: {message}',
    hooks_no_template: '❌ Error: Plantilla del hook "pre-commit" no encontrada.',

    health_title: '=== 🪺 DIAGNÓSTICO DE SALUD DEL ESPACIO DE TRABAJO YAPU ===\n',
    health_core_memory: '[+] Comprobando archivos de memoria central...',
    health_project_exists: 'PROJECT.md existe',
    health_roadmap_exists: 'ROADMAP.md existe',
    health_state_exists: 'STATE.md existe',
    health_planning_colony: '[+] Comprobando la estructura de la colonia .planning/...',
    health_planning_exists: 'El directorio .planning/ existe',
    health_all_subdirs_exist: 'Los 10 subdirectorios requeridos existen',
    health_file_exists: '.planning/{name} existe',
    health_config_json_format: 'config.json tiene un formato JSON válido',
    health_config_json_syntax: 'config.json contiene una sintaxis JSON inválida',
    health_guard_hooks: '[+] Comprobando Yapu Guard (Git Hooks)...',
    health_active_git: 'Repositorio Git activo detectado',
    health_hook_installed: 'Hook de pre-commit instalado en .git/hooks/pre-commit',
    health_hook_executable: 'El hook de pre-commit es ejecutable',
    health_hook_perms: 'No se pudieron leer los permisos del hook de pre-commit',
    health_memory_integrity: '[+] Comprobando la integridad de la memoria...',
    health_opr_mode_declared: 'Modo de operación declarado en STATE.md',
    health_active_phase_declared: 'Fase activa declarada en STATE.md',
    health_state_read_error: 'No se pudo leer la estructura de contexto de STATE.md',
    health_state_skipped: 'Omitido (falta STATE.md)',
    health_report_separator: '=============================================',
    health_healthy: '🔥 ¡El espacio de trabajo está 100% SALUDABLE! La colonia está prosperando. 🪺',
    health_warnings: '⚠️  El espacio de trabajo es funcional pero tiene {count} advertencia(s).',
    health_unhealthy: '❌ El espacio de trabajo NO ESTÁ SALUDABLE con {errors} error(es) y {warnings} advertencia(s).',
    health_repair_tip: '👉 Ejecuta "yapu init" o "yapu install-hooks" para repararlo.',

    sync_brain_detected: '🧠 Brain activo detectado automáticamente: {path}\n',
    sync_usage: '❌ Uso: yapu sync --brain-path <ruta-al-brain>\n   Ejemplo: yapu sync --brain-path <ruta-al-directorio-brain>',
    sync_brain_not_found: '❌ Error: Directorio del brain no encontrado: {path}',
    sync_no_planning: '❌ Error: .planning/ no encontrado. Ejecuta "yapu init" primero.',
    sync_start: '🪺 Sincronizando brain de Antigravity → .planning/...\n',
    sync_success: '✅ Sincronizado: {name}',
    sync_no_artifacts: 'ℹ️  No se encontraron artifacts en el brain para sincronizar.',
    sync_error: '⚠️  Error: {error}',
    sync_done: '\n🪺 Sync completado: {count} artifacts sincronizados.',
    sync_fatal_error: '❌ Error durante la sincronización: {message}',

    handoff_start: '🪺 Generando handoff para la siguiente sesión...\n',
    handoff_success_json: '✅ HANDOFF.json generado: {path}',
    handoff_success_md: '✅ .continue-here.md generado: {path}',
    handoff_done: '\n🪺 Handoff listo. La siguiente sesión retomará automáticamente.',
    handoff_error: '❌ Error generando el handoff: {message}',
    handoff_md_title: '# Continuar Aquí\n',
    handoff_md_auto_gen: '> Auto-generado el {date}\n',
    handoff_md_current_state: '## Estado Actual',
    handoff_md_current_plan: '## Plan Actual (extracto)',
    handoff_md_brain_artifacts: '## Artifacts del Brain',
    handoff_md_brain_art_item: '- **{name}** ({type}) — {summary}',
    handoff_md_no_summary: 'sin resumen',
    handoff_md_recent_activity: '## Actividad Reciente',
    handoff_md_brain_path: '## Ruta del Brain',

    brain_usage: '❌ Uso: yapu brain <list|log> --path <ruta-al-brain>\n   Ejemplo: yapu brain list --path <ruta-al-directorio-brain>',
    brain_list_title: '=== 🪺 YAPU BRAIN INSPECTOR ===\n',
    brain_no_artifacts: 'ℹ️  No se encontraron artifacts en el brain.',
    brain_artifacts_found: '[ ARTIFACTS ] : {count} encontrados\n',
    brain_art_name: '  📄 {name}',
    brain_art_type: '     Tipo: {type}',
    brain_art_summary: '     Resumen: {summary}',
    brain_art_updated: '     Actualizado: {updated}',
    brain_art_no_summary: 'sin resumen',
    brain_art_unknown_updated: 'fecha de actualización desconocida',
    brain_read_error: '❌ Error leyendo el brain: {message}',
    brain_log_title: '=== 🪺 YAPU BRAIN LOG (últimas {limit} entradas) ===\n',
    brain_log_empty: 'ℹ️  No se encontraron entradas en el log del brain.',
    brain_log_error: '❌ Error leyendo el log: {message}',
    brain_unrecognized: '❌ Subcomando no reconocido. Usa: yapu brain <list|log> --path <ruta>',

    check_title: '=== 🪺 DIAGNÓSTICO DE ESPACIO DE TRABAJO YAPU (FASE 5) ===\n',
    check_reading: '[+] Escaneando la tríada de memoria en busca de anti-patrones...',
    check_no_files: '❌ Error Crítico: No se pudieron leer los archivos de memoria central. Ejecuta "yapu init" primero.',
    check_warn_placeholder: '⚠️  Anti-patrón detectado: Placeholder sin resolver (TBD, TODO, [Insert...]) en {file} (línea {line})',
    check_warn_empty_tasks: '⚠️  Anti-patrón detectado: No hay tareas activas definidas en {file}',
    check_warn_contradiction: '⚠️  Anti-patrón detectado: Desajuste de fase entre STATE.md y PROJECT.md',
    check_success: '🔥 Diagnóstico completado: Cero anti-patrones detectados. ¡La memoria está inmaculada! 🪺',
    check_summary: '❌ Diagnóstico completado: Se detectaron {count} anti-patrón(es).',

    help_title: '🪺 Framework YapuCli\n',
    help_usage: 'Uso:',
    help_init: '  yapu init              -> Funda la colonia (.planning/ + skills completos).',
    help_status: '  yapu status            -> Radiografía del proyecto.',
    help_health: '  yapu health            -> Valida la integridad del espacio de trabajo.',
    help_check: '  yapu check             -> Diagnóstico: escanea la memoria buscando anti-patrones (Fase 5).',
    help_archive: '  yapu archive           -> Fin de temporada (congela tareas en HISTORY.md).',
    help_install_hooks: '  yapu install-hooks     -> Despliega el avispero (Yapu Guard).',
    help_sync: '  yapu sync              -> Sincroniza brain de Antigravity → .planning/ (auto-detectado).',
    help_handoff: '  yapu handoff           -> Genera handoff para la siguiente sesión (auto-detectado).',
    help_brain: '  yapu brain <list|log>  -> Inspecciona el brain de Antigravity (auto-detectado).',
    help_provider: '  yapu provider          -> Diagnóstico de proveedores IA detectados en el sistema.',
    provider_title: '=== 🪺 YAPU PROVIDER DIAGNOSTICS ===\n',
    provider_detected: '🔍 Proveedores detectados:',
    provider_installed: '  ✅ {name}  → {path}',
    provider_not_installed: '  ❌ {name}  → no instalado',
    provider_has_data: ' ({sessions} sesiones)',
    provider_no_data: ' (sin datos)',
    provider_active: '\n  ⚡ Activo: {name} ({mode})',
    dash_start: '🪺 Iniciando Dashboard TUI (Modo interactivo). Presiona Ctrl+C para salir.\n',
    dash_no_planning: '❌ Error: .planning/ no encontrado. Ejecuta "yapu init" primero.',
    help_dash: '  yapu dash              -> Panel de control interactivo en tiempo real (TUI).',
    gc_start: '🪺 Iniciando Recolección de Basura Contextual (Contextual GC)...\n',
    gc_no_phases: 'ℹ️  No se encontraron archivos en .planning/phases/ para comprimir.',
    gc_archived: '✅ Archivos originales movidos a {path}',
    gc_prompt_generated: '🔥 Tarea LORE_MASTER generada en {path}\n👉 Instruye a tu IA: "Ejecuta {path}"',
    help_gc: '  yapu gc                -> Comprime fases antiguas en LORE.md (Contextual GC).',
    rescue_start: '🪺 Iniciando Guardián de Producción (Auto-Heal)...\n',
    rescue_no_log: '❌ Error: Debes proporcionar la ruta a un archivo de log de error.\n   Uso: yapu rescue ./error.log',
    rescue_session_created: '✅ Sesión de rescate (Auto-Heal) creada en {path}\n👉 Instruye a tu IA: "Ejecuta {path}"',
    help_rescue: '  yapu rescue <log>      -> Auto-Heal: Lee un log de error CI/CD y prepara un fix.',
    swarm_start: '🪺 Iniciando Yapu Swarm (Orquestación Paralela de Subagentes)...\n',
    swarm_no_tasks: 'ℹ️  No se encontraron tareas pendientes para ejecutar.',
    swarm_running_task: '🚀 [{id}] Iniciando subagente para: {name}',
    swarm_completed_task: '✅ [{id}] Subagente completó la tarea exitosamente.',
    swarm_failed_task: '❌ [{id}] Subagente falló con código de salida {code}.',
    swarm_summary_title: '\n=== 🪺 YAPU SWARM SUMMARY ===\n',
    swarm_summary_success: '¡Todas las tareas se completaron exitosamente!',
    swarm_summary_partial: '⚠️  Algunas tareas fallaron o no se pudieron ejecutar debido a dependencias.',
    swarm_git_commit: '📦 [{id}] Git commit realizado para los archivos: {files}',
    help_swarm: '  yapu swarm             -> Orquestación paralela de subagentes (Yapu Swarm).',
    snapshot_created: '✅ Snapshot del contexto creado con éxito: {name} (Git: {commit})',
    snapshot_error: '❌ Error al crear el snapshot: {error}',
    rewind_start: '🪺 Iniciando Yapu Time-Travel (Rewind)...\n',
    rewind_no_snapshots: '❌ Error: No se encontraron snapshots en .planning/.snapshots/',
    rewind_selected: '👉 Seleccionando el snapshot más reciente: {name}',
    rewind_confirm_prompt: '⚠️  ADVERTENCIA: Esto revertirá tus archivos de .planning/ y ejecutará un "git reset --hard {commit}" en tu código.\n¡Se perderán todos los cambios de código no committeados!\n¿Deseas continuar? [s/N]: ',
    rewind_cancelled: '❌ Rewind cancelado por el usuario.',
    rewind_restoring_files: '📂 Restaurando archivos de contexto a la carpeta .planning/...',
    rewind_restoring_git: '📦 Sincronizando código en Git al commit {commit}...',
    rewind_success: '🎉 ¡Yapu Time-Travel completado con éxito! Código y contexto rebobinados a {commit}.',
    rewind_error: '❌ Error durante el rebobinado: {error}',
    help_snapshot: '  yapu snapshot          -> Crea un snapshot manual del contexto y commit actual.',
    help_rewind: '  yapu rewind            -> Rebobina código y contexto al último punto estable.',
    profile_title: '=== 🪺 YAPU CONTEXT PROFILER (TOKEN DIETITIAN) ===\n',
    profile_header_file: 'Archivo / Categoría',
    profile_header_size: 'Tam (KB)',
    profile_header_tokens: 'Tokens Est.',
    profile_header_status: 'Estado',
    profile_total_weight: '[ PESO TOTAL DEL CONTEXTO ] : {size} KB | ~{tokens} Tokens',
    profile_rec_title: '👉 Recomendación: ',
    profile_rec_ok: 'El volumen del contexto es saludable. ¡La colonia está esbelta y ágil! 🪺',
    profile_rec_warning: 'El volumen del contexto está creciendo. Considera ejecutar "yapu archive" para congelar tareas completadas.',
    profile_rec_critical: '¡ALERTA CRÍTICA DE CONTEXTO! Ejecuta "yapu gc" para condensar fases antiguas o "yapu archive" inmediatamente para evitar alucinaciones de la IA.',
    help_profile: '  yapu profile           -> Diagnóstico de volumen y tokens del contexto (Dietista).',
    daemon_start: '📡 Iniciando Yapu Daemon (Sincronización en tiempo real)...',
    daemon_watching_path: '📂 Observando cambios en: {path}',
    daemon_synced_file: '⚡ [SINCRO] Artefacto "{name}" sincronizado con éxito.',
    daemon_error: '❌ Error en el daemon: {error}',
    help_daemon: '  yapu daemon            -> Sincroniza en tiempo real los artefactos del Brain de la IA. (Alias: yapu watch)',
    branch_start: '🌿 Sincronizando multiverso de contexto...',
    branch_current_saved: '💾 Estado de contexto de la rama "{name}" guardado.',
    branch_restored: '📂 Estado de contexto de la rama "{name}" restaurado.',
    branch_created: '🌿 Activada rama de Git "{name}".',
    branch_list_title: '🌿 === MULTIVERSO DE CONTEXTO (RAMAS ACTIVAS) ===\n',
    branch_err_dirty: '❌ Error: Tienes cambios sin confirmar en Git. Por favor, haz commit o stash antes de cambiar de rama.',
    merge_start: '🌀 Iniciando fusión del multiverso (rama "{name}")...',
    merge_success: '🎉 ¡Fusión completada con éxito! Código y contexto unificados.',
    merge_tasks_updated: '✅ Se actualizaron {count} tareas completadas en STATE.md.',
    merge_learnings_added: '🧠 Nuevos aprendizajes integrados en yapu-learnings.md.',
    help_branch: '  yapu branch [nombre]   -> Crea, cambia o lista ramas del multiverso de contexto.',
    help_merge: '  yapu merge <nombre>    -> Fusiona código y semánticamente el contexto de una rama.',
    board_start: '🪺 Iniciando Yapu Command Center...',
    board_listening: '🌐 C2 escuchando en http://localhost:{port}',
    board_no_state: '❌ Error: STATE.md no encontrado. Ejecuta "yapu init" primero.',
    board_opened: '🔗 Abriendo navegador...',
    board_shutdown: '\n🪺 Command Center apagado.',
    help_board: '  board [--port N]       -> Lanza el Command Center (C2) web en localhost.'
  },
  en: {
    init_start: '🪺 Initializing YapuCli...\n',
    init_colony: '🪺 Founding the colony (.planning/)...',
    init_dir_scaffolded: '✅ .planning/ directory scaffolded.',
    init_file_created: '✅ {label} initialized.',
    init_file_skipped: '⚠️  {label} already exists (skipped).',
    init_skills_created: '✅ .agents/skills/ directory created.',
    init_deploying_workflows: '\n🪺 Deploying complete arsenal of fibers...',
    init_workflows_count: '🔥 {count} workflows loaded in .agents/skills/',
    init_references_count: '🔥 {count} references loaded in .agents/skills/references/',
    init_contexts_count: '🔥 {count} contexts loaded in .agents/skills/contexts/',
    init_codebase_count: '🔥 {count} codebase templates loaded in .agents/skills/codebase/',
    init_done: '\n🚀 Colony founded! Yapu is ready to weave.',

    archive_start: '🪺 Executing Archiving System (Yapu Context Freeze)...\n',
    archive_no_state: '❌ Error: STATE.md not found in the root directory.',
    archive_no_completed: 'ℹ️  No completed tasks ([x]) found in STATE.md to archive.',
    archive_success: '✅ Tasks successfully archived in HISTORY.md ({count} tasks).',
    archive_state_cleaned: '✅ STATE.md has been cleaned and prepared for the next phase.',
    archive_state_warn: '⚠️  Warning: Could not format STATE.md automatically.',
    archive_entry_title: '\n# CONTEXT ARCHIVE: {phase}\n',
    archive_entry_frozen: '*Frozen on:* {timestamp}\n\n',
    archive_entry_tasks: '### Archived Technical Tasks:\n',
    archive_next_phase_todo: '- [ ] [Define Task 1 of the next phase]\n',

    status_title: '=== 🪺 YAPU SYSTEM STATUS ===\n',
    status_no_state: '❌ Error: STATE.md not found. Run "yapu init" first.',
    status_opr_mode: '[ OPR MODE  ] : {mode}',
    status_phase: '[ PHASE     ] : {phase}',
    status_tasks: '[ TASKS     ] :',
    status_no_tasks: '  (No tasks defined in STATE.md)',
    status_specs: '[ SPECS     ] : PROJECT.md ({project}) | ROADMAP.md ({roadmap})',
    status_footer: '\n=================================',
    status_read_error: '❌ Error reading Yapu memory: {message}',

    hooks_start: '🪺 Installing Yapu Guard in Git Hooks...\n',
    hooks_no_git: '❌ Error: This directory is not an active Git repository (.git not found).',
    hooks_success: '✅ Yapu Guard: .git/hooks/pre-commit installed successfully.',
    hooks_chmod_warn: '⚠️  Could not assign executable permissions automatically: {message}',
    hooks_no_template: '❌ Error: Template of "pre-commit" hook not found.',

    health_title: '=== 🪺 YAPU WORKSPACE HEALTH CHECK ===\n',
    health_core_memory: '[+] Checking core memory files...',
    health_project_exists: 'PROJECT.md exists',
    health_roadmap_exists: 'ROADMAP.md exists',
    health_state_exists: 'STATE.md exists',
    health_planning_colony: '[+] Checking .planning/ colony structure...',
    health_planning_exists: '.planning/ directory exists',
    health_all_subdirs_exist: 'All 10 required subdirectories exist',
    health_file_exists: '.planning/{name} exists',
    health_config_json_format: 'config.json has valid JSON format',
    health_config_json_syntax: 'config.json contains invalid JSON syntax',
    health_guard_hooks: '[+] Checking Yapu Guard (Git Hooks)...',
    health_active_git: 'Active git repository detected',
    health_hook_installed: 'Pre-commit hook installed at .git/hooks/pre-commit',
    health_hook_executable: 'Pre-commit hook is executable',
    health_hook_perms: 'Pre-commit hook permissions could not be read',
    health_memory_integrity: '[+] Checking Memory Integrity...',
    health_opr_mode_declared: 'Operational mode declared in STATE.md',
    health_active_phase_declared: 'Active phase declared in STATE.md',
    health_state_read_error: 'Could not read STATE.md context structure',
    health_state_skipped: 'Skipped (STATE.md missing)',
    health_report_separator: '=============================================',
    health_healthy: '🔥 Workspace is 100% HEALTHY! The colony is thriving. 🪺',
    health_warnings: '⚠️  Workspace is functional but has {count} warning(s).',
    health_unhealthy: '❌ Workspace is UNHEALTHY with {errors} error(s) and {warnings} warning(s).',
    health_repair_tip: '👉 Run "yapu init" or "yapu install-hooks" to repair.',

    sync_brain_detected: '🧠 Active brain auto-detected: {path}\n',
    sync_usage: '❌ Usage: yapu sync --brain-path <path-to-brain>\n   Example: yapu sync --brain-path <brain-directory-path>',
    sync_brain_not_found: '❌ Error: Brain directory not found: {path}',
    sync_no_planning: '❌ Error: .planning/ not found. Run "yapu init" first.',
    sync_start: '🪺 Syncing brain of Antigravity → .planning/...\n',
    sync_success: '✅ Synced: {name}',
    sync_no_artifacts: 'ℹ️  No artifacts found in the brain to sync.',
    sync_error: '⚠️  Error: {error}',
    sync_done: '\n🪺 Sync complete: {count} artifacts synced.',
    sync_fatal_error: '❌ Error during sync: {message}',

    handoff_start: '🪺 Generating handoff for the next session...\n',
    handoff_success_json: '✅ HANDOFF.json generated: {path}',
    handoff_success_md: '✅ .continue-here.md generated: {path}',
    handoff_done: '\n🪺 Handoff ready. The next session will resume automatically.',
    handoff_error: '❌ Error generating the handoff: {message}',
    handoff_md_title: '# Continue Here\n',
    handoff_md_auto_gen: '> Auto-generated on {date}\n',
    handoff_md_current_state: '## Current State',
    handoff_md_current_plan: '## Current Plan (excerpt)',
    handoff_md_brain_artifacts: '## Brain Artifacts',
    handoff_md_brain_art_item: '- **{name}** ({type}) — {summary}',
    handoff_md_no_summary: 'no summary',
    handoff_md_recent_activity: '## Recent Activity',
    handoff_md_brain_path: '## Brain Path',

    brain_usage: '❌ Usage: yapu brain <list|log> --path <path-to-brain>\n   Example: yapu brain list --path <brain-directory-path>',
    brain_list_title: '=== 🪺 YAPU BRAIN INSPECTOR ===\n',
    brain_no_artifacts: 'ℹ️  No artifacts found in the brain.',
    brain_artifacts_found: '[ ARTIFACTS ] : {count} found\n',
    brain_art_name: '  📄 {name}',
    brain_art_type: '     Type: {type}',
    brain_art_summary: '     Summary: {summary}',
    brain_art_updated: '     Updated: {updated}',
    brain_art_no_summary: 'no summary',
    brain_art_unknown_updated: 'unknown update date',
    brain_read_error: '❌ Error reading the brain: {message}',
    brain_log_title: '=== 🪺 YAPU BRAIN LOG (last {limit} entries) ===\n',
    brain_log_empty: 'ℹ️  No entries found in the brain log.',
    brain_log_error: '❌ Error reading the log: {message}',
    brain_unrecognized: '❌ Unrecognized subcommand. Use: yapu brain <list|log> --path <path>',

    check_title: '=== 🪺 YAPU WORKSPACE DIAGNOSTICS (PHASE 5) ===\n',
    check_reading: '[+] Scanning memory triad for anti-patterns...',
    check_no_files: '❌ Critical Error: Could not read core memory files. Run "yapu init" first.',
    check_warn_placeholder: '⚠️  Anti-pattern detected: Unresolved placeholder (TBD, TODO, [Insert...]) in {file} (line {line})',
    check_warn_empty_tasks: '⚠️  Anti-pattern detected: No active tasks defined in {file}',
    check_warn_contradiction: '⚠️  Anti-pattern detected: Phase mismatch between STATE.md and PROJECT.md',
    check_success: '🔥 Diagnostics complete: Zero anti-patterns detected. Memory is pristine! 🪺',
    check_summary: '❌ Diagnostics complete: {count} anti-pattern(s) detected.',

    help_title: '🪺 YapuCli Framework\n',
    help_usage: 'Usage:',
    help_init: '  yapu init              -> Founds the colony (.planning/ + complete skills).',
    help_status: '  yapu status            -> Radiography of the project.',
    help_health: '  yapu health            -> Validates workspace integrity.',
    help_check: '  yapu check             -> Diagnostics: scans memory for anti-patterns (Phase 5).',
    help_archive: '  yapu archive           -> End of season (freezes tasks in HISTORY.md).',
    help_install_hooks: '  yapu install-hooks     -> Deploys the hornet\'s nest (Yapu Guard).',
    help_sync: '  yapu sync              -> Syncs Antigravity brain → .planning/ (auto-detected).',
    help_handoff: '  yapu handoff           -> Generates handoff for the next session (auto-detected).',
    help_brain: '  yapu brain <list|log>  -> Inspects Antigravity brain (auto-detected).',
    help_provider: '  yapu provider          -> Diagnostics of detected AI providers in the system.',
    provider_title: '=== 🪺 YAPU PROVIDER DIAGNOSTICS ===\n',
    provider_detected: '🔍 Detected providers:',
    provider_installed: '  ✅ {name}  → {path}',
    provider_not_installed: '  ❌ {name}  → not installed',
    provider_has_data: ' ({sessions} sessions)',
    provider_no_data: ' (no data)',
    provider_active: '\n  ⚡ Active: {name} ({mode})',
    dash_start: '🪺 Starting TUI Dashboard (Interactive mode). Press Ctrl+C to exit.\n',
    dash_no_planning: '❌ Error: .planning/ not found. Run "yapu init" first.',
    help_dash: '  yapu dash              -> Real-time interactive dashboard (TUI).',
    gc_start: '🪺 Starting Contextual Garbage Collection (GC)...\n',
    gc_no_phases: 'ℹ️  No files found in .planning/phases/ to condense.',
    gc_archived: '✅ Original files moved to {path}',
    gc_prompt_generated: '🔥 LORE_MASTER task generated at {path}\n👉 Instruct your AI: "Execute {path}"',
    help_gc: '  yapu gc                -> Condenses old phases into LORE.md (Contextual GC).',
    rescue_start: '🪺 Starting Production Guardian (Auto-Heal)...\n',
    rescue_no_log: '❌ Error: You must provide a path to an error log file.\n   Usage: yapu rescue ./error.log',
    rescue_session_created: '✅ Rescue (Auto-Heal) session created at {path}\n👉 Instruct your AI: "Execute {path}"',
    help_rescue: '  yapu rescue <log>      -> Auto-Heal: Reads a CI/CD error log and prepares a fix.',
    swarm_start: '🪺 Starting Yapu Swarm (Parallel Subagent Orchestration)...\n',
    swarm_no_tasks: 'ℹ️  No pending tasks found to execute.',
    swarm_running_task: '🚀 [{id}] Starting subagent for: {name}',
    swarm_completed_task: '✅ [{id}] Subagent completed the task successfully.',
    swarm_failed_task: '❌ [{id}] Subagent failed with exit code {code}.',
    swarm_git_commit: '📦 [{id}] Git commit created for files: {files}',
    swarm_summary_title: '\n=== 🪺 YAPU SWARM SUMMARY ===\n',
    swarm_summary_success: 'All tasks completed successfully!',
    swarm_summary_partial: '⚠️  Some tasks failed or could not be executed due to dependencies.',
    help_swarm: '  yapu swarm             -> Parallel orchestration of subagents (Yapu Swarm).',
    snapshot_created: '✅ Context snapshot created successfully: {name} (Git: {commit})',
    snapshot_error: '❌ Error creating snapshot: {error}',
    rewind_start: '🪺 Starting Yapu Time-Travel (Rewind)...\n',
    rewind_no_snapshots: '❌ Error: No snapshots found in .planning/.snapshots/',
    rewind_selected: '👉 Selecting the most recent snapshot: {name}',
    rewind_confirm_prompt: '⚠️  WARNING: This will overwrite files in .planning/ and perform "git reset --hard {commit}" on your codebase.\nAny uncommitted code changes will be lost!\nDo you want to proceed? [y/N]: ',
    rewind_cancelled: '❌ Rewind cancelled by user.',
    rewind_restoring_files: '📂 Restoring context files under .planning/...',
    rewind_restoring_git: '📦 Synchronizing Git code state to commit {commit}...',
    rewind_success: '🎉 Yapu Time-Travel completed successfully! Code and context rewound to {commit}.',
    rewind_error: '❌ Error during rewind: {error}',
    help_snapshot: '  yapu snapshot          -> Creates a manual snapshot of current context and commit.',
    help_rewind: '  yapu rewind            -> Rewinds code and context to the last stable point.',
    profile_title: '=== 🪺 YAPU CONTEXT PROFILER (TOKEN DIETITIAN) ===\n',
    profile_header_file: 'File / Category',
    profile_header_size: 'Size (KB)',
    profile_header_tokens: 'Est. Tokens',
    profile_header_status: 'Status',
    profile_total_weight: '[ TOTAL CONTEXT WEIGHT ] : {size} KB | ~{tokens} Tokens',
    profile_rec_title: '👉 Recommendation: ',
    profile_rec_ok: 'Context volume is healthy. The colony is lean and agile! 🪺',
    profile_rec_warning: 'Context volume is growing. Consider running "yapu archive" to freeze completed tasks.',
    profile_rec_critical: 'CRITICAL CONTEXT WARNING! Run "yapu gc" to condense old phases or "yapu archive" immediately to avoid AI hallucinations.',
    help_profile: '  yapu profile           -> Diagnostics of context volume and tokens (Dietitian).',
    daemon_start: '📡 Starting Yapu Daemon (Real-time synchronization)...',
    daemon_watching_path: '📂 Watching for changes in: {path}',
    daemon_synced_file: '⚡ [SYNC] Artifact "{name}" successfully synchronized.',
    daemon_error: '❌ Daemon error: {error}',
    help_daemon: '  yapu daemon            -> Synchronizes AI Brain artifacts in real-time. (Alias: yapu watch)',
    branch_start: '🌿 Synchronizing context multiverse...',
    branch_current_saved: '💾 Saved context state for branch "{name}".',
    branch_restored: '📂 Restored context state for branch "{name}".',
    branch_created: '🌿 Activated Git branch "{name}".',
    branch_list_title: '🌿 === CONTEXT MULTIVERSE (ACTIVE BRANCHES) ===\n',
    branch_err_dirty: '❌ Error: You have uncommitted changes in Git. Please commit or stash them before switching branches.',
    merge_start: '🌀 Initiating multiverse merge (branch "{name}")...',
    merge_success: '🎉 Merge completed successfully! Code and context unified.',
    merge_tasks_updated: '✅ Updated {count} completed tasks in STATE.md.',
    merge_learnings_added: '🧠 Integrated new learnings in yapu-learnings.md.',
    help_branch: '  yapu branch [name]     -> Creates, switches, or lists context multiverse branches.',
    help_merge: '  yapu merge <name>      -> Merges code and semantically unifies the context of a branch.',
    board_start: '🪺 Starting Yapu Command Center...',
    board_listening: '🌐 C2 listening on http://localhost:{port}',
    board_no_state: '❌ Error: STATE.md not found. Run "yapu init" first.',
    board_opened: '🔗 Opening browser...',
    board_shutdown: '\n🪺 Command Center shut down.',
    help_board: '  board [--port N]       -> Launch the web Command Center (C2) on localhost.'
  }
};

/**
 * Determine the active language based on early args, env, config file, or system locale.
 * @param {string[]} args - CLI arguments array
 * @returns {string} resolved language ('es' or 'en')
 */
export function getLanguage(args = []) {
  if (activeLanguage) return activeLanguage;

  // 1. Check CLI args: --lang <lang> or -l <lang>
  const langIdx = args.indexOf('--lang') !== -1 ? args.indexOf('--lang') : args.indexOf('-l');
  if (langIdx !== -1 && args[langIdx + 1]) {
    const candidate = args[langIdx + 1].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(candidate)) {
      activeLanguage = candidate;
      return activeLanguage;
    }
  }

  // 2. Check environment variables
  if (process.env.YAPU_LANG && SUPPORTED_LANGUAGES.includes(process.env.YAPU_LANG.toLowerCase())) {
    activeLanguage = process.env.YAPU_LANG.toLowerCase();
    return activeLanguage;
  }

  // 3. Check local config file (.planning/config.json)
  const targetDir = process.cwd();
  const configPath = path.join(targetDir, '.planning', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lang && SUPPORTED_LANGUAGES.includes(parsed.lang.toLowerCase())) {
        activeLanguage = parsed.lang.toLowerCase();
        return activeLanguage;
      }
    } catch { /* skip */ }
  }

  // 4. Check system LANG env variable
  if (process.env.LANG) {
    const sysLang = process.env.LANG.toLowerCase();
    if (sysLang.startsWith('es')) {
      activeLanguage = 'es';
      return activeLanguage;
    } else if (sysLang.startsWith('en')) {
      activeLanguage = 'en';
      return activeLanguage;
    }
  }

  // 5. Default fallback to 'es' (historical default for the codebase)
  activeLanguage = 'es';
  return activeLanguage;
}

/**
 * Reset active language state (mainly for testing).
 */
export function resetLanguage() {
  activeLanguage = null;
}

/**
 * Translate a key into the active language, substituting any variables.
 * @param {string} key - Translation key
 * @param {object} [params={}] - Map of variable placeholders to values
 * @param {string} [lang] - Explicit language override
 * @returns {string} Translated string
 */
export function t(key, params = {}, lang) {
  const resolvedLang = lang && SUPPORTED_LANGUAGES.includes(lang) ? lang : (activeLanguage || 'es');
  const translations = TRANSLATIONS[resolvedLang] || TRANSLATIONS.es;
  let text = translations[key];

  if (text === undefined) {
    // If not found in active language, fallback to Spanish
    text = TRANSLATIONS.es[key] || key;
  }

  // Handle feminine gender for 'Memoria' files in Spanish creation
  if (resolvedLang === 'es' && key === 'init_file_created' && params.label && params.label.startsWith('Memoria:')) {
    text = '✅ {label} inicializada.';
  }

  // Replace variable placeholders like {name}
  for (const [varName, val] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${varName}}`, 'g'), String(val));
  }

  return text;
}
