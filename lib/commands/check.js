import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir }) {
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
    const placeholderRegex = /\[Insert[^\]]*\]|TBD|TODO(?!\s*\()/i;
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
    if (statePhase && (statePhase.includes('unknown') || statePhase.includes('desconocida'))) {
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
}
