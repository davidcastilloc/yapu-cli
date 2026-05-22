import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, _activeLang }) {
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
}
