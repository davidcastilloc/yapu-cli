// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { detectBrainPath, readConversationLog } from './artifacts.js';
import { t } from './i18n.js';

/**
 * Starts the zero-dependency TUI dashboard.
 * @param {string} targetDir - The root project directory.
 * @param {string} [activeLang] - The active language code.
 */
export function startDashboard(targetDir, _activeLang) {
    const statePath = path.join(targetDir, 'STATE.md');
    const roadmapPath = path.join(targetDir, 'ROADMAP.md');
    
    if (!fs.existsSync(statePath)) {
        console.error(t('dash_no_planning'));
        process.exit(1);
    }

    let isRunning = true;
    /** @type {string|null} */
    let brainPathCache = null;

    const handleResize = () => {
        if (!isRunning) return;
        // Limpieza completa en cambio de tamaño para evitar caracteres huérfanos
        process.stdout.write('\x1b[2J\x1b[H');
        render();
    };

    process.on('SIGINT', () => {
        isRunning = false;
        process.stdout.off('resize', handleResize);
        process.stdout.write('\x1b[?25h'); // Show cursor
        console.log('\nSaliendo del Dashboard / Exiting Dashboard...');
        process.exit(0);
    });

    process.stdout.write('\x1b[?25l'); // Hide cursor
    process.stdout.write('\x1b[2J\x1b[H'); // Initial clear screen

    function render() {
        if (!isRunning) return;

        // Reposicionar cursor en la esquina superior izquierda (0,0 / 1,1) sin limpiar
        process.stdout.write('\x1b[H');

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
        /** @type {string[]} */
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
        /** @type {Array<{ step_index: number, source: string, type: string, content: string }>} */
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
        output += `${BG_BLUE}${WHITE}${BOLD}${headerText}${' '.repeat(headerPadding)}${RESET}\x1b[K\n`;
        
        // PROGRESS BAR
        let pct = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
        const barWidth = Math.max(10, cols - 20);
        const filled = Math.min(barWidth, Math.round((pct / 100) * barWidth));
        const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, barWidth - filled));
        output += `${CYAN}Phase Progress: [${bar}] ${pct}%${RESET}\x1b[K\n`;
        output += `${BOLD}Active Phase:${RESET} ${activePhase}\x1b[K\n`;
        output += '─'.repeat(cols) + '\x1b[K\n';

        // MAIN CONTENT: Split into Left (Tasks) and Right (Logs)
        const leftWidth = Math.floor(cols / 2) - 1;
        const rightWidth = cols - leftWidth - 1;
        
        const contentRows = Math.max(1, rows - 8); // Header(3) + Footer(2) + buffer(3)
        
        output += `${BOLD}📌 TASKS (STATE.md)${' '.repeat(Math.max(0, leftWidth - 18))}| 🧠 BRAIN LOGS (Antigravity)${RESET}\x1b[K\n`;
        output += '─'.repeat(cols) + '\x1b[K\n';

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
                rightLine = `${icon} [${log.step_index}] ${log.type}: ${log.content ? log.content.substring(0, Math.max(0, rightWidth - 15)).replace(/\n/g, ' ') : ''}`;
                if (rightLine.length > rightWidth) rightLine = rightLine.substring(0, rightWidth - 3) + '...';
            }
            
            output += `${leftLine}| ${rightLine}\x1b[K\n`;
        }

        // FOOTER
        output += '─'.repeat(cols) + '\x1b[K\n';
        output += `${YELLOW}Brain Path: ${brainPathCache || 'Not Detected'} | Refresh: 1s | Press Ctrl+C to exit${RESET}\x1b[K\n`;

        process.stdout.write(output);
    }

    process.stdout.on('resize', handleResize);

    render();
    const intervalId = setInterval(render, 1000);

    // Guardar para poder detener si se requiere externalmente
    return () => {
        clearInterval(intervalId);
        process.stdout.off('resize', handleResize);
    };
}
