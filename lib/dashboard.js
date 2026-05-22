import fs from 'node:fs';
import path from 'node:path';
import { detectBrainPath, readConversationLog } from './artifacts.js';
import { t } from './i18n.js';

/**
 * Starts the zero-dependency TUI dashboard.
 * @param {string} targetDir - The root project directory.
 * @param {string} activeLang - The active language code.
 */
export function startDashboard(targetDir, _activeLang) {
    const statePath = path.join(targetDir, 'STATE.md');
    const roadmapPath = path.join(targetDir, 'ROADMAP.md');
    
    if (!fs.existsSync(statePath)) {
        console.error(t('dash_no_planning'));
        process.exit(1);
    }

    let isRunning = true;
    let brainPathCache = null;

    process.on('SIGINT', () => {
        isRunning = false;
        process.stdout.write('\x1b[?25h'); // Show cursor
        console.log('\nSaliendo del Dashboard / Exiting Dashboard...');
        process.exit(0);
    });

    process.stdout.write('\x1b[?25l'); // Hide cursor

    function render() {
        if (!isRunning) return;

        // Limpiar pantalla y mover cursor a (0,0)
        process.stdout.write('\x1b[2J\x1b[0;0H');

        // Leer datos
        let stateContent = '';
        try {
            stateContent = fs.readFileSync(statePath, 'utf8');
        } catch { }

        let roadmapContent = '';
        if (fs.existsSync(roadmapPath)) {
            try {
                roadmapContent = fs.readFileSync(roadmapPath, 'utf8');
            } catch { }
        }

        // --- Extracción de Datos ---
        const phaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i) || stateContent.match(/\*\*ACTIVE PHASE:\*\*\s*(.*)/i);
        const activePhase = phaseMatch ? phaseMatch[1].trim() : 'N/A';

        const modeMatch = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i) || stateContent.match(/\[\s*CURRENT OPERATIONAL MODE:\s*(.*?)\s*\]/i);
        const currentMode = modeMatch ? modeMatch[1].trim() : 'N/A';

        // Tareas
        const lines = stateContent.split('\n');
        const tasks = [];
        let inTasksSection = false;
        for (const line of lines) {
            if (line.includes('## Tareas') || line.includes('## Tasks')) {
                inTasksSection = true;
                continue;
            }
            if (inTasksSection && line.startsWith('##')) break;
            if (inTasksSection && line.trim().startsWith('- [')) {
                tasks.push(line.trim());
            }
        }

        // Fases Roadmap
        const rLines = roadmapContent.split('\n');
        let totalPhases = 0;
        let completedPhases = 0;
        for (const line of rLines) {
            if (line.match(/- \[[x ]\] \*\*Phase/i) || line.match(/- \[[x ]\] \*\*Fase/i)) {
                totalPhases++;
                if (line.includes('[x]')) completedPhases++;
            }
        }

        // Brain logs
        if (!brainPathCache) {
            brainPathCache = detectBrainPath();
        }
        let logs = [];
        if (brainPathCache) {
            logs = readConversationLog(brainPathCache, 10);
        }

        // --- Renderizado ---
        const cols = process.stdout.columns || 80;
        const rows = process.stdout.rows || 24;

        // Colores ANSI
        const RESET = '\x1b[0m';
        const BOLD = '\x1b[1m';
        const YELLOW = '\x1b[33m';
        const CYAN = '\x1b[36m';
        const BG_BLUE = '\x1b[44m';
        const WHITE = '\x1b[37m';

        let output = '';

        // HEADER
        const headerText = ` 🪺  YAPU TUI DASHBOARD - MODE: ${currentMode} `;
        const headerPadding = Math.max(0, cols - headerText.length);
        output += `${BG_BLUE}${WHITE}${BOLD}${headerText}${' '.repeat(headerPadding)}${RESET}\n`;
        
        // PROGRESS BAR
        let pct = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
        const barWidth = cols - 20;
        const filled = Math.round((pct / 100) * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, barWidth - filled));
        output += `${CYAN}Phase Progress: [${bar}] ${pct}%${RESET}\n`;
        output += `${BOLD}Active Phase:${RESET} ${activePhase}\n`;
        output += '─'.repeat(cols) + '\n';

        // MAIN CONTENT: Split into Left (Tasks) and Right (Logs)
        const leftWidth = Math.floor(cols / 2) - 1;
        const rightWidth = cols - leftWidth - 1;
        
        const contentRows = rows - 8; // Header(3) + Footer(2) + buffer(3)
        
        output += `${BOLD}📌 TASKS (STATE.md)${' '.repeat(leftWidth - 18)}| 🧠 BRAIN LOGS (Antigravity)${RESET}\n`;
        output += '─'.repeat(cols) + '\n';

        for (let i = 0; i < contentRows; i++) {
            let leftLine = '';
            if (i < tasks.length) {
                leftLine = tasks[i];
                if (leftLine.length > leftWidth) leftLine = leftLine.substring(0, leftWidth - 3) + '...';
            }
            // Pad left
            leftLine += ' '.repeat(Math.max(0, leftWidth - leftLine.length));

            let rightLine = '';
            if (i < logs.length) {
                const log = logs[logs.length - 1 - i]; // Reverse to show latest at top
                const icon = log.source === 'USER_EXPLICIT' ? '👤' : '🤖';
                rightLine = `${icon} [${log.step_index}] ${log.type}: ${log.content ? log.content.substring(0, rightWidth - 15).replace(/\n/g, ' ') : ''}`;
                if (rightLine.length > rightWidth) rightLine = rightLine.substring(0, rightWidth - 3) + '...';
            }
            
            output += `${leftLine}| ${rightLine}\n`;
        }

        // FOOTER
        output += '─'.repeat(cols) + '\n';
        output += `${YELLOW}Brain Path: ${brainPathCache || 'Not Detected'} | Refresh: 1s | Press Ctrl+C to exit${RESET}\n`;

        process.stdout.write(output);
    }

    render();
    setInterval(render, 1000);
}
