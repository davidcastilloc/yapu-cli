import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir }) {
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
}
