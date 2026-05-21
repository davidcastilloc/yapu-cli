# Plantilla de Stack Tecnológico

Plantilla para `.planning/codebase/STACK.md` — fundamento tecnológico del proyecto.

**Propósito:** Documentar qué tecnologías ejecuta este codebase. Enfocado en "qué se ejecuta cuando corres el código."

---

## Plantilla

```markdown
# Stack Tecnológico

**Fecha de Análisis:** [YYYY-MM-DD]

## Lenguajes

**Principal:**
- [Lenguaje] [Versión] - [Dónde se usa: e.g., "all application code"]

**Secundario:**
- [Lenguaje] [Versión] - [Dónde se usa: e.g., "build scripts, tooling"]

## Runtime

**Entorno:**
- [Runtime] [Versión] - [e.g., "Node.js 20.x"]
- [Requisitos adicionales si hay]

**Package Manager:**
- [Manager] [Versión] - [e.g., "npm 10.x"]
- Lockfile: [e.g., "package-lock.json present"]

## Frameworks

**Core:**
- [Framework] [Versión] - [Propósito: e.g., "web server", "UI framework"]

**Testing:**
- [Framework] [Versión] - [e.g., "Jest for unit tests"]

**Build/Dev:**
- [Herramienta] [Versión] - [e.g., "Vite for bundling"]

## Dependencias Clave

[Solo incluir dependencias críticas para entender el stack — limitar a 5-10 más importantes]

**Críticas:**
- [Package] [Versión] - [Por qué importa: e.g., "authentication", "database access"]

**Infraestructura:**
- [Package] [Versión] - [e.g., "Express for HTTP routing"]

## Configuración

**Entorno:**
- [Cómo se configura: e.g., ".env files", "environment variables"]
- [Configs clave: e.g., "DATABASE_URL, API_KEY required"]

**Build:**
- [Archivos de config: e.g., "vite.config.ts, tsconfig.json"]

## Requisitos de Plataforma

**Desarrollo:**
- [Requisitos de OS o "any platform"]
- [Tooling adicional: e.g., "Docker for local DB"]

**Producción:**
- [Target de deployment: e.g., "Vercel", "AWS Lambda", "Docker container"]
- [Requisitos de versión]

---

*Análisis de stack: [fecha]*
*Actualizar después de cambios importantes en dependencias*
```

## Guía de Uso

**Qué incluir:**
- Lenguajes y versiones
- Requisitos de runtime (Node, Bun, Deno, browser)
- Package manager y lockfile
- Elecciones de frameworks
- Dependencias críticas (limitar a 5-10 más importantes)
- Build tooling y requisitos de plataforma/deployment

**Qué NO incluir:**
- Estructura de archivos → eso va en STRUCTURE.md
- Patrones arquitectónicos → eso va en ARCHITECTURE.md
- Cada dependencia en package.json (solo las críticas)

**Cómo llenar esta plantilla:**
1. Revisar package.json para dependencias
2. Notar versión de runtime desde .nvmrc o package.json engines
3. Incluir solo dependencias que afectan la comprensión
4. Especificar versiones solo cuando la versión importa (breaking changes, compatibilidad)
