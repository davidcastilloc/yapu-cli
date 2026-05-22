import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';
import { listArtifacts, readConversationLog, detectBrainPath } from '../artifacts.js';

export async function run({ targetDir, cleanArgs }) {
    // ── yapu brain list|log --path {path} ──────────────────────────────
    const subCommand = cleanArgs[1];
    const pathIdx = cleanArgs.indexOf('--path');
    let brainPath = pathIdx !== -1 ? cleanArgs[pathIdx + 1] : null;

    if (!brainPath) {
        try {
            brainPath = detectBrainPath();
            if (brainPath) {
                console.log(t('sync_brain_detected', { path: brainPath }));
            }
        } catch { /* ignore */ }
    }

    if (!brainPath) {
        console.error(t('brain_usage'));
        process.exit(1);
    }

    if (!fs.existsSync(brainPath)) {
        console.error(t('sync_brain_not_found', { path: brainPath }));
        process.exit(1);
    }

    if (subCommand === 'list') {
        console.log(t('brain_list_title'));
        try {
            const artifacts = listArtifacts(brainPath);

            if (artifacts.length === 0) {
                console.log(t('brain_no_artifacts'));
            } else {
                console.log(t('brain_artifacts_found', { count: artifacts.length }));
                artifacts.forEach(art => {
                    const typeShort = art.type.replace('ARTIFACT_TYPE_', '');
                    console.log(t('brain_art_name', { name: art.name }));
                    console.log(t('brain_art_type', { type: typeShort }));
                    console.log(t('brain_art_summary', { summary: art.summary || t('brain_art_no_summary') }));
                    console.log(t('brain_art_updated', { updated: art.updatedAt || t('brain_art_unknown_updated') }));
                    console.log('');
                });
            }
            console.log('=================================');
        } catch (err) {
            console.error(t('brain_read_error', { message: err.message }));
            process.exit(1);
        }
    } else if (subCommand === 'log') {
        const nIdx = cleanArgs.indexOf('-n');
        const limit = nIdx !== -1 ? parseInt(cleanArgs[nIdx + 1], 10) || 20 : 20;

        console.log(t('brain_log_title', { limit }));
        try {
            const entries = readConversationLog(brainPath, limit);

            if (entries.length === 0) {
                console.log(t('brain_log_empty'));
            } else {
                entries.forEach(entry => {
                    const icon = entry.source === 'USER_EXPLICIT' ? '👤' : '🤖';
                    const content = (entry.content || '').substring(0, 120);
                    console.log(`  ${icon} [${entry.step_index}] ${entry.type}: ${content}${content.length >= 120 ? '...' : ''}`);
                });
            }
            console.log('\n=================================');
        } catch (err) {
            console.error(t('brain_log_error', { message: err.message }));
            process.exit(1);
        }
    } else {
        console.error(t('brain_unrecognized'));
        process.exit(1);
    }
}
