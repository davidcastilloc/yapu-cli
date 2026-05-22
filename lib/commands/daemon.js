import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { t } from '../i18n.js';
import { resolveProvider } from '../providers.js';
import { detectBrainPath, syncBrainToPlanning } from '../artifacts.js';

export async function run({ targetDir, cleanArgs }) {
    const brainIdx = cleanArgs.indexOf('--brain-path');
    let brainPath = brainIdx !== -1 ? cleanArgs[brainIdx + 1] : null;

    const homeDir = os.homedir();
    let brainBaseDir;
    if (!brainPath) {
        try {
            let configProvider = null;
            const cfgPath = path.join(targetDir, '.planning', 'config.json');
            if (fs.existsSync(cfgPath)) {
                try {
                    const cfgObj = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
                    configProvider = cfgObj.workflow?.provider || null;
                } catch { /* skip */ }
            }
            const resolved = resolveProvider(configProvider);
            brainBaseDir = resolved.config.brainPath(homeDir);
        } catch {
            brainBaseDir = path.join(homeDir, '.gemini', 'antigravity-cli', 'brain');
        }
    } else {
        brainBaseDir = path.join(homeDir, '.gemini', 'antigravity-cli', 'brain');
    }
    const watchDir = brainPath || brainBaseDir;

    if (!fs.existsSync(watchDir)) {
        fs.mkdirSync(watchDir, { recursive: true });
    }

    const planningPath = path.join(targetDir, '.planning');
    if (!fs.existsSync(planningPath)) {
        console.error(t('sync_no_planning'));
        process.exit(1);
    }

    console.log(t('daemon_start'));
    console.log(t('daemon_watching_path', { path: watchDir }));

    const doSync = async () => {
        try {
            const targetBrainPath = brainPath || detectBrainPath();
            if (!targetBrainPath || !fs.existsSync(targetBrainPath)) {
                return;
            }

            const result = syncBrainToPlanning(targetBrainPath, planningPath);
            if (result.synced && result.synced.length > 0) {
                result.synced.forEach(name => {
                    console.log(t('daemon_synced_file', { name }));
                });
            }
        } catch (err) {
            console.error(t('daemon_error', { error: err.message }));
        }
    };

    // Run initial sync
    await doSync();

    let debounceTimeout = null;
    const watcher = fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.includes('.system_generated') && !filename.endsWith('transcript.jsonl')) {
            return;
        }

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
            doSync();
        }, 300);
    });

    process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        watcher.close();
        process.exit(0);
    });
}
