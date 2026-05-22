import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { t } from '../i18n.js';
import { 
    normalizeTaskText, 
    getBranchFileContent, 
    harmonizeStateFile, 
    harvestLearnings 
} from '../helpers.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
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

    const learningsAdded = harvestLearnings(targetDir, targetBranch, activeLang);
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
}
