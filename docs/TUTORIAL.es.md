# 🐣 Mi Primer Día con YapuCli — Tutorial para Principiantes

¡Bienvenido al mundo del desarrollo de software asistido por Inteligencia Artificial! Si estás dando tus primeros pasos en la programación, es muy común que sientas que hay demasiadas cosas que recordar: el lenguaje, la base de datos, cómo conectar todo, y qué tarea sigue.

Aquí es donde entra **YapuCli 🪺**. 

---

## 🧠 La Analogía Sencilla: ¿Qué es YapuCli?

Imagina que estás construyendo una casa de juguete con Legos junto a un asistente robótico súper rápido (la IA como ChatGPT, Cursor, o Cline). Tu asistente puede poner bloques a la velocidad de la luz, pero tiene **pérdida de memoria a corto plazo**: cada 15 minutos olvida qué color de bloques querías usar o qué parte de la casa estaba construyendo.

Para que no pierdan tiempo repitiendo lo mismo, tú y tu asistente usan un **cuaderno físico de notas**:
1. **Las Reglas de Oro (`PROJECT.md`)**: "Solo usamos bloques azules y amarillos, y las ventanas van en el segundo piso".
2. **El Plano General (`ROADMAP.md`)**: "Fase 1: La base. Fase 2: Las paredes. Fase 3: El techo".
3. **La Tarea de Hoy (`STATE.md`)**: "Hoy vamos a colocar las 4 columnas de la esquina".

**YapuCli** es la herramienta que crea y organiza ese "cuaderno físico" en tu computadora, para que tu IA trabaje sin cometer errores y tú nunca te sientas perdido.

---

## 🚀 Paso 1: Instalación (Preparar tu Entorno)

Para usar YapuCli, necesitas tener instalado [Node.js](https://nodejs.org/) en tu computadora.

No necesitas instalar nada de forma permanente si no quieres. Puedes ejecutar Yapu directamente usando `npx`, que es como pedirle prestada la herramienta a internet cada vez que la usas:

```bash
npx @davidsd/yapu-cli init
```

*Si prefieres instalarlo de forma global en tu sistema para usar el comando directo `yapu`, corre:*
```bash
npm install -g @davidsd/yapu-cli
```

---

## 🪺 Paso 2: Crear el Nido (Iniciar un Proyecto)

1. Abre tu terminal o consola.
2. Crea una carpeta nueva para tu proyecto y entra en ella:
   ```bash
   mkdir mi-primer-proyecto
   cd mi-primer-proyecto
   ```
3. Ejecuta el comando de inicialización de Yapu:
   ```bash
   npx @davidsd/yapu-cli init
   ```

**¡Magia!** Verás que en tu carpeta han aparecido tres archivos principales (`PROJECT.md`, `ROADMAP.md`, `STATE.md`) y una carpeta llamada `.planning/` que es donde Yapu guarda la memoria técnica.

---

## 🏛️ Paso 3: Define tu Visión en `PROJECT.md`

Abre el archivo `PROJECT.md` en tu editor de código (como VS Code o Cursor). Verás que es una plantilla. Tu primer trabajo es llenarla con las "reglas del juego".

**Ejemplo para un principiante:**
* **Stack**: HTML, CSS de vainilla y JavaScript básico.
* **Reglas**: 
  * "Quiero que el diseño de mi web sea oscuro y moderno".
  * "Usa variables CSS para los colores para que sea fácil cambiarlos".
  * "Escribe comentarios en español explicando qué hace cada función".

*Al escribir esto, tu IA asistente sabrá exactamente cómo escribir el código sin que tengas que recordárselo en cada prompt.*

---

## 🗺️ Paso 4: Dibuja tu Mapa de Ruta en `ROADMAP.md`

La programación es más fácil cuando divides un problema grande en partes pequeñas (el principio de *Divide y Vencerás*). Abre `ROADMAP.md` y crea tus fases de desarrollo.

**Ejemplo de Roadmap para hacer una lista de tareas simple:**
```markdown
- [ ] Fase 1: Diseñar la estructura HTML básica y estilos oscuros.
- [ ] Fase 2: Agregar JavaScript para poder escribir tareas y que se listen en pantalla.
- [ ] Fase 3: Añadir un botón para poder eliminar tareas completadas.
```

---

## 🌅 Paso 5: Tu Rutina Diaria (Día a Día con Yapu)

Aquí está el secreto para empezar el día como un programador profesional utilizando Inteligencia Artificial.

### 1. ☕ La Mañana: El Arranque
Al encender la computadora y abrir tu editor de código:
* Abre tu terminal y escribe:
  ```bash
  npx @davidsd/yapu-cli status
  ```
  Esto te dará una radiografía rápida en la terminal de qué estás haciendo y en qué fase vas.
* Abre `STATE.md`. Este es tu plan del día. Configura tu fase activa y añade las tareas específicas para hoy.
  ```markdown
  # Estado del Proyecto - Fase 1
  - [ ] Crear el archivo index.html.
  - [ ] Crear el archivo style.css con fondo oscuro.
  - [ ] Agregar el formulario de entrada de texto.
  ```

### 2. 🤖 Durante el Día: Programando con tu IA
Cuando abras tu chat con la IA (Cursor, Cline, o la que uses), dale este prompt inicial:
> *"Hola. Vamos a empezar a programar. Lee los archivos `PROJECT.md`, `ROADMAP.md` y `STATE.md` para entender las reglas de nuestra app, el plan general y en qué tarea estamos trabajando hoy. ¡Por favor, toma la primera tarea pendiente de `STATE.md` y desarrollemos el código!"*

La IA leerá tus directivas y se pondrá a programar. A medida que la IA complete el código:
1. Te pedirá permiso para guardar o modificar archivos.
2. Una vez que verifiques que el código funciona, la IA **tachará la tarea** en `STATE.md` cambiando `[ ]` por `[x]`.
3. Tú verás el cambio en vivo.

*Si quieres supervisar todo en tiempo real de una forma súper genial, abre otra terminal y corre:*
```bash
npx @davidsd/yapu-cli dash
```
*¡Verás una interfaz de monitor estilo hacker que se actualiza sola mientras la IA va tachando las tareas!*

*¿Quieres algo aún más poderoso? Lanza el **Command Center** en tu navegador:*
```bash
npx @davidsd/yapu-cli board
```
*¡Esto abre un dashboard web premium donde puedes ver tareas, actividad neuronal de tu IA, e incluso ejecutar comandos yapu con un solo clic — todo desde tu navegador!*

### 🌌 3. La Noche: Guardar tu Progreso (El Handoff)
Cuando decidas que es hora de descansar o terminar por hoy, necesitas dejar un **marcapáginas** en tu libro de desarrollo para que al día siguiente (o si le prestas tu código a otro programador) sepas exactamente dónde te quedaste.

Ejecuta en tu terminal:
```bash
npx @davidsd/yapu-cli handoff
```
Yapu generará un archivo llamado `.continue-here.md` que resume exactamente:
* Qué lograste terminar hoy.
* Qué archivos se modificaron.
* Qué tarea quedó a medias o debe ser la primera en retomarse mañana.

Al día siguiente, solo tendrás que decirle a tu IA: *"Lee `.continue-here.md` y continuemos"* y volverás a entrar en la zona al instante.

---

## 💡 Consejos de Oro para Principiantes

1. **Una sola cosa a la vez**: Nunca intentes programar la Fase 1 y la Fase 3 juntas. Sigue el orden estricto de tu `ROADMAP.md`.
2. **Prueba rápido**: Cada vez que la IA escriba una función o un trozo de código, pruébalo en tu navegador. No dejes que la IA escriba 100 líneas sin verificar que las primeras 10 funcionan.
3. **No borres el cuaderno**: Mantén siempre actualizados `STATE.md` y `PROJECT.md`. Si decides cambiar un color o una regla de tu proyecto, modifícalo en `PROJECT.md` para que la IA no vuelva a usar la regla vieja.

¡Listo! Con esta rutina, programar con Inteligencia Artificial ya no se sentirá caótico. YapuCli te mantendrá siempre con el control total de tu proyecto. ¡Feliz programación! 🪺
