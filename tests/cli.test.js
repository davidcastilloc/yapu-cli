import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

// Force Spanish as default environment for the existing test suite to maintain 100% backward compatibility
process.env.YAPU_LANG = 'es';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const cliPath = path.join(projectRoot, 'bin', 'cli.js');

describe('YapuCli CLI', () => {
    let tempDir;

    before(() => {
        // Create a temporary directory in the OS temp folder for our tests
        const tempPrefix = path.join(process.env.TMPDIR || '/tmp', 'yapu-test-');
        tempDir = fs.mkdtempSync(tempPrefix);
    });

    after(() => {
        // Clean up the temporary directory after tests are complete
        if (tempDir && fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('Muestra la ayuda de uso cuando se invoca sin comandos', () => {
        const output = execSync(`node ${cliPath}`, { encoding: 'utf8' });
        assert.ok(output.includes('🪺 Framework YapuCli'));
        assert.ok(output.includes('Uso:'));
        assert.ok(output.includes('yapu init'));
        assert.ok(output.includes('yapu archive'));
        assert.ok(output.includes('yapu install-hooks'));
        assert.ok(output.includes('yapu sync'));
        assert.ok(output.includes('yapu handoff'));
        assert.ok(output.includes('yapu brain'));
    });

    test('Ejecuta init correctamente en un espacio de trabajo limpio', () => {
        // Run yapu init inside our temp directory
        const output = execSync(`node ${cliPath} init`, { 
            cwd: tempDir,
            encoding: 'utf8' 
        });

        assert.ok(output.includes('🪺 Inicializando YapuCli...'));
        assert.ok(output.includes('✅ Directorio .planning/ scaffoldeado.'));
        assert.ok(output.includes('✅ Memoria: PROJECT.md inicializada.'));

        // Assert that the base triad files exist
        assert.ok(fs.existsSync(path.join(tempDir, 'PROJECT.md')), 'PROJECT.md should exist');
        assert.ok(fs.existsSync(path.join(tempDir, 'ROADMAP.md')), 'ROADMAP.md should exist');
        assert.ok(fs.existsSync(path.join(tempDir, 'STATE.md')), 'STATE.md should exist');

        // Assert .planning/ directory structure
        const planningDir = path.join(tempDir, '.planning');
        assert.ok(fs.existsSync(planningDir), '.planning/ should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'STATE.md')), '.planning/STATE.md should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'codebase')), '.planning/codebase/ should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'phases')), '.planning/phases/ should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'debug')), '.planning/debug/ should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'seeds')), '.planning/seeds/ should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'config.json')), '.planning/config.json should exist');
        assert.ok(fs.existsSync(path.join(planningDir, 'REQUIREMENTS.md')), '.planning/REQUIREMENTS.md should exist');

        // Assert that the workflow files exist in .agents/skills/
        const skillsDir = path.join(tempDir, '.agents', 'skills');
        assert.ok(fs.existsSync(skillsDir), '.agents/skills should exist');
        
        // Verify key workflows exist (dynamic copy should include all yapu-*.md)
        const expectedWorkflows = [
            'yapu-map.md',
            'yapu-plan.md',
            'yapu-execute.md',
            'yapu-verify.md',
            'yapu-grill-me.md',
            'yapu-grill-docs.md',
            'yapu-secops.md',
            'yapu-dba.md',
            'yapu-ui.md',
            'yapu-forensics.md'
        ];

        for (const file of expectedWorkflows) {
            assert.ok(fs.existsSync(path.join(skillsDir, file)), `${file} should exist in skills`);
        }

        // Verify references and contexts were also copied
        assert.ok(fs.existsSync(path.join(skillsDir, 'references')), '.agents/skills/references/ should exist');
        assert.ok(fs.existsSync(path.join(skillsDir, 'codebase')), '.agents/skills/codebase/ should exist');
    });

    test('Previene la sobreescritura de archivos existentes de memoria', () => {
        // 1. Write a custom content to PROJECT.md inside tempDir
        const customContent = 'PROYECTO PERSONALIZADO';
        const projectPath = path.join(tempDir, 'PROJECT.md');
        fs.writeFileSync(projectPath, customContent, 'utf8');

        // 2. Run init again
        const output = execSync(`node ${cliPath} init`, { 
            cwd: tempDir,
            encoding: 'utf8' 
        });

        // 3. Assert that it reports it was skipped
        assert.ok(output.includes('⚠️  Memoria: PROJECT.md ya existe (omitido).'));

        // 4. Assert that the content remains unchanged
        const currentContent = fs.readFileSync(projectPath, 'utf8');
        assert.strictEqual(currentContent, customContent, 'PROJECT.md should NOT be overwritten');
    });

    test('Ejecuta archive y congela correctamente las tareas completadas', () => {
        // Setup a mock STATE.md
        const mockStatePath = path.join(tempDir, 'STATE.md');
        const mockStateContent = `# ESTADO ACTUAL (MEMORIA DE ANTIGRAVITY)

**FASE ACTIVA:** Fase de Prueba Unitaria

## Tareas de la Fase Actual
- [x] Tarea Completada A
- [ ] Tarea Pendiente B

## Contexto de Ejecución
Notas de prueba.
`;
        fs.writeFileSync(mockStatePath, mockStateContent, 'utf8');

        // Run yapu archive
        const output = execSync(`node ${cliPath} archive`, { 
            cwd: tempDir,
            encoding: 'utf8' 
        });

        assert.ok(output.includes('✅ Tareas archivadas con éxito en HISTORY.md'));
        assert.ok(output.includes('✅ STATE.md ha sido limpiado'));

        // Verify HISTORY.md
        const historyPath = path.join(tempDir, 'HISTORY.md');
        assert.ok(fs.existsSync(historyPath), 'HISTORY.md should be created');
        const historyContent = fs.readFileSync(historyPath, 'utf8');
        assert.ok(historyContent.includes('# ARCHIVO DE CONTEXTO: Fase de Prueba Unitaria'));
        assert.ok(historyContent.includes('- [x] Tarea Completada A'));

        // Verify updated STATE.md
        const stateContent = fs.readFileSync(mockStatePath, 'utf8');
        assert.ok(!stateContent.includes('- [x] Tarea Completada A'), 'Completed task should be removed');
        assert.ok(stateContent.includes('- [ ] Tarea Pendiente B'), 'Pending task should remain');
        assert.ok(stateContent.includes('## Contexto de Ejecución'), 'Context section should remain');
    });

    test('Ejecuta install-hooks e instala Yapu Guard correctamente', () => {
        // Setup a mock git repository folder structure
        const mockGitDir = path.join(tempDir, '.git');
        fs.mkdirSync(mockGitDir, { recursive: true });

        // Run yapu install-hooks
        const output = execSync(`node ${cliPath} install-hooks`, { 
            cwd: tempDir,
            encoding: 'utf8' 
        });

        assert.ok(output.includes('✅ Yapu Guard: .git/hooks/pre-commit instalado con éxito.'));

        // Verify pre-commit file
        const hookPath = path.join(mockGitDir, 'hooks', 'pre-commit');
        assert.ok(fs.existsSync(hookPath), 'pre-commit hook file should exist');
        
        const hookContent = fs.readFileSync(hookPath, 'utf8');
        assert.ok(hookContent.includes('🪺 [Yapu Guard]'));
        assert.ok(hookContent.includes('PROJECT.md'));

        // Check if executable permissions are applied (on Unix systems)
        if (process.platform !== 'win32') {
            const stats = fs.statSync(hookPath);
            const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
            assert.ok(isExecutable, 'pre-commit hook should have executable permissions');
        }
    });

    test('Ejecuta status e imprime el estado del proyecto correctamente', () => {
        // Setup a mock STATE.md with operational mode and tasks
        const mockStatePath = path.join(tempDir, 'STATE.md');
        const mockStateContent = `# ESTADO ACTUAL (MEMORIA DE ANTIGRAVITY)

**[ MODO DE OPERACIÓN ACTUAL: FORENSE ]**

**FASE ACTIVA:** Fase de Test Forense

## Tareas de la Fase Actual
- [ ] Tarea Pendiente C
- [x] Tarea Completada D
`;
        fs.writeFileSync(mockStatePath, mockStateContent, 'utf8');

        // Setup mock PROJECT.md and ROADMAP.md to verify Specs output
        fs.writeFileSync(path.join(tempDir, 'PROJECT.md'), 'PROJECT CONTENT', 'utf8');
        fs.writeFileSync(path.join(tempDir, 'ROADMAP.md'), 'ROADMAP CONTENT', 'utf8');

        // Run yapu status
        const output = execSync(`node ${cliPath} status`, { 
            cwd: tempDir,
            encoding: 'utf8' 
        });

        assert.ok(output.includes('=== 🪺 YAPU SYSTEM STATUS ==='));
        assert.ok(output.includes('[ OPR MODE  ] : FORENSE'));
        assert.ok(output.includes('[ PHASE     ] : Fase de Test Forense'));
        assert.ok(output.includes('- [ ] Tarea Pendiente C'));
        assert.ok(output.includes('- [x] Tarea Completada D'));
        assert.ok(output.includes('[ SPECS     ] : PROJECT.md (OK) | ROADMAP.md (OK)'));
    });

    test('sync requiere --brain-path', () => {
        try {
            execSync(`node ${cliPath} sync`, {
                cwd: tempDir,
                env: { ...process.env, HOME: path.join(tempDir, 'empty-home') },
                encoding: 'utf8',
                stdio: 'pipe'
            });
            assert.fail('Should have thrown');
        } catch (err) {
            assert.ok(err.stderr && (err.stderr.includes('yapu sync --brain-path') || err.stdout.includes('yapu sync --brain-path')));
        }
    });

    test('sync funciona con un brain directory mock', () => {
        // Create .planning/
        const planningDir = path.join(tempDir, '.planning');
        fs.mkdirSync(planningDir, { recursive: true });

        // Create a mock brain directory with an artifact
        const mockBrain = path.join(tempDir, 'mock-brain');
        fs.mkdirSync(mockBrain, { recursive: true });
        fs.writeFileSync(path.join(mockBrain, 'task.md'), '# My Task\n- [ ] Do stuff', 'utf8');
        fs.writeFileSync(path.join(mockBrain, 'task.md.metadata.json'), JSON.stringify({
            artifactType: 'ARTIFACT_TYPE_TASK',
            summary: 'Test task',
            updatedAt: new Date().toISOString()
        }), 'utf8');

        const output = execSync(`node ${cliPath} sync --brain-path ${mockBrain}`, {
            cwd: tempDir,
            encoding: 'utf8'
        });

        assert.ok(output.includes('Sincronizado'));
        assert.ok(fs.existsSync(path.join(planningDir, 'current-tasks.md')));
    });

    test('handoff genera archivos de continuación', () => {
        // Create .planning/ with STATE.md
        const planningDir = path.join(tempDir, '.planning');
        fs.mkdirSync(planningDir, { recursive: true });
        fs.writeFileSync(path.join(planningDir, 'STATE.md'), '# Estado\n\n**FASE ACTIVA:** Test\n\n## Tareas\n- [ ] Pendiente', 'utf8');

        const output = execSync(`node ${cliPath} handoff`, {
            cwd: tempDir,
            encoding: 'utf8'
        });

        assert.ok(output.includes('HANDOFF.json generado'));
        assert.ok(output.includes('.continue-here.md generado'));
        assert.ok(fs.existsSync(path.join(planningDir, 'HANDOFF.json')));
        assert.ok(fs.existsSync(path.join(planningDir, '.continue-here.md')));
    });

    test('brain list muestra artifacts de un brain directory', () => {
        // Create a mock brain directory
        const mockBrain = path.join(tempDir, 'mock-brain-list');
        fs.mkdirSync(mockBrain, { recursive: true });
        fs.writeFileSync(path.join(mockBrain, 'walkthrough.md'), '# Walkthrough', 'utf8');
        fs.writeFileSync(path.join(mockBrain, 'walkthrough.md.metadata.json'), JSON.stringify({
            artifactType: 'ARTIFACT_TYPE_WALKTHROUGH',
            summary: 'Test walkthrough',
            updatedAt: new Date().toISOString()
        }), 'utf8');

        const output = execSync(`node ${cliPath} brain list --path ${mockBrain}`, {
            cwd: tempDir,
            encoding: 'utf8'
        });

        assert.ok(output.includes('YAPU BRAIN INSPECTOR'));
        assert.ok(output.includes('walkthrough'));
        assert.ok(output.includes('WALKTHROUGH'));
    });

    test('yapu health reports healthy workspace after init and hooks installation', () => {
        execSync(`node ${cliPath} init`, { cwd: tempDir, encoding: 'utf8' });
        
        const mockGitDir = path.join(tempDir, '.git');
        if (!fs.existsSync(mockGitDir)) {
            fs.mkdirSync(mockGitDir, { recursive: true });
        }
        execSync(`node ${cliPath} install-hooks`, { cwd: tempDir, encoding: 'utf8' });

        const output = execSync(`node ${cliPath} health`, {
            cwd: tempDir,
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });

        assert.ok(output.includes('YAPU WORKSPACE HEALTH CHECK'));
        assert.ok(output.includes('PROJECT.md exists'));
        assert.ok(output.includes('ROADMAP.md exists'));
        assert.ok(output.includes('STATE.md exists'));
        assert.ok(output.includes('Workspace is 100% HEALTHY'));
    });

    test('Auto-detecta correctamente el brainPath activo basándose en mtime', () => {
        const mockHome = path.join(tempDir, 'mock-home');
        const brainBaseDir = path.join(mockHome, '.gemini', 'antigravity-cli', 'brain');
        fs.mkdirSync(brainBaseDir, { recursive: true });

        const brain1 = path.join(brainBaseDir, 'uuid-older');
        const brain2 = path.join(brainBaseDir, 'uuid-newer');
        fs.mkdirSync(brain1, { recursive: true });
        fs.mkdirSync(brain2, { recursive: true });

        const logDir1 = path.join(brain1, '.system_generated', 'logs');
        const logDir2 = path.join(brain2, '.system_generated', 'logs');
        fs.mkdirSync(logDir1, { recursive: true });
        fs.mkdirSync(logDir2, { recursive: true });

        fs.writeFileSync(path.join(logDir1, 'transcript.jsonl'), 'Older log content', 'utf8');
        fs.writeFileSync(path.join(logDir2, 'transcript.jsonl'), 'Newer log content', 'utf8');

        const now = Date.now();
        fs.utimesSync(path.join(logDir1, 'transcript.jsonl'), new Date(now - 10000), new Date(now - 10000));
        fs.utimesSync(path.join(logDir2, 'transcript.jsonl'), new Date(now), new Date(now));

        const mockProjectDir = path.join(tempDir, 'mock-project');
        fs.mkdirSync(mockProjectDir, { recursive: true });
        execSync(`node ${cliPath} init`, { cwd: mockProjectDir, encoding: 'utf8' });

        const output = execSync(`node ${cliPath} sync`, {
            cwd: mockProjectDir,
            env: { ...process.env, HOME: mockHome, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });

        assert.ok(output.includes('Active brain auto-detected'));
        assert.ok(output.includes('uuid-newer'));
    });

    // ── NATIVE BILINGUAL & i18n TEST CASES ───────────────────────────────────

    test('Muestra la ayuda de uso en ingles cuando se usa la opcion --lang en', () => {
        const output = execSync(`node ${cliPath} --lang en`, {
            env: { ...process.env, YAPU_LANG: '' }, // Clear global default env
            encoding: 'utf8'
        });
        assert.ok(output.includes('🪺 YapuCli Framework'));
        assert.ok(output.includes('Usage:'));
        assert.ok(output.includes('yapu init'));
        assert.ok(output.includes('yapu status'));
    });

    test('Ejecuta init en ingles y crea configuracion persistente', () => {
        const testDirEn = path.join(tempDir, 'yapu-en-test');
        fs.mkdirSync(testDirEn, { recursive: true });

        const output = execSync(`node ${cliPath} init --lang en`, {
            cwd: testDirEn,
            env: { ...process.env, YAPU_LANG: '' }, // Clear global default env
            encoding: 'utf8'
        });

        assert.ok(output.includes('🪺 Initializing YapuCli...'));
        assert.ok(output.includes('✅ .planning/ directory scaffolded.'));
        assert.ok(output.includes('✅ Memoria: PROJECT.md initialized.'));

        // Assert that the config file has lang: 'en'
        const configPath = path.join(testDirEn, '.planning', 'config.json');
        assert.ok(fs.existsSync(configPath), 'config.json should exist');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        assert.strictEqual(config.lang, 'en');

        // Assert that the triad templates have English text
        const projectContent = fs.readFileSync(path.join(testDirEn, 'PROJECT.md'), 'utf8');
        assert.ok(projectContent.includes('# PROJECT CONTEXT'), 'PROJECT.md should be in English');

        // Assert status runs automatically in English because of the config file
        const statusOutput = execSync(`node ${cliPath} status`, {
            cwd: testDirEn,
            env: { ...process.env, YAPU_LANG: '' }, // Clear global default env
            encoding: 'utf8'
        });
        assert.ok(statusOutput.includes('=== 🪺 YAPU SYSTEM STATUS ==='));
        assert.ok(statusOutput.includes('[ OPR MODE  ] :'));
        assert.ok(statusOutput.includes('[ PHASE     ] :'));
    });

    test('yapu check detecta anti-patrones en la memoria', () => {
        const testDirCheck = path.join(tempDir, 'yapu-check-test');
        fs.mkdirSync(testDirCheck, { recursive: true });

        // Initialize normally
        execSync(`node ${cliPath} init`, {
            cwd: testDirCheck,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        // 1. Inject an anti-pattern in PROJECT.md
        const projectPath = path.join(testDirCheck, 'PROJECT.md');
        let projectContent = fs.readFileSync(projectPath, 'utf8');
        projectContent += '\n## Nueva Sección\nAquí hay un TODO pendiente.\n';
        fs.writeFileSync(projectPath, projectContent, 'utf8');

        // 2. Inject an empty tasks anti-pattern in STATE.md
        const statePath = path.join(testDirCheck, 'STATE.md');
        const stateContent = `# ESTADO ACTUAL

**FASE ACTIVA:** Fase de Diseño

## Tareas de la Fase Actual
No hay tareas definidas.

## Contexto
Blabla`;
        fs.writeFileSync(statePath, stateContent, 'utf8');

        // Run yapu check
        const output = execSync(`node ${cliPath} check 2>&1`, {
            cwd: testDirCheck,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(output.includes('YAPU (FASE 5)'), 'Should print diagnostics header');
        assert.ok(output.includes('Anti-patrón detectado: Placeholder sin resolver'), 'Should detect TODO');
        assert.ok(output.includes('Anti-patrón detectado: No hay tareas activas'), 'Should detect empty tasks');
    });

    test('yapu swarm se muestra en el menu de ayuda en espanol e ingles', () => {
        // Spanish help
        const outputEs = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });
        assert.ok(outputEs.includes('yapu swarm'), 'Debería incluir el comando yapu swarm');
        assert.ok(outputEs.includes('Orquestación paralela de subagentes'), 'Debería incluir la descripción en español');

        // English help
        const outputEn = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });
        assert.ok(outputEn.includes('yapu swarm'), 'Should include yapu swarm command');
        assert.ok(outputEn.includes('Parallel orchestration of subagents'), 'Should include description in English');
    });

    test('yapu swarm falla elegantemente si no existe STATE.md', () => {
        const testDirSwarmFail = path.join(tempDir, 'yapu-swarm-fail');
        fs.mkdirSync(testDirSwarmFail, { recursive: true });

        try {
            execSync(`node ${cliPath} swarm`, {
                cwd: testDirSwarmFail,
                env: { ...process.env, YAPU_LANG: 'es' },
                encoding: 'utf8',
                stdio: 'pipe'
            });
            assert.fail('Should have failed');
        } catch (err) {
            assert.ok(err.stderr.includes('No se encontró STATE.md'), 'Debería indicar que no se encontró el archivo de estado');
        }
    });

    test('yapu swarm termina exitosamente si no hay tareas pendientes', () => {
        const testDirSwarmEmpty = path.join(tempDir, 'yapu-swarm-empty');
        fs.mkdirSync(testDirSwarmEmpty, { recursive: true });

        // Initialize first
        execSync(`node ${cliPath} init`, {
            cwd: testDirSwarmEmpty,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        // Set all tasks in STATE.md to completed [x]
        const statePath = path.join(testDirSwarmEmpty, '.planning', 'STATE.md');
        const stateContent = `# ESTADO ACTUAL

**FASE ACTIVA:** Fase de Diseño

## Tareas de la Fase Actual
- [x] **T1: Implement login**
  * Files: \`login.js\`
  * Dependency: none
`;
        fs.writeFileSync(statePath, stateContent, 'utf8');

        // Copy STATE.md to root
        fs.copyFileSync(statePath, path.join(testDirSwarmEmpty, 'STATE.md'));

        // Run yapu swarm
        const output = execSync(`node ${cliPath} swarm`, {
            cwd: testDirSwarmEmpty,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(output.includes('No se encontraron tareas pendientes para ejecutar.'), 'Debería reportar que no hay tareas pendientes');
    });

    test('yapu swarm detecta y lee PLAN.md si STATE.md no existe', () => {
        const testDirSwarmPlanFallback = path.join(tempDir, 'yapu-swarm-plan-fallback');
        fs.mkdirSync(testDirSwarmPlanFallback, { recursive: true });

        // Initialize first
        execSync(`node ${cliPath} init`, {
            cwd: testDirSwarmPlanFallback,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        // Delete STATE.md files
        fs.rmSync(path.join(testDirSwarmPlanFallback, '.planning', 'STATE.md'), { force: true });
        fs.rmSync(path.join(testDirSwarmPlanFallback, 'STATE.md'), { force: true });

        // Create .planning/PLAN.md with no pending tasks (all [x])
        const customPlanContent = `# PLAN DE TRABAJO

**FASE ACTIVA:** Fase de Pruebas

## Tareas de la Fase Actual
- [x] **T1: Implement something**
  * Files: \`somefile.txt\`
  * Dependency: none
`;
        const planPath = path.join(testDirSwarmPlanFallback, '.planning', 'PLAN.md');
        fs.writeFileSync(planPath, customPlanContent, 'utf8');

        // Run yapu swarm
        const output = execSync(`node ${cliPath} swarm`, {
            cwd: testDirSwarmPlanFallback,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(output.includes('No se encontraron tareas pendientes para ejecutar.'), 'Debería reportar que no hay tareas pendientes leyendo PLAN.md');
    });

    test('yapu swarm ejecuta tareas respetando concurrencia, dependencias y solapamiento de archivos', () => {
        const testDirSwarm = path.join(tempDir, 'yapu-swarm-exec');
        fs.mkdirSync(testDirSwarm, { recursive: true });

        // 1. Initialize git and yapu
        execSync('git init', { cwd: testDirSwarm, stdio: 'ignore' });
        execSync('git config user.name "Swarm Test"', { cwd: testDirSwarm, stdio: 'ignore' });
        execSync('git config user.email "swarm@yapu.cli"', { cwd: testDirSwarm, stdio: 'ignore' });

        execSync(`node ${cliPath} init`, {
            cwd: testDirSwarm,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        execSync('git add .', { cwd: testDirSwarm });
        execSync('git commit -m "initial commit"', { cwd: testDirSwarm, stdio: 'ignore' });

        // 2. Create mock bin/antigravity
        const mockBinDir = path.join(testDirSwarm, 'bin');
        fs.mkdirSync(mockBinDir, { recursive: true });
        const mockExePath = path.join(mockBinDir, 'antigravity');

        const mockExeContent = `#!/usr/bin/env node
const fs = require('fs');

let taskId = 'unknown';
for (const arg of process.argv) {
    if (arg.includes('task-') || arg.includes('T')) {
        const match = arg.match(/task-(T\\d+)|(T\\d+)/);
        if (match) {
            taskId = match[1] || match[2];
        }
    }
}

const logFilePath = process.env.SWARM_LOG_FILE;
if (logFilePath) {
    fs.appendFileSync(logFilePath, \`START:\${taskId}\\n\`, 'utf8');
}

// Touches files to mock changes
const fileArgs = [];
for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '-a') {
        fileArgs.push(process.argv[i+1]);
    }
}

fileArgs.forEach(f => {
    try {
        fs.writeFileSync(f, 'modified by subagent', 'utf8');
    } catch (e) {}
});

const delay = parseInt(process.env.SWARM_DELAY || '100', 10);
setTimeout(() => {
    if (logFilePath) {
        fs.appendFileSync(logFilePath, \`END:\${taskId}\\n\`, 'utf8');
    }
    process.exit(0);
}, delay);
`;

        fs.writeFileSync(mockExePath, mockExeContent, 'utf8');
        fs.chmodSync(mockExePath, 0o755);

        if (process.platform === 'win32') {
            fs.writeFileSync(mockExePath + '.cmd', `@node "${mockExePath}" %*`, 'utf8');
        }

        // Create the files that will be touched by tasks so spawn doesn't fail
        fs.writeFileSync(path.join(testDirSwarm, 'file1.txt'), 'content', 'utf8');
        fs.writeFileSync(path.join(testDirSwarm, 'file2.txt'), 'content', 'utf8');
        fs.writeFileSync(path.join(testDirSwarm, 'shared.txt'), 'content', 'utf8');
        execSync('git add .', { cwd: testDirSwarm });
        execSync('git commit -m "add files"', { cwd: testDirSwarm, stdio: 'ignore' });

        // 3. Create STATE.md with T1, T2, T3, T4
        const statePath = path.join(testDirSwarm, '.planning', 'STATE.md');
        const stateContent = `# ESTADO ACTUAL

**FASE ACTIVA:** Fase de Pruebas

## Tareas de la Fase Actual
- [ ] **T1: Task One**
  * Files: \`file1.txt\`
  * Dependency: none
- [ ] **T2: Task Two**
  * Files: \`file2.txt\`
  * Dependency: \`T1\`
- [ ] **T3: Task Three**
  * Files: \`shared.txt\`
  * Dependency: none
- [ ] **T4: Task Four**
  * Files: \`shared.txt\`
  * Dependency: none
`;
        fs.writeFileSync(statePath, stateContent, 'utf8');
        fs.copyFileSync(statePath, path.join(testDirSwarm, 'STATE.md'));

        // 4. Run yapu swarm with mock executable in PATH
        const logFilePath = path.join(testDirSwarm, 'swarm.log');
        const newPath = mockBinDir + path.delimiter + process.env.PATH;

        const output = execSync(`node ${cliPath} swarm`, {
            cwd: testDirSwarm,
            env: {
                ...process.env,
                PATH: newPath,
                SWARM_LOG_FILE: logFilePath,
                SWARM_DELAY: '150',
                YAPU_LANG: 'es'
            },
            encoding: 'utf8'
        });

        // Verify output messages
        assert.ok(output.includes('Iniciando Yapu Swarm'), 'Should output swarm initiation message');
        assert.ok(output.includes('¡Todas las tareas se completaron exitosamente!'), 'Should output final success summary');

        // 5. Read swarm.log and assert sequence
        assert.ok(fs.existsSync(logFilePath), 'swarm.log should exist');
        const logContent = fs.readFileSync(logFilePath, 'utf8');
        const events = logContent.split('\n').filter(Boolean);

        console.log('Swarm log events:', events);

        // Find positions
        const t1Start = events.indexOf('START:T1');
        const t1End = events.indexOf('END:T1');
        const t2Start = events.indexOf('START:T2');
        const t2End = events.indexOf('END:T2');
        const t3Start = events.indexOf('START:T3');
        const t3End = events.indexOf('END:T3');
        const t4Start = events.indexOf('START:T4');
        const t4End = events.indexOf('END:T4');

        // Assert T2 starts after T1 ends
        assert.ok(t1Start < t1End, 'T1 end after start');
        assert.ok(t1End < t2Start, 'T2 must start after T1 ends');
        assert.ok(t2Start < t2End, 'T2 end after start');

        // Assert T3 and T4 do not overlap (since both touch shared.txt, one must end before the other starts)
        const t3T4Overlap = (t3Start < t4End && t4Start < t3End);
        assert.ok(!t3T4Overlap, 'T3 and T4 must not run concurrently due to file overlap');
    });

    test('yapu snapshot y yapu rewind funcionan perfectamente en conjunto', () => {
        const testDirTravel = path.join(tempDir, 'yapu-time-travel');
        fs.mkdirSync(testDirTravel, { recursive: true });

        // Initialize git
        execSync('git init', { cwd: testDirTravel, stdio: 'ignore' });
        execSync('git config user.name "Yapu Test"', { cwd: testDirTravel, stdio: 'ignore' });
        execSync('git config user.email "test@yapu.cli"', { cwd: testDirTravel, stdio: 'ignore' });

        // Initialize yapu
        execSync(`node ${cliPath} init`, {
            cwd: testDirTravel,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        // Commit initial state
        execSync('git add .', { cwd: testDirTravel });
        execSync('git commit -m "initial commit"', { cwd: testDirTravel, stdio: 'ignore' });

        // 1. Create a custom file in .planning/
        const customFilePath = path.join(testDirTravel, '.planning', 'custom-memory.md');
        fs.writeFileSync(customFilePath, 'Original Context Memory', 'utf8');

        // 2. Take a snapshot
        const snapshotOut = execSync(`node ${cliPath} snapshot`, {
            cwd: testDirTravel,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });
        assert.ok(snapshotOut.includes('Snapshot del contexto creado con éxito'), 'Should output success message');

        // Verify snapshot file exists
        const snapshotsDir = path.join(testDirTravel, '.planning', '.snapshots');
        assert.ok(fs.existsSync(snapshotsDir), '.snapshots dir should exist');
        const files = fs.readdirSync(snapshotsDir);
        assert.strictEqual(files.length, 1, 'Should have exactly 1 snapshot file');
        assert.ok(files[0].startsWith('snapshot-') && files[0].endsWith('.json.gz'), 'Filename should match pattern');

        // 3. Make a breaking code change, commit it, and corrupt the context
        const codeFilePath = path.join(testDirTravel, 'code.js');
        fs.writeFileSync(codeFilePath, 'console.log("bad code");', 'utf8');
        execSync('git add code.js', { cwd: testDirTravel });
        execSync('git commit -m "breaking commit"', { cwd: testDirTravel, stdio: 'ignore' });

        fs.writeFileSync(customFilePath, 'Corrupted Context Memory', 'utf8');

        // 4. Run yapu rewind (piping 's' or 'y' for confirmation)
        const rewindOut = execSync(`echo s | node ${cliPath} rewind`, {
            cwd: testDirTravel,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(rewindOut.includes('Restaurando archivos de contexto'), 'Should output restoration status');
        assert.ok(rewindOut.includes('Sincronizando código en Git al commit'), 'Should output git restoration status');
        assert.ok(rewindOut.includes('Time-Travel completado con éxito'), 'Should output final success');

        // 5. Verify both git code and context memory were restored
        assert.ok(!fs.existsSync(codeFilePath), 'git code should be rewound (code.js should not exist)');
        const restoredContent = fs.readFileSync(customFilePath, 'utf8');
        assert.strictEqual(restoredContent, 'Original Context Memory', 'Context memory file should be restored to original state');
    });

    test('yapu profile se muestra en el menu de ayuda en espanol e ingles', () => {
        // Spanish help
        const outputEs = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });
        assert.ok(outputEs.includes('yapu profile'), 'Debería incluir el comando yapu profile');
        assert.ok(outputEs.includes('Diagnóstico de volumen y tokens'), 'Debería incluir la descripción en español');

        // English help
        const outputEn = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });
        assert.ok(outputEn.includes('yapu profile'), 'Should include yapu profile command');
        assert.ok(outputEn.includes('Diagnostics of context volume and tokens'), 'Should include description in English');
    });

    test('yapu profile escanea archivos y calcula el volumen de tokens correctamente', () => {
        const testDirProfile = path.join(tempDir, 'yapu-profile-test');
        fs.mkdirSync(testDirProfile, { recursive: true });

        // Initialize yapu in clean repo
        execSync(`node ${cliPath} init`, {
            cwd: testDirProfile,
            env: { ...process.env, YAPU_LANG: 'es' }
        });

        // Run profile on clean repo
        const outputClean = execSync(`node ${cliPath} profile`, {
            cwd: testDirProfile,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(outputClean.includes('YAPU CONTEXT PROFILER'), 'Should print profiler title');
        assert.ok(outputClean.includes('Archivo / Categoría'), 'Should print table headers in Spanish');
        assert.ok(outputClean.includes('PROJECT.md'), 'Should list PROJECT.md');
        assert.ok(outputClean.includes('ROADMAP.md'), 'Should list ROADMAP.md');
        assert.ok(outputClean.includes('STATE.md'), 'Should list STATE.md');
        assert.ok(outputClean.includes('[ PESO TOTAL DEL CONTEXTO ]'), 'Should print cumulative context weight');
        assert.ok(outputClean.includes('OK'), 'Should print status OK');
        assert.ok(outputClean.includes('colonia está esbelta y ágil'), 'Should recommend lean status');

        // Add a giant mock file in .planning/phases/bloated.md (e.g. 50KB = 51200 characters)
        const phasesDir = path.join(testDirProfile, '.planning', 'phases');
        fs.mkdirSync(phasesDir, { recursive: true });

        const giantContent = 'A'.repeat(51200); // 50 KB -> Math.ceil(51200/4) = 12800 tokens (> 10000 -> CRITICAL)
        fs.writeFileSync(path.join(phasesDir, 'bloated-phase-with-a-very-long-name-to-test-truncation.md'), giantContent, 'utf8');

        // Run profile on bloated repo
        const outputBloated = execSync(`node ${cliPath} profile`, {
            cwd: testDirProfile,
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });

        assert.ok(outputBloated.includes('CRITICAL 🚨'), 'Should print status CRITICAL');
        assert.ok(outputBloated.includes('ALERTA CRÍTICA DE CONTEXTO'), 'Should recommend immediate gc or archive');
        assert.ok(outputBloated.includes('...-long-name-to-test-truncation.md'), 'Should truncate long file names using middle-ellipsis');
    });

    test('yapu daemon se muestra en el menu de ayuda en espanol e ingles', () => {
        // Spanish help
        const outputEs = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });
        assert.ok(outputEs.includes('yapu daemon'), 'Debería incluir el comando yapu daemon');
        assert.ok(outputEs.includes('Sincroniza en tiempo real'), 'Debería incluir la descripción en español');

        // English help
        const outputEn = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });
        assert.ok(outputEn.includes('yapu daemon'), 'Should include yapu daemon command');
        assert.ok(outputEn.includes('Synchronizes AI Brain artifacts in real-time'), 'Should include description in English');
    });

    test('yapu daemon y yapu watch sincronizan en tiempo real', async () => {
        const testDirDaemon = path.join(tempDir, 'yapu-daemon-test');
        fs.mkdirSync(testDirDaemon, { recursive: true });

        // Initialize yapu in clean repo
        execSync(`node ${cliPath} init`, {
            cwd: testDirDaemon,
            env: { ...process.env, YAPU_LANG: 'es' }
        });

        const mockBrainDir = path.join(testDirDaemon, 'mock-brain');
        fs.mkdirSync(mockBrainDir, { recursive: true });

        // Spawn the daemon watching mockBrainDir
        const { spawn } = await import('node:child_process');
        const daemonProcess = spawn('node', [cliPath, 'daemon', '--brain-path', mockBrainDir], {
            cwd: testDirDaemon,
            env: { ...process.env, YAPU_LANG: 'es' },
            stdio: 'pipe'
        });

        // Let the daemon start and print its watching status
        let daemonOutput = '';
        daemonProcess.stdout.on('data', (data) => {
            daemonOutput += data.toString();
        });

        // Wait until the daemon prints that it's watching (event-driven, not fixed timeout)
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Daemon startup timeout')), 5000);
            const check = () => {
                if (daemonOutput.includes('Observando cambios en')) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            daemonProcess.stdout.on('data', check);
            check(); // Check if already received
        });

        // Create an artifact in mockBrainDir
        const mdPath = path.join(mockBrainDir, 'implementation_plan.md');
        const metaPath = path.join(mockBrainDir, 'implementation_plan.md.metadata.json');

        const planContent = '# Real-time Plan Content';
        const planMeta = JSON.stringify({
            artifactType: 'implementation_plan',
            summary: 'A plan written in real-time',
            updatedAt: new Date().toISOString()
        });

        fs.writeFileSync(mdPath, planContent, 'utf8');
        fs.writeFileSync(metaPath, planMeta, 'utf8');

        // Wait for the debounced sync (300ms debounce + generous padding for CI)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Stop the daemon process cleanly
        daemonProcess.kill('SIGINT');

        // Verify that the plan was successfully synchronized to .planning/current-plan.md
        const destPath = path.join(testDirDaemon, '.planning', 'current-plan.md');
        assert.ok(fs.existsSync(destPath), 'current-plan.md should have been synced');
        assert.strictEqual(fs.readFileSync(destPath, 'utf8'), planContent, 'content should match');

        // Also assert that the CLI printed the sync message
        assert.ok(daemonOutput.includes('Iniciando Yapu Daemon'), 'Should print startup');
        assert.ok(daemonOutput.includes('Observando cambios en'), 'Should print watching directory');
        assert.ok(daemonOutput.includes('Artefacto "implementation_plan" sincronizado con éxito'), 'Should print sync confirmation');
    });

    test('yapu branch y yapu merge se muestran en el menu de ayuda en espanol e ingles', () => {
        // Spanish help
        const outputEs = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'es' },
            encoding: 'utf8'
        });
        assert.ok(outputEs.includes('yapu branch'), 'Debería incluir el comando yapu branch');
        assert.ok(outputEs.includes('yapu merge'), 'Debería incluir el comando yapu merge');
        assert.ok(outputEs.includes('Crea, cambia o lista ramas del multiverso'), 'Debería incluir la descripción de branch en español');
        assert.ok(outputEs.includes('Fusiona código y semánticamente el contexto'), 'Debería incluir la descripción de merge en español');

        // English help
        const outputEn = execSync(`node ${cliPath} --help`, {
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });
        assert.ok(outputEn.includes('yapu branch'), 'Should include yapu branch command');
        assert.ok(outputEn.includes('yapu merge'), 'Should include yapu merge command');
        assert.ok(outputEn.includes('Creates, switches, or lists context multiverse'), 'Should include branch description in English');
        assert.ok(outputEn.includes('Merges code and semantically unifies'), 'Should include merge description in English');
    });

    test('yapu branch previene cambiar de rama si hay cambios sin confirmar en Git', () => {
        const testDirDirty = path.join(tempDir, 'yapu-dirty-test');
        fs.mkdirSync(testDirDirty, { recursive: true });

        // Init git
        execSync('git init', { cwd: testDirDirty });
        execSync('git config user.name "Yapu Test"', { cwd: testDirDirty });
        execSync('git config user.email "test@yapu.io"', { cwd: testDirDirty });

        // Init yapu
        execSync(`node ${cliPath} init`, {
            cwd: testDirDirty,
            env: { ...process.env, YAPU_LANG: 'es' }
        });

        // Commit initial files
        execSync('git add .', { cwd: testDirDirty });
        execSync('git commit -m "initial commit"', { cwd: testDirDirty });

        // Create a dirty change
        fs.writeFileSync(path.join(testDirDirty, 'PROJECT.md'), 'dirty content', 'utf8');

        // Attempt branch switch and expect failure
        assert.throws(() => {
            execSync(`node ${cliPath} branch my-feature`, {
                cwd: testDirDirty,
                env: { ...process.env, YAPU_LANG: 'es' },
                stdio: 'pipe'
            });
        }, /Tienes cambios sin confirmar/);
    });

    test('yapu branch cambia, guarda y restaura el contexto del multiverso', () => {
        const testDirBranch = path.join(tempDir, 'yapu-multiverse-branch-test');
        fs.mkdirSync(testDirBranch, { recursive: true });

        // Init git
        execSync('git init', { cwd: testDirBranch });
        execSync('git config user.name "Yapu Test"', { cwd: testDirBranch });
        execSync('git config user.email "test@yapu.io"', { cwd: testDirBranch });
        execSync('git config commit.gpgsign false', { cwd: testDirBranch });

        // Init yapu
        execSync(`node ${cliPath} init`, {
            cwd: testDirBranch,
            env: { ...process.env, YAPU_LANG: 'en' }
        });

        // Create an initial commit on master/main
        execSync('git checkout -b main', { cwd: testDirBranch, stdio: 'pipe' });
        execSync('git add .', { cwd: testDirBranch });
        execSync('git commit -m "Initial commit on main"', { cwd: testDirBranch });

        // Now create a custom file in the main context
        const mainPlanningDir = path.join(testDirBranch, '.planning');
        fs.writeFileSync(path.join(mainPlanningDir, 'main-only.txt'), 'hello main', 'utf8');

        // Switch context/branch using yapu branch to experiment-1
        const switchOutput = execSync(`node ${cliPath} branch experiment-1`, {
            cwd: testDirBranch,
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });

        assert.ok(switchOutput.includes('Synchronizing context multiverse'), 'Should start sync');
        assert.ok(switchOutput.includes('Saved context state for branch "main"'), 'Should save current');
        assert.ok(switchOutput.includes('Activated Git branch "experiment-1"'), 'Should checkout experimental');

        // Inside experiment-1, the inherited file exists. Let's delete it and create an experimental file!
        const mainOnlyFile = path.join(mainPlanningDir, 'main-only.txt');
        if (fs.existsSync(mainOnlyFile)) {
            fs.unlinkSync(mainOnlyFile);
        }
        fs.writeFileSync(path.join(mainPlanningDir, 'exp-only.txt'), 'hello experiment', 'utf8');

        // Commit the experimental code change to make Git happy
        execSync('git add .', { cwd: testDirBranch });
        execSync('git commit -m "Commit on experiment"', { cwd: testDirBranch });

        // Switch back to main
        const backOutput = execSync(`node ${cliPath} branch main`, {
            cwd: testDirBranch,
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });

        assert.ok(backOutput.includes('Saved context state for branch "experiment-1"'), 'Should save current experimental context');
        assert.ok(backOutput.includes('Restored context state for branch "main"'), 'Should restore main context');

        // Verify main context is restored: main-only.txt exists, exp-only.txt is deleted!
        assert.ok(fs.existsSync(path.join(mainPlanningDir, 'main-only.txt')), 'main-only.txt should be restored');
        assert.ok(!fs.existsSync(path.join(mainPlanningDir, 'exp-only.txt')), 'exp-only.txt should not leak to main');

        // Switch to experiment-1 again
        execSync(`node ${cliPath} branch experiment-1`, {
            cwd: testDirBranch,
            env: { ...process.env, YAPU_LANG: 'en' }
        });

        // Verify experimental context is restored: main-only.txt is deleted, exp-only.txt exists!
        assert.ok(!fs.existsSync(path.join(mainPlanningDir, 'main-only.txt')), 'main-only.txt should be gone on experimental branch');
        assert.ok(fs.existsSync(path.join(mainPlanningDir, 'exp-only.txt')), 'exp-only.txt should be restored');
    });

    test('yapu merge fusiona codigo, tareas, aprendizajes y archivos custom del multiverso', () => {
        const testDirMerge = path.join(tempDir, 'yapu-multiverse-merge-test');
        fs.mkdirSync(testDirMerge, { recursive: true });

        // Init git
        execSync('git init', { cwd: testDirMerge });
        execSync('git config user.name "Yapu Test"', { cwd: testDirMerge });
        execSync('git config user.email "test@yapu.io"', { cwd: testDirMerge });
        execSync('git config commit.gpgsign false', { cwd: testDirMerge });

        // Init yapu
        execSync(`node ${cliPath} init`, {
            cwd: testDirMerge,
            env: { ...process.env, YAPU_LANG: 'en' }
        });

        // Ensure active branch is main
        execSync('git checkout -b main', { cwd: testDirMerge, stdio: 'pipe' });

        // Modify STATE.md in main with some tasks
        const statePath = path.join(testDirMerge, 'STATE.md');
        fs.writeFileSync(statePath, [
            '# STATE',
            '- [ ] Task 1: Complete the core system setup',
            '- [ ] Task 2: Setup internationalization support',
            '- [ ] Task 3: Implement multithreaded routing'
        ].join('\n'), 'utf8');

        // Commit main files
        execSync('git add .', { cwd: testDirMerge });
        execSync('git commit -m "Setup main branch state"', { cwd: testDirMerge });

        // Switch to experiment-2 using yapu branch
        execSync(`node ${cliPath} branch experiment-2`, {
            cwd: testDirMerge,
            env: { ...process.env, YAPU_LANG: 'en' }
        });

        // In experiment-2, complete Task 1 and Task 2, and add a learning file and a custom sketch file
        fs.writeFileSync(statePath, [
            '# STATE',
            '- [x] Task 1: Complete the core system setup',
            '- [x] Task 2: Setup internationalization support',
            '- [ ] Task 3: Implement multithreaded routing'
        ].join('\n'), 'utf8');

        // Create yapu-learnings.md
        fs.writeFileSync(path.join(testDirMerge, 'yapu-learnings.md'), [
            '# Learnings',
            '- Learning 1: Found out that zlib gzip is super fast.',
            '- Learning 2: Git porcelain status is perfect for dirty checks.'
        ].join('\n'), 'utf8');

        // Create a custom sketch planning file
        const sketchDir = path.join(testDirMerge, '.planning', 'phases');
        fs.mkdirSync(sketchDir, { recursive: true });
        fs.writeFileSync(path.join(sketchDir, 'experiment-sketch.md'), 'My sketch notes', 'utf8');

        // Commit experiment-2 changes
        execSync('git add .', { cwd: testDirMerge });
        execSync('git commit -m "Complete experiments"', { cwd: testDirMerge });

        // Switch back to main using yapu branch
        execSync(`node ${cliPath} branch main`, {
            cwd: testDirMerge,
            env: { ...process.env, YAPU_LANG: 'en' }
        });

        // Now merge experiment-2 into main using yapu merge
        const mergeOutput = execSync(`node ${cliPath} merge experiment-2`, {
            cwd: testDirMerge,
            env: { ...process.env, YAPU_LANG: 'en' },
            encoding: 'utf8'
        });

        assert.ok(mergeOutput.includes('Initiating multiverse merge (branch "experiment-2")'), 'Should start merge output');
        assert.ok(mergeOutput.includes('Updated 2 completed tasks in STATE.md'), 'Should report 2 completed tasks updated');
        assert.ok(mergeOutput.includes('Integrated new learnings in yapu-learnings.md'), 'Should report learnings integrated');
        assert.ok(mergeOutput.includes('Merge completed successfully!'), 'Should report successful merge');

        // Verify task checking in active STATE.md
        const activeStateContent = fs.readFileSync(statePath, 'utf8');
        assert.ok(activeStateContent.includes('- [x] Task 1: Complete'), 'Task 1 should be checked off');
        assert.ok(activeStateContent.includes('- [x] Task 2: Setup'), 'Task 2 should be checked off');
        assert.ok(activeStateContent.includes('- [ ] Task 3: Implement'), 'Task 3 should remain pending');

        // Verify learnings harvesting in active yapu-learnings.md
        const activeLearningsPath = path.join(testDirMerge, 'yapu-learnings.md');
        assert.ok(fs.existsSync(activeLearningsPath), 'yapu-learnings.md should exist');
        const activeLearningsContent = fs.readFileSync(activeLearningsPath, 'utf8');
        assert.ok(activeLearningsContent.includes('## 🧪 Learnings from Experiment: experiment-2'), 'Should include dedicated header');
        assert.ok(activeLearningsContent.includes('- Learning 1:'), 'Should include experimental learning 1');

        // Verify custom sketch copy
        const copiedSketchFile = path.join(sketchDir, 'experiment-sketch.md');
        assert.ok(fs.existsSync(copiedSketchFile), 'Custom sketch file should have been copied over');
        assert.strictEqual(fs.readFileSync(copiedSketchFile, 'utf8'), 'My sketch notes');

        // Verify context state file of experiment-2 is deleted/cleaned up
        const stateFile = path.join(testDirMerge, '.planning', '.branches', 'branch-experiment-2.json.gz');
        assert.ok(!fs.existsSync(stateFile), 'Source branch state file should be deleted');
    });
});

