import fs from 'node:fs';
import path from 'node:path';
import { t } from '../i18n.js';

export async function run({ targetDir, activeLang, cleanArgs }) {
    console.log(t('rescue_start'));
    const logFile = cleanArgs[1];
    
    if (!logFile) {
        console.error(t('rescue_no_log'));
        process.exit(1);
    }

    const logPath = path.resolve(targetDir, logFile);
    if (!fs.existsSync(logPath)) {
        console.error(`❌ Error: File not found: ${logPath}`);
        process.exit(1);
    }

    const logContent = fs.readFileSync(logPath, 'utf8');

    const planningDir = path.join(targetDir, '.planning');
    const debugDir = path.join(planningDir, 'debug');
    if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const rescueTaskPath = path.join(debugDir, `RESCUE_${timestamp}.md`);

    const rescuePrompt = activeLang === 'es' ?
`# GUARDIÁN DE PRODUCCIÓN: Auto-Heal (Rescue)

Un fallo en CI/CD ha sido detectado. El archivo de log de error ha sido inyectado abajo.

## Tu Tarea
1. Analiza el log de error de CI/CD.
2. Formula una hipótesis de por qué fallaron los tests o el build.
3. Modifica el código fuente localmente para solucionar el error.
4. Ejecuta las pruebas localmente usando comandos de terminal para validar tu solución.
5. Haz un reporte rápido de qué cambiaste.

## Log de Error
\`\`\`
${logContent.substring(0, 5000)} // Truncated to 5000 chars for context size
\`\`\`

**[ INICIAR ]**: Comienza inmediatamente el análisis y soluciona el problema.
` : 
`# PRODUCTION GUARDIAN: Auto-Heal (Rescue)

A CI/CD failure has been detected. The error log file has been injected below.

## Your Task
1. Analyze the CI/CD error log.
2. Formulate a hypothesis for why the tests or build failed.
3. Modify the source code locally to fix the error.
4. Run tests locally using terminal commands to validate your solution.
5. Provide a quick report of what you changed.

## Error Log
\`\`\`
${logContent.substring(0, 5000)} // Truncated to 5000 chars for context size
\`\`\`

**[ START ]**: Begin analysis immediately and fix the issue.
`;

    fs.writeFileSync(rescueTaskPath, rescuePrompt, 'utf8');
    console.log(t('rescue_session_created', { path: rescueTaskPath }));
}
