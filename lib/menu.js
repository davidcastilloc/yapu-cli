import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.resolve(__dirname, '..', 'bin', 'cli.js');

const COLORS = {
  reset: '\x1B[0m',
  bold: '\x1B[1m',
  dim: '\x1B[2m',
  italic: '\x1B[3m',
  underline: '\x1B[4m',
  invert: '\x1B[7m',
  
  // Foreground Colors
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',
  red: '\x1B[31m',
  
  // High Intensity
  brightGreen: '\x1B[92m',
  brightYellow: '\x1B[93m',
  brightCyan: '\x1B[96m'
};

const MENU_ITEMS = [
  { label: 'Sincronizar Colonia (yapu sync)', cmd: 'sync' },
  { label: 'Diagnóstico de Salud (yapu health)', cmd: 'health' },
  { label: 'Archivar Tareas Completadas (yapu archive)', cmd: 'archive' },
  { label: 'Preparar Handoff de Sesión (yapu handoff)', cmd: 'handoff' },
  { label: 'Ver Estado Detallado (yapu status)', cmd: 'status' },
  { label: 'Inspeccionar Brain (yapu brain list)', cmd: 'brain-list' },
  { label: 'Instalar Yapu Guard Hooks (yapu install-hooks)', cmd: 'install-hooks' },
  { label: 'Salir del Avispero', cmd: 'exit' }
];

let selectedIndex = 0;
let inExecutionMode = false;

/**
 * Extracts and returns project metadata from STATE.md and other workspace files.
 */
function getDashboardStats() {
  const targetDir = process.cwd();
  const files = {
    state: path.join(targetDir, 'STATE.md'),
    project: path.join(targetDir, 'PROJECT.md'),
    roadmap: path.join(targetDir, 'ROADMAP.md'),
    git: path.join(targetDir, '.git')
  };

  let mode = 'NO DETECTADO';
  let phase = 'NO DETECTADA';
  let totalTasks = 0;
  let completedTasks = 0;
  let hasProject = false;
  let hasRoadmap = false;
  let hooksStatus = 'NO INSTALADO';

  if (fs.existsSync(files.state)) {
    try {
      const stateContent = fs.readFileSync(files.state, 'utf-8');
      const modeMatch = stateContent.match(/\[\s*MODO DE OPERACIÓN ACTUAL:\s*(.*?)\s*\]/i);
      if (modeMatch) mode = modeMatch[1].trim();

      const phaseMatch = stateContent.match(/\*\*FASE ACTIVA:\*\*\s*(.*)/i);
      if (phaseMatch) phase = phaseMatch[1].trim();

      const tasks = stateContent.split('\n').filter(line => line.trim().startsWith('- ['));
      totalTasks = tasks.length;
      completedTasks = tasks.filter(t => t.includes('[x]')).length;
    } catch { /* ignore */ }
  }

  hasProject = fs.existsSync(files.project);
  hasRoadmap = fs.existsSync(files.roadmap);

  if (fs.existsSync(path.join(files.git, 'hooks', 'pre-commit'))) {
    hooksStatus = 'ACTIVO';
  }

  return { mode, phase, totalTasks, completedTasks, hasProject, hasRoadmap, hooksStatus, targetDir };
}

/**
 * Restores terminal settings and exits.
 */
function cleanupAndExit() {
  process.stdout.write('\x1B[?25h'); // Show cursor
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  console.log(`\n🪺 ${COLORS.brightGreen}¡Hasta pronto en la colonia, Conoto! Que la gravedad te acompañe.${COLORS.reset}\n`);
  process.exit(0);
}

/**
 * Renders the full interactive dashboard TUI.
 */
function renderDashboard() {
  if (inExecutionMode) return;

  const stats = getDashboardStats();
  
  // Clear screen and home cursor
  process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  process.stdout.write('\x1B[?25l'); // Hide cursor

  // Banner Header
  console.log(`${COLORS.brightGreen}┌──────────────────────────────────────────────────────────────┐`);
  console.log(`│  🪺  ${COLORS.bold}C O N O T O   -   Y A P U C L I   D A S H B O A R D${COLORS.reset}${COLORS.brightGreen}   │`);
  console.log(`└──────────────────────────────────────────────────────────────┘${COLORS.reset}`);
  
  // Workspace Info
  console.log(`${COLORS.gray}📂 Nido Activo:${COLORS.reset} ${COLORS.bold}${stats.targetDir}${COLORS.reset}`);
  console.log(`${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  
  // Status Cards Grid
  console.log(`${COLORS.bold}📋 ESTADO DEL PROYECTO${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}├ Modo Operativo :${COLORS.reset} ${COLORS.bold}${stats.mode}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}├ Fase Activa    :${COLORS.reset} ${stats.phase}`);
  
  const pct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const progressColor = pct === 100 ? COLORS.brightGreen : (pct > 50 ? COLORS.brightYellow : COLORS.cyan);
  console.log(`  ${COLORS.cyan}├ Tareas Activas :${COLORS.reset} ${progressColor}${stats.completedTasks}/${stats.totalTasks} completadas (${pct}%)${COLORS.reset}`);
  
  const hooksColor = stats.hooksStatus === 'ACTIVO' ? COLORS.brightGreen : COLORS.red;
  console.log(`  ${COLORS.cyan}├ Yapu Guard Hook:${COLORS.reset} ${hooksColor}${stats.hooksStatus}${COLORS.reset}`);
  
  const projStatus = stats.hasProject ? `${COLORS.brightGreen}OK${COLORS.reset}` : `${COLORS.red}MISSING${COLORS.reset}`;
  const roadStatus = stats.hasRoadmap ? `${COLORS.brightGreen}OK${COLORS.reset}` : `${COLORS.red}MISSING${COLORS.reset}`;
  console.log(`  ${COLORS.cyan}└ Especificaciones:${COLORS.reset} PROJECT.md (${projStatus}) | ROADMAP.md (${roadStatus})`);
  
  console.log(`${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.bold}🛠️  ACCIONES DISPONIBLES (Navega con ↑/↓ y presiona Enter)${COLORS.reset}\n`);

  // Render Menu Items
  MENU_ITEMS.forEach((item, index) => {
    if (index === selectedIndex) {
      console.log(`  ${COLORS.brightGreen}👉 ${COLORS.invert} ${item.label} ${COLORS.reset}`);
    } else {
      console.log(`     ${COLORS.gray}${item.label}${COLORS.reset}`);
    }
  });

  console.log(`\n${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.gray}Instrucciones: ↑/↓ Navegar | Enter Seleccionar | Esc/q Salir${COLORS.reset}`);
}

/**
 * Handles action execution.
 */
function executeAction(index) {
  const item = MENU_ITEMS[index];
  
  if (item.cmd === 'exit') {
    cleanupAndExit();
    return;
  }

  inExecutionMode = true;
  
  // Clear screen and show cursor
  process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  process.stdout.write('\x1B[?25h'); // Show cursor
  
  console.log(`${COLORS.brightGreen}🪺 Ejecutando: ${COLORS.bold}${item.label}${COLORS.reset}\n`);
  
  let args = [];
  if (item.cmd === 'sync') {
    args = ['sync'];
  } else if (item.cmd === 'health') {
    args = ['health'];
  } else if (item.cmd === 'archive') {
    args = ['archive'];
  } else if (item.cmd === 'handoff') {
    args = ['handoff'];
  } else if (item.cmd === 'status') {
    args = ['status'];
  } else if (item.cmd === 'brain-list') {
    args = ['brain', 'list'];
  } else if (item.cmd === 'install-hooks') {
    args = ['install-hooks'];
  }

  // Restore raw mode of stdin temporarily during process execution so the child process works properly
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }

  // Execute using spawnSync to preserve colors and console outputs
  spawnSync('node', [cliPath, ...args], { stdio: 'inherit' });

  console.log(`\n${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.bold}Presiona cualquier tecla para regresar al panel principal...${COLORS.reset}`);

  // Wait for any key press before returning to dashboard
  const waitKeyHandler = () => {
    process.stdin.removeListener('data', waitKeyHandler);
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    inExecutionMode = false;
    renderDashboard();
  };

  process.stdin.on('data', waitKeyHandler);
}

/**
 * Entry point to launch the interactive menu dashboard.
 */
export function launchMenu() {
  // Check if stdin is a TTY. If not, print list of commands non-interactively and exit.
  if (!process.stdin.isTTY) {
    console.log('=== 🪺 YAPUCLI COMMAND MENU (Modo No Interactivo) ===\n');
    console.log('Comandos Disponibles:');
    MENU_ITEMS.forEach(item => {
      if (item.cmd !== 'exit') {
        console.log(`  - ${item.label}`);
      }
    });
    console.log('\nPara ejecutar comandos interactivamente, corre este script desde una terminal TTY activa.');
    process.exit(0);
  }

  // Setup stdin keyboard listener
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on('keypress', (str, key) => {
    if (inExecutionMode) return;

    if (key.ctrl && key.name === 'c') {
      cleanupAndExit();
      return;
    }

    if (key.name === 'up') {
      selectedIndex = (selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
      renderDashboard();
    } else if (key.name === 'down') {
      selectedIndex = (selectedIndex + 1) % MENU_ITEMS.length;
      renderDashboard();
    } else if (key.name === 'return') {
      executeAction(selectedIndex);
    } else if (key.name === 'escape' || key.name === 'q') {
      cleanupAndExit();
    }
  });

  // Initial draw
  renderDashboard();
}
