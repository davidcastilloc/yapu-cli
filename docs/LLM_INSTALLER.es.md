# YAPU-CLI: Instalador y Onboarding para LLMs

Eres un asistente de programación IA (Cursor, Cline, Windsurf, Antigravity, etc.). Tu usuario quiere que instales e inicialices el framework **YapuCli** en este proyecto para gestionar tu contexto, tu memoria a largo plazo y tu carga cognitiva de forma eficiente.

## Tarea 1: Instalación
Ejecuta el siguiente comando en la terminal para instalar YapuCli globalmente:
```bash
npm install -g yapu-cli
```
*(Si no tienes permisos globales, puedes usar directamente `npx yapu-cli` en los siguientes pasos).*

## Tarea 2: Inicialización
Ejecuta el comando de inicialización en la raíz de este proyecto:
```bash
yapu init
```
Esto creará el ecosistema de memoria (la carpeta `.planning/` y los archivos maestros).

## Tarea 3: Asimilación de Reglas
Una vez inicializado, lee los archivos `PROJECT.md`, `ROADMAP.md` y `STATE.md` generados en la raíz del proyecto. Desde este momento, **debes acatar estrictamente** las siguientes directivas:

1. **Memoria Continua:** Mantén el archivo `STATE.md` actualizado constantemente. Marca las tareas con `[x]` cuando las termines y `[/]` cuando estés trabajando en ellas.
2. **Archivado de Fases:** Cuando termines todas las tareas de la "Fase Actual" del `ROADMAP.md`, ejecuta `yapu archive` en la terminal para limpiar la memoria a corto plazo.
3. **Rescate (Auto-Heal):** Si el usuario te indica que mires un error de CI/CD, busca el archivo `.planning/debug/RESCUE_*.md` generado por Yapu y sigue sus instrucciones.
4. **Context GC:** Si el usuario te indica ejecutar un `LORE_MASTER.md`, léelo de `.planning/tasks/LORE_MASTER.md` y condensa el contexto masivo en `.planning/LORE.md`.

## Tarea 4: Persistencia del Agente
Para garantizar que nunca olvides estas directivas en futuras sesiones, **crea el archivo de reglas correspondiente a tu sistema** en la raíz del proyecto (ej. `.cursorrules` si eres Cursor, `.windsurfrules` si eres Windsurf, `.clinerules` si eres Cline).
El contenido del archivo debe ser:
`Siempre lee .planning/STATE.md y .planning/ROADMAP.md al inicio de cada tarea. Mantén el estado actualizado y marca los checkboxes con [x]. Si hay un log de error, usa yapu rescue.`

*(Nota especial de ecosistema: Si eres Antigravity o Antigravity-CLI, cuentas con soporte de primera clase. Usa tu sistema nativo de artefactos y los comandos `yapu sync`/`yapu brain` para mantener el control total de la memoria profunda del proyecto).*

## Tarea Final: Reporte
Responde a tu usuario confirmando que **YapuCli ha sido instalado**, que **has creado tu archivo de reglas (.cursorrules/.windsurfrules/etc)** y que has asimilado las reglas de memoria estática. Aconséjale que abra una segunda terminal y ejecute `yapu dash` para que vea tu progreso en tiempo real.
