import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';
import { generateHandoff, detectBrainPath } from '../artifacts.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
    // ── yapu handoff [--brain-path {path}] ─────────────────────────────
    const brainIdx = cleanArgs.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? cleanArgs[brainIdx + 1] : null;

    if (!brainPath) {
        try {
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
        const result = generateHandoff(planningPath, brainPath, activeLang);

        console.log(t('handoff_success_json', { path: result.handoffPath }));
        console.log(t('handoff_success_md', { path: result.continueHerePath }));
        console.log(t('handoff_done'));
    } catch (err) {
        console.error(t('handoff_error', { message: err.message }));
        process.exit(1);
    }
}
