# Contexto - YapuCli

> **Formato**: este documento es legible por máquina. Cada hecho operacional es un
> predicado de una sola línea (`CLASS.subkey=value`). Los briefs del agente citan predicados
> por ID textualmente — nunca parafrasee de este archivo.

## 1. Arquitectura Central y Tríada de Memoria

YAPU.architecture.core=Yapu es un framework ligero de ingeniería de contexto para Antigravity CLI diseñado para prevenir el desgaste de contexto.
YAPU.architecture.memory-triad=Yapu estructura el contexto usando una tríada de tres archivos estáticos: PROJECT.md, ROADMAP.md y STATE.md en la raíz del proyecto.
YAPU.architecture.project-md=PROJECT.md define la visión del proyecto, el stack tecnológico y reglas estrictas de arquitectura. Es permanente y cambia raramente.
YAPU.architecture.roadmap-md=ROADMAP.md define las fases secuenciales del proyecto. El enfoque del desarrollo se restringe a una sola fase activa a la vez.
YAPU.architecture.state-md=STATE.md almacena el estado de ejecución a corto plazo, incluyendo el nombre de la fase activa, tareas técnicas precisas y notas de ejecución.
YAPU.architecture.system-directive=La directiva execute.md en .antigravity/workflows/execute.md sirve como prompt operacional del sistema para el agente.
YAPU.architecture.state-machine-flag=STATE.md contiene una bandera de modo operacional que rastrea si el contexto actual es PLANIFICACIÓN, EJECUCIÓN, VERIFICACIÓN o FORENSE.

## 2. Herramientas CLI y Comandos

YAPU.cli.executable=El comando CLI global o local se llama `yapu` y está definido en `bin/cli.js`.
YAPU.cli.init-command=Ejecutar `yapu init` copia las plantillas (PROJECT.md, ROADMAP.md, STATE.md) y 10 directivas de flujo de trabajo al espacio de trabajo del usuario.
YAPU.cli.overwrite-protection=El comando `yapu init` nunca sobrescribe los archivos de destino existentes para evitar la pérdida de datos.
YAPU.cli.status-command=Ejecutar `yapu status` analiza STATE.md e informa el modo activo, el nombre de la fase, la lista de tareas y el estado de las Specs.
YAPU.cli.archive-command=Ejecutar `yapu archive` mueve programáticamente las tareas completadas [x] de STATE.md a HISTORY.md y reinicia el bloque de tareas.
YAPU.cli.install-hooks-command=Ejecutar `yapu install-hooks` despliega Yapu Guard en .git/hooks/pre-commit con permisos de ejecución.
YAPU.cli.yapu-guard=Yapu Guard es un script pre-commit de Node.js nativo que escanea los archivos en el área de preparación (stage) contra los mandamientos arquitectónicos de PROJECT.md.
YAPU.cli.provider-command=Ejecutar `yapu provider` muestra un diagnóstico de todos los proveedores IA CLI detectados (Antigravity, Claude Code, Codex) con estado de instalación, rutas de datos y proveedor activo.
YAPU.cli.multi-provider=Yapu soporta múltiples proveedores IA CLI mediante `lib/providers.js`. El proveedor activo se resuelve por prioridad: config explícita > auto-detección (ejecutable + datos) > default (antigravity).

## 3. Flujo de Trabajo y Reglas de Ejecución de Prompts de Sistema

YAPU.workflow.focus=El agente solo debe trabajar en la tarea activa marcada como pendiente `[ ]` en STATE.md.
YAPU.workflow.skills=El agente utiliza sus herramientas nativas de Antigravity CLI (por ejemplo, leer, escribir, ejecutar comandos) para completar las tareas.
YAPU.workflow.verification=Todo el código debe validarse con pruebas y compilarse localmente antes de completar cualquier tarea.
YAPU.workflow.completion=Cuando se completa una tarea, el agente la marca como completa `[x]` en STATE.md y borra los registros temporales de ejecución.
YAPU.workflow.state-guard=La plantilla del flujo de ejecución (yapu-execute.md) impone la verificación del modo operacional, abortando inmediatamente la ejecución ante desajustes de estado.
YAPU.workflow.squads=Los flujos de trabajo activos incluyen escuadras especializadas (secops, dba, ui, forensics) con límites de comportamiento estrictamente definidos.
