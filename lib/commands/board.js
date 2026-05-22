import { t } from '../i18n.js';
import { startBoard } from '../board.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
    const portIdx = cleanArgs.indexOf('--port');
    const port = portIdx !== -1 ? parseInt(cleanArgs[portIdx + 1], 10) : 4040;
    console.log(t('board_start'));
    try {
        await startBoard(targetDir, activeLang, { port });
    } catch (err) {
        console.error('Error loading board:', err);
        process.exit(1);
    }
}
