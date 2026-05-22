import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { t } from '../i18n.js';
import { restoreSnapshot } from '../helpers.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
    console.log(t('rewind_start'));
    const snapshotsDir = path.join(targetDir, '.planning', '.snapshots');
    if (!fs.existsSync(snapshotsDir)) {
        console.error(t('rewind_no_snapshots'));
        process.exit(1);
    }
    const snapshotFiles = fs.readdirSync(snapshotsDir)
        .filter(f => f.startsWith('snapshot-') && f.endsWith('.json.gz'));

    if (snapshotFiles.length === 0) {
        console.error(t('rewind_no_snapshots'));
        process.exit(1);
    }

    // Sort descending by timestamp
    snapshotFiles.sort((a, b) => {
        const timeA = parseInt(a.split('-')[1]) || 0;
        const timeB = parseInt(b.split('-')[1]) || 0;
        return timeB - timeA;
    });

    const listIdx = cleanArgs.indexOf('--list');
    const selectIdx = cleanArgs.indexOf('--select');

    if (listIdx !== -1) {
        console.log(activeLang === 'es' ? '=== Snapshots Disponibles ===' : '=== Available Snapshots ===');
        snapshotFiles.forEach((file, index) => {
            const parts = file.split('-');
            const timestamp = parseInt(parts[1]);
            const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
            const dateStr = new Date(timestamp).toLocaleString();
            console.log(`[${index}] ${file} (${dateStr}) - Git: ${commit}`);
        });
        process.exit(0);
    }

    let selectedFile = null;
    if (selectIdx !== -1 && cleanArgs[selectIdx + 1]) {
        const selection = cleanArgs[selectIdx + 1];
        const idx = parseInt(selection, 10);
        if (!isNaN(idx) && idx >= 0 && idx < snapshotFiles.length) {
            selectedFile = snapshotFiles[idx];
        } else if (snapshotFiles.includes(selection)) {
            selectedFile = selection;
        } else {
            console.error(activeLang === 'es' ? `❌ Error: Selección inválida: ${selection}` : `❌ Error: Invalid selection: ${selection}`);
            process.exit(1);
        }
    } else {
        selectedFile = snapshotFiles[0];
    }

    const proceedWithRewind = (selected) => {
        const parts = selected.split('-');
        const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
        console.log(t('rewind_selected', { name: selected }));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(t('rewind_confirm_prompt', { commit }), (answer) => {
            rl.close();
            const conf = answer.trim().toLowerCase();
            if (conf === 's' || conf === 'y' || conf === 'si' || conf === 'yes') {
                try {
                    restoreSnapshot(targetDir, path.join(snapshotsDir, selected));
                } catch (err) {
                    process.exit(1);
                }
            } else {
                console.log(t('rewind_cancelled'));
                process.exit(0);
            }
        });
    };

    if (selectIdx !== -1 && !cleanArgs[selectIdx + 1]) {
        console.log(activeLang === 'es' ? '=== Selecciona un Snapshot ===' : '=== Select a Snapshot ===');
        snapshotFiles.forEach((file, index) => {
            const parts = file.split('-');
            const timestamp = parseInt(parts[1]);
            const commit = parts[2] ? parts[2].replace('.json.gz', '') : 'no-commit';
            const dateStr = new Date(timestamp).toLocaleString();
            console.log(`[${index}] ${file} (${dateStr}) - Git: ${commit}`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const selectionPrompt = activeLang === 'es' ? 'Ingresa el número o nombre del snapshot: ' : 'Enter snapshot number or filename: ';
        rl.question(selectionPrompt, (answer) => {
            rl.close();
            const selection = answer.trim();
            const idx = parseInt(selection, 10);
            let interactiveSelected = null;
            if (!isNaN(idx) && idx >= 0 && idx < snapshotFiles.length) {
                interactiveSelected = snapshotFiles[idx];
            } else if (snapshotFiles.includes(selection)) {
                interactiveSelected = selection;
            } else {
                console.error(activeLang === 'es' ? `❌ Error: Selección inválida: ${selection}` : `❌ Error: Invalid selection: ${selection}`);
                process.exit(1);
            }
            proceedWithRewind(interactiveSelected);
        });
    } else {
        proceedWithRewind(selectedFile);
    }
}
