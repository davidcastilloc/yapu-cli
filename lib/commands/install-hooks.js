import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, templatesDir }) {
    console.log(t('hooks_start'));
    
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
        console.error(t('hooks_no_git'));
        process.exit(1);
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    const src = path.join(templatesDir, 'pre-commit');
    const dest = path.join(hooksDir, 'pre-commit');

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        try {
            fs.chmodSync(dest, 0o755); // Dar permisos ejecutables
            console.log(t('hooks_success'));
        } catch (err) {
            console.warn(t('hooks_chmod_warn', { message: err.message }));
        }
    } else {
        console.error(t('hooks_no_template'));
        process.exit(1);
    }
}
