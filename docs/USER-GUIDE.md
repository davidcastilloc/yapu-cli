# Guía de Usuario - YapuCli

Esta guía te guiará en los pasos para instalar, configurar e interactuar con el framework **YapuCli** en tus proyectos de desarrollo con **Antigravity CLI**.

---

## 1. Instalación y Configuración

Yapu está empaquetado para ser instalado de forma global o local a través de `npm`.

### Instalación Global (Recomendado)
```bash
npm install -g yapu-cli
```

Una vez instalado, el comando `yapu` estará disponible globalmente en tu terminal.

---

## 2. Inicializando un Proyecto con Yapu

Para preparar tu repositorio actual para trabajar bajo la ingeniería de contexto estricta de Yapu, ejecuta el comando `init` en la raíz de tu proyecto:

```bash
yapu init
```

### ¿Qué hace `yapu init`?
Este comando crea la infraestructura del framework en tu directorio de trabajo actual:
1. **Scaffolding de la Memoria Estática**:
   - `PROJECT.md`: Archivo inicial para documentar tu visión, stack tecnológico y mandamientos de arquitectura.
   - `ROADMAP.md`: Estructura para organizar tu desarrollo en fases discretas y aisladas.
   - `STATE.md`: Plantilla del estado de memoria a corto plazo para que el agente registre sus tareas del ciclo actual.
2. **Inyección de la Directiva de Ejecución**:
   - Crea el directorio `.antigravity/workflows/`.
   - Copia el archivo `.antigravity/workflows/execute.md` que contiene las instrucciones de meta-prompting y las reglas de ejecución del framework.

> [!IMPORTANT]
> **Protección de Datos**: `yapu init` está diseñado de forma segura. Si ya existen archivos con los mismos nombres en tu directorio actual, el CLI imprimirá una advertencia y los omitirá para no sobrescribir tus datos o configuraciones previas.

---

## 3. Flujo de Trabajo Diario con Yapu

El ciclo de desarrollo con Yapu se compone de tres pasos sencillos que garantizan que el contexto se mantenga limpio:

### Paso 1: Configurar la Visión y el Mapa de Ruta
1. Rellena las secciones de `PROJECT.md` con tu stack y reglas.
2. Define en `ROADMAP.md` tus fases de desarrollo secuenciales.

### Paso 2: Activar una Fase en `STATE.md`
Cuando estés listo para desarrollar una fase, abre `STATE.md` y configura:
- **FASE ACTIVA**: Indica el número y nombre de la fase del roadmap.
- **Tareas de la Fase Actual**: Escribe una lista de tareas detalladas con `[ ]` (sin completar).

### Paso 3: Lanzar Antigravity CLI
Inicia tu sesión de Antigravity CLI. El agente detectará automáticamente la directiva en `.antigravity/workflows/execute.md` y los archivos de memoria estática en la raíz:
1. El agente leerá `STATE.md` para extraer la primera tarea pendiente.
2. Desarrollará los cambios respetando las reglas de `PROJECT.md`.
3. Verificará localmente corriendo pruebas.
4. Marcará la tarea como completada (`[x]`) y guardará el progreso en `STATE.md`.
5. Al terminar la fase, limpia el historial temporal de `STATE.md` y activa la siguiente fase del `ROADMAP.md` para mantener el contexto libre de residuos.
