import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ── Provider Definitions ────────────────────────────────────────────────────

/**
 * Registry of known AI CLI providers and their configurations.
 * Each provider defines how to locate its data, spawn it, and read its sessions.
 */
export const PROVIDERS = {
  antigravity: {
    name: 'Antigravity CLI',
    executable: 'antigravity',
    brainPath: (homeDir) => path.join(homeDir, '.gemini', 'antigravity-cli', 'brain'),
    buildSpawnArgs: (promptText, attachedFiles = []) => {
      const args = ['chat', '-m', 'agent'];
      for (const f of attachedFiles) {
        args.push('-a', f);
      }
      args.push(promptText);
      return args;
    },
    transcriptCandidates: (conversationDir) => [
      path.join(conversationDir, '.system_generated', 'logs', 'transcript.jsonl'),
      path.join(conversationDir, 'transcript.jsonl'),
      path.join(conversationDir, 'overview.txt'),
    ],
  },
  claude: {
    name: 'Claude Code',
    executable: 'claude',
    brainPath: (homeDir) => path.join(homeDir, '.claude', 'projects'),
    buildSpawnArgs: (promptText, _attachedFiles = []) => {
      return ['--print', '--output-format', 'text', promptText];
    },
    transcriptCandidates: (sessionDir) => {
      // Claude Code stores JSONL files directly in project directories
      try {
        const entries = fs.readdirSync(sessionDir);
        return entries
          .filter(e => e.endsWith('.jsonl'))
          .map(e => path.join(sessionDir, e));
      } catch {
        return [];
      }
    },
  },
  codex: {
    name: 'Codex CLI',
    executable: 'codex',
    brainPath: (homeDir) => path.join(homeDir, '.codex', 'sessions'),
    buildSpawnArgs: (promptText, _attachedFiles = []) => {
      return ['--approval-mode', 'full-auto', promptText];
    },
    transcriptCandidates: (sessionDir) => {
      // Codex stores sessions in YYYY/MM/DD/ hierarchy as .jsonl
      // Walk the directory tree to find .jsonl files
      const results = [];
      try {
        const walk = (dir) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              walk(fullPath);
            } else if (entry.name.endsWith('.jsonl')) {
              results.push(fullPath);
            }
          }
        };
        walk(sessionDir);
      } catch { /* skip */ }
      return results;
    },
  },
};

/** @type {string[]} Valid provider names */
export const PROVIDER_NAMES = Object.keys(PROVIDERS);

/** @type {string} Default provider when nothing else is configured */
export const DEFAULT_PROVIDER = 'antigravity';

// ── Detection & Resolution ──────────────────────────────────────────────────

/**
 * Check if an executable is available in PATH.
 * @param {string} executable
 * @returns {boolean}
 */
export function isExecutableAvailable(executable) {
  if (!executable) return false;
  const pathDirs = (process.env.PATH || '').split(path.delimiter);
  for (const dir of pathDirs) {
    try {
      const fullPath = path.join(dir, executable);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          fs.accessSync(fullPath, fs.constants.X_OK);
          return true;
        }
      }
    } catch {
      // Ignore and continue checking path directories
    }
  }
  return false;
}

/**
 * Check if a provider's data directory exists.
 * @param {string} providerName
 * @returns {boolean}
 */
export function hasProviderData(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) return false;
  const dataPath = provider.brainPath(os.homedir());
  return fs.existsSync(dataPath);
}

/**
 * Detect all providers available on the system.
 * Returns an array of objects with provider info and availability status.
 * @returns {Array<{ name: string, key: string, installed: boolean, hasData: boolean, dataPath: string }>}
 */
export function detectProviders() {
  const homeDir = os.homedir();
  return PROVIDER_NAMES.map(key => {
    const provider = PROVIDERS[key];
    const dataPath = provider.brainPath(homeDir);
    return {
      key,
      name: provider.name,
      installed: isExecutableAvailable(provider.executable),
      hasData: fs.existsSync(dataPath),
      dataPath,
    };
  });
}

/**
 * Resolve which provider to use.
 * Priority: configOverride > auto-detect (first with data + executable) > default (antigravity)
 *
 * @param {string|null|undefined} configOverride - Provider name from yapu-config.json ("auto", "antigravity", "claude", "codex")
 * @returns {{ key: string, config: object }}
 */
export function resolveProvider(configOverride) {
  // Explicit provider requested
  if (configOverride && configOverride !== 'auto' && PROVIDERS[configOverride]) {
    return { key: configOverride, config: PROVIDERS[configOverride] };
  }

  // Auto-detect: prefer providers that have both executable AND data
  for (const key of PROVIDER_NAMES) {
    if (isExecutableAvailable(PROVIDERS[key].executable) && hasProviderData(key)) {
      return { key, config: PROVIDERS[key] };
    }
  }

  // Fallback: any provider with just data
  for (const key of PROVIDER_NAMES) {
    if (hasProviderData(key)) {
      return { key, config: PROVIDERS[key] };
    }
  }

  // Ultimate fallback: antigravity (the original default)
  return { key: DEFAULT_PROVIDER, config: PROVIDERS[DEFAULT_PROVIDER] };
}

/**
 * Detect the most recently active brain/session path for a given provider.
 * Finds the conversation/session directory with the most recent modification time.
 *
 * @param {string} providerName - Provider key
 * @returns {string|null} Path to the most recent conversation directory, or null
 */
export function detectBrainPathForProvider(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) return null;

  const homeDir = os.homedir();
  const baseDir = provider.brainPath(homeDir);

  if (!fs.existsSync(baseDir)) return null;

  try {
    const items = fs.readdirSync(baseDir);
    let latestDir = null;
    let latestTime = 0;

    for (const item of items) {
      const itemPath = path.join(baseDir, item);
      let stat;
      try {
        stat = fs.statSync(itemPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        let mtime = stat.mtimeMs;

        // For antigravity, check the transcript.jsonl for more accurate mtime
        if (providerName === 'antigravity') {
          const transcriptPath = path.join(itemPath, '.system_generated', 'logs', 'transcript.jsonl');
          if (fs.existsSync(transcriptPath)) {
            try {
              const transcriptStat = fs.statSync(transcriptPath);
              mtime = transcriptStat.mtimeMs;
            } catch { /* use directory mtime */ }
          }
        }

        // For claude, check for .jsonl files inside
        if (providerName === 'claude') {
          try {
            const entries = fs.readdirSync(itemPath);
            for (const e of entries) {
              if (e.endsWith('.jsonl')) {
                const eStat = fs.statSync(path.join(itemPath, e));
                if (eStat.mtimeMs > mtime) mtime = eStat.mtimeMs;
              }
            }
          } catch { /* use directory mtime */ }
        }

        if (mtime > latestTime) {
          latestTime = mtime;
          latestDir = itemPath;
        }
      }
    }

    return latestDir;
  } catch {
    return null;
  }
}
