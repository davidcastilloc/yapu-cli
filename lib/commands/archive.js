import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, activeLang }) {
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
}
