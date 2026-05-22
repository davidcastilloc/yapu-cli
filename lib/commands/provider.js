import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';
import { detectProviders, resolveProvider } from '../providers.js';

export async function run({ targetDir }) {
    console.log(t('provider_title'));
    try {
        const providers = detectProviders();

        // Read config for provider override
        let configProvider = null;
        const cfgPath = path.join(targetDir, '.planning', 'config.json');
        if (fs.existsSync(cfgPath)) {
            try {
                const cfgObj = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
                configProvider = cfgObj.workflow?.provider || null;
            } catch { /* skip */ }
        }

        const active = resolveProvider(configProvider);

        console.log(t('provider_detected'));
        for (const p of providers) {
            if (p.installed || p.hasData) {
                let sessionCount = 0;
                if (p.hasData) {
                    try {
                        const entries = fs.readdirSync(p.dataPath);
                        sessionCount = entries.filter(e => {
                            try { return fs.statSync(path.join(p.dataPath, e)).isDirectory(); } catch { return false; }
                        }).length;
                    } catch { /* skip */ }
                }
                const dataInfo = p.hasData ? t('provider_has_data', { sessions: sessionCount }) : t('provider_no_data');
                console.log(t('provider_installed', { name: p.name, path: p.dataPath }) + dataInfo);
            } else {
                console.log(t('provider_not_installed', { name: p.name }));
            }
        }

        const mode = configProvider && configProvider !== 'auto' ? configProvider : 'auto-detected';
        console.log(t('provider_active', { name: active.config.name, mode }));
    } catch (err) {
        console.error(`❌ Error loading providers: ${err.message}`);
        process.exit(1);
    }
}
