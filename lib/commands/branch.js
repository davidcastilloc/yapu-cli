import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { t } from '../i18n.js';
import { saveBranchContext, restoreBranchContext, runGit } from '../helpers.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
    const targetBranch = cleanArgs[1];
    
    let currentBranch = '';
    try {
        currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: targetDir }).trim();
    } catch (err) {
        console.error(t('hooks_no_git'));
        process.exit(1);
    }

    if (!targetBranch) {
        const branchesDir = path.join(targetDir, '.planning', '.branches');
        const contextBranches = [];
        if (fs.existsSync(branchesDir)) {
            const files = fs.readdirSync(branchesDir);
            for (const file of files) {
                if (file.startsWith('branch-') && file.endsWith('.json.gz')) {
                    const name = file.slice(7, -8);
                    const fullPath = path.join(branchesDir, file);
                    try {
                        const stat = fs.statSync(fullPath);
                        const compressed = fs.readFileSync(fullPath);
                        const decompressed = zlib.gunzipSync(compressed).toString('utf8');
                        const stateObj = JSON.parse(decompressed);
                        contextBranches.push({
                            name,
                            timestamp: stateObj.timestamp || stat.mtimeMs
                        });
                    } catch {
                        contextBranches.push({ name, timestamp: 0 });
                    }
                }
            }
        }

        console.log(t('branch_list_title'));
        if (contextBranches.length === 0) {
            console.log(activeLang === 'es' ? '  (No hay ramas de contexto guardadas aún)' : '  (No context branches saved yet)');
        } else {
            contextBranches.forEach(b => {
                const isCurrent = b.name === currentBranch ? '* ' : '  ';
                const dateStr = b.timestamp ? new Date(b.timestamp).toISOString() : 'unknown';
                console.log(`${isCurrent}${b.name} (${dateStr})`);
            });
        }
        process.exit(0);
    }
    let isDirty = false;
    try {
        const status = runGit(['status', '--porcelain', '-uno'], { cwd: targetDir }).trim();
        if (status) {
            isDirty = true;
        }
    } catch {
        // Assume clean if command fails
    }

    if (isDirty) {
        console.error(t('branch_err_dirty'));
        process.exit(1);
    }

    console.log(t('branch_start'));

    saveBranchContext(targetDir, currentBranch);
    console.log(t('branch_current_saved', { name: currentBranch }));

    let branchExists = false;
    try {
        runGit(['show-ref', '--verify', '--quiet', `refs/heads/${targetBranch}`], { cwd: targetDir });
        branchExists = true;
    } catch {
        try {
            runGit(['show-ref', '--verify', '--quiet', `refs/remotes/origin/${targetBranch}`], { cwd: targetDir });
            branchExists = true;
        } catch {}
    }

    try {
        if (branchExists) {
            runGit(['checkout', targetBranch], { cwd: targetDir, stdio: 'inherit' });
        } else {
            runGit(['checkout', '-b', targetBranch], { cwd: targetDir, stdio: 'inherit' });
        }
        console.log(t('branch_created', { name: targetBranch }));
    } catch (err) {
        console.error(`❌ Error switching Git branch: ${err.message}`);
        process.exit(1);
    }

    const restored = restoreBranchContext(targetDir, targetBranch);
    if (restored) {
        console.log(t('branch_restored', { name: targetBranch }));
    }
}
