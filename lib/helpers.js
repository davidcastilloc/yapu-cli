// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import zlib from 'node:zlib';
import { t } from './i18n.js';

/**
 * Ejecuta un comando Git de forma segura evitando la shell y previniendo la inyección.
 * @param {string[]} args - Argumentos del comando
 * @param {import('node:child_process').SpawnSyncOptionsWithStringEncoding} [options] - Opciones de spawnSync
 * @returns {string} Salida estándar en formato texto
 */
export function runGit(args, options = {}) {
    const result = spawnSync('git', args, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
    });
    
    if (result.error) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(result.stderr || `Git command failed with exit code ${result.status}`);
    }
    
    return result.stdout;
}

/**
 * Crea un snapshot comprimido de los archivos de planificación y estado actual.
 * @param {string} targetDir - Directorio del proyecto.
 * @returns {string} El nombre de archivo del snapshot creado.
 */
export function createSnapshot(targetDir) {
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
            gitCommitHash = runGit(['rev-parse', 'HEAD'], { cwd: targetDir }).trim();
        } catch {
            // Not a git repository or no commit yet
        }

        /** @type {Record<string, string>} */
        const filesObj = {};
        /**
         * @param {string} dir
         */
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
        // @ts-ignore
        console.error(t('snapshot_error', { error: err.message }));
        throw err;
    }
}

/**
 * Restaura un snapshot de archivos y revierte el estado Git correspondiente.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} snapshotPath - Ruta absoluta al archivo del snapshot (.gz).
 * @returns {void}
 */
export function restoreSnapshot(targetDir, snapshotPath) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            throw new Error('.planning directory not found');
        }

        const compressed = fs.readFileSync(snapshotPath);
        const decompressed = zlib.gunzipSync(compressed).toString('utf8');
        const snapshotObj = JSON.parse(decompressed);

        console.log(t('rewind_restoring_files'));

        /**
         * @param {string} dir
         */
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
            // @ts-ignore
            fs.writeFileSync(fullPath, content, 'utf8');
        }

        const gitCommit = snapshotObj.gitCommit;
        if (gitCommit && gitCommit !== 'no-git-commit') {
            console.log(t('rewind_restoring_git', { commit: gitCommit.substring(0, 7) }));
            runGit(['reset', '--hard', gitCommit], { cwd: targetDir });
        }

        console.log(t('rewind_success', { commit: (gitCommit || 'unknown').substring(0, 7) }));
    } catch (err) {
        // @ts-ignore
        console.error(t('rewind_error', { error: err.message }));
        throw err;
    }
}

/**
 * Guarda el contexto de planificación de la rama actual de forma comprimida.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} branchName - Nombre de la rama Git.
 * @returns {void}
 */
export function saveBranchContext(targetDir, branchName) {
    try {
        const planningDir = path.join(targetDir, '.planning');
        if (!fs.existsSync(planningDir)) {
            return;
        }

        const branchesDir = path.join(planningDir, '.branches');
        if (!fs.existsSync(branchesDir)) {
            fs.mkdirSync(branchesDir, { recursive: true });
        }

        /** @type {Record<string, string>} */
        const filesObj = {};
        /**
         * @param {string} dir
         */
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
        // @ts-ignore
        console.error(`Error saving branch context: ${err.message}`);
    }
}

/**
 * Restaura el contexto de planificación guardado para una rama específica.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} branchName - Nombre de la rama Git.
 * @returns {boolean} True si se restauró con éxito, false en caso contrario.
 */
export function restoreBranchContext(targetDir, branchName) {
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

        /**
         * @param {string} dir
         */
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
            // @ts-ignore
            fs.writeFileSync(fullPath, content, 'utf8');
        }

        return true;
    } catch (err) {
        // @ts-ignore
        console.error(`Error restoring branch context: ${err.message}`);
        return false;
    }
}

/**
 * Normaliza el texto de una tarea para su comparación insensible a mayúsculas y formato.
 * @param {string} text - Texto original de la tarea.
 * @returns {string} Texto normalizado.
 */
export function normalizeTaskText(text) {
    return text
        .replace(/^\s*(Task\s*\d+|T\d+|Task\s+[A-Za-z0-9_]+|T\s+[A-Za-z0-9_]+)[:\s\*-]*/i, '')
        .replace(/[\*\s`'"]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Obtiene el contenido de un archivo desde una rama Git o su contexto de respaldo comprimido.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} branchName - Nombre de la rama Git.
 * @param {string} relPath - Ruta relativa del archivo.
 * @returns {string|null} Contenido del archivo o null si no se encuentra.
 */
export function getBranchFileContent(targetDir, branchName, relPath) {
    try {
        const content = runGit(['show', `${branchName}:${relPath}`], { cwd: targetDir });
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

/**
 * Armoniza el archivo de estado local marcando como completadas las tareas que ya lo están en la rama de destino.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} targetBranch - Rama Git de destino.
 * @param {string} activeFileName - Nombre del archivo de estado (ej: STATE.md).
 * @returns {number} Número de tareas que fueron actualizadas a completadas.
 */
export function harmonizeStateFile(targetDir, targetBranch, activeFileName) {
    let updatedTasksCount = 0;
    const sourceStateContent = getBranchFileContent(targetDir, targetBranch, activeFileName) || getBranchFileContent(targetDir, targetBranch, `.planning/${activeFileName}`);
    if (!sourceStateContent) return 0;

    /** @type {string[]} */
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

/**
 * Recolecta aprendizajes acumulados en la rama de experimento y los concatena en el archivo de aprendizajes principal.
 * @param {string} targetDir - Directorio del proyecto.
 * @param {string} targetBranch - Rama Git de origen de los aprendizajes.
 * @param {string} activeLang - Idioma activo.
 * @returns {boolean} True si se recolectaron aprendizajes con éxito, false en caso contrario.
 */
export function harvestLearnings(targetDir, targetBranch, activeLang) {
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
