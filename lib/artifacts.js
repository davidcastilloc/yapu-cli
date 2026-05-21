import fs from 'node:fs';
import path from 'node:path';

// ── Artifact type constants ─────────────────────────────────────────────────
/** @type {string} */ export const ARTIFACT_TYPE_IMPLEMENTATION_PLAN = 'implementation_plan';
/** @type {string} */ export const ARTIFACT_TYPE_TASK               = 'task';
/** @type {string} */ export const ARTIFACT_TYPE_WALKTHROUGH         = 'walkthrough';
/** @type {string} */ export const ARTIFACT_TYPE_OTHER               = 'other';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON string, returning `null` on failure.
 * @param {string} raw
 * @returns {object|null}
 */
function safeParse(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * Ensure a directory exists (recursive).
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Strip the `.md.metadata.json` or `.metadata.json` suffix to recover the
 * artifact name from a metadata sidecar filename.
 * @param {string} filename
 * @returns {string}
 */
function nameFromMetaFile(filename) {
  // e.g.  "implementation_plan.md.metadata.json" → "implementation_plan"
  //       "my_notes.md.metadata.json"            → "my_notes"
  return filename.replace(/\.md\.metadata\.json$/, '');
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Read an artifact from an Antigravity brain directory.
 *
 * Reads both `{name}.md` and its sidecar `{name}.md.metadata.json`.
 *
 * @param {string} brainPath - Absolute path to the brain conversation directory.
 * @param {string} name      - Artifact name (e.g. `'implementation_plan'`).
 * @returns {{ content: string, metadata: object|null } | null}
 *   The artifact payload, or `null` when the markdown file does not exist.
 */
export function readArtifact(brainPath, name) {
  if (!brainPath || !name) return null;

  const mdPath   = path.join(brainPath, `${name}.md`);
  const metaPath = path.join(brainPath, `${name}.md.metadata.json`);

  if (!fs.existsSync(mdPath)) return null;

  let content;
  try {
    content = fs.readFileSync(mdPath, 'utf8');
  } catch {
    return null;
  }

  let metadata = null;
  if (fs.existsSync(metaPath)) {
    try {
      metadata = safeParse(fs.readFileSync(metaPath, 'utf8'));
    } catch { /* metadata is optional */ }
  }

  return { content, metadata };
}

/**
 * Write an artifact to an Antigravity brain directory.
 *
 * Creates `{name}.md` and the sidecar `{name}.md.metadata.json`.
 * The directory tree is created automatically when it does not exist.
 *
 * @param {string} brainPath - Absolute path to the brain conversation directory.
 * @param {string} name      - Artifact name.
 * @param {string} content   - Markdown body.
 * @param {object} metadata  - Metadata object (see {@link createMetadata}).
 */
export function writeArtifact(brainPath, name, content, metadata) {
  if (!brainPath || !name) {
    throw new Error('brainPath and name are required');
  }

  ensureDir(brainPath);

  const mdPath   = path.join(brainPath, `${name}.md`);
  const metaPath = path.join(brainPath, `${name}.md.metadata.json`);

  fs.writeFileSync(mdPath, content ?? '', 'utf8');

  const meta = {
    ...(metadata ?? {}),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

/**
 * Create a metadata sidecar object compatible with Antigravity's format.
 *
 * @param {string}  artifactType    - One of the `ARTIFACT_TYPE_*` constants.
 * @param {string}  summary         - Human-readable summary of the artifact.
 * @param {boolean} [requestFeedback=false] - Whether to flag for user feedback.
 * @returns {{ artifactType: string, summary: string, updatedAt: string, requestFeedback: boolean }}
 */
export function createMetadata(artifactType, summary, requestFeedback = false) {
  return {
    artifactType: artifactType ?? ARTIFACT_TYPE_OTHER,
    summary:      summary ?? '',
    updatedAt:    new Date().toISOString(),
    requestFeedback: Boolean(requestFeedback),
  };
}

/**
 * List every artifact present in a brain directory.
 *
 * Scans for `*.md.metadata.json` sidecar files in both the root of
 * `brainPath` and `brainPath/artifacts/`.
 *
 * @param {string} brainPath - Absolute path to the brain conversation directory.
 * @returns {Array<{ name: string, type: string, summary: string, updatedAt: string }>}
 *   Sorted by `updatedAt` descending (newest first).
 */
export function listArtifacts(brainPath) {
  if (!brainPath || !fs.existsSync(brainPath)) return [];

  /** @type {Array<{ name: string, type: string, summary: string, updatedAt: string }>} */
  const results = [];

  // Directories to scan – root + artifacts/ subfolder
  const searchDirs = [
    brainPath,
    path.join(brainPath, 'artifacts'),
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    let entries;
    try { entries = fs.readdirSync(dir); } catch { continue; }

    for (const entry of entries) {
      if (!entry.endsWith('.md.metadata.json')) continue;

      const metaPath = path.join(dir, entry);
      let stat;
      try { stat = fs.statSync(metaPath); } catch { continue; }
      if (!stat.isFile()) continue;

      const raw = safeParse((() => {
        try { return fs.readFileSync(metaPath, 'utf8'); } catch { return ''; }
      })());

      if (!raw) continue;

      const name = nameFromMetaFile(entry);

      results.push({
        name,
        type:      raw.artifactType ?? raw.type ?? 'other',
        summary:   raw.summary ?? '',
        updatedAt: raw.updatedAt ?? '',
      });
    }
  }

  // Sort newest-first
  results.sort((a, b) => {
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return results;
}

/**
 * Read the conversation log from a brain directory.
 *
 * Tries `transcript.jsonl` first (antigravity-cli), then falls back to
 * `overview.txt` (antigravity desktop).  Both are expected to be in
 * JSON-Lines format.
 *
 * @param {string} brainPath  - Absolute path to the brain conversation directory.
 * @param {number} [limit=50] - Maximum number of entries to return (from the tail).
 * @returns {Array<{ step_index: number, source: string, type: string, content: string }>}
 */
export function readConversationLog(brainPath, limit = 50) {
  if (!brainPath) return [];

  // Candidate log locations
  const candidates = [
    path.join(brainPath, '.system_generated', 'logs', 'transcript.jsonl'),
    path.join(brainPath, 'transcript.jsonl'),
    path.join(brainPath, 'overview.txt'),
  ];

  let logPath = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) { logPath = c; break; }
  }
  if (!logPath) return [];

  let raw;
  try {
    raw = fs.readFileSync(logPath, 'utf8');
  } catch {
    return [];
  }

  const lines = raw.split('\n').filter(l => l.trim().length > 0);

  /** @type {Array<{ step_index: number, source: string, type: string, content: string }>} */
  const entries = [];

  for (const line of lines) {
    const parsed = safeParse(line);
    if (!parsed) continue;

    entries.push({
      step_index: parsed.step_index ?? entries.length,
      source:     parsed.source ?? '',
      type:       parsed.type ?? '',
      content:    parsed.content ?? '',
    });
  }

  // Return the last `limit` entries
  return entries.slice(-Math.max(1, limit));
}

/**
 * Sync brain artifacts into the project's `.planning/` directory.
 *
 * Mapping:
 * | Brain artifact          | Planning destination                      |
 * |-------------------------|-------------------------------------------|
 * | `implementation_plan`   | `.planning/current-plan.md`               |
 * | `task`                  | `.planning/current-tasks.md`              |
 * | `walkthrough`           | `.planning/current-walkthrough.md`        |
 * | *(anything else)*       | `.planning/artifacts/{name}.md`           |
 *
 * @param {string} brainPath    - Absolute path to the brain conversation directory.
 * @param {string} planningPath - Absolute path to the `.planning/` directory.
 * @returns {{ synced: string[], errors: string[] }}
 */
export function syncBrainToPlanning(brainPath, planningPath) {
  /** @type {string[]} */ const synced = [];
  /** @type {string[]} */ const errors = [];

  if (!brainPath || !planningPath) {
    errors.push('brainPath and planningPath are required');
    return { synced, errors };
  }

  const artifacts = listArtifacts(brainPath);
  if (artifacts.length === 0) return { synced, errors };

  ensureDir(planningPath);

  /** Map well-known artifact names → destination filenames */
  const WELL_KNOWN = {
    implementation_plan: 'current-plan.md',
    task:                'current-tasks.md',
    walkthrough:         'current-walkthrough.md',
  };

  for (const art of artifacts) {
    try {
      const source = readArtifact(brainPath, art.name);
      if (!source) continue;

      const destName = WELL_KNOWN[art.name]
        ? WELL_KNOWN[art.name]
        : path.join('artifacts', `${art.name}.md`);

      const destPath = path.join(planningPath, destName);
      const destDir  = path.dirname(destPath);
      ensureDir(destDir);

      fs.writeFileSync(destPath, source.content, 'utf8');
      synced.push(art.name);
    } catch (/** @type {any} */ err) {
      errors.push(`${art.name}: ${err?.message ?? String(err)}`);
    }
  }

  return { synced, errors };
}

/**
 * Generate session-continuity files: `HANDOFF.json` (machine-readable) and
 * `.continue-here.md` (human-readable).
 *
 * These are written into the `.planning/` directory so any future agent can
 * resume work without re-reading the entire brain history.
 *
 * @param {string}      planningPath - Absolute path to the `.planning/` directory.
 * @param {string|null} [brainPath=null] - Optional brain path for extra context.
 * @returns {{ handoffPath: string, continueHerePath: string }}
 */
export function generateHandoff(planningPath, brainPath = null) {
  if (!planningPath) {
    throw new Error('planningPath is required');
  }

  ensureDir(planningPath);

  // ── Gather context ──────────────────────────────────────────────────────

  // Read STATE.md / current-tasks.md for current position
  let currentState = null;
  for (const candidate of ['STATE.md', 'current-tasks.md']) {
    const p = path.join(planningPath, candidate);
    if (fs.existsSync(p)) {
      try { currentState = fs.readFileSync(p, 'utf8'); } catch { /* skip */ }
      if (currentState) break;
    }
  }

  // Read current plan if available
  let currentPlan = null;
  for (const candidate of ['current-plan.md', 'PLAN.md']) {
    const p = path.join(planningPath, candidate);
    if (fs.existsSync(p)) {
      try { currentPlan = fs.readFileSync(p, 'utf8'); } catch { /* skip */ }
      if (currentPlan) break;
    }
  }

  // Conversation log from brain (last 20 entries for context)
  let recentLog = [];
  if (brainPath) {
    recentLog = readConversationLog(brainPath, 20);
  }

  // List brain artifacts
  let brainArtifacts = [];
  if (brainPath) {
    brainArtifacts = listArtifacts(brainPath);
  }

  // ── Build HANDOFF.json ──────────────────────────────────────────────────

  const handoff = {
    generatedAt:  new Date().toISOString(),
    brainPath:    brainPath ?? null,
    planningPath,
    artifacts:    brainArtifacts.map(a => ({
      name:      a.name,
      type:      a.type,
      summary:   a.summary,
      updatedAt: a.updatedAt,
    })),
    currentState: currentState ? summariseMarkdown(currentState) : null,
    currentPlan:  currentPlan  ? summariseMarkdown(currentPlan)  : null,
    recentActivity: recentLog.map(e => ({
      step:    e.step_index,
      source:  e.source,
      type:    e.type,
      preview: (e.content ?? '').slice(0, 300),
    })),
  };

  const handoffPath = path.join(planningPath, 'HANDOFF.json');
  fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2) + '\n', 'utf8');

  // ── Build .continue-here.md ─────────────────────────────────────────────

  const lines = [
    '# Continue Here',
    '',
    `> Auto-generated on ${handoff.generatedAt}`,
    '',
  ];

  if (currentState) {
    lines.push('## Current State', '', currentState, '');
  }

  if (currentPlan) {
    lines.push('## Current Plan (excerpt)', '', currentPlan.slice(0, 2000), '');
  }

  if (brainArtifacts.length > 0) {
    lines.push('## Brain Artifacts', '');
    for (const a of brainArtifacts) {
      lines.push(`- **${a.name}** (${a.type}) — ${a.summary || 'no summary'}`);
    }
    lines.push('');
  }

  if (recentLog.length > 0) {
    lines.push('## Recent Activity', '');
    for (const e of recentLog.slice(-10)) {
      const preview = (e.content ?? '').slice(0, 200).replace(/\n/g, ' ');
      lines.push(`- [${e.source}/${e.type}] ${preview}`);
    }
    lines.push('');
  }

  if (brainPath) {
    lines.push('## Brain Path', '', `\`${brainPath}\``, '');
  }

  const continueHerePath = path.join(planningPath, '.continue-here.md');
  fs.writeFileSync(continueHerePath, lines.join('\n'), 'utf8');

  return { handoffPath, continueHerePath };
}

// ── Internal helpers ────────────────────────────────────────────────────────

/**
 * Extract a short summary from markdown: the first heading and the first
 * paragraph or up to 500 chars, whichever is shorter.
 * @param {string} md
 * @returns {string}
 */
function summariseMarkdown(md) {
  if (!md) return '';
  const trimmed = md.trim();
  if (trimmed.length <= 500) return trimmed;
  // First heading
  const headingMatch = trimmed.match(/^#+\s+(.+)$/m);
  const heading = headingMatch ? headingMatch[1] : '';
  // First paragraph (non-heading, non-empty block)
  const paraMatch = trimmed.match(/\n\n([^#\n][^\n]{10,})/);
  const para = paraMatch ? paraMatch[1].slice(0, 300) : trimmed.slice(0, 300);
  return heading ? `${heading}\n\n${para}…` : `${para}…`;
}
