import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
            env: { ...process.env, HOME: mockHome },
            encoding: 'utf8'
        });

        assert.ok(output.includes('Active brain auto-detected'));
        assert.ok(output.includes('uuid-newer'));
    });

    test('yapu menu ejecuta de forma no interactiva fuera de TTY', () => {
        const output = execSync(`node ${cliPath} menu`, {
            cwd: tempDir,
            encoding: 'utf8'
        });

        assert.ok(output.includes('YAPUCLI COMMAND MENU (Modo No Interactivo)'));
        assert.ok(output.includes('Sincronizar Colonia (yapu sync)'));
        assert.ok(output.includes('Diagnóstico de Salud (yapu health)'));
    });

    test('yapu dashboard ejecuta de forma no interactiva fuera de TTY (alias)', () => {
        const output = execSync(`node ${cliPath} dashboard`, {
            cwd: tempDir,
            encoding: 'utf8'
        });

        assert.ok(output.includes('YAPUCLI COMMAND MENU (Modo No Interactivo)'));
        assert.ok(output.includes('Sincronizar Colonia (yapu sync)'));
        assert.ok(output.includes('Diagnóstico de Salud (yapu health)'));
    });
});
