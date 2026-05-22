# Estrategia de Versionado y Lanzamiento - YapuCli

YapuCli sigue las especificaciones de [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/).

## Formato de Versión

Cada versión del framework se define bajo la nomenclatura `MAJOR.MINOR.PATCH`:

- **MAJOR (Mayor)**: Cambios incompatibles con versiones previas (por ejemplo, cambios disruptivos en la estructura requerida del contexto o de la tríada de memoria `PROJECT.md`, `ROADMAP.md`, `STATE.md`).
- **MINOR (Menor)**: Funcionalidades añadidas compatibles con versiones previas (por ejemplo, nuevas plantillas opcionales de directivas de sistema, o mejoras en el inyector del CLI `yapu init`).
- **PATCH (Parche)**: Corrección de errores compatible con versiones previas (por ejemplo, ajustes menores de formato en las plantillas Markdown, o corrección de bugs menores de Node.js en `bin/cli.js`).

## Ramas Principales y Ciclo de Desarrollo

El desarrollo de Yapu se estructura en torno a las siguientes ramas en el repositorio de Git:

- **main**: Representa el estado estable actual de producción. Todo código en `main` debe superar las pruebas de integración.
- **feature/* / bugfix/* / chore/**: Ramas temporales utilizadas para añadir características, reparar bugs o realizar labores de mantenimiento, respectivamente. Se fusionan en `main` una vez probadas y aprobadas.

## Publicación en el Registro de Paquetes (npm)

La distribución oficial se publica en el registro de paquetes `npm` bajo el nombre `@davidsd/yapu-cli`:

```bash
# Instalación estable recomendada
npm install -g @davidsd/yapu-cli
```
