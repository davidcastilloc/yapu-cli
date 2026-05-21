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

const TRANSLATIONS = {
  es: {
    title: 'C O N O T O   -   Y A P U C L I   D A S H B O A R D',
    activeNest: 'Nido Activo',
    projectStatus: 'ESTADO DEL PROYECTO',
    oprMode: 'Modo Operativo',
    activePhase: 'Fase Activa',
    activeTasks: 'Tareas Activas',
    completed: 'completadas',
    hooks: 'Yapu Guard Hook',
    specs: 'Especificaciones',
    availableActions: 'ACCIONES DISPONIBLES (Navega con ↑/↓ y presiona Enter)',
    instructions: 'Instrucciones: ↑/↓ Navegar | Enter Seleccionar | L Cambiar Idioma (EN/ES) | Esc/q Salir',
    executing: 'Ejecutando',
    returnPrompt: 'Presiona cualquier tecla para regresar al panel principal...',
    exitMsg: '¡Hasta pronto en la colonia, Conoto! Que la gravedad te acompañe.',
    nonInteractiveTitle: '=== YAPUCLI COMMAND MENU (Modo No Interactivo) ===',
    availableCmds: 'Comandos Disponibles:',
    nonInteractiveFooter: 'Para ejecutar comandos interactivamente, corre este script desde una terminal TTY activa.',
    
    // Menu labels
    menuSync: 'Sincronizar Colonia (yapu sync)',
    menuHealth: 'Diagnóstico de Salud (yapu health)',
    menuArchive: 'Archivar Tareas Completadas (yapu archive)',
    menuHandoff: 'Preparar Handoff de Sesión (yapu handoff)',
    menuStatus: 'Ver Estado Detallado (yapu status)',
    menuBrainList: 'Inspeccionar Brain (yapu brain list)',
    menuInstallHooks: 'Instalar Yapu Guard Hooks (yapu install-hooks)',
    menuExit: 'Salir del Avispero'
  },
  en: {
    title: 'C O N O T O   -   Y A P U C L I   D A S H B O A R D',
    activeNest: 'Active Nest',
    projectStatus: 'PROJECT STATUS',
    oprMode: 'Operating Mode',
    activePhase: 'Active Phase',
    activeTasks: 'Active Tasks',
    completed: 'completed',
    hooks: 'Yapu Guard Hook',
    specs: 'Specifications',
    availableActions: 'AVAILABLE ACTIONS (Navigate with ↑/↓ and press Enter)',
    instructions: 'Instructions: ↑/↓ Navigate | Enter Select | L Toggle Language (EN/ES) | Esc/q Exit',
    executing: 'Executing',
    returnPrompt: 'Press any key to return to the main panel...',
    exitMsg: 'See you soon in the colony, Conoto! May gravity guide you.',
    nonInteractiveTitle: '=== YAPUCLI COMMAND MENU (Non-Interactive Mode) ===',
    availableCmds: 'Available Commands:',
    nonInteractiveFooter: 'To run commands interactively, execute this script in an active TTY terminal.',
    
    // Menu labels
    menuSync: 'Synchronize Colony (yapu sync)',
    menuHealth: 'Health Diagnostics (yapu health)',
    menuArchive: 'Archive Completed Tasks (yapu archive)',
    menuHandoff: 'Prepare Session Handoff (yapu handoff)',
    menuStatus: 'View Detailed Status (yapu status)',
    menuBrainList: 'Inspect Brain (yapu brain list)',
    menuInstallHooks: 'Install Yapu Guard Hooks (yapu install-hooks)',
    menuExit: 'Leave the Nest'
  }
};

// Global TUI state
let selectedIndex = 0;
let inExecutionMode = false;
let currentLang = (process.env.LANG || '').toLowerCase().startsWith('es') ? 'es' : 'en';
let cachedStats = null; // Disk I/O caching for ultra-fast, lag-free rendering

/**
 * Returns dynamic menu items array depending on active language.
 */
function getMenuItems() {
  const t = TRANSLATIONS[currentLang];
  return [
    { label: t.menuSync, cmd: 'sync' },
    { label: t.menuHealth, cmd: 'health' },
    { label: t.menuArchive, cmd: 'archive' },
    { label: t.menuHandoff, cmd: 'handoff' },
    { label: t.menuStatus, cmd: 'status' },
    { label: t.menuBrainList, cmd: 'brain-list' },
    { label: t.menuInstallHooks, cmd: 'install-hooks' },
    { label: t.menuExit, cmd: 'exit' }
  ];
}

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

  let mode = 'NO DETECTADO / NOT DETECTED';
  let phase = 'NO DETECTADA / NOT DETECTED';
  let totalTasks = 0;
  let completedTasks = 0;
  let hasProject = false;
  let hasRoadmap = false;
  let hooksStatus = 'NO INSTALADO / NOT INSTALLED';

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
    hooksStatus = 'ACTIVO / ACTIVE';
  }

  return { mode, phase, totalTasks, completedTasks, hasProject, hasRoadmap, hooksStatus, targetDir };
}

/**
 * Refresh the in-memory stats cache.
 */
function refreshStatsCache() {
  cachedStats = getDashboardStats();
}

/**
 * Restores terminal settings and exits.
 */
function cleanupAndExit() {
  const t = TRANSLATIONS[currentLang];
  process.stdout.write('\x1B[?25h'); // Show cursor
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  console.log(`\n🪺 ${COLORS.brightGreen}${t.exitMsg}${COLORS.reset}\n`);
  process.exit(0);
}

/**
 * Renders the full interactive dashboard TUI.
 */
function renderDashboard() {
  if (inExecutionMode) return;

  // Use cache to prevent blocking file read operations on critical keypress navigation
  if (!cachedStats) {
    refreshStatsCache();
  }
  const stats = cachedStats;
  const t = TRANSLATIONS[currentLang];
  
  // Clear screen and home cursor
  process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  process.stdout.write('\x1B[?25l'); // Hide cursor

  // Banner Header
  console.log(`${COLORS.brightGreen}┌──────────────────────────────────────────────────────────────┐`);
  console.log(`│  🪺  ${COLORS.bold}${t.title}${COLORS.reset}${COLORS.brightGreen}   │`);
  console.log(`└──────────────────────────────────────────────────────────────┘${COLORS.reset}`);
  
  // Workspace Info
  console.log(`${COLORS.gray}📂 ${t.activeNest}:${COLORS.reset} ${COLORS.bold}${stats.targetDir}${COLORS.reset}`);
  console.log(`${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  
  // Status Cards Grid
  console.log(`${COLORS.bold}📋 ${t.projectStatus}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}├ ${t.oprMode} :${COLORS.reset} ${COLORS.bold}${stats.mode}${COLORS.reset}`);
  console.log(`  ${COLORS.cyan}├ ${t.activePhase}    :${COLORS.reset} ${stats.phase}`);
  
  const pct = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const progressColor = pct === 100 ? COLORS.brightGreen : (pct > 50 ? COLORS.brightYellow : COLORS.cyan);
  console.log(`  ${COLORS.cyan}├ ${t.activeTasks} :${COLORS.reset} ${progressColor}${stats.completedTasks}/${stats.totalTasks} ${t.completed} (${pct}%)${COLORS.reset}`);
  
  const hooksColor = stats.hooksStatus.includes('ACTIVO') || stats.hooksStatus.includes('ACTIVE') ? COLORS.brightGreen : COLORS.red;
  console.log(`  ${COLORS.cyan}├ ${t.hooks}:${COLORS.reset} ${hooksColor}${stats.hooksStatus}${COLORS.reset}`);
  
  const projStatus = stats.hasProject ? `${COLORS.brightGreen}OK${COLORS.reset}` : `${COLORS.red}MISSING${COLORS.reset}`;
  const roadStatus = stats.hasRoadmap ? `${COLORS.brightGreen}OK${COLORS.reset}` : `${COLORS.red}MISSING${COLORS.reset}`;
  console.log(`  ${COLORS.cyan}└ ${t.specs}:${COLORS.reset} PROJECT.md (${projStatus}) | ROADMAP.md (${roadStatus})`);
  
  console.log(`${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.bold}🛠️  ${t.availableActions}${COLORS.reset}\n`);

  // Render Menu Items
  const menuItems = getMenuItems();
  menuItems.forEach((item, index) => {
    if (index === selectedIndex) {
      console.log(`  ${COLORS.brightGreen}👉 ${COLORS.invert} ${item.label} ${COLORS.reset}`);
    } else {
      console.log(`     ${COLORS.gray}${item.label}${COLORS.reset}`);
    }
  });

  console.log(`\n${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.gray}${t.instructions}${COLORS.reset}`);
}

/**
 * Handles action execution.
 */
function executeAction(index) {
  const menuItems = getMenuItems();
  const item = menuItems[index];
  const t = TRANSLATIONS[currentLang];
  
  if (item.cmd === 'exit') {
    cleanupAndExit();
    return;
  }

  inExecutionMode = true;
  
  // Clear screen and show cursor
  process.stdout.write('\x1B[2J\x1B[3J\x1B[H');
  process.stdout.write('\x1B[?25h'); // Show cursor
  
  console.log(`${COLORS.brightGreen}🪺 ${t.executing}: ${COLORS.bold}${item.label}${COLORS.reset}\n`);
  
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

  // Update cached stats so that the dashboard reflects any changes made by the executed command
  refreshStatsCache();

  console.log(`\n${COLORS.brightGreen}────────────────────────────────────────────────────────────────${COLORS.reset}`);
  console.log(`${COLORS.bold}${t.returnPrompt}${COLORS.reset}`);

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
  const t = TRANSLATIONS[currentLang];
  
  // Check if stdin is a TTY. If not, print list of commands non-interactively and exit.
  if (!process.stdin.isTTY) {
    console.log(`${t.nonInteractiveTitle}\n`);
    console.log(t.availableCmds);
    const menuItems = getMenuItems();
    menuItems.forEach(item => {
      if (item.cmd !== 'exit') {
        console.log(`  - ${item.label}`);
      }
    });
    console.log(`\n${t.nonInteractiveFooter}`);
    process.exit(0);
  }

  // Pre-fetch stats once on startup to cache them
  refreshStatsCache();

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
      const menuItems = getMenuItems();
      selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
      renderDashboard();
    } else if (key.name === 'down') {
      const menuItems = getMenuItems();
      selectedIndex = (selectedIndex + 1) % menuItems.length;
      renderDashboard();
    } else if (key.name === 'l') {
      // Toggle language
      currentLang = currentLang === 'es' ? 'en' : 'es';
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
