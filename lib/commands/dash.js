import { t } from '../i18n.js';
import { startDashboard } from '../dashboard.js';

export async function run({ targetDir, activeLang }) {
    console.log(t('dash_start'));
    try {
        await startDashboard(targetDir, activeLang);
    } catch (err) {
        console.error('Error loading dashboard:', err);
        process.exit(1);
    }
}
