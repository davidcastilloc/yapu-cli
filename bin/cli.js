#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { t, getLanguage } from '../lib/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Strip --lang / -l flags from args so they don't interfere with subcommands
const cleanArgs = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' || args[i] === '-l') {
        i++; // skip next arg (the language value)
    } else {
        cleanArgs.push(args[i]);
    }
}

const command = cleanArgs[0];
const activeLang = getLanguage(args);

const targetDir = process.cwd();
let templatesDir = path.join(__dirname, '..', 'templates', activeLang);
if (!fs.existsSync(templatesDir)) {
    templatesDir = path.join(__dirname, '..', 'templates', 'es');
}
const skillsDir = path.join(targetDir, '.agents', 'skills');

if (command === 'init') {
    console.log(t('init_start'));

    // ── 1. Scaffold .planning/ directory structure ──────────────────────
    console.log(t('init_colony'));
    const planningDir = path.join(targetDir, '.planning');
    const planningSubdirs = [
        '',
        'codebase',
        'phases',
        'debug',
        'debug/resolved',
        'seeds',
        'notes',
        'todos',
        'research',
        'quick',
        'spikes'
    ];
    planningSubdirs.forEach(sub => {
        const dir = path.join(planningDir, sub);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    console.log(t('init_dir_scaffolded'));

    // .planning/ files from templates (skip if exists)
    /**
     * Copies a file if it doesn't already exist at the destination.
     * @param {string} src - Source file path.
     * @param {string} dest - Destination file path.
     * @param {string} label - Display label for logging.
     * @returns {boolean} True if copied, false if skipped.
     */
    const copyIfMissing = (src, dest, label) => {
        if (!fs.existsSync(dest)) {
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
            console.log(t('init_file_created', { label }));
            return true;
        } else {
            console.log(t('init_file_skipped', { label }));
            return false;
        }
    };

    /**
     * Writes content to a file if it doesn't already exist.
     * @param {string} dest - Destination file path.
     * @param {string} content - String content to write.
     * @param {string} label - Display label for logging.
     */
    const writeIfMissing = (dest, content, label) => {
        if (!fs.existsSync(dest)) {
            fs.writeFileSync(dest, content, 'utf8');
            console.log(t('init_file_created', { label }));
        } else {
            console.log(t('init_file_skipped', { label }));
        }
    };

    copyIfMissing(
        path.join(templatesDir, 'STATE.md'),
        path.join(planningDir, 'STATE.md'),
        '.planning/STATE.md'
    );
    copyIfMissing(
        path.join(templatesDir, 'ROADMAP.md'),
        path.join(planningDir, 'ROADMAP.md'),
        '.planning/ROADMAP.md'
    );

    // Dynamic write for config.json to inject the active lang property
    const configDest = path.join(planningDir, 'config.json');
    if (!fs.existsSync(configDest)) {
        const srcConfig = path.join(templatesDir, 'yapu-config.json');
        let configObj = {};
        if (fs.existsSync(srcConfig)) {
            try {
                configObj = JSON.parse(fs.readFileSync(srcConfig, 'utf8'));
            } catch { /* use default empty obj */ }
        }
        configObj.lang = activeLang;
        fs.writeFileSync(configDest, JSON.stringify(configObj, null, 2) + '\n', 'utf8');
        console.log(t('init_file_created', { label: '.planning/config.json' }));
    } else {
        console.log(t('init_file_skipped', { label: '.planning/config.json' }));
    }

    const reqHeader = activeLang === 'es' ? '# Requisitos del Proyecto\n\n> Criterios de aceptación numerados con tabla de trazabilidad.\n\n---\n' : '# Project Requirements\n\n> Numbered acceptance criteria with traceability table.\n\n---\n';
    writeIfMissing(
        path.join(planningDir, 'REQUIREMENTS.md'),
        reqHeader,
        '.planning/REQUIREMENTS.md'
    );

    const methodHeader = activeLang === 'es' ? '# Metodología\n\n> Frameworks interpretativos (lenses) reutilizables que persisten entre fases.\n\n---\n' : '# Methodology\n\n> Reusable interpretive frameworks (lenses) that persist across phases.\n\n---\n';
    writeIfMissing(
        path.join(planningDir, 'METHODOLOGY.md'),
        methodHeader,
        '.planning/METHODOLOGY.md'
    );

    // ── 2. Backward compat: root-level base files ──────────────────────
    const baseFiles = ['PROJECT.md', 'ROADMAP.md', 'STATE.md'];
    baseFiles.forEach(file => {
        const src = path.join(templatesDir, file);
        const dest = path.join(targetDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(t('init_file_created', { label: `Memoria: ${file}` }));
        } else if (fs.existsSync(dest)) {
            console.log(t('init_file_skipped', { label: `Memoria: ${file}` }));
        }
    });

    // ── Inyección de Memoria Global (Hive Mind) ──────────────────────
    const globalPatternsPath = path.join(os.homedir(), '.yapu', 'global-patterns.md');
    const targetProjectMd = path.join(targetDir, 'PROJECT.md');
    
    if (fs.existsSync(globalPatternsPath) && fs.existsSync(targetProjectMd)) {
        console.log('🧠 Inyectando memoria global desde proyectos anteriores...');
        const globalPatterns = fs.readFileSync(globalPatternsPath, 'utf8');
        let projectMdContent = fs.readFileSync(targetProjectMd, 'utf8');
        
        // Evitar inyectar múltiples veces si ya existe
        if (!projectMdContent.includes('## 🧠 Mandamientos Globales (Aprendidos)')) {
            projectMdContent += '\n## 🧠 Mandamientos Globales (Aprendidos)\n';
            projectMdContent += '> Estas reglas fueron aprendidas por Yapu en proyectos anteriores y son de cumplimiento obligatorio.\n\n';
            projectMdContent += globalPatterns + '\n';
            
            fs.writeFileSync(targetProjectMd, projectMdContent, 'utf8');
            console.log('✅ Mandamientos globales inyectados en PROJECT.md.');
        }
    }

    // ── 3. Create .agents/skills/ ──────────────────────────────────────
    if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
        console.log(t('init_skills_created'));
    }

    // ── 4. Deploy ALL workflows dynamically ────────────────────────────
    console.log(t('init_deploying_workflows'));

    // 4a. All yapu-*.md from templates root → .agents/skills/
    const allWorkflows = fs.readdirSync(templatesDir)
        .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
    let wfCount = 0;
    allWorkflows.forEach(file => {
        const src = path.join(templatesDir, file);
        const dest = path.join(skillsDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            wfCount++;
        }
    });
    console.log(t('init_workflows_count', { count: wfCount }));

    // 4b. References: templates/references/yapu-*.md → .agents/skills/references/
    const refsSourceDir = path.join(templatesDir, 'references');
    const refsDestDir = path.join(skillsDir, 'references');
    let refCount = 0;
    if (fs.existsSync(refsSourceDir)) {
        if (!fs.existsSync(refsDestDir)) {
            fs.mkdirSync(refsDestDir, { recursive: true });
        }
        const refFiles = fs.readdirSync(refsSourceDir)
            .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
        refFiles.forEach(file => {
            const src = path.join(refsSourceDir, file);
            const dest = path.join(refsDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                refCount++;
            }
        });
    }
    console.log(t('init_references_count', { count: refCount }));

    // 4c. Contexts: templates/contexts/yapu-*.md → .agents/skills/contexts/
    const ctxSourceDir = path.join(templatesDir, 'contexts');
    const ctxDestDir = path.join(skillsDir, 'contexts');
    let ctxCount = 0;
    if (fs.existsSync(ctxSourceDir)) {
        if (!fs.existsSync(ctxDestDir)) {
            fs.mkdirSync(ctxDestDir, { recursive: true });
        }
        const ctxFiles = fs.readdirSync(ctxSourceDir)
            .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
        ctxFiles.forEach(file => {
            const src = path.join(ctxSourceDir, file);
            const dest = path.join(ctxDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                ctxCount++;
            }
        });
    }
    console.log(t('init_contexts_count', { count: ctxCount }));

    // 4d. Codebase: templates/codebase/*.md → .agents/skills/codebase/
    const cbSourceDir = path.join(templatesDir, 'codebase');
    const cbDestDir = path.join(skillsDir, 'codebase');
    let cbCount = 0;
    if (fs.existsSync(cbSourceDir)) {
        if (!fs.existsSync(cbDestDir)) {
            fs.mkdirSync(cbDestDir, { recursive: true });
        }
        const cbFiles = fs.readdirSync(cbSourceDir)
            .filter(f => f.endsWith('.md'));
        cbFiles.forEach(file => {
            const src = path.join(cbSourceDir, file);
            const dest = path.join(cbDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                cbCount++;
            }
        });
    }
    console.log(t('init_codebase_count', { count: cbCount }));

    console.log(t('init_done'));
} else if (command === 'archive') {
    console.log(t('archive_start'));

    const statePath = path.join(targetDir, 'STATE.md');
    const historyPath = path.join(targetDir, 'HISTORY.md');

    if (!fs.existsSync(statePath)) {
        console.error(t('archive_no_state'));
        process.exit(1);
    }

    const stateContent = fs.readFileSync(statePath, 'utf8');

    // 1. Extract active phase
    const activePhaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.+)/i) || stateContent.match(/\*\*ACTIVE PHASE:\*\*\s*(.+)/i);
    const activePhase = activePhaseMatch ? activePhaseMatch[1].trim() : (activeLang === 'es' ? 'Fase Desconocida' : 'Unknown Phase');

    // 2. Extract completed and pending tasks
    const lines = stateContent.split('\n');
    const completedTasks = [];
    const pendingTasks = [];
    let inTasksSection = false;

    for (const line of lines) {
        if (line.includes('## Tareas de la Fase Actual') || line.includes('## Tasks of the Current Phase') || line.includes('## Tareas') || line.includes('## Tasks')) {
            inTasksSection = true;
            continue;
        }
        if (inTasksSection && line.startsWith('##')) {
            inTasksSection = false;
        }
        if (inTasksSection) {
            if (line.trim().startsWith('- [x]')) {
                completedTasks.push(line.trim());
            } else if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- [/]')) {
                pendingTasks.push(line.trim());
            }
        }
    }

    if (completedTasks.length === 0) {
        console.log(t('archive_no_completed'));
        process.exit(0);
    }

    // 3. Generate structured archive entry
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let archiveEntry = t('archive_entry_title', { phase: activePhase });
    archiveEntry += t('archive_entry_frozen', { timestamp });
    archiveEntry += t('archive_entry_tasks');
    completedTasks.forEach(task => {
        archiveEntry += `${task}\n`;
    });
    archiveEntry += '\n---\n';

    // Save to HISTORY.md
    fs.appendFileSync(historyPath, archiveEntry, 'utf8');
    console.log(t('archive_success', { count: completedTasks.length }));

    // 4. Clean STATE.md
    const titleTasks = activeLang === 'es' ? '## Tareas de la Fase Actual\n' : '## Tasks of the Current Phase\n';
    let cleanTasksSection = titleTasks;
    if (pendingTasks.length > 0) {
        pendingTasks.forEach(task => {
            cleanTasksSection += `${task}\n`;
        });
    } else {
        cleanTasksSection += t('archive_next_phase_todo');
    }

    const tasksStartIdx = stateContent.toLowerCase().indexOf('## tareas') !== -1 
        ? stateContent.toLowerCase().indexOf('## tareas')
        : stateContent.toLowerCase().indexOf('## tasks');

    const contextTitleStr = activeLang === 'es' ? '## contexto de ejecución' : '## execution context';
    const tasksEndIdx = stateContent.toLowerCase().indexOf(contextTitleStr) !== -1
        ? stateContent.toLowerCase().indexOf(contextTitleStr)
        : (stateContent.toLowerCase().indexOf('## accumulated context') !== -1 
            ? stateContent.toLowerCase().indexOf('## accumulated context')
            : stateContent.toLowerCase().indexOf('## session continuity'));

    if (tasksStartIdx !== -1 && tasksEndIdx !== -1) {
        const beforeTasks = stateContent.substring(0, tasksStartIdx);
        const afterTasks = stateContent.substring(tasksEndIdx);
        const newStateContent = beforeTasks + cleanTasksSection + '\n' + afterTasks;
        fs.writeFileSync(statePath, newStateContent, 'utf8');
        console.log(t('archive_state_cleaned'));
    } else {
        console.warn(t('archive_state_warn'));
    }
} else if (command === 'status') {
    console.log(t('status_title'));
    
    const files = {
        state: path.join(targetDir, 'STATE.md'),
        project: path.join(targetDir, 'PROJECT.md'),
        roadmap: path.join(targetDir, 'ROADMAP.md')
    };

    if (!fs.existsSync(files.state)) {
        console.log(t('status_no_state'));
        process.exit(1);
    }

    try {
        const stateContent = fs.readFileSync(files.state, 'utf-8');
        
        // Extract the Mode using Regex
        const modeMatch = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i) || stateContent.match(/\[\s*CURRENT OPERATIONAL MODE:\s*(.*?)\s*\]/i);
        const currentMode = modeMatch ? modeMatch[1].trim() : 'NO DEFINIDO / UNDEFINED';
        
        // Extract Active Phase
        const phaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i) || stateContent.match(/\*\*ACTIVE PHASE:\*\*\s*(.*)/i);
        const activePhase = phaseMatch ? phaseMatch[1].trim() : 'NO DEFINIDA / UNDEFINED';

        console.log(t('status_opr_mode', { mode: currentMode }));
        console.log(t('status_phase', { phase: activePhase }));
        console.log('---------------------------------');
        
        // Extract Tasks
        console.log(t('status_tasks'));
        const tasks = stateContent.split('\n').filter(line => line.trim().startsWith('- ['));
        if (tasks.length > 0) {
            tasks.forEach(task => console.log(`  ${task.trim()}`));
        } else {
            console.log(t('status_no_tasks'));
        }
        
        console.log('---------------------------------');
        const hasProject = fs.existsSync(files.project) ? 'OK' : 'MISSING';
        const hasRoadmap = fs.existsSync(files.roadmap) ? 'OK' : 'MISSING';
        console.log(t('status_specs', { project: hasProject, roadmap: hasRoadmap }));
        
        console.log(t('status_footer'));
    } catch (err) {
        console.error(t('status_read_error', { message: err.message }));
    }
} else if (command === 'install-hooks') {
    console.log(t('hooks_start'));
    
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
        console.error(t('hooks_no_git'));
        process.exit(1);
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    const src = path.join(templatesDir, 'pre-commit');
    const dest = path.join(hooksDir, 'pre-commit');

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        try {
            fs.chmodSync(dest, 0o755); // Dar permisos ejecutables
            console.log(t('hooks_success'));
        } catch (err) {
            console.warn(t('hooks_chmod_warn', { message: err.message }));
        }
    } else {
        console.error(t('hooks_no_template'));
        process.exit(1);
    }
} else if (command === 'health') {
    console.log(t('health_title'));

    let errorsCount = 0;
    let warningsCount = 0;

    /**
     * Prints a standardized check result.
     * @param {boolean} ok - True if successful, false otherwise.
     * @param {string} message - Result description.
     * @param {boolean} [errorIfFailed=true] - If false, treats failures as warnings.
     */
    const printResult = (ok, message, errorIfFailed = true) => {
        if (ok) {
            console.log(`  ✅ ${message}`);
        } else {
            if (errorIfFailed) {
                console.log(`  ❌ ${message}`);
                errorsCount++;
            } else {
                console.log(`  ⚠️  ${message}`);
                warningsCount++;
            }
        }
    };

    // ── 1. Checking core memory files ──────────────────────
    console.log(t('health_core_memory'));
    const projectPath = path.join(targetDir, 'PROJECT.md');
    const roadmapPath = path.join(targetDir, 'ROADMAP.md');
    const statePath = path.join(targetDir, 'STATE.md');

    printResult(fs.existsSync(projectPath), t('health_project_exists'));
    printResult(fs.existsSync(roadmapPath), t('health_roadmap_exists'));
    printResult(fs.existsSync(statePath), t('health_state_exists'));
    console.log('');

    // ── 2. Checking .planning/ colony structure ──────────────────────
    console.log(t('health_planning_colony'));
    const planningDir = path.join(targetDir, '.planning');
    const hasPlanningDir = fs.existsSync(planningDir);
    printResult(hasPlanningDir, t('health_planning_exists'));

    if (hasPlanningDir) {
        const planningSubdirs = [
            'codebase',
            'phases',
            'debug',
            'debug/resolved',
            'seeds',
            'notes',
            'todos',
            'research',
            'quick',
            'spikes'
        ];
        let subdirsOk = true;
        planningSubdirs.forEach(sub => {
            if (!fs.existsSync(path.join(planningDir, sub))) {
                subdirsOk = false;
            }
        });
        printResult(subdirsOk, t('health_all_subdirs_exist'));

        const reqFiles = [
            { name: 'STATE.md', critical: true },
            { name: 'ROADMAP.md', critical: true },
            { name: 'REQUIREMENTS.md', critical: false },
            { name: 'METHODOLOGY.md', critical: false },
            { name: 'config.json', critical: true }
        ];

        reqFiles.forEach(file => {
            const filePath = path.join(planningDir, file.name);
            const exists = fs.existsSync(filePath);
            printResult(exists, t('health_file_exists', { name: file.name }), file.critical);

            if (file.name === 'config.json' && exists) {
                try {
                    JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    printResult(true, t('health_config_json_format'));
                } catch {
                    printResult(false, t('health_config_json_syntax'), true);
                }
            }
        });
    }
    console.log('');

    // ── 3. Checking Yapu Guard (Git Hooks) ──────────────────────
    console.log(t('health_guard_hooks'));
    const gitDir = path.join(targetDir, '.git');
    const hasGit = fs.existsSync(gitDir);
    printResult(hasGit, t('health_active_git'), false);

    if (hasGit) {
        const preCommitPath = path.join(gitDir, 'hooks', 'pre-commit');
        const hasHook = fs.existsSync(preCommitPath);
        printResult(hasHook, t('health_hook_installed'), false);

        if (hasHook) {
            try {
                const hookStat = fs.statSync(preCommitPath);
                const isExecutable = (hookStat.mode & 0o111) !== 0;
                printResult(isExecutable, t('health_hook_executable'), false);
            } catch {
                printResult(false, t('health_hook_perms'), false);
            }
        }
    }
    console.log('');

    // ── 4. Checking Memory Integrity ──────────────────────
    console.log(t('health_memory_integrity'));
    if (fs.existsSync(statePath)) {
        try {
            const stateContent = fs.readFileSync(statePath, 'utf8');
            const hasMode = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i) || stateContent.match(/\[\s*CURRENT OPERATIONAL MODE:\s*(.*?)\s*\]/i);
            const hasPhase = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i) || stateContent.match(/\*\*ACTIVE PHASE:\*\*\s*(.*)/i);

            printResult(Boolean(hasMode), t('health_opr_mode_declared'));
            printResult(Boolean(hasPhase), t('health_active_phase_declared'));
        } catch {
            printResult(false, t('health_state_read_error'));
        }
    } else {
        printResult(false, t('health_state_skipped'));
    }
    console.log('');

    // ── 5. Final Report ──────────────────────
    console.log(t('health_report_separator'));
    if (errorsCount === 0) {
        if (warningsCount === 0) {
            console.log(t('health_healthy'));
        } else {
            console.log(t('health_warnings', { count: warningsCount }));
        }
        process.exit(0);
    } else {
        console.log(t('health_unhealthy', { errors: errorsCount, warnings: warningsCount }));
        console.log(t('health_repair_tip'));
        process.exit(1);
    }
} else if (command === 'check') {
    console.log(t('check_title'));
    console.log(t('check_reading'));

    const projectPath = path.join(targetDir, '.planning', 'PROJECT.md');
    const statePath = path.join(targetDir, '.planning', 'STATE.md');
    
    // Check backwards compatibility paths
    const finalProjectPath = fs.existsSync(projectPath) ? projectPath : path.join(targetDir, 'PROJECT.md');
    const finalStatePath = fs.existsSync(statePath) ? statePath : path.join(targetDir, 'STATE.md');

    if (!fs.existsSync(finalProjectPath) || !fs.existsSync(finalStatePath)) {
        console.error(t('check_no_files'));
        process.exit(1);
    }

    let antiPatterns = 0;
    
    const projectContent = fs.readFileSync(finalProjectPath, 'utf8');
    const stateContent = fs.readFileSync(finalStatePath, 'utf8');

    // 1. Check for unresolved placeholders
    const placeholderRegex = /\[Insert[^\]]*\]|TBD|TODO(?!\s*\()/gi;
    const lines = projectContent.split('\n');
    lines.forEach((line, index) => {
        if (placeholderRegex.test(line)) {
            console.warn(t('check_warn_placeholder', { file: 'PROJECT.md', line: index + 1 }));
            antiPatterns++;
        }
    });

    // 2. Check for empty tasks in STATE.md
    const tasksMatch = stateContent.match(/\[ TASKS \]:[\s\S]*?(?=\[ SPECS \]|=================================|$)/i);
    if (!tasksMatch || tasksMatch[0].includes('No hay tareas') || tasksMatch[0].includes('No tasks')) {
        const hasTaskLines = stateContent.split('\n').some(l => l.trim().startsWith('- [ ]') || l.trim().startsWith('- [x]'));
        if (!hasTaskLines) {
            console.warn(t('check_warn_empty_tasks', { file: 'STATE.md' }));
            antiPatterns++;
        }
    }

    // 3. Phase contradiction (Optional: could match PROJECT vs STATE)
    const activePhaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.+)/i) || stateContent.match(/\*\*ACTIVE PHASE:\*\*\s*(.+)/i);
    const statePhase = activePhaseMatch ? activePhaseMatch[1].trim().toLowerCase() : '';
    if (statePhase && statePhase.includes('unknown') || statePhase.includes('desconocida')) {
        console.warn(t('check_warn_contradiction'));
        antiPatterns++;
    }

    console.log('');
    if (antiPatterns === 0) {
        console.log(t('check_success'));
        process.exit(0);
    } else {
        console.error(t('check_summary', { count: antiPatterns }));
        process.exit(0); // Exit 0 for warnings by default
    }
} else if (command === 'sync') {
    // ── yapu sync --brain-path {path} ──────────────────────────────────
    const brainIdx = cleanArgs.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? cleanArgs[brainIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(t('sync_brain_detected', { path: brainPath }));
            }
        } catch { /* ignore */ }
    }

    if (!brainPath) {
        console.error(t('sync_usage'));
        process.exit(1);
    }

    if (!fs.existsSync(brainPath)) {
        console.error(t('sync_brain_not_found', { path: brainPath }));
        process.exit(1);
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error(t('sync_no_planning'));
        process.exit(1);
    }

    console.log(t('sync_start'));

    try {
        const { syncBrainToPlanning } = await import('../lib/artifacts.js');
        const result = syncBrainToPlanning(brainPath, planningPath);

        if (result.synced.length > 0) {
            result.synced.forEach(name => console.log(t('sync_success', { name })));
        } else {
            console.log(t('sync_no_artifacts'));
        }

        if (result.errors.length > 0) {
            result.errors.forEach(err => console.error(t('sync_error', { error: err })));
        }

        console.log(t('sync_done', { count: result.synced.length }));
    } catch (err) {
        console.error(t('sync_fatal_error', { message: err.message }));
        process.exit(1);
    }
} else if (command === 'handoff') {
    // ── yapu handoff [--brain-path {path}] ─────────────────────────────
    const brainIdx = cleanArgs.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? cleanArgs[brainIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(t('sync_brain_detected', { path: brainPath }));
            }
        } catch { /* ignore */ }
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error(t('sync_no_planning'));
        process.exit(1);
    }

    console.log(t('handoff_start'));

    try {
        const { generateHandoff } = await import('../lib/artifacts.js');
        const result = generateHandoff(planningPath, brainPath, activeLang);

        console.log(t('handoff_success_json', { path: result.handoffPath }));
        console.log(t('handoff_success_md', { path: result.continueHerePath }));
        console.log(t('handoff_done'));
    } catch (err) {
        console.error(t('handoff_error', { message: err.message }));
        process.exit(1);
    }
} else if (command === 'brain') {
    // ── yapu brain list|log --path {path} ──────────────────────────────
    const subCommand = cleanArgs[1];
    const pathIdx = cleanArgs.indexOf('--path');
    let brainPath = pathIdx !== -1 ? cleanArgs[pathIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(t('sync_brain_detected', { path: brainPath }));
            }
        } catch { /* ignore */ }
    }

    if (!brainPath) {
        console.error(t('brain_usage'));
        process.exit(1);
    }

    if (!fs.existsSync(brainPath)) {
        console.error(t('sync_brain_not_found', { path: brainPath }));
        process.exit(1);
    }

    if (subCommand === 'list') {
        console.log(t('brain_list_title'));
        try {
            const { listArtifacts } = await import('../lib/artifacts.js');
            const artifacts = listArtifacts(brainPath);

            if (artifacts.length === 0) {
                console.log(t('brain_no_artifacts'));
            } else {
                console.log(t('brain_artifacts_found', { count: artifacts.length }));
                artifacts.forEach(art => {
                    const typeShort = art.type.replace('ARTIFACT_TYPE_', '');
                    console.log(t('brain_art_name', { name: art.name }));
                    console.log(t('brain_art_type', { type: typeShort }));
                    console.log(t('brain_art_summary', { summary: art.summary || t('brain_art_no_summary') }));
                    console.log(t('brain_art_updated', { updated: art.updatedAt || t('brain_art_unknown_updated') }));
                    console.log('');
                });
            }
            console.log('=================================');
        } catch (err) {
            console.error(t('brain_read_error', { message: err.message }));
            process.exit(1);
        }
    } else if (subCommand === 'log') {
        const nIdx = cleanArgs.indexOf('-n');
        const limit = nIdx !== -1 ? parseInt(cleanArgs[nIdx + 1], 10) || 20 : 20;

        console.log(t('brain_log_title', { limit }));
        try {
            const { readConversationLog } = await import('../lib/artifacts.js');
            const entries = readConversationLog(brainPath, limit);

            if (entries.length === 0) {
                console.log(t('brain_log_empty'));
            } else {
                entries.forEach(entry => {
                    const icon = entry.source === 'USER_EXPLICIT' ? '👤' : '🤖';
                    const content = (entry.content || '').substring(0, 120);
                    console.log(`  ${icon} [${entry.step_index}] ${entry.type}: ${content}${content.length >= 120 ? '...' : ''}`);
                });
            }
            console.log('\n=================================');
        } catch (err) {
            console.error(t('brain_log_error', { message: err.message }));
            process.exit(1);
        }
    } else {
        console.error(t('brain_unrecognized'));
        process.exit(1);
    }
} else if (command === 'dash') {
    console.log(t('dash_start'));
    import('../lib/dashboard.js')
        .then(({ startDashboard }) => {
            startDashboard(targetDir, activeLang);
        })
        .catch(err => {
            console.error('Error loading dashboard:', err);
            process.exit(1);
        });
} else if (command === 'gc') {
    console.log(t('gc_start'));

    const planningDir = path.join(targetDir, '.planning');
    const phasesDir = path.join(planningDir, 'phases');
    const archiveDir = path.join(planningDir, 'archive');

    if (!fs.existsSync(planningDir)) {
        console.error(t('dash_no_planning'));
        process.exit(1);
    }

    let phaseFiles = [];
    if (fs.existsSync(phasesDir)) {
        phaseFiles = fs.readdirSync(phasesDir).filter(f => f.endsWith('.md'));
    }

    if (phaseFiles.length === 0) {
        console.log(t('gc_no_phases'));
        process.exit(0);
    }

    let masterContext = '';
    phaseFiles.forEach(f => {
        const p = path.join(phasesDir, f);
        masterContext += `\n\n# FILE: phases/${f}\n\n`;
        masterContext += fs.readFileSync(p, 'utf8');
    });

    const contextPath = path.join(planningDir, 'context-to-compress.md');
    fs.writeFileSync(contextPath, masterContext, 'utf8');

    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
    }
    const timestampDir = path.join(archiveDir, new Date().toISOString().replace(/:/g, '-').split('.')[0]);
    fs.mkdirSync(timestampDir, { recursive: true });

    phaseFiles.forEach(f => {
        fs.renameSync(path.join(phasesDir, f), path.join(timestampDir, f));
    });
    console.log(t('gc_archived', { path: timestampDir }));

    const loreSrc = path.join(templatesDir, 'yapu-lore-master.md');
    const tasksDir = path.join(planningDir, 'tasks');
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir, { recursive: true });
    }
    const loreDest = path.join(tasksDir, 'LORE_MASTER.md');

    if (fs.existsSync(loreSrc)) {
        fs.copyFileSync(loreSrc, loreDest);
        console.log(t('gc_prompt_generated', { path: loreDest }));
    } else {
        console.warn('⚠️  Warning: Template yapu-lore-master.md not found.');
    }
} else if (command === 'rescue') {
    console.log(t('rescue_start'));
    const logFile = cleanArgs[1];
    
    if (!logFile) {
        console.error(t('rescue_no_log'));
        process.exit(1);
    }

    const logPath = path.resolve(targetDir, logFile);
    if (!fs.existsSync(logPath)) {
        console.error(`❌ Error: File not found: ${logPath}`);
        process.exit(1);
    }

    const logContent = fs.readFileSync(logPath, 'utf8');

    const planningDir = path.join(targetDir, '.planning');
    const debugDir = path.join(planningDir, 'debug');
    if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const rescueTaskPath = path.join(debugDir, `RESCUE_${timestamp}.md`);

    const rescuePrompt = activeLang === 'es' ?
`# GUARDIÁN DE PRODUCCIÓN: Auto-Heal (Rescue)

Un fallo en CI/CD ha sido detectado. El archivo de log de error ha sido inyectado abajo.

## Tu Tarea
1. Analiza el log de error de CI/CD.
2. Formula una hipótesis de por qué fallaron los tests o el build.
3. Modifica el código fuente localmente para solucionar el error.
4. Ejecuta las pruebas localmente usando comandos de terminal para validar tu solución.
5. Haz un reporte rápido de qué cambiaste.

## Log de Error
\`\`\`
${logContent.substring(0, 5000)} // Truncated to 5000 chars for context size
\`\`\`

**[ INICIAR ]**: Comienza inmediatamente el análisis y soluciona el problema.
` : 
`# PRODUCTION GUARDIAN: Auto-Heal (Rescue)

A CI/CD failure has been detected. The error log file has been injected below.

## Your Task
1. Analyze the CI/CD error log.
2. Formulate a hypothesis for why the tests or build failed.
3. Modify the source code locally to fix the error.
4. Run tests locally using terminal commands to validate your solution.
5. Provide a quick report of what you changed.

## Error Log
\`\`\`
${logContent.substring(0, 5000)} // Truncated to 5000 chars for context size
\`\`\`

**[ START ]**: Begin analysis immediately and fix the issue.
`;

    fs.writeFileSync(rescueTaskPath, rescuePrompt, 'utf8');
    console.log(t('rescue_session_created', { path: rescueTaskPath }));
} else {
    console.log(t('help_title'));
    console.log(t('help_usage'));
    console.log(t('help_init'));
    console.log(t('help_status'));
    console.log(t('help_dash'));
    console.log(t('help_gc'));
    console.log(t('help_rescue'));
    console.log(t('help_health'));
    console.log(t('help_check'));
    console.log(t('help_archive'));
    console.log(t('help_install_hooks'));
    console.log(t('help_sync'));
    console.log(t('help_handoff'));
    console.log(t('help_brain'));
}
