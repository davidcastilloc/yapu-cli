import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, templatesDir }) {
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
}
