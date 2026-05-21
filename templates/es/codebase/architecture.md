# Plantilla de Arquitectura

Plantilla para `.planning/codebase/ARCHITECTURE.md` — organización conceptual del código.

**Propósito:** Documentar cómo está organizado el código a nivel conceptual. Complementa STRUCTURE.md (ubicación física de archivos).

---

## Plantilla

```markdown
# Arquitectura

**Fecha de Análisis:** [YYYY-MM-DD]

## Patrón General

**Tipo:** [Nombre del patrón: e.g., "Monolithic CLI", "Serverless API", "Full-stack MVC"]

**Características Clave:**
- [Característica 1: e.g., "Single executable"]
- [Característica 2: e.g., "Stateless request handling"]
- [Característica 3: e.g., "Event-driven"]

## Capas

**[Nombre de Capa]:**
- Propósito: [Qué hace esta capa]
- Contiene: [Tipos de código: e.g., "route handlers", "business logic"]
- Depende de: [Qué usa: e.g., "data layer only"]
- Usado por: [Qué lo usa: e.g., "API routes"]

**[Nombre de Capa]:**
- Propósito: [Qué hace]
- Contiene: [Tipos de código]
- Depende de: [Qué usa]
- Usado por: [Qué lo usa]

## Flujo de Datos

**[Nombre del Flujo] (e.g., "HTTP Request", "CLI Command", "Event Processing"):**

1. [Entry point: e.g., "User runs command"]
2. [Processing step: e.g., "Router matches path"]
3. [Processing step: e.g., "Controller validates input"]
4. [Processing step: e.g., "Service executes logic"]
5. [Output: e.g., "Response returned"]

**Gestión de Estado:**
- [Cómo se maneja el estado: e.g., "Stateless", "Database per request", "In-memory cache"]

## Abstracciones Clave

**[Nombre de Abstracción]:**
- Propósito: [Qué representa]
- Ejemplos: [e.g., "UserService, ProjectService"]
- Patrón: [e.g., "Singleton", "Factory", "Repository"]

## Entry Points

**[Entry Point]:**
- Ubicación: [e.g., "src/index.ts"]
- Triggers: [Qué lo invoca: e.g., "CLI invocation", "HTTP request"]
- Responsabilidades: [Qué hace: e.g., "Parse args, route to command"]

## Manejo de Errores

**Estrategia:** [e.g., "Exception bubbling to top-level handler"]

**Patrones:**
- [e.g., "try/catch at controller level"]
- [e.g., "Error codes returned to user"]

## Aspectos Transversales

**Logging:** [e.g., "Winston logger, injected per-request"]
**Validación:** [e.g., "Zod schemas at API boundary"]
**Autenticación:** [e.g., "JWT middleware on protected routes"]

---

*Análisis de arquitectura: [fecha]*
*Actualizar cuando cambien patrones importantes*
```

## Guía de Uso

**Qué incluir:**
- Patrón arquitectónico general (monolith, microservices, layered, etc.)
- Capas conceptuales y sus relaciones
- Flujo de datos / lifecycle de requests
- Abstracciones y patrones clave
- Entry points y manejo de errores
- Aspectos transversales (logging, auth, validación)

**Qué NO incluir:**
- Listados exhaustivos de archivos → eso va en STRUCTURE.md
- Elecciones de tecnología → eso va en STACK.md
- Walkthrough línea por línea del código
- Detalles de implementación de features específicos

**Los file paths SÍ son bienvenidos** — incluir paths como ejemplos concretos de abstracciones con backticks: `src/services/user.ts`. Esto hace el documento accionable para el agente al planificar.

**Cómo llenar esta plantilla:**
1. Leer entry points principales (index, server, main)
2. Identificar capas leyendo imports/dependencias
3. Trazar la ejecución típica de un request/comando
4. Notar patrones recurrentes (services, controllers, repositories)
5. Mantener descripciones conceptuales, no mecánicas
