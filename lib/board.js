import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { detectBrainPath, readConversationLog } from './artifacts.js';
import { t } from './i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Security: Whitelisted Commands ───────────────────────────────────────────
const ALLOWED_COMMANDS = new Set([
  'plan', 'execute', 'status', 'check', 'health',
  'sync', 'handoff', 'snapshot', 'gc', 'rescue'
]);

// ─── STATE.md Parser ──────────────────────────────────────────────────────────

/**
 * Parse STATE.md into a structured object.
 * @param {string} statePath - Absolute path to STATE.md.
 * @returns {{ phase: string, mode: string, progress: number, tasks: Array<{ lineIndex: number, text: string, status: string }> }}
 */
function parseState(statePath) {
  let content = '';
  try {
    content = fs.readFileSync(statePath, 'utf8');
  } catch {
    return { phase: 'N/A', mode: 'N/A', progress: 0, tasks: [] };
  }

  const lines = content.split('\n');

  // Phase
  const phaseMatch = content.match(/\*\*(?:FASE ACTIVA|ACTIVE PHASE):\*\*\s*(.*)/i);
  const phase = phaseMatch ? phaseMatch[1].trim() : 'N/A';

  // Mode
  const modeMatch = content.match(/\[\s*(?:MODO DE OPERACIÓN ACTUAL|CURRENT OPERATIONAL MODE|CURRENT OPERATING MODE):\s*(.*?)\s*\]/i);
  const mode = modeMatch ? modeMatch[1].trim() : 'N/A';

  // Tasks
  const tasks = [];
  let inTasksSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s*(?:Tareas|Tasks)/i.test(line)) {
      inTasksSection = true;
      continue;
    }
    if (inTasksSection && line.startsWith('##')) break;
    if (inTasksSection && line.trim().startsWith('- [')) {
      const trimmed = line.trim();
      let status = 'pending';
      if (/^-\s*\[[xX]\]/.test(trimmed)) status = 'completed';
      else if (/^-\s*\[\/\]/.test(trimmed)) status = 'in-progress';

      // Extract text after the checkbox
      const textMatch = trimmed.match(/^-\s*\[.\]\s*(.*)/);
      const text = textMatch ? textMatch[1].trim() : trimmed;

      tasks.push({ lineIndex: i, text, status });
    }
  }

  // Progress
  const completed = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return { phase, mode, progress, tasks };
}

// ─── SSE Broadcast ────────────────────────────────────────────────────────────

/**
 * Send an SSE event to all connected clients.
 * @param {Set<http.ServerResponse>} clients - Active SSE connections.
 * @param {string} event - Event name.
 * @param {object} data - JSON-serializable payload.
 */
function broadcast(clients, event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

// ─── HTTP Body Parser ─────────────────────────────────────────────────────────

/**
 * Read and parse a JSON request body.
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

/**
 * Start the Yapu Command Center web server.
 * @param {string} targetDir - The root project directory.
 * @param {string} activeLang - The active language code.
 * @param {{ port?: number }} [options]
 */
export function startBoard(targetDir, activeLang, options = {}) {
  const port = options.port || 4040;
  const statePath = path.join(targetDir, 'STATE.md');
  const htmlPath = path.join(__dirname, '..', 'templates', 'board', 'index.html');

  // ── Validate prerequisites ────────────────────────────────────────────────
  if (!fs.existsSync(statePath)) {
    console.error(t('board_no_state'));
    process.exit(1);
  }
  if (!fs.existsSync(htmlPath)) {
    console.error('Error: templates/board/index.html not found.');
    process.exit(1);
  }

  // ── State ─────────────────────────────────────────────────────────────────
  const sseClients = new Set();
  let activeProcess = null;
  let brainPath = null;
  let lastLogHash = '';

  // Detect brain path once
  try {
    brainPath = detectBrainPath();
  } catch { /* brain not available */ }

  // ── Helper: Fetch and broadcast current state ─────────────────────────────
  function pushState() {
    const state = parseState(statePath);
    broadcast(sseClients, 'state', state);
  }

  function pushLogs() {
    if (!brainPath) return;
    try {
      const entries = readConversationLog(brainPath, 30);
      const hash = entries.length > 0
        ? `${entries.length}-${entries[entries.length - 1].step_index}`
        : '';
      if (hash !== lastLogHash) {
        lastLogHash = hash;
        broadcast(sseClients, 'log', { entries });
      }
    } catch { /* brain read failed silently */ }
  }

  function pushStatus() {
    broadcast(sseClients, 'status', {
      running: activeProcess !== null,
      command: activeProcess ? activeProcess._yapuCmd : null,
      pid: activeProcess ? activeProcess.pid : null,
    });
  }

  // ── HTTP Server ───────────────────────────────────────────────────────────
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);

    // CORS headers for local dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // ── GET / → Serve index.html ──────────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/') {
      try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading index.html: ' + err.message);
      }
      return;
    }

    // ── GET /api/state → Initial state snapshot ───────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/state') {
      const state = parseState(statePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state));
      return;
    }

    // ── GET /api/logs → Initial brain logs snapshot ───────────────────────
    if (req.method === 'GET' && url.pathname === '/api/logs') {
      let entries = [];
      if (brainPath) {
        try {
          entries = readConversationLog(brainPath, 30);
        } catch { /* */ }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ entries, brainPath: brainPath || null }));
      return;
    }

    // ── GET /api/stream → SSE channel ─────────────────────────────────────
    if (req.method === 'GET' && url.pathname === '/api/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write('\n');
      sseClients.add(res);

      // Send initial burst
      const state = parseState(statePath);
      res.write(`event: state\ndata: ${JSON.stringify(state)}\n\n`);
      pushStatus();

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // ── POST /api/toggle → Toggle task checkbox ───────────────────────────
    if (req.method === 'POST' && url.pathname === '/api/toggle') {
      try {
        const { lineIndex } = await readBody(req);
        if (typeof lineIndex !== 'number') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'lineIndex must be a number' }));
          return;
        }

        const content = fs.readFileSync(statePath, 'utf8');
        const lines = content.split('\n');

        if (lineIndex < 0 || lineIndex >= lines.length) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'lineIndex out of range' }));
          return;
        }

        const line = lines[lineIndex];
        let newLine = line;

        if (/- \[ \]/.test(line)) {
          newLine = line.replace('- [ ]', '- [x]');
        } else if (/- \[x\]/i.test(line)) {
          newLine = line.replace(/- \[[xX]\]/, '- [ ]');
        } else if (/- \[\/\]/.test(line)) {
          newLine = line.replace('- [/]', '- [x]');
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Line is not a task checkbox' }));
          return;
        }

        lines[lineIndex] = newLine;
        const newContent = lines.join('\n');

        // Atomic write: write to temp, then rename
        const tmpPath = statePath + '.tmp';
        fs.writeFileSync(tmpPath, newContent, 'utf8');
        fs.renameSync(tmpPath, statePath);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, line: newLine.trim() }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // ── POST /api/command → Execute whitelisted yapu command ──────────────
    if (req.method === 'POST' && url.pathname === '/api/command') {
      try {
        const { command } = await readBody(req);

        // Security: validate against whitelist
        if (!command || !ALLOWED_COMMANDS.has(command)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Command "${command}" is not allowed. Whitelist: ${[...ALLOWED_COMMANDS].join(', ')}`
          }));
          return;
        }

        // Single process at a time
        if (activeProcess) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'A process is already running',
            command: activeProcess._yapuCmd,
            pid: activeProcess.pid,
          }));
          return;
        }

        // Resolve yapu binary path
        let yapuBin = 'yapu';
        try {
          yapuBin = execSync('which yapu', { encoding: 'utf8' }).trim();
        } catch {
          // Fallback: use the local bin
          yapuBin = path.join(__dirname, '..', 'bin', 'cli.js');
        }

        // Spawn the command
        const child = spawn('node', [yapuBin, command], {
          cwd: targetDir,
          env: { ...process.env },
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        child._yapuCmd = `yapu ${command}`;
        activeProcess = child;

        broadcast(sseClients, 'process', {
          stream: 'system',
          line: `▶ Running: yapu ${command} (PID ${child.pid})`,
        });
        pushStatus();

        child.stdout.on('data', (data) => {
          const text = data.toString();
          for (const line of text.split('\n')) {
            if (line.trim()) {
              broadcast(sseClients, 'process', { stream: 'stdout', line });
            }
          }
        });

        child.stderr.on('data', (data) => {
          const text = data.toString();
          for (const line of text.split('\n')) {
            if (line.trim()) {
              broadcast(sseClients, 'process', { stream: 'stderr', line });
            }
          }
        });

        child.on('close', (code) => {
          activeProcess = null;
          broadcast(sseClients, 'process', {
            stream: 'system',
            line: `■ Process exited with code ${code}`,
          });
          pushStatus();
          // Refresh state since the command may have modified STATE.md
          setTimeout(pushState, 200);
        });

        child.on('error', (err) => {
          activeProcess = null;
          broadcast(sseClients, 'process', {
            stream: 'stderr',
            line: `Error spawning process: ${err.message}`,
          });
          pushStatus();
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, command: `yapu ${command}`, pid: child.pid }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // ── 404 ───────────────────────────────────────────────────────────────
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  // ── File Watchers ─────────────────────────────────────────────────────────
  const watchers = [];

  // Watch STATE.md
  let stateDebounce = null;
  try {
    const stateWatcher = fs.watch(statePath, () => {
      if (stateDebounce) clearTimeout(stateDebounce);
      stateDebounce = setTimeout(pushState, 200);
    });
    watchers.push(stateWatcher);
  } catch (err) {
    console.error('Warning: Could not watch STATE.md:', err.message);
  }

  // Watch brain transcript
  if (brainPath) {
    let logDebounce = null;
    const logsDir = path.join(brainPath, '.system_generated', 'logs');
    if (fs.existsSync(logsDir)) {
      try {
        const logWatcher = fs.watch(logsDir, () => {
          if (logDebounce) clearTimeout(logDebounce);
          logDebounce = setTimeout(pushLogs, 300);
        });
        watchers.push(logWatcher);
      } catch (err) {
        console.error('Warning: Could not watch brain logs:', err.message);
      }
    }
  }

  // Periodic brain log poll as fallback (every 5s)
  const logInterval = setInterval(() => {
    if (sseClients.size > 0) {
      // Re-detect brain path in case a new conversation started
      if (!brainPath) {
        try {
          brainPath = detectBrainPath();
        } catch { /* */ }
      }
      pushLogs();
    }
  }, 5000);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  function shutdown() {
    console.log(t('board_shutdown'));
    if (activeProcess) {
      try { activeProcess.kill('SIGTERM'); } catch { /* */ }
    }
    for (const w of watchers) {
      try { w.close(); } catch { /* */ }
    }
    clearInterval(logInterval);
    for (const client of sseClients) {
      try { client.end(); } catch { /* */ }
    }
    server.close();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // ── Start Listening ───────────────────────────────────────────────────────
  server.listen(port, () => {
    console.log(t('board_listening', { port }));
    console.log(`\n  → http://localhost:${port}\n`);
    console.log('  Press Ctrl+C to stop.\n');

    // Auto-open browser
    try {
      const openCmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'start'
        : 'xdg-open';
      spawn(openCmd, [`http://localhost:${port}`], { stdio: 'ignore', detached: true }).unref();
    } catch { /* silently fail if no browser opener */ }
  });
}
