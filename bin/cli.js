#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const command = args[0];

const targetDir = process.cwd();
const templatesDir = path.join(__dirname, '..', 'templates');
const skillsDir = path.join(targetDir, '.agents', 'skills');

if (command === 'init') {
    console.log('🪺 Inicializando YapuCli...\n');

    // ── 1. Scaffold .planning/ directory structure ──────────────────────
    console.log('🪺 Fundando la colonia (.planning/)...');
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
    console.log('✅ Directorio .planning/ scaffoldeado.');

    // .planning/ files from templates (skip if exists)
    const copyIfMissing = (src, dest, label) => {
        if (!fs.existsSync(dest)) {
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
            console.log(`✅ ${label} inicializado.`);
            return true;
        } else {
            console.log(`⚠️  ${label} ya existe (omitido).`);
            return false;
        }
    };

    const writeIfMissing = (dest, content, label) => {
        if (!fs.existsSync(dest)) {
            fs.writeFileSync(dest, content, 'utf8');
            console.log(`✅ ${label} inicializado.`);
        } else {
            console.log(`⚠️  ${label} ya existe (omitido).`);
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
    copyIfMissing(
        path.join(templatesDir, 'yapu-config.json'),
        path.join(planningDir, 'config.json'),
        '.planning/config.json'
    );
    writeIfMissing(
        path.join(planningDir, 'REQUIREMENTS.md'),
        '# Requisitos del Proyecto\n\n> Criterios de aceptación numerados con tabla de trazabilidad.\n\n---\n',
        '.planning/REQUIREMENTS.md'
    );
    writeIfMissing(
        path.join(planningDir, 'METHODOLOGY.md'),
        '# Metodología\n\n> Frameworks interpretativos (lenses) reutilizables que persisten entre fases.\n\n---\n',
        '.planning/METHODOLOGY.md'
    );

    // ── 2. Backward compat: root-level base files ──────────────────────
    const baseFiles = ['PROJECT.md', 'ROADMAP.md', 'STATE.md'];
    baseFiles.forEach(file => {
        const src = path.join(templatesDir, file);
        const dest = path.join(targetDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Memoria: ${file} inicializada.`);
        } else if (fs.existsSync(dest)) {
            console.log(`⚠️  Memoria: ${file} ya existe (omitido).`);
        }
    });

    // ── 3. Create .agents/skills/ ──────────────────────────────────────
    if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
        console.log('✅ Directorio .agents/skills/ creado.');
    }

    // ── 4. Deploy ALL workflows dynamically ────────────────────────────
    console.log('\n🪺 Desplegando arsenal completo de fibras...');

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
    console.log(`🔥 ${wfCount} workflows cargados en .agents/skills/`);

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
    console.log(`🔥 ${refCount} referencias cargadas en .agents/skills/references/`);

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
    console.log(`🔥 ${ctxCount} contextos cargados en .agents/skills/contexts/`);

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
    console.log(`🔥 ${cbCount} templates de codebase cargados en .agents/skills/codebase/`);

    console.log('\n🚀 ¡Colonia fundada! Yapu está listo para tejer.');
} else if (command === 'archive') {
    console.log('🪺 Ejecutando Sistema de Archivo (Yapu Context Freeze)...\n');

    const statePath = path.join(targetDir, 'STATE.md');
    const historyPath = path.join(targetDir, 'HISTORY.md');

    if (!fs.existsSync(statePath)) {
        console.error('❌ Error: STATE.md no encontrado en el directorio raíz.');
        process.exit(1);
    }

    const stateContent = fs.readFileSync(statePath, 'utf8');

    // 1. Extraer fase activa
    const activePhaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.+)/);
    const activePhase = activePhaseMatch ? activePhaseMatch[1].trim() : 'Fase Desconocida';

    // 2. Extraer tareas completadas y pendientes
    const lines = stateContent.split('\n');
    const completedTasks = [];
    const pendingTasks = [];
    let inTasksSection = false;

    for (const line of lines) {
        if (line.includes('## Tareas de la Fase Actual')) {
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
        console.log('ℹ️  No se encontraron tareas completadas ([x]) en STATE.md para archivar.');
        process.exit(0);
    }

    // 3. Generar entrada de archivo estructurada
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let archiveEntry = `\n# ARCHIVO DE CONTEXTO: ${activePhase}\n`;
    archiveEntry += `*Congelado el:* ${timestamp}\n\n`;
    archiveEntry += '### Tareas Técnicas Archivadas:\n';
    completedTasks.forEach(task => {
        archiveEntry += `${task}\n`;
    });
    archiveEntry += '\n---\n';

    // Guardar en HISTORY.md
    fs.appendFileSync(historyPath, archiveEntry, 'utf8');
    console.log(`✅ Tareas archivadas con éxito en HISTORY.md (${completedTasks.length} tareas).`);

    // 4. Limpiar STATE.md
    let cleanTasksSection = '## Tareas de la Fase Actual\n';
    if (pendingTasks.length > 0) {
        pendingTasks.forEach(task => {
            cleanTasksSection += `${task}\n`;
        });
    } else {
        cleanTasksSection += '- [ ] [Definir Tarea 1 de la siguiente fase]\n';
    }

    const tasksStartIdx = stateContent.indexOf('## Tareas de la Fase Actual');
    const tasksEndIdx = stateContent.indexOf('## Contexto de Ejecución');

    if (tasksStartIdx !== -1 && tasksEndIdx !== -1) {
        const beforeTasks = stateContent.substring(0, tasksStartIdx);
        const afterTasks = stateContent.substring(tasksEndIdx);
        const newStateContent = beforeTasks + cleanTasksSection + '\n' + afterTasks;
        fs.writeFileSync(statePath, newStateContent, 'utf8');
        console.log('✅ STATE.md ha sido limpiado y preparado para la siguiente fase.');
    } else {
        console.warn('⚠️  Advertencia: No se pudo formatear STATE.md automáticamente.');
    }
} else if (command === 'status') {
    console.log('=== 🪺 YAPU SYSTEM STATUS ===\n');
    
    const files = {
        state: path.join(targetDir, 'STATE.md'),
        project: path.join(targetDir, 'PROJECT.md'),
        roadmap: path.join(targetDir, 'ROADMAP.md')
    };

    if (!fs.existsSync(files.state)) {
        console.log('❌ Error: No se encontró STATE.md. Ejecuta "yapu init" primero.');
        process.exit(1);
    }

    try {
        const stateContent = fs.readFileSync(files.state, 'utf-8');
        
        // Extraer el Modo usando Regex
        const modeMatch = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i);
        const currentMode = modeMatch ? modeMatch[1].trim() : 'NO DEFINIDO';
        
        // Extraer Fase Activa
        const phaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i);
        const activePhase = phaseMatch ? phaseMatch[1].trim() : 'NO DEFINIDA';

        console.log(`[ OPR MODE  ] : ${currentMode}`);
        console.log(`[ PHASE     ] : ${activePhase}`);
        console.log('---------------------------------');
        
        // Extraer Tareas
        console.log('[ TASKS     ] :');
        const tasks = stateContent.split('\n').filter(line => line.trim().startsWith('- ['));
        if (tasks.length > 0) {
            tasks.forEach(task => console.log(`  ${task.trim()}`));
        } else {
            console.log('  (No hay tareas definidas en STATE.md)');
        }
        
        console.log('---------------------------------');
        const hasProject = fs.existsSync(files.project) ? 'OK' : 'MISSING';
        const hasRoadmap = fs.existsSync(files.roadmap) ? 'OK' : 'MISSING';
        console.log(`[ SPECS     ] : PROJECT.md (${hasProject}) | ROADMAP.md (${hasRoadmap})`);
        
        console.log('\n=================================');
    } catch (err) {
        console.error('❌ Error leyendo la memoria de Yapu:', err.message);
    }
} else if (command === 'install-hooks') {
    console.log('🪺 Instalando Yapu Guard en Git Hooks...\n');
    
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
        console.error('❌ Error: Este directorio no es un repositorio Git activo (.git no encontrado).');
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
            console.log('✅ Yapu Guard: .git/hooks/pre-commit instalado con éxito.');
        } catch (err) {
            console.warn(`⚠️  No se pudieron asignar permisos ejecutables automáticamente: ${err.message}`);
        }
    } else {
        console.error('❌ Error: Plantilla del hook "pre-commit" no encontrada.');
        process.exit(1);
    }
} else if (command === 'health') {
    console.log('=== 🪺 YAPU WORKSPACE HEALTH CHECK ===\n');

    let errorsCount = 0;
    let warningsCount = 0;

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
    console.log('[+] Checking core memory files...');
    const projectPath = path.join(targetDir, 'PROJECT.md');
    const roadmapPath = path.join(targetDir, 'ROADMAP.md');
    const statePath = path.join(targetDir, 'STATE.md');

    printResult(fs.existsSync(projectPath), 'PROJECT.md exists');
    printResult(fs.existsSync(roadmapPath), 'ROADMAP.md exists');
    printResult(fs.existsSync(statePath), 'STATE.md exists');
    console.log('');

    // ── 2. Checking .planning/ colony structure ──────────────────────
    console.log('[+] Checking .planning/ colony structure...');
    const planningDir = path.join(targetDir, '.planning');
    const hasPlanningDir = fs.existsSync(planningDir);
    printResult(hasPlanningDir, '.planning/ directory exists');

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
        printResult(subdirsOk, 'All 10 required subdirectories exist');

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
            printResult(exists, `.planning/${file.name} exists`, file.critical);

            if (file.name === 'config.json' && exists) {
                try {
                    JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    printResult(true, 'config.json has valid JSON format');
                } catch {
                    printResult(false, 'config.json contains invalid JSON syntax', true);
                }
            }
        });
    }
    console.log('');

    // ── 3. Checking Yapu Guard (Git Hooks) ──────────────────────
    console.log('[+] Checking Yapu Guard (Git Hooks)...');
    const gitDir = path.join(targetDir, '.git');
    const hasGit = fs.existsSync(gitDir);
    printResult(hasGit, 'Active git repository detected', false);

    if (hasGit) {
        const preCommitPath = path.join(gitDir, 'hooks', 'pre-commit');
        const hasHook = fs.existsSync(preCommitPath);
        printResult(hasHook, 'Pre-commit hook installed at .git/hooks/pre-commit', false);

        if (hasHook) {
            try {
                const hookStat = fs.statSync(preCommitPath);
                const isExecutable = (hookStat.mode & 0o111) !== 0;
                printResult(isExecutable, 'Pre-commit hook is executable', false);
            } catch {
                printResult(false, 'Pre-commit hook permissions could not be read', false);
            }
        }
    }
    console.log('');

    // ── 4. Checking Memory Integrity ──────────────────────
    console.log('[+] Checking Memory Integrity...');
    if (fs.existsSync(statePath)) {
        try {
            const stateContent = fs.readFileSync(statePath, 'utf8');
            const hasMode = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i);
            const hasPhase = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i);

            printResult(Boolean(hasMode), 'Operational mode declared in STATE.md');
            printResult(Boolean(hasPhase), 'Active phase declared in STATE.md');
        } catch {
            printResult(false, 'Could not read STATE.md context structure');
        }
    } else {
        printResult(false, 'Skipped (STATE.md missing)');
    }
    console.log('');

    // ── 5. Final Report ──────────────────────
    console.log('=============================================');
    if (errorsCount === 0) {
        if (warningsCount === 0) {
            console.log('🔥 Workspace is 100% HEALTHY! The colony is thriving. 🪺');
        } else {
            console.log(`⚠️  Workspace is functional but has ${warningsCount} warning(s).`);
        }
        process.exit(0);
    } else {
        console.log(`❌ Workspace is UNHEALTHY with ${errorsCount} error(s) and ${warningsCount} warning(s).`);
        console.log('👉 Run "yapu init" or "yapu install-hooks" to repair.');
        process.exit(1);
    }
} else if (command === 'sync') {
    // ── yapu sync --brain-path {path} ──────────────────────────────────
    const brainIdx = args.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? args[brainIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(`🧠 Active brain auto-detected: ${brainPath}\n`);
            }
        } catch { /* ignore */ }
    }

    if (!brainPath) {
        console.error('❌ Uso: yapu sync --brain-path <ruta-al-brain>');
        console.error('   Ejemplo: yapu sync --brain-path ~/.gemini/antigravity-cli/brain/<uuid>');
        process.exit(1);
    }

    if (!fs.existsSync(brainPath)) {
        console.error(`❌ Error: Brain directory no encontrado: ${brainPath}`);
        process.exit(1);
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error('❌ Error: .planning/ no encontrado. Ejecuta "yapu init" primero.');
        process.exit(1);
    }

    console.log('🪺 Sincronizando brain de Antigravity → .planning/...\n');

    try {
        const { syncBrainToPlanning } = await import('../lib/artifacts.js');
        const result = syncBrainToPlanning(brainPath, planningPath);

        if (result.synced.length > 0) {
            result.synced.forEach(name => console.log(`✅ Sincronizado: ${name}`));
        } else {
            console.log('ℹ️  No se encontraron artifacts en el brain para sincronizar.');
        }

        if (result.errors.length > 0) {
            result.errors.forEach(err => console.error(`⚠️  Error: ${err}`));
        }

        console.log(`\n🪺 Sync completado: ${result.synced.length} artifacts sincronizados.`);
    } catch (err) {
        console.error('❌ Error durante la sincronización:', err.message);
        process.exit(1);
    }
} else if (command === 'handoff') {
    // ── yapu handoff [--brain-path {path}] ─────────────────────────────
    const brainIdx = args.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? args[brainIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(`🧠 Active brain auto-detected: ${brainPath}\n`);
            }
        } catch { /* ignore */ }
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error('❌ Error: .planning/ no encontrado. Ejecuta "yapu init" primero.');
        process.exit(1);
    }

    console.log('🪺 Generando handoff para la siguiente sesión...\n');

    try {
        const { generateHandoff } = await import('../lib/artifacts.js');
        const result = generateHandoff(planningPath, brainPath);

        console.log(`✅ HANDOFF.json generado: ${result.handoffPath}`);
        console.log(`✅ .continue-here.md generado: ${result.continueHerePath}`);
        console.log('\n🪺 Handoff listo. La siguiente sesión retomará automáticamente.');
    } catch (err) {
        console.error('❌ Error generando el handoff:', err.message);
        process.exit(1);
    }
} else if (command === 'brain') {
    // ── yapu brain list|log --path {path} ──────────────────────────────
    const subCommand = args[1];
    const pathIdx = args.indexOf('--path');
    let brainPath = pathIdx !== -1 ? args[pathIdx + 1] : null;

    if (!brainPath) {
        try {
            const { detectBrainPath } = await import('../lib/artifacts.js');
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(`🧠 Active brain auto-detected: ${brainPath}\n`);
            }
        } catch { /* ignore */ }
    }

    if (!brainPath) {
        console.error('❌ Uso: yapu brain <list|log> --path <ruta-al-brain>');
        console.error('   Ejemplo: yapu brain list --path ~/.gemini/antigravity-cli/brain/<uuid>');
        process.exit(1);
    }

    if (!fs.existsSync(brainPath)) {
        console.error(`❌ Error: Brain directory no encontrado: ${brainPath}`);
        process.exit(1);
    }

    if (subCommand === 'list') {
        console.log('=== 🪺 YAPU BRAIN INSPECTOR ===\n');
        try {
            const { listArtifacts } = await import('../lib/artifacts.js');
            const artifacts = listArtifacts(brainPath);

            if (artifacts.length === 0) {
                console.log('ℹ️  No se encontraron artifacts en el brain.');
            } else {
                console.log(`[ ARTIFACTS ] : ${artifacts.length} encontrados\n`);
                artifacts.forEach(art => {
                    const typeShort = art.type.replace('ARTIFACT_TYPE_', '');
                    console.log(`  📄 ${art.name}`);
                    console.log(`     Tipo: ${typeShort}`);
                    console.log(`     Resumen: ${art.summary || '(sin resumen)'}`);
                    console.log(`     Actualizado: ${art.updatedAt || '(desconocido)'}`);
                    console.log('');
                });
            }
            console.log('=================================');
        } catch (err) {
            console.error('❌ Error leyendo el brain:', err.message);
            process.exit(1);
        }
    } else if (subCommand === 'log') {
        const nIdx = args.indexOf('-n');
        const limit = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) || 20 : 20;

        console.log(`=== 🪺 YAPU BRAIN LOG (últimas ${limit} entradas) ===\n`);
        try {
            const { readConversationLog } = await import('../lib/artifacts.js');
            const entries = readConversationLog(brainPath, limit);

            if (entries.length === 0) {
                console.log('ℹ️  No se encontraron entradas en el log del brain.');
            } else {
                entries.forEach(entry => {
                    const icon = entry.source === 'USER_EXPLICIT' ? '👤' : '🤖';
                    const content = (entry.content || '').substring(0, 120);
                    console.log(`  ${icon} [${entry.step_index}] ${entry.type}: ${content}${content.length >= 120 ? '...' : ''}`);
                });
            }
            console.log('\n=================================');
        } catch (err) {
            console.error('❌ Error leyendo el log:', err.message);
            process.exit(1);
        }
    } else {
        console.error('❌ Subcomando no reconocido. Usa: yapu brain <list|log> --path <ruta>');
        process.exit(1);
    }
} else if (command === 'menu' || command === 'dashboard') {
    const { launchMenu } = await import('../lib/menu.js');
    await launchMenu();
} else {
    console.log('🪺 Framework YapuCli\n');
    console.log('Uso:');
    console.log('  yapu menu              -> Lanza el panel de control interactivo (TUI) de la colonia.');
    console.log('  yapu dashboard         -> (Alias de yapu menu) Panel interactivo TUI.');
    console.log('  yapu init              -> Funda la colonia (.planning/ + skills completos).');
    console.log('  yapu status            -> Radiografía del proyecto.');
    console.log('  yapu health            -> Valida la integridad del espacio de trabajo.');
    console.log('  yapu archive           -> Fin de temporada (congela tareas en HISTORY.md).');
    console.log('  yapu install-hooks     -> Despliega el avispero (Yapu Guard).');
    console.log('  yapu sync              -> Sincroniza brain de Antigravity → .planning/ (auto-detectado).');
    console.log('  yapu handoff           -> Genera handoff para la siguiente sesión (auto-detectado).');
    console.log('  yapu brain <list|log>  -> Inspecciona el brain de Antigravity (auto-detectado).');
}
