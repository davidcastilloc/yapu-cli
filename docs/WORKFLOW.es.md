# The Vibe Coder Workflow (Guía de Uso de YapuCli)

Para los **"vibe coders"** —desarrolladores que fluyen y construyen a base de prompts y asistencia de IA usando herramientas como Cursor, Windsurf, o Cline— YapuCli es el exoesqueleto perfecto. Su objetivo principal es quitarte de encima la carga mental de organizar el contexto, permitiéndote concentrarte únicamente en la creatividad y la lógica de negocio (el *vibe*).

A continuación, se detalla el ciclo de desarrollo diario utilizando la suite completa de comandos de Yapu.


> [!TIP]
> Cada fase del workflow está diseñada para ser ejecutada por tu IA. Tu rol es supervisar, validar y ajustar — no escribir código manualmente.

---

## 1. El Arranque (Setup Mental)

Al iniciar un nuevo proyecto o feature, en lugar de perder 1 hora escribiendo prompts larguísimos para que la IA entienda las reglas de tu arquitectura, simplemente abres la terminal en tu directorio vacío y ejecutas:

```termynal
npx yapu-cli init
```

### ¿Qué sucede detrás de escena?
Yapu funda la "colonia" creando la estructura de directorios en `.planning/`. Automáticamente clona los mandamientos aprendidos de proyectos anteriores (Hive Mind) y deja los archivos `ROADMAP.md` y `STATE.md` listos en la raíz para ser poblados.

### El "Vibe"
No tienes que explicarle nada a tu IA. Simplemente le dices a tu agente: *"Lee el `PROJECT.md`, analiza mi idea inicial y estructura la Fase 1 en el `ROADMAP.md`"*. La IA ya sabrá exactamente dónde y cómo escribir.

---

## 2. Entrando en la "Zona" (Monitor en Tiempo Real)

A medida que tu agente empieza a escribir código, leer archivos y proponer cambios, puedes perder fácilmente la noción de en qué tarea exacta está trabajando la IA o qué porcentaje de la fase se ha completado.

Abre una terminal secundaria (idealmente en un monitor anexo) y ejecuta:

```termynal
yapu dash
```

### ¿Qué sucede detrás de escena?
Yapu dibuja un panel de control interactivo (TUI) sin usar dependencias externas. Este panel se divide en áreas lógicas:
- **Arriba:** Barra de progreso basada en los checkboxes del `ROADMAP.md`.
- **Izquierda:** Tareas pendientes y completadas extraídas de `STATE.md`.
- **Derecha:** Logs de actividad en vivo interceptados desde el cerebro de la IA.

### El "Vibe"
Sientes el progreso fluyendo visualmente como si estuvieras en la matrix. Te permite supervisar a tu agente de un vistazo rápido sin tener que abrir los archivos de markdown manualmente para ver qué tachó.

---

## 3. Pánico en Producción (Auto-Heal)

Has pusheado tu código a la rama `main` y te vas a tomar un café. Sin embargo, tu pipeline de CI/CD (GitHub Actions) falla porque faltaba una variable de entorno o un test asíncrono no se manejó bien.

### ¿Qué sucede detrás de escena?
El pipeline tiene pre-instalado el flujo `yapu-heal.yml`. Al detectar el fallo en `npm test`, vuelca el error y ejecuta automáticamente `yapu rescue error.log`. Esto crea de inmediato una sesión de rescate en `.planning/debug/RESCUE_YYYY-MM-DD.md` con todo el log formateado y las instrucciones para corregirlo.

### El "Vibe"
Vuelves con tu café y recibes la notificación de fallo. En lugar de ponerte a debugear manualmente, le dices a tu IA: *"Léete la tarea de rescate generada por Yapu y arréglalo"*. La IA lee el error, inyecta el parche y haces push de nuevo sin perder tu flujo creativo.

---

## 4. Vibe Check (Ingeniería de Resiliencia)

Tu nueva característica ya pasa todas las pruebas unitarias. Todo parece perfecto, pero te preguntas: *¿Sobrevivirá si la base de datos se vuelve lenta o si el JWT expira a mitad de sesión?*

En lugar de escribir complejos tests de integración o infraestructura, invocas el caos.

### El "Vibe"
Le ordenas a tu agente de IA: *"Activa el modo chaos. Ejecuta las directivas de `.agents/skills/yapu-chaos.md`"*.

### ¿Qué sucede detrás de escena?
La IA se convierte en un *Chaos Monkey*. Empezará a inyectar latencias artificiales (ej. `setTimeout` de 5s en tus rutas), forzar excepciones no controladas o tumbar promesas deliberadamente en tu entorno local. Si tu servidor Node.js explota por una `Unhandled Rejection`, la IA documentará el crasheo y escribirá automáticamente los bloques `try/catch` o degradaciones elegantes necesarias para que el sistema sea resiliente.

---

## 5. Crisis de Contexto (Contextual Garbage Collector)

Han pasado semanas de intenso desarrollo. Has cerrado múltiples fases. Notas que Cursor, Windsurf o Cline se vuelven lentos, costosos en consumo de tokens, o empiezan a "alucinar" porque hay decenas de archivos `SUMMARY.md` y tareas antiguas abrumando su ventana de contexto.

Es hora de hacer limpieza en la memoria del proyecto:

```termynal
yapu gc
```

### ¿Qué sucede detrás de escena?
YapuCli escanea `.planning/phases/`. Toma todas las fases antiguas, concatena su texto bruto en un archivo temporal y **archiva** (mueve) los archivos originales a una carpeta oculta `.planning/archive/YYYY-MM-DD/`, sacándolos del árbol principal para que la IA deje de indexarlos. Finalmente, genera una tarea de compresión especializada (`LORE_MASTER.md`).

### El "Vibe"
Solo tienes que decirle a tu IA: *"Ejecuta `.planning/tasks/LORE_MASTER.md`"*. La IA procesará semanas de historiales y lo condensará todo en un documento altamente denso llamado `LORE.md` (reteniendo solo decisiones arquitectónicas y el *por qué* de las cosas, eliminando ruido como tareas triviales). Recuperas la velocidad inmediata de tu IA, abaratas los tokens y el repositorio queda limpio.
