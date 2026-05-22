import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';
import { syncBrainToPlanning, detectBrainPath } from '../artifacts.js';

export async function run({ targetDir, cleanArgs }) {
    // ── yapu sync --brain-path {path} ──────────────────────────────────
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
}
