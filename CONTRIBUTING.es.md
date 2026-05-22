<p align="center">
  <strong>🇺🇸 <a href="CONTRIBUTING.md">Read in English</a></strong>
</p>

# Guía de Contribución — YapuCli 🪺

¡Gracias por tu interés en contribuir a YapuCli! Este documento describe cómo puedes colaborar con el proyecto.

---

## 🚀 Inicio Rápido

```bash
# 1. Fork el repositorio
gh repo fork davidcastilloc/yapu-cli --clone

# 2. Instala las dependencias de desarrollo
cd yapu-cli
npm install

# 3. Crea una rama para tu cambio
git checkout -b feat/mi-nueva-feature

# 4. Haz tus cambios y verifica
npm run test
npm run lint

# 5. Haz commit y push
git add -A
git commit -m "feat: descripción del cambio"
git push origin feat/mi-nueva-feature

# 6. Abre un Pull Request en GitHub
gh pr create
```

---

## 📋 Tipos de Contribuciones

### 🐛 Reportar Bugs
- Usa la plantilla de [Bug Report](https://github.com/davidcastilloc/yapu-cli/issues/new?template=bug_report.md)
- Incluye pasos para reproducir, comportamiento esperado vs actual, y tu entorno (Node.js, OS)

### 💡 Proponer Features
- Usa la plantilla de [Feature Request](https://github.com/davidcastilloc/yapu-cli/issues/new?template=feature_request.md)
- Describe el problema que resuelve y la solución propuesta

### 📝 Mejorar Documentación
- Typos, clarificaciones, ejemplos adicionales — todo es bienvenido
- La documentación vive en `docs/`, `README.md`, y los templates en `templates/`

### 🔧 Contribuir Código
- Nuevos comandos CLI, mejoras al módulo `lib/artifacts.js`, nuevos workflows

---

## 🏗️ Estructura del Proyecto

```
yapu-cli/
├── bin/cli.js              # CLI principal (22 comandos)
├── lib/
│   ├── artifacts.js        # Módulo bridge con el brain de Antigravity
│   ├── board.js            # Servidor web Command Center (C2)
│   ├── dashboard.js        # Dashboard TUI sin dependencias
│   ├── i18n.js             # Sistema de internacionalización bilingüe
│   └── providers.js        # Soporte multi-proveedor de agentes IA
├── index.js                # Entry point del paquete
├── templates/              # Plantillas desplegadas por yapu init
│   ├── yapu-*.md           # 41 workflows con Pre/Post-Sync
│   ├── yapu-*-schema.md    # 11 schemas de artifacts
│   ├── references/         # 25 archivos de referencia
│   ├── contexts/           # 3 contextos operacionales
│   └── codebase/           # 5 templates de análisis
├── tests/cli.test.js       # Tests de integración (29 tests)
├── docs/                   # Documentación
│   ├── COMMANDS.md          # Referencia de comandos del CLI
│   ├── ARCHITECTURE.md      # Arquitectura del framework
│   └── USER-GUIDE.md        # Guía de usuario
└── .github/                # Configuración de GitHub
```

---

## ✅ Requisitos para Pull Requests

### Antes de enviar tu PR:

1. **Tests pasan**: `npm run test` → 0 fallos
2. **Lint limpio**: `npm run lint` → 0 errores
3. **Sin referencias prohibidas**: No usar los términos `tether`, `GSD`, o `get-shit-done`
4. **Documentación actualizada**: Si agregas un comando o workflow, documéntalo
5. **Sin dependencias de producción**: YapuCli tiene **cero dependencias** — solo `node:fs` y `node:path`. Mantén esto así.

### Convención de commits:

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
refactor: refactorización sin cambio de comportamiento
test: agregar o modificar tests
chore: tareas de mantenimiento
```

Ejemplos:
```
feat: agregar comando yapu health para validación de workspace
fix: corregir parseo de STATE.md cuando no tiene fase activa
docs: documentar yapu brain log en COMMANDS.md
test: agregar test para syncBrainToPlanning con brain vacío
```

---

## 🔀 Flujo de Trabajo

```
  Tu fork                        Repo principal
  ────────                       ──────────────
  
  1. Fork ──────────────────────► davidcastilloc/yapu-cli
  2. Clone a tu máquina
  3. Crea rama feat/xxx
  4. Desarrolla + tests + lint
  5. Push a tu fork
  6. Abre PR ──────────────────► Review por mantenedor
  7. Feedback / Aprobación
  8. Merge ◄──────────────────── ¡Tu código está en main!
```

---

## 🧪 Cómo Ejecutar Tests

```bash
# Tests de integración
npm run test

# Linter
npm run lint

# Probar un comando específico
node bin/cli.js init
node bin/cli.js status
node bin/cli.js brain list --path /ruta/al/brain
```

---

## 🦋 Releases y Versiones

Este proyecto utiliza **Changesets** para gestionar las versiones y la publicación del paquete npm.

### 1. Documentar tus cambios
Si envías un Pull Request (PR) que incluya cambios visibles para el usuario (correcciones, nuevas funciones, refactorizaciones importantes), DEBES agregar un archivo de changeset:
```bash
npm run changeset
```
El asistente interactivo te preguntará:
- Qué paquete está afectado (selecciona `@davidsd/yapu-cli`).
- El tipo de incremento: **major** (cambios disruptivos / breaking changes), **minor** (nuevas características), o **patch** (correcciones de errores).
- Un breve resumen del cambio (este texto irá directo a `CHANGELOG.md`).

Confirma e incluye el archivo generado `.changeset/*.md` dentro de tu PR.

### 2. Publicación Automatizada
Una vez que un PR se fusiona en la rama `main`:
- Un workflow de GitHub Actions busca nuevos archivos changeset.
- Si existen changesets, crea o actualiza un Pull Request llamado **"Version Packages"**.
- Cuando un administrador fusiona ese PR:
  1. Se actualizan automáticamente las versiones en `package.json` y se genera el archivo `CHANGELOG.md`.
  2. Se publica la nueva versión en **NPM**.
  3. Se crea una versión/release correspondiente en GitHub de forma automatizada.

---

## 📐 Guías de Estilo

- **JavaScript**: ES Modules (`import`/`export`), single quotes, sin punto y coma
- **Markdown**: Español para documentación del proyecto
- **Emojis**: Usa 🪺 para branding de Yapu, no ⚓
- **Workflows**: Si creas un nuevo workflow, incluye los bloques `§ Pre-Sync` y `§ Post-Sync`

---

## 🪺 Áreas que Necesitan Ayuda

| Área | Descripción | Dificultad |
|------|-------------|------------|
| Tests unitarios de módulos `lib/` | Tests directos de los módulos lib (no solo integration) | 🟢 Baja |
| Traducciones | README y docs en inglés | 🟢 Baja |
| Nuevos workflows | Templates para casos de uso específicos | 🟡 Media |

---

## 💬 Contacto

- **Issues**: [github.com/davidcastilloc/yapu-cli/issues](https://github.com/davidcastilloc/yapu-cli/issues)
- **Email**: vikruzdavid@gmail.com
- **Autor**: David Castillo ([@davidcastilloc](https://github.com/davidcastilloc))

---

## 📜 Licencia

Al contribuir a YapuCli, aceptas que tus contribuciones serán licenciadas bajo la misma [licencia MIT](LICENSE) del proyecto.
