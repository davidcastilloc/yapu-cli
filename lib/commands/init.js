import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, activeLang, templatesDir, skillsDir, _cleanArgs }) {
    console.log(t('init_start'));

    // ── 1. Scaffold .planning/ directory structure ──────────────────────
    console.log(t('init_colony'));
    const planningDir = path.join(targetDir, '.planning');
    const planningSubdirs = [
        '',
        'codebase',
        'phases',
        'debug',
        'debug/resolved',
        'seeds',
        'notes',
        'todos',
        'research',
        'quick',
        'spikes'
    ];
    planningSubdirs.forEach(sub => {
        const dir = path.join(planningDir, sub);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    console.log(t('init_dir_scaffolded'));

    // .planning/ files from templates (skip if exists)
    /**
     * Copies a file if it doesn't already exist at the destination.
     * @param {string} src - Source file path.
     * @param {string} dest - Destination file path.
     * @param {string} label - Display label for logging.
     * @returns {boolean} True if copied, false if skipped.
     */
    const copyIfMissing = (src, dest, label) => {
        if (!fs.existsSync(dest)) {
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
            console.log(t('init_file_created', { label }));
            return true;
        } else {
            console.log(t('init_file_skipped', { label }));
            return false;
        }
    };

    /**
     * Writes content to a file if it doesn't already exist.
     * @param {string} dest - Destination file path.
     * @param {string} content - String content to write.
     * @param {string} label - Display label for logging.
     */
    const writeIfMissing = (dest, content, label) => {
        if (!fs.existsSync(dest)) {
            fs.writeFileSync(dest, content, 'utf8');
            console.log(t('init_file_created', { label }));
        } else {
            console.log(t('init_file_skipped', { label }));
        }
    };

    copyIfMissing(
        path.join(templatesDir, 'STATE.md'),
        path.join(planningDir, 'STATE.md'),
        '.planning/STATE.md'
    );
    copyIfMissing(
        path.join(templatesDir, 'ROADMAP.md'),
        path.join(planningDir, 'ROADMAP.md'),
        '.planning/ROADMAP.md'
    );

    // Dynamic write for config.json to inject the active lang property
    const configDest = path.join(planningDir, 'config.json');
    if (!fs.existsSync(configDest)) {
        const srcConfig = path.join(templatesDir, 'yapu-config.json');
        let configObj = {};
        if (fs.existsSync(srcConfig)) {
            try {
                configObj = JSON.parse(fs.readFileSync(srcConfig, 'utf8'));
            } catch { /* use default empty obj */ }
        }
        configObj.lang = activeLang;
        fs.writeFileSync(configDest, JSON.stringify(configObj, null, 2) + '\n', 'utf8');
        console.log(t('init_file_created', { label: '.planning/config.json' }));
    } else {
        console.log(t('init_file_skipped', { label: '.planning/config.json' }));
    }

    const reqHeader = activeLang === 'es' ? '# Requisitos del Proyecto\n\n> Criterios de aceptación numerados con tabla de trazabilidad.\n\n---\n' : '# Project Requirements\n\n> Numbered acceptance criteria with traceability table.\n\n---\n';
    writeIfMissing(
        path.join(planningDir, 'REQUIREMENTS.md'),
        reqHeader,
        '.planning/REQUIREMENTS.md'
    );

    const methodHeader = activeLang === 'es' ? '# Metodología\n\n> Frameworks interpretativos (lenses) reutilizables que persisten entre fases.\n\n---\n' : '# Methodology\n\n> Reusable interpretive frameworks (lenses) that persist across phases.\n\n---\n';
    writeIfMissing(
        path.join(planningDir, 'METHODOLOGY.md'),
        methodHeader,
        '.planning/METHODOLOGY.md'
    );

    // ── 2. Backward compat: root-level base files ──────────────────────
    const baseFiles = ['PROJECT.md', 'ROADMAP.md', 'STATE.md'];
    baseFiles.forEach(file => {
        const src = path.join(templatesDir, file);
        const dest = path.join(targetDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(t('init_file_created', { label: `Memoria: ${file}` }));
        } else if (fs.existsSync(dest)) {
            console.log(t('init_file_skipped', { label: `Memoria: ${file}` }));
        }
    });

    // ── Global Memory Injection (Hive Mind) ──────────────────────
    const globalPatternsPath = path.join(os.homedir(), '.yapu', 'global-patterns.md');
    const targetProjectMd = path.join(targetDir, 'PROJECT.md');
    
    if (fs.existsSync(globalPatternsPath) && fs.existsSync(targetProjectMd)) {
        console.log(t('init_hivemind_injecting'));
        const globalPatterns = fs.readFileSync(globalPatternsPath, 'utf8');
        let projectMdContent = fs.readFileSync(targetProjectMd, 'utf8');
        
        const hivemindHeader = t('init_hivemind_header');
        if (!projectMdContent.includes(hivemindHeader)) {
            projectMdContent += '\n' + hivemindHeader + '\n';
            projectMdContent += '> ' + t('init_hivemind_description') + '\n\n';
            projectMdContent += globalPatterns + '\n';
            
            fs.writeFileSync(targetProjectMd, projectMdContent, 'utf8');
            console.log(t('init_hivemind_done'));
        }
    }

    // ── 3. Create .agents/skills/ ──────────────────────────────────────
    if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
        console.log(t('init_skills_created'));
    }

    // ── 4. Deploy ALL workflows dynamically ────────────────────────────
    console.log(t('init_deploying_workflows'));

    // 4a. All yapu-*.md from templates root → .agents/skills/
    const allWorkflows = fs.readdirSync(templatesDir)
        .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
    let wfCount = 0;
    allWorkflows.forEach(file => {
        const src = path.join(templatesDir, file);
        const dest = path.join(skillsDir, file);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            wfCount++;
        }
    });
    console.log(t('init_workflows_count', { count: wfCount }));

    // 4b. References: templates/references/yapu-*.md → .agents/skills/references/
    const refsSourceDir = path.join(templatesDir, 'references');
    const refsDestDir = path.join(skillsDir, 'references');
    let refCount = 0;
    if (fs.existsSync(refsSourceDir)) {
        if (!fs.existsSync(refsDestDir)) {
            fs.mkdirSync(refsDestDir, { recursive: true });
        }
        const refFiles = fs.readdirSync(refsSourceDir)
            .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
        refFiles.forEach(file => {
            const src = path.join(refsSourceDir, file);
            const dest = path.join(refsDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                refCount++;
            }
        });
    }
    console.log(t('init_references_count', { count: refCount }));

    // 4c. Contexts: templates/contexts/yapu-*.md → .agents/skills/contexts/
    const ctxSourceDir = path.join(templatesDir, 'contexts');
    const ctxDestDir = path.join(skillsDir, 'contexts');
    let ctxCount = 0;
    if (fs.existsSync(ctxSourceDir)) {
        if (!fs.existsSync(ctxDestDir)) {
            fs.mkdirSync(ctxDestDir, { recursive: true });
        }
        const ctxFiles = fs.readdirSync(ctxSourceDir)
            .filter(f => f.startsWith('yapu-') && f.endsWith('.md'));
        ctxFiles.forEach(file => {
            const src = path.join(ctxSourceDir, file);
            const dest = path.join(ctxDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                ctxCount++;
            }
        });
    }
    console.log(t('init_contexts_count', { count: ctxCount }));

    // 4d. Codebase: templates/codebase/*.md → .agents/skills/codebase/
    const cbSourceDir = path.join(templatesDir, 'codebase');
    const cbDestDir = path.join(skillsDir, 'codebase');
    let cbCount = 0;
    if (fs.existsSync(cbSourceDir)) {
        if (!fs.existsSync(cbDestDir)) {
            fs.mkdirSync(cbDestDir, { recursive: true });
        }
        const cbFiles = fs.readdirSync(cbSourceDir)
            .filter(f => f.endsWith('.md'));
        cbFiles.forEach(file => {
            const src = path.join(cbSourceDir, file);
            const dest = path.join(cbDestDir, file);
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                cbCount++;
            }
        });
    }
    console.log(t('init_codebase_count', { count: cbCount }));

    // Automatically add .planning/.branches/ and .planning/.snapshots/ to .gitignore to avoid committing them
    const gitignorePath = path.join(targetDir, '.gitignore');
    const ignoreEntries = [
        '.planning/.branches/',
        '.planning/.snapshots/'
    ];
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    let updatedGitignore = false;
    for (const entry of ignoreEntries) {
        if (!gitignoreContent.includes(entry)) {
            if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
                gitignoreContent += '\n';
            }
            gitignoreContent += entry + '\n';
            updatedGitignore = true;
        }
    }
    if (updatedGitignore) {
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
        console.log(activeLang === 'es' ? '📝 Archivo .gitignore actualizado para excluir ramas y snapshots de contexto.' : '📝 .gitignore file updated to exclude context branches and snapshots.');
    }

    console.log(t('init_done'));
}
