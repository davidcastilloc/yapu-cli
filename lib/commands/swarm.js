import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawn, execSync } from 'node:child_process';
import { t } from '../i18n.js';
import { createSnapshot } from '../helpers.js';
import { resolveProvider } from '../providers.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
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

        // Resolve the AI provider to use for spawning subagents
        let swarmProvider = null;
        try {
            // Check for --provider flag override
            const providerIdx = cleanArgs.indexOf('--provider');
            const providerOverride = providerIdx !== -1 ? cleanArgs[providerIdx + 1] : null;

            // Check config for provider setting
            let configProvider = null;
            if (fs.existsSync(configPath)) {
                try {
                    const configObj = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    configProvider = configObj.workflow?.provider || null;
                } catch { /* skip */ }
            }

            const resolved = resolveProvider(providerOverride || configProvider);
            swarmProvider = resolved.config;
        } catch {
            // Fallback to hardcoded antigravity if providers.js is unavailable
            swarmProvider = {
                executable: 'antigravity',
                buildSpawnArgs: (promptText, attachedFiles = []) => {
                    const a = ['chat', '-m', 'agent'];
                    for (const f of attachedFiles) a.push('-a', f);
                    a.push(promptText);
                    return a;
                }
            };
        }

        try {
            execSync(`command -v ${swarmProvider.executable}`, { stdio: 'ignore' });
        } catch {
            console.error(`❌ Error: the "${swarmProvider.executable}" executable was not found in the system PATH.`);
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

            const attachedFiles = [];
            task.files.forEach(f => {
                const fullPath = path.resolve(targetDir, f);
                if (fs.existsSync(fullPath)) {
                    attachedFiles.push(f);
                }
            });

            const workflowPath = path.join(targetDir, '.agents', 'skills', 'yapu-execute.md');
            if (fs.existsSync(workflowPath)) {
                attachedFiles.push('.agents/skills/yapu-execute.md');
            }

            const args = swarmProvider.buildSpawnArgs(promptText, attachedFiles);

            const child = spawn(swarmProvider.executable, args, {
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
}
