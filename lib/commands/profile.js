import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, activeLang }) {
    try {
        const memoryFiles = [
            { name: 'PROJECT.md', path: path.join(targetDir, 'PROJECT.md') },
            { name: 'ROADMAP.md', path: path.join(targetDir, 'ROADMAP.md') },
            { name: 'STATE.md', path: path.join(targetDir, 'STATE.md') }
        ];

        const filesToScan = [];

        // Check root files
        for (const file of memoryFiles) {
            if (fs.existsSync(file.path) && fs.statSync(file.path).isFile()) {
                filesToScan.push(file);
            }
        }

        // Recursively scan .planning/ excluding .snapshots/
        const planningDir = path.join(targetDir, '.planning');
        if (fs.existsSync(planningDir)) {
            const scanDir = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name === '.snapshots') {
                            continue;
                        }
                        scanDir(fullPath);
                    } else if (entry.isFile()) {
                        const relPath = path.relative(targetDir, fullPath);
                        filesToScan.push({
                            name: relPath,
                            path: fullPath
                        });
                    }
                }
            };
            scanDir(planningDir);
        }

        console.log(t('profile_title'));

        const fileHeader = t('profile_header_file').padEnd(35);
        const sizeHeader = t('profile_header_size').padEnd(10);
        const tokensHeader = t('profile_header_tokens').padEnd(12);
        const statusHeader = t('profile_header_status').padEnd(12);

        const headerLine = `| ${fileHeader} | ${sizeHeader} | ${tokensHeader} | ${statusHeader} |`;
        const separator = '-'.repeat(headerLine.length);

        console.log(separator);
        console.log(headerLine);
        console.log(separator);

        let totalBytes = 0;
        let totalTokens = 0;
        let hasWarning = false;
        let hasCritical = false;

        const getFileStatus = (tokens) => {
            if (tokens < 5000) {
                return { label: 'OK', color: '\x1b[32m' };
            } else if (tokens <= 10000) {
                hasWarning = true;
                return { label: 'WARNING ⚠️', color: '\x1b[33m' };
            } else {
                hasCritical = true;
                return { label: 'CRITICAL 🚨', color: '\x1b[31m' };
            }
        };

        for (const file of filesToScan) {
            const content = fs.readFileSync(file.path, 'utf8');
            const bytes = content.length;
            const sizeKB = (bytes / 1024).toFixed(1);
            const tokens = Math.ceil(bytes / 4.0);

            totalBytes += bytes;
            totalTokens += tokens;

            const statusObj = getFileStatus(tokens);

            let nameCol = file.name;
            if (nameCol.length > 35) {
                nameCol = '...' + nameCol.slice(-32);
            }

            const nameStr = nameCol.padEnd(35);
            const sizeStr = `${sizeKB} KB`.padEnd(10);
            const tokensStr = String(tokens).padEnd(12);
            const statusStr = statusObj.label.padEnd(12);

            console.log(`| ${nameStr} | ${sizeStr} | ${tokensStr} | ${statusObj.color}${statusStr}\x1b[0m |`);
        }

        console.log(separator);

        const totalKBStr = (totalBytes / 1024).toFixed(1);
        const formattedTokens = totalTokens.toLocaleString(activeLang === 'es' ? 'es-ES' : 'en-US');

        console.log(t('profile_total_weight', { size: totalKBStr, tokens: formattedTokens }));

        // Recommendations based on cumulative context size and single files status
        let recText = t('profile_rec_ok');
        if (totalTokens > 30000 || hasCritical) {
            recText = t('profile_rec_critical');
        } else if (totalTokens > 15000 || hasWarning) {
            recText = t('profile_rec_warning');
        }

        console.log(`${t('profile_rec_title')}${recText}`);

    } catch (err) {
        console.error(`❌ Error scanning context: ${err.message}`);
        process.exit(1);
    }
}
