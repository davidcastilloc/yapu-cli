#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execSync } from 'node:child_process';
import readline from 'node:readline';
import zlib from 'node:zlib';
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

function createSnapshot(targetDir) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            throw new Error('.planning directory not found');
        }

        const snapshotsDir = path.join(planningDir, '.snapshots');
        if (!fs.existsSync(snapshotsDir)) {
            fs.mkdirSync(snapshotsDir, { recursive: true });
        }

        let gitCommitHash = 'no-git-commit';
        try {
            gitCommitHash = execSync('git rev-parse HEAD', { cwd: targetDir, stdio: 'pipe' }).toString().trim();
        } catch {
            // Not a git repository or no commit yet
        }

        const filesObj = {};
        const traverse = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relPath = path.relative(planningDir, fullPath);

                if (entry.isDirectory()) {
                    if (entry.name === '.snapshots') {
                        continue;
                    }
                    traverse(fullPath);
                } else if (entry.isFile()) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    filesObj[relPath] = content;
                }
            }
        };

        traverse(planningDir);

        const timestamp = Date.now();
        const snapshotObj = {
            version: 1,
            timestamp,
            gitCommit: gitCommitHash,
            files: filesObj
        };

        const shortCommit = gitCommitHash !== 'no-git-commit' ? gitCommitHash.substring(0, 7) : 'no-commit';
        const snapshotFilename = `snapshot-${timestamp}-${shortCommit}.json.gz`;
        const snapshotPath = path.join(snapshotsDir, snapshotFilename);

        const compressed = zlib.gzipSync(JSON.stringify(snapshotObj));
        fs.writeFileSync(snapshotPath, compressed);

        console.log(t('snapshot_created', { name: snapshotFilename, commit: shortCommit }));
        return snapshotFilename;
    } catch (err) {
        console.error(t('snapshot_error', { error: err.message }));
        throw err;
    }
}

function restoreSnapshot(targetDir, snapshotPath) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            throw new Error('.planning directory not found');
        }

        const compressed = fs.readFileSync(snapshotPath);
        const decompressed = zlib.gunzipSync(compressed).toString('utf8');
        const snapshotObj = JSON.parse(decompressed);

        console.log(t('rewind_restoring_files'));

        const clearDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name === '.snapshots') {
                        continue;
                    }
                    clearDir(fullPath);
                    try {
                        if (fs.readdirSync(fullPath).length === 0) {
                            fs.rmdirSync(fullPath);
                        }
                    } catch { /* skip */ }
                } else if (entry.isFile()) {
                    fs.unlinkSync(fullPath);
                }
            }
        };
        clearDir(planningDir);

        for (const [relPath, content] of Object.entries(snapshotObj.files)) {
            const fullPath = path.join(planningDir, relPath);
            const parentDir = path.dirname(fullPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, 'utf8');
        }

        const gitCommit = snapshotObj.gitCommit;
        if (gitCommit && gitCommit !== 'no-git-commit') {
            console.log(t('rewind_restoring_git', { commit: gitCommit.substring(0, 7) }));
            execSync(`git reset --hard ${gitCommit}`, { cwd: targetDir, stdio: 'inherit' });
        }

        console.log(t('rewind_success', { commit: (gitCommit || 'unknown').substring(0, 7) }));
    } catch (err) {
        console.error(t('rewind_error', { error: err.message }));
        throw err;
    }
}

function saveBranchContext(targetDir, branchName) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            return;
        }

        const branchesDir = path.join(planningDir, '.branches');
        if (!fs.existsSync(branchesDir)) {
            fs.mkdirSync(branchesDir, { recursive: true });
        }

        const filesObj = {};
        const traverse = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relPath = path.relative(planningDir, fullPath);

                if (entry.isDirectory()) {
                    if (entry.name === '.snapshots' || entry.name === '.branches') {
                        continue;
                    }
                    traverse(fullPath);
                } else if (entry.isFile()) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    filesObj[relPath] = content;
                }
            }
        };

        traverse(planningDir);

        const stateObj = {
            version: 1,
            timestamp: Date.now(),
            files: filesObj
        };

        const statePath = path.join(branchesDir, `branch-${branchName}.json.gz`);
        const compressed = zlib.gzipSync(JSON.stringify(stateObj));
        fs.writeFileSync(statePath, compressed);
    } catch (err) {
        console.error(`Error saving branch context: ${err.message}`);
    }
}

function restoreBranchContext(targetDir, branchName) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            return false;
        }

        const branchesDir = path.join(planningDir, '.branches');
        const statePath = path.join(branchesDir, `branch-${branchName}.json.gz`);
        if (!fs.existsSync(statePath)) {
            return false;
        }

        const compressed = fs.readFileSync(statePath);
        const decompressed = zlib.gunzipSync(compressed).toString('utf8');
        const stateObj = JSON.parse(decompressed);

        const clearDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name === '.snapshots' || entry.name === '.branches') {
                        continue;
                    }
                    clearDir(fullPath);
                    try {
                        if (fs.readdirSync(fullPath).length === 0) {
                            fs.rmdirSync(fullPath);
                        }
                    } catch { /* skip */ }
                } else if (entry.isFile()) {
                    fs.unlinkSync(fullPath);
                }
            }
        };
        clearDir(planningDir);

        for (const [relPath, content] of Object.entries(stateObj.files)) {
            const fullPath = path.join(planningDir, relPath);
            const parentDir = path.dirname(fullPath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, 'utf8');
        }

        return true;
    } catch (err) {
        console.error(`Error restoring branch context: ${err.message}`);
        return false;
    }
}

function normalizeTaskText(text) {
    return text
        .replace(/^\s*(Task\s*\d+|T\d+|Task\s+[A-Za-z0-9_]+|T\s+[A-Za-z0-9_]+)[:\s\*-]*/i, '')
        .replace(/[\*\s`'"]/g, '')
        .toLowerCase()
        .trim();
}

function getBranchFileContent(targetDir, branchName, relPath) {
    try {
        const content = execSync(`git show ${branchName}:${relPath}`, { cwd: targetDir, stdio: 'pipe' }).toString('utf8');
        return content;
    } catch {
        const statePath = path.join(targetDir, '.planning', '.branches', `branch-${branchName}.json.gz`);
        if (fs.existsSync(statePath)) {
            try {
                const compressed = fs.readFileSync(statePath);
                const decompressed = zlib.gunzipSync(compressed).toString('utf8');
                const stateObj = JSON.parse(decompressed);
                if (stateObj && stateObj.files) {
                    if (stateObj.files[relPath]) {
                        return stateObj.files[relPath];
                    }
                    if (relPath.startsWith('.planning/')) {
                        const planningRel = relPath.substring(10);
                        if (stateObj.files[planningRel]) {
                            return stateObj.files[planningRel];
                        }
                    } else {
                        if (stateObj.files[`.planning/${relPath}`]) {
                            return stateObj.files[`.planning/${relPath}`];
                        }
                    }
                }
            } catch {}
        }
    }
    return null;
}

function harmonizeStateFile(targetDir, targetBranch, activeFileName) {
    let updatedTasksCount = 0;
    const sourceStateContent = getBranchFileContent(targetDir, targetBranch, activeFileName) || getBranchFileContent(targetDir, targetBranch, `.planning/${activeFileName}`);
    if (!sourceStateContent) return 0;

    const pathsToHarmonize = [];
    if (fs.existsSync(path.join(targetDir, '.planning', activeFileName))) {
        pathsToHarmonize.push(path.join(targetDir, '.planning', activeFileName));
    }
    if (fs.existsSync(path.join(targetDir, activeFileName))) {
        pathsToHarmonize.push(path.join(targetDir, activeFileName));
    }

    const uniquePaths = Array.from(new Set(pathsToHarmonize));

    for (const activeStatePath of uniquePaths) {
        const activeStateContent = fs.readFileSync(activeStatePath, 'utf8');
        
        const completedTasks = new Set();
        const sourceLines = sourceStateContent.split('\n');
        const completedRegex = /^\s*-\s*\[[xX]\]\s*(.*)$/;
        for (const line of sourceLines) {
            const match = line.match(completedRegex);
            if (match) {
                completedTasks.add(normalizeTaskText(match[1]));
            }
        }

        const activeLines = activeStateContent.split('\n');
        const pendingRegex = /^\s*-\s*\[([\s\/])\]\s*(.*)$/;
        let fileUpdatedTasksCount = 0;
        const updatedLines = activeLines.map(line => {
            const match = line.match(pendingRegex);
            if (match) {
                const text = match[2];
                const norm = normalizeTaskText(text);
                if (completedTasks.has(norm)) {
                    fileUpdatedTasksCount++;
                    return line.replace(/-\s*\[[\s\/]\]/, '- [x]');
                }
            }
            return line;
        });

        if (fileUpdatedTasksCount > 0) {
            fs.writeFileSync(activeStatePath, updatedLines.join('\n'), 'utf8');
            updatedTasksCount = Math.max(updatedTasksCount, fileUpdatedTasksCount);
        }
    }
    return updatedTasksCount;
}

function harvestLearnings(targetDir, targetBranch) {
    const learningsFileName = 'yapu-learnings.md';
    const sourceLearningsContent = getBranchFileContent(targetDir, targetBranch, learningsFileName) || getBranchFileContent(targetDir, targetBranch, `.planning/${learningsFileName}`);
    if (!sourceLearningsContent) {
        return false;
    }

    const targetPlanningPath = path.join(targetDir, '.planning', learningsFileName);
    const targetRootPath = path.join(targetDir, learningsFileName);
    
    let activePath = targetRootPath;
    if (fs.existsSync(targetPlanningPath)) {
        activePath = targetPlanningPath;
    } else if (fs.existsSync(targetRootPath)) {
        activePath = targetRootPath;
    } else if (fs.existsSync(path.join(targetDir, '.planning'))) {
        activePath = targetPlanningPath;
    }

    let currentContent = '';
    if (fs.existsSync(activePath)) {
        currentContent = fs.readFileSync(activePath, 'utf8');
    }

    const headerTitle = activeLang === 'es' 
        ? `## 🧪 Aprendizajes del Experimento: ${targetBranch}`
        : `## 🧪 Learnings from Experiment: ${targetBranch}`;

    const formattedLearnings = sourceLearningsContent
        .replace(/^#\s+.*$/m, '')
        .trim();

    const newSection = `\n${headerTitle}\n\n${formattedLearnings}\n`;

    fs.writeFileSync(activePath, currentContent + newSection, 'utf8');
    return true;
}

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

    // Automatically add .planning/.branches/ and .planning/.snapshots/ to .gitignore to avoid committing them
    const gitignorePath = path.join(targetDir, '.gitignore');
    const ignoreEntries = [
        '.planning/.branches/',
        '.planning/.snapshots/'
    ];
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    let updatedGitignore = false;
    for (const entry of ignoreEntries) {
        if (!gitignoreContent.includes(entry)) {
            if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
                gitignoreContent += '\n';
            }
            gitignoreContent += entry + '\n';
            updatedGitignore = true;
        }
    }
    if (updatedGitignore) {
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
        console.log(activeLang === 'es' ? '📝 Archivo .gitignore actualizado para excluir ramas y snapshots de contexto.' : '📝 .gitignore file updated to exclude context branches and snapshots.');
    }

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
} else if (command === 'board') {
    const portIdx = cleanArgs.indexOf('--port');
    const port = portIdx !== -1 ? parseInt(cleanArgs[portIdx + 1], 10) : 4040;
    console.log(t('board_start'));
    import('../lib/board.js')
        .then(({ startBoard }) => {
            startBoard(targetDir, activeLang, { port });
        })
        .catch(err => {
            console.error('Error loading board:', err);
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
} else if (command === 'swarm') {
    console.log(t('swarm_start'));

    let finalStatePath = '';
    const candidates = [
        path.join(targetDir, '.planning', 'STATE.md'),
        path.join(targetDir, 'STATE.md'),
        path.join(targetDir, '.planning', 'PLAN.md'),
        path.join(targetDir, 'PLAN.md'),
        path.join(targetDir, '.planning', 'current-plan.md')
    ];
    for (const cand of candidates) {
        if (fs.existsSync(cand)) {
            finalStatePath = cand;
            break;
        }
    }

    if (!finalStatePath) {
        console.error(t('status_no_state'));
        process.exit(1);
    }

    try {
        const stateContent = fs.readFileSync(finalStatePath, 'utf8');
        const tasks = [];
        const lines = stateContent.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Format 1: MECE Advanced format - e.g. "- [ ] **T1: Implement login**"
            const meceMatch = line.match(/- \[( |\/|x)\] \*\*(T\d+):\s*(.*?)\*\*/);
            if (meceMatch) {
                const statusChar = meceMatch[1];
                const id = meceMatch[2];
                const name = meceMatch[3].trim();
                const status = (statusChar === 'x') ? 'completed' : 'pending';

                let files = [];
                let verification = '';
                let dependency = [];

                let j = i + 1;
                while (j < lines.length && 
                       (lines[j].trim().startsWith('-') || lines[j].trim().startsWith('*') || lines[j].trim() === '') && 
                       !lines[j].match(/- \[( |\/|x)\]/)) {
                    const subLine = lines[j].trim();
                    const filesMatch = subLine.match(/(?:Files|Archivos):\s*(.*)/i);
                    if (filesMatch) {
                        files = filesMatch[1].split(',').map(f => f.trim().replace(/[\[\]`]/g, '')).filter(Boolean);
                    }
                    const verifyMatch = subLine.match(/(?:Verification|Verificación):\s*(.*)/i);
                    if (verifyMatch) {
                        verification = verifyMatch[1].trim();
                    }
                    const depMatch = subLine.match(/(?:Dependency|Dependencia):\s*(.*)/i);
                    if (depMatch) {
                        const depVal = depMatch[1].trim().replace(/[\[\]`]/g, '');
                        if (depVal.toLowerCase() !== 'none') {
                            dependency = depVal.split(',').map(d => d.trim()).filter(Boolean);
                        }
                    }
                    j++;
                }

                tasks.push({
                    id,
                    name,
                    status,
                    files,
                    verification,
                    dependency,
                    startIndex: i,
                    endIndex: j - 1
                });
            } else {
                // Format 2: Fallback simple task - e.g. "- [ ] Task 1: Refactor bin/cli.js" or "- [/] Task 5: ..."
                const fallbackMatch = line.match(/- \[( |\/|x)\] (Task \d+|Tarea \d+):\s*(.*)/i);
                if (fallbackMatch) {
                    const statusChar = fallbackMatch[1];
                    const idVal = fallbackMatch[2].trim();
                    const idMatch = idVal.match(/\d+/);
                    const id = idMatch ? 'T' + idMatch[0] : idVal;
                    const name = fallbackMatch[3].trim();
                    const status = (statusChar === 'x') ? 'completed' : 'pending';

                    let files = [];
                    const fileMatches = name.match(/`([^`]+)`/g);
                    if (fileMatches) {
                        files = fileMatches.map(m => m.replace(/`/g, ''));
                    }

                    tasks.push({
                        id,
                        name,
                        status,
                        files,
                        verification: '',
                        dependency: [],
                        startIndex: i,
                        endIndex: i
                    });
                }
            }
        }

        const pendingTasksCheck = tasks.filter(t => t.status === 'pending');
        if (pendingTasksCheck.length === 0) {
            console.log(t('swarm_no_tasks'));
            process.exit(0);
        }

        const configPath = path.join(targetDir, '.planning', 'config.json');
        let maxConcurrent = 3;
        if (fs.existsSync(configPath)) {
            try {
                const configObj = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                if (configObj.parallelization && configObj.parallelization.max_concurrent_agents) {
                    maxConcurrent = configObj.parallelization.max_concurrent_agents;
                }
            } catch { /* skip */ }
        }

        try {
            execSync('which antigravity', { stdio: 'ignore' });
        } catch {
            console.error('❌ Error: the "antigravity" executable was not found in the system PATH.');
            process.exit(1);
        }

        const running = new Map();
        const failedTasks = new Set();
        const completedTasks = new Set();

        tasks.forEach(t => {
            if (t.status === 'completed') {
                completedTasks.add(t.id);
            }
        });

        const colors = [
            '\x1b[36m', // Cyan
            '\x1b[35m', // Magenta
            '\x1b[33m', // Yellow
            '\x1b[32m', // Green
            '\x1b[34m'  // Blue
        ];
        const resetColor = '\x1b[0m';

        let colorCounter = 0;
        const taskColors = {};
        tasks.forEach(t => {
            taskColors[t.id] = colors[colorCounter % colors.length];
            colorCounter++;
        });

        const startSubagent = (task) => {
            console.log(`${taskColors[task.id]}[${task.id}] 🚀 ${t('swarm_running_task', { id: task.id, name: task.name })}${resetColor}`);

            const promptText = `You are a parallel subagent in a Yapu Swarm.
Execute the following task:
Task ID: ${task.id}
Task Name: ${task.name}
Files to modify: ${task.files.join(', ')}
Verification: ${task.verification || 'Run relevant tests or check changes'}

Instructions:
1. Implement the task.
2. Verify the implementation.
3. CRITICAL: Do NOT perform any git commits, and do NOT modify STATE.md or any other plan/roadmap files. The parent orchestrator will handle git commits and state updates.
4. Once successfully completed and verified, exit with code 0.
`;

            const args = ['chat', '-m', 'agent'];
            task.files.forEach(f => {
                const fullPath = path.resolve(targetDir, f);
                if (fs.existsSync(fullPath)) {
                    args.push('-a', f);
                }
            });

            const workflowPath = path.join(targetDir, '.agents', 'skills', 'yapu-execute.md');
            if (fs.existsSync(workflowPath)) {
                args.push('-a', '.agents/skills/yapu-execute.md');
            }

            args.push(promptText);

            const child = spawn('antigravity', args, {
                cwd: targetDir,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            running.set(task.id, {
                process: child,
                files: task.files,
                task
            });

            const rlStdout = readline.createInterface({ input: child.stdout });
            rlStdout.on('line', (line) => {
                console.log(`${taskColors[task.id]}[${task.id}]${resetColor} ${line}`);
            });

            const rlStderr = readline.createInterface({ input: child.stderr });
            rlStderr.on('line', (line) => {
                console.error(`${taskColors[task.id]}[${task.id}] [ERR]${resetColor} \x1b[31m${line}\x1b[0m`);
            });

            child.on('close', (code) => {
                running.delete(task.id);

                if (code === 0) {
                    console.log(`${taskColors[task.id]}[${task.id}] ${t('swarm_completed_task', { id: task.id })}${resetColor}`);
                    task.status = 'completed';
                    completedTasks.add(task.id);

                    try {
                        const currentContent = fs.readFileSync(finalStatePath, 'utf8');
                        const linesArray = currentContent.split('\n');
                        const targetLine = linesArray[task.startIndex];
                        linesArray[task.startIndex] = targetLine.replace(/- \[( |\/)\]/, '- [x]');
                        fs.writeFileSync(finalStatePath, linesArray.join('\n'), 'utf8');
                    } catch (err) {
                        console.error(`❌ [${task.id}] Error writing to STATE.md: ${err.message}`);
                    }

                    if (task.files.length > 0) {
                        try {
                            task.files.forEach(f => {
                                if (fs.existsSync(path.join(targetDir, f))) {
                                    execSync(`git add "${f}"`, { cwd: targetDir });
                                }
                            });
                            execSync(`git commit -m "yapu: ${task.id} - ${task.name}"`, { cwd: targetDir, stdio: 'ignore' });
                            console.log(`${taskColors[task.id]}[${task.id}] ${t('swarm_git_commit', { id: task.id, files: task.files.join(', ') })}${resetColor}`);
                            
                            // Auto-trigger snapshot on swarm task success
                            try {
                                createSnapshot(targetDir);
                            } catch {
                                // Suppress snapshot errors during swarm
                            }
                        } catch (err) {
                            // Suppress git errors if no changes made
                        }
                    }
                } else {
                    console.error(`\x1b[31m[${task.id}] ${t('swarm_failed_task', { id: task.id, code })}\x1b[0m`);
                    failedTasks.add(task.id);
                }

                tick();
            });
        };

        const tick = () => {
            const pendingTasks = tasks.filter(t => t.status === 'pending' && !running.has(t.id) && !failedTasks.has(t.id));

            if (pendingTasks.length === 0 && running.size === 0) {
                console.log(t('swarm_summary_title'));
                if (failedTasks.size === 0) {
                    console.log(`\x1b[32m${t('swarm_summary_success')}\x1b[0m`);
                } else {
                    console.warn(`\x1b[33m${t('swarm_summary_partial')}\x1b[0m`);
                    console.warn(`❌ Failed tasks: ${Array.from(failedTasks).join(', ')}`);
                }
                process.exit(failedTasks.size === 0 ? 0 : 1);
            }

            const runnableTasks = pendingTasks.filter(task => {
                const hasFailedDep = task.dependency.some(depId => failedTasks.has(depId));
                if (hasFailedDep) {
                    failedTasks.add(task.id);
                    return false;
                }
                return task.dependency.every(depId => completedTasks.has(depId));
            });

            for (const task of runnableTasks) {
                if (running.size >= maxConcurrent) {
                    break;
                }

                let hasFileOverlap = false;
                for (const runningTask of running.values()) {
                    const overlap = task.files.some(f => runningTask.files.includes(f));
                    if (overlap) {
                        hasFileOverlap = true;
                        break;
                    }
                }

                if (hasFileOverlap) {
                    continue;
                }

                startSubagent(task);
            }
        };

        // Start scheduling
        tick();

    } catch (err) {
        console.error(`❌ Error in Yapu Swarm: ${err.message}`);
        process.exit(1);
    }
} else if (command === 'snapshot') {
    try {
        createSnapshot(targetDir);
    } catch (err) {
        process.exit(1);
    }
} else if (command === 'rewind') {
    console.log(t('rewind_start'));
    const snapshotsDir = path.join(targetDir, '.planning', '.snapshots');
    if (!fs.existsSync(snapshotsDir)) {
        console.error(t('rewind_no_snapshots'));
        process.exit(1);
    }
    const snapshotFiles = fs.readdirSync(snapshotsDir)
        .filter(f => f.startsWith('snapshot-') && f.endsWith('.json.gz'));

    if (snapshotFiles.length === 0) {
        console.error(t('rewind_no_snapshots'));
        process.exit(1);
    }

    // Sort descending by timestamp
    snapshotFiles.sort((a, b) => {
        const timeA = parseInt(a.split('-')[1]) || 0;
        const timeB = parseInt(b.split('-')[1]) || 0;
        return timeB - timeA;
    });

    const listIdx = cleanArgs.indexOf('--list');
    const selectIdx = cleanArgs.indexOf('--select');

    if (listIdx !== -1) {
        console.log(activeLang === 'es' ? '=== Snapshots Disponibles ===' : '=== Available Snapshots ===');
        snapshotFiles.forEach((file, index) => {
            const parts = file.split('-');
            const timestamp = parseInt(parts[1]);
            const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
            const dateStr = new Date(timestamp).toLocaleString();
            console.log(`[${index}] ${file} (${dateStr}) - Git: ${commit}`);
        });
        process.exit(0);
    }

    let selectedFile = null;
    if (selectIdx !== -1 && cleanArgs[selectIdx + 1]) {
        const selection = cleanArgs[selectIdx + 1];
        const idx = parseInt(selection, 10);
        if (!isNaN(idx) && idx >= 0 && idx < snapshotFiles.length) {
            selectedFile = snapshotFiles[idx];
        } else if (snapshotFiles.includes(selection)) {
            selectedFile = selection;
        } else {
            console.error(activeLang === 'es' ? `❌ Error: Selección inválida: ${selection}` : `❌ Error: Invalid selection: ${selection}`);
            process.exit(1);
        }
    } else {
        selectedFile = snapshotFiles[0];
    }

    const proceedWithRewind = (selected) => {
        const parts = selected.split('-');
        const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
        console.log(t('rewind_selected', { name: selected }));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(t('rewind_confirm_prompt', { commit }), (answer) => {
            rl.close();
            const conf = answer.trim().toLowerCase();
            if (conf === 's' || conf === 'y' || conf === 'si' || conf === 'yes') {
                try {
                    restoreSnapshot(targetDir, path.join(snapshotsDir, selected));
                } catch (err) {
                    process.exit(1);
                }
            } else {
                console.log(t('rewind_cancelled'));
                process.exit(0);
            }
        });
    };

    if (selectIdx !== -1 && !cleanArgs[selectIdx + 1]) {
        console.log(activeLang === 'es' ? '=== Selecciona un Snapshot ===' : '=== Select a Snapshot ===');
        snapshotFiles.forEach((file, index) => {
            const parts = file.split('-');
            const timestamp = parseInt(parts[1]);
            const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
            const dateStr = new Date(timestamp).toLocaleString();
            console.log(`[${index}] ${file} (${dateStr}) - Git: ${commit}`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const selectionPrompt = activeLang === 'es' ? 'Ingresa el número o nombre del snapshot: ' : 'Enter snapshot number or filename: ';
        rl.question(selectionPrompt, (answer) => {
            rl.close();
            const selection = answer.trim();
            const idx = parseInt(selection, 10);
            let interactiveSelected = null;
            if (!isNaN(idx) && idx >= 0 && idx < snapshotFiles.length) {
                interactiveSelected = snapshotFiles[idx];
            } else if (snapshotFiles.includes(selection)) {
                interactiveSelected = selection;
            } else {
                console.error(activeLang === 'es' ? `❌ Error: Selección inválida: ${selection}` : `❌ Error: Invalid selection: ${selection}`);
                process.exit(1);
            }
            proceedWithRewind(interactiveSelected);
        });
    } else {
        proceedWithRewind(selectedFile);
    }
} else if (command === 'profile') {
    try {
        const memoryFiles = [
            { name: 'PROJECT.md', path: path.join(targetDir, 'PROJECT.md') },
            { name: 'ROADMAP.md', path: path.join(targetDir, 'ROADMAP.md') },
            { name: 'STATE.md', path: path.join(targetDir, 'STATE.md') }
        ];

        const filesToScan = [];

        // Check root files
        for (const file of memoryFiles) {
            if (fs.existsSync(file.path) && fs.statSync(file.path).isFile()) {
                filesToScan.push(file);
            }
        }

        // Recursively scan .planning/ excluding .snapshots/
        const planningDir = path.join(targetDir, '.planning');
        if (fs.existsSync(planningDir)) {
            const scanDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name === '.snapshots') {
                            continue;
                        }
                        scanDir(fullPath);
                    } else if (entry.isFile()) {
                        const relPath = path.relative(targetDir, fullPath);
                        filesToScan.push({
                            name: relPath,
                            path: fullPath
                        });
                    }
                }
            };
            scanDir(planningDir);
        }

        console.log(t('profile_title'));

        const fileHeader = t('profile_header_file').padEnd(35);
        const sizeHeader = t('profile_header_size').padEnd(10);
        const tokensHeader = t('profile_header_tokens').padEnd(12);
        const statusHeader = t('profile_header_status').padEnd(12);

        const headerLine = `| ${fileHeader} | ${sizeHeader} | ${tokensHeader} | ${statusHeader} |`;
        const separator = '-'.repeat(headerLine.length);

        console.log(separator);
        console.log(headerLine);
        console.log(separator);

        let totalBytes = 0;
        let totalTokens = 0;
        let hasWarning = false;
        let hasCritical = false;

        const getFileStatus = (tokens) => {
            if (tokens < 5000) {
                return { label: 'OK', color: '\x1b[32m' };
            } else if (tokens <= 10000) {
                hasWarning = true;
                return { label: 'WARNING ⚠️', color: '\x1b[33m' };
            } else {
                hasCritical = true;
                return { label: 'CRITICAL 🚨', color: '\x1b[31m' };
            }
        };

        for (const file of filesToScan) {
            const content = fs.readFileSync(file.path, 'utf8');
            const bytes = content.length;
            const sizeKB = (bytes / 1024).toFixed(1);
            const tokens = Math.ceil(bytes / 4.0);

            totalBytes += bytes;
            totalTokens += tokens;

            const statusObj = getFileStatus(tokens);

            let nameCol = file.name;
            if (nameCol.length > 35) {
                nameCol = '...' + nameCol.slice(-32);
            }

            const nameStr = nameCol.padEnd(35);
            const sizeStr = `${sizeKB} KB`.padEnd(10);
            const tokensStr = String(tokens).padEnd(12);
            const statusStr = statusObj.label.padEnd(12);

            console.log(`| ${nameStr} | ${sizeStr} | ${tokensStr} | ${statusObj.color}${statusStr}\x1b[0m |`);
        }

        console.log(separator);

        const totalKBStr = (totalBytes / 1024).toFixed(1);
        const formattedTokens = totalTokens.toLocaleString(activeLang === 'es' ? 'es-ES' : 'en-US');

        console.log(t('profile_total_weight', { size: totalKBStr, tokens: formattedTokens }));

        // Recommendations based on cumulative context size and single files status
        let recText = t('profile_rec_ok');
        if (totalTokens > 30000 || hasCritical) {
            recText = t('profile_rec_critical');
        } else if (totalTokens > 15000 || hasWarning) {
            recText = t('profile_rec_warning');
        }

        console.log(`${t('profile_rec_title')}${recText}`);

    } catch (err) {
        console.error(`❌ Error scanning context: ${err.message}`);
        process.exit(1);
    }
} else if (command === 'daemon' || command === 'watch') {
    const brainIdx = cleanArgs.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? cleanArgs[brainIdx + 1] : null;

    const homeDir = os.homedir();
    const brainBaseDir = path.join(homeDir, '.gemini', 'antigravity-cli', 'brain');
    const watchDir = brainPath || brainBaseDir;

    if (!fs.existsSync(watchDir)) {
        fs.mkdirSync(watchDir, { recursive: true });
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error(t('sync_no_planning'));
        process.exit(1);
    }

    console.log(t('daemon_start'));
    console.log(t('daemon_watching_path', { path: watchDir }));

    const doSync = async () => {
        try {
            const { detectBrainPath, syncBrainToPlanning } = await import('../lib/artifacts.js');
            const targetBrainPath = brainPath || detectBrainPath();
            if (!targetBrainPath || !fs.existsSync(targetBrainPath)) {
                return;
            }

            const result = syncBrainToPlanning(targetBrainPath, planningPath);
            if (result.synced && result.synced.length > 0) {
                result.synced.forEach(name => {
                    console.log(t('daemon_synced_file', { name }));
                });
            }
        } catch (err) {
            console.error(t('daemon_error', { error: err.message }));
        }
    };

    // Run initial sync
    await doSync();

    let debounceTimeout = null;
    const watcher = fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.includes('.system_generated') && !filename.endsWith('transcript.jsonl')) {
            return;
        }

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
            doSync();
        }, 300);
    });

    process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        watcher.close();
        process.exit(0);
    });
} else if (command === 'branch') {
    const targetBranch = cleanArgs[1];
    
    let currentBranch = '';
    try {
        currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: targetDir, stdio: 'pipe' }).toString().trim();
    } catch (err) {
        console.error(t('hooks_no_git'));
        process.exit(1);
    }

    if (!targetBranch) {
        const branchesDir = path.join(targetDir, '.planning', '.branches');
        const contextBranches = [];
        if (fs.existsSync(branchesDir)) {
            const files = fs.readdirSync(branchesDir);
            for (const file of files) {
                if (file.startsWith('branch-') && file.endsWith('.json.gz')) {
                    const name = file.slice(7, -8);
                    const fullPath = path.join(branchesDir, file);
                    try {
                        const stat = fs.statSync(fullPath);
                        const compressed = fs.readFileSync(fullPath);
                        const decompressed = zlib.gunzipSync(compressed).toString('utf8');
                        const stateObj = JSON.parse(decompressed);
                        contextBranches.push({
                            name,
                            timestamp: stateObj.timestamp || stat.mtimeMs
                        });
                    } catch {
                        contextBranches.push({ name, timestamp: 0 });
                    }
                }
            }
        }

        console.log(t('branch_list_title'));
        if (contextBranches.length === 0) {
            console.log(activeLang === 'es' ? '  (No hay ramas de contexto guardadas aún)' : '  (No context branches saved yet)');
        } else {
            contextBranches.forEach(b => {
                const isCurrent = b.name === currentBranch ? '* ' : '  ';
                const dateStr = b.timestamp ? new Date(b.timestamp).toISOString() : 'unknown';
                console.log(`${isCurrent}${b.name} (${dateStr})`);
            });
        }
        process.exit(0);
    }
    let isDirty = false;
    try {
        const status = execSync('git status --porcelain -uno', { cwd: targetDir, stdio: 'pipe' }).toString().trim();
        if (status) {
            isDirty = true;
        }
    } catch {
        // Assume clean if command fails
    }

    if (isDirty) {
        console.error(t('branch_err_dirty'));
        process.exit(1);
    }

    console.log(t('branch_start'));

    saveBranchContext(targetDir, currentBranch);
    console.log(t('branch_current_saved', { name: currentBranch }));

    let branchExists = false;
    try {
        execSync(`git show-ref --verify --quiet refs/heads/${targetBranch}`, { cwd: targetDir, stdio: 'pipe' });
        branchExists = true;
    } catch {
        try {
            execSync(`git show-ref --verify --quiet refs/remotes/origin/${targetBranch}`, { cwd: targetDir, stdio: 'pipe' });
            branchExists = true;
        } catch {}
    }

    try {
        if (branchExists) {
            execSync(`git checkout ${targetBranch}`, { cwd: targetDir, stdio: 'inherit' });
        } else {
            execSync(`git checkout -b ${targetBranch}`, { cwd: targetDir, stdio: 'inherit' });
        }
        console.log(t('branch_created', { name: targetBranch }));
    } catch (err) {
        console.error(`❌ Error switching Git branch: ${err.message}`);
        process.exit(1);
    }

    const restored = restoreBranchContext(targetDir, targetBranch);
    if (restored) {
        console.log(t('branch_restored', { name: targetBranch }));
    }

} else if (command === 'merge') {
    const targetBranch = cleanArgs[1];
    if (!targetBranch) {
        console.error(activeLang === 'es' ? '❌ Error: Debes especificar el nombre de la rama a fusionar.' : '❌ Error: You must specify the branch name to merge.');
        console.error('Usage: yapu merge <branchName>');
        process.exit(1);
    }

    try {
        execSync('git rev-parse --is-inside-work-tree', { cwd: targetDir, stdio: 'pipe' });
    } catch {
        console.error(t('hooks_no_git'));
        process.exit(1);
    }

    // Pre-calculate completed tasks count before merge
    let tasksUpdated = 0;
    try {
        const statePaths = [];
        if (fs.existsSync(path.join(targetDir, '.planning', 'STATE.md'))) {
            statePaths.push(path.join(targetDir, '.planning', 'STATE.md'));
        }
        if (fs.existsSync(path.join(targetDir, 'STATE.md'))) {
            statePaths.push(path.join(targetDir, 'STATE.md'));
        }
        const uniquePaths = Array.from(new Set(statePaths));
        for (const activeStatePath of uniquePaths) {
            const sourceStateContent = getBranchFileContent(targetDir, targetBranch, 'STATE.md') || getBranchFileContent(targetDir, targetBranch, '.planning/STATE.md');
            if (sourceStateContent) {
                const activeStateContent = fs.readFileSync(activeStatePath, 'utf8');
                const pendingActiveTasks = new Set();
                const activeLines = activeStateContent.split('\n');
                const pendingRegex = /^\s*-\s*\[([\s\/])\]\s*(.*)$/;
                for (const line of activeLines) {
                    const match = line.match(pendingRegex);
                    if (match) {
                        pendingActiveTasks.add(normalizeTaskText(match[2]));
                    }
                }

                const completedSourceTasks = new Set();
                const sourceLines = sourceStateContent.split('\n');
                const completedRegex = /^\s*-\s*\[[xX]\]\s*(.*)$/;
                for (const line of sourceLines) {
                    const match = line.match(completedRegex);
                    if (match) {
                        completedSourceTasks.add(normalizeTaskText(match[1]));
                    }
                }

                let fileTasksUpdated = 0;
                for (const task of completedSourceTasks) {
                    if (pendingActiveTasks.has(task)) {
                        fileTasksUpdated++;
                    }
                }
                tasksUpdated = Math.max(tasksUpdated, fileTasksUpdated);
            }
        }
    } catch {}

    try {
        const stateEsPaths = [];
        if (fs.existsSync(path.join(targetDir, '.planning', 'STATE.es.md'))) {
            stateEsPaths.push(path.join(targetDir, '.planning', 'STATE.es.md'));
        }
        if (fs.existsSync(path.join(targetDir, 'STATE.es.md'))) {
            stateEsPaths.push(path.join(targetDir, 'STATE.es.md'));
        }
        const uniqueEsPaths = Array.from(new Set(stateEsPaths));
        let esTasksUpdated = 0;
        for (const activeStatePath of uniqueEsPaths) {
            const sourceStateContent = getBranchFileContent(targetDir, targetBranch, 'STATE.es.md') || getBranchFileContent(targetDir, targetBranch, '.planning/STATE.es.md');
            if (sourceStateContent) {
                const activeStateContent = fs.readFileSync(activeStatePath, 'utf8');
                const pendingActiveTasks = new Set();
                const activeLines = activeStateContent.split('\n');
                const pendingRegex = /^\s*-\s*\[([\s\/])\]\s*(.*)$/;
                for (const line of activeLines) {
                    const match = line.match(pendingRegex);
                    if (match) {
                        pendingActiveTasks.add(normalizeTaskText(match[2]));
                    }
                }

                const completedSourceTasks = new Set();
                const sourceLines = sourceStateContent.split('\n');
                const completedRegex = /^\s*-\s*\[[xX]\]\s*(.*)$/;
                for (const line of sourceLines) {
                    const match = line.match(completedRegex);
                    if (match) {
                        completedSourceTasks.add(normalizeTaskText(match[1]));
                    }
                }

                let fileTasksUpdated = 0;
                for (const task of completedSourceTasks) {
                    if (pendingActiveTasks.has(task)) {
                        fileTasksUpdated++;
                    }
                }
                esTasksUpdated = Math.max(esTasksUpdated, fileTasksUpdated);
            }
        }
        tasksUpdated += esTasksUpdated;
    } catch {}

    console.log(t('merge_start', { name: targetBranch }));

    try {
        execSync(`git merge ${targetBranch}`, { cwd: targetDir, stdio: 'inherit' });
    } catch (err) {
        console.error(`❌ Git merge failed: ${err.message}`);
        process.exit(1);
    }

    const statePath = path.join(targetDir, '.planning', '.branches', `branch-${targetBranch}.json.gz`);
    let sourceStateObj = null;
    if (fs.existsSync(statePath)) {
        try {
            const compressed = fs.readFileSync(statePath);
            const decompressed = zlib.gunzipSync(compressed).toString('utf8');
            sourceStateObj = JSON.parse(decompressed);
        } catch (err) {
            console.warn(`⚠️ Warning: Could not parse branch context file: ${err.message}`);
        }
    }

    harmonizeStateFile(targetDir, targetBranch, 'STATE.md');
    harmonizeStateFile(targetDir, targetBranch, 'STATE.es.md');

    if (tasksUpdated > 0) {
        console.log(t('merge_tasks_updated', { count: tasksUpdated }));
    }

    const learningsAdded = harvestLearnings(targetDir, targetBranch);
    if (learningsAdded) {
        console.log(t('merge_learnings_added'));
    }

    if (sourceStateObj && sourceStateObj.files) {
        const planningDir = path.join(targetDir, '.planning');
        for (const [relPath, content] of Object.entries(sourceStateObj.files)) {
            if (relPath.startsWith('.snapshots') || relPath.startsWith('.branches')) continue;
            if (relPath === 'config.json' || relPath === 'STATE.md' || relPath === 'ROADMAP.md' || relPath === 'STATE.es.md') continue;

            const targetFilePath = path.join(planningDir, relPath);
            if (!fs.existsSync(targetFilePath)) {
                const parentDir = path.dirname(targetFilePath);
                if (!fs.existsSync(parentDir)) {
                    fs.mkdirSync(parentDir, { recursive: true });
                }
                fs.writeFileSync(targetFilePath, content, 'utf8');
            }
        }
    }

    if (fs.existsSync(statePath)) {
        try {
            fs.unlinkSync(statePath);
        } catch {}
    }

    console.log(t('merge_success'));
} else {
    console.log(t('help_title'));
    console.log(t('help_usage'));
    console.log(t('help_init'));
    console.log(t('help_status'));
    console.log(t('help_dash'));
    console.log(t('help_gc'));
    console.log(t('help_rescue'));
    console.log(t('help_swarm'));
    console.log(t('help_snapshot'));
    console.log(t('help_rewind'));
    console.log(t('help_profile'));
    console.log(t('help_daemon'));
    console.log(t('help_branch'));
    console.log(t('help_merge'));
    console.log(t('help_health'));
    console.log(t('help_check'));
    console.log(t('help_archive'));
    console.log(t('help_install_hooks'));
    console.log(t('help_sync'));
    console.log(t('help_handoff'));
    console.log(t('help_brain'));
    console.log(t('help_board'));
}
