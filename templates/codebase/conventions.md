# Plantilla de Convenciones de Código

Plantilla para `.planning/codebase/CONVENTIONS.md` — estilo de código y patrones.

**Propósito:** Documentar cómo se escribe el código en este codebase. Guía prescriptiva para que el agente coincida con el estilo existente.

---

## Plantilla

```markdown
# Convenciones de Código

**Fecha de Análisis:** [YYYY-MM-DD]

## Patrones de Nombres

**Archivos:**
- [Patrón: e.g., "kebab-case for all files"]
- [Test files: e.g., "*.test.ts alongside source"]
- [Components: e.g., "PascalCase.tsx for React components"]

**Funciones:**
- [Patrón: e.g., "camelCase for all functions"]
- [Async: e.g., "no special prefix for async functions"]
- [Handlers: e.g., "handleEventName for event handlers"]

**Variables:**
- [Patrón: e.g., "camelCase for variables"]
- [Constantes: e.g., "UPPER_SNAKE_CASE for constants"]
- [Private: e.g., "_prefix for private members" o "no prefix"]

**Types:**
- [Interfaces: e.g., "PascalCase, no I prefix"]
- [Type aliases: e.g., "PascalCase"]
- [Enums: e.g., "PascalCase name, UPPER_CASE values"]

## Estilo de Código

**Formateo:**
- [Herramienta: e.g., "Prettier with .prettierrc"]
- [Line length: e.g., "100 characters max"]
- [Quotes: e.g., "single quotes"]
- [Semicolons: e.g., "required" o "omitted"]

**Linting:**
- [Herramienta: e.g., "ESLint with eslint.config.js"]
- [Rules: e.g., "extends @typescript-eslint/recommended"]
- [Run: e.g., "npm run lint"]

## Organización de Imports

**Orden:**
1. [e.g., "External packages (react, express)"]
2. [e.g., "Internal modules (@/lib, @/services)"]
3. [e.g., "Relative imports (., ..)"]
4. [e.g., "Type imports (import type {})"]

**Agrupación:**
- [e.g., "Blank line between groups"]
- [e.g., "Alphabetical within each group"]

**Path Aliases:**
- [e.g., "@/ maps to src/"]

## Manejo de Errores

**Patrones:**
- [Estrategia: e.g., "throw errors, catch at boundaries"]
- [Custom errors: e.g., "extend Error class, named *Error"]
- [Async: e.g., "use try/catch, no .catch() chains"]

**Tipos de Error:**
- [Cuándo lanzar: e.g., "invalid input, missing dependencies"]
- [Cuándo retornar: e.g., "expected failures return Result<T, E>"]
- [Logging: e.g., "log error with context before throwing"]

## Logging

**Framework:** [e.g., "pino logger from lib/logger.ts"]
**Niveles:** [e.g., "debug, info, warn, error"]

**Patrones:**
- [Formato: e.g., "structured logging with context object"]
- [Dónde: e.g., "log at service boundaries, not in utils"]
- [Regla: e.g., "no console.log in committed code"]

## Comentarios

**Cuándo Comentar:**
- [e.g., "explain why, not what"]
- [e.g., "document business rules and edge cases"]
- [e.g., "avoid obvious comments"]

**JSDoc/TSDoc:**
- [e.g., "required for public APIs, optional for internal"]

**TODO Comments:**
- [Formato: e.g., "// TODO: description"]

## Diseño de Funciones

**Tamaño:** [e.g., "keep under 50 lines, extract helpers"]

**Parámetros:**
- [e.g., "max 3 parameters, use object for more"]
- [e.g., "destructure objects in parameter list"]

**Return Values:**
- [e.g., "explicit returns, return early for guard clauses"]

## Diseño de Módulos

**Exports:**
- [e.g., "named exports preferred"]
- [e.g., "export public API from index.ts"]

**Barrel Files:**
- [e.g., "index.ts re-exports public API"]
- [e.g., "avoid circular dependencies"]

---

*Análisis de convenciones: [fecha]*
*Actualizar cuando cambien los patrones*
```

## Guía de Uso

**Qué incluir:**
- Patrones de nombres observados en el codebase
- Reglas de formateo (Prettier config, linting rules)
- Organización de imports
- Estrategia de manejo de errores
- Approach de logging y comentarios
- Patrones de diseño de funciones y módulos

**Qué NO incluir:**
- Decisiones de arquitectura → eso va en ARCHITECTURE.md
- Elecciones de tecnología → eso va en STACK.md
- Patrones de testing → eso va en TESTING.md
- Organización de archivos → eso va en STRUCTURE.md

**Cómo llenar esta plantilla:**
1. Revisar .prettierrc, .eslintrc, o configs similares
2. Examinar 5-10 archivos fuente representativos
3. Buscar consistencia: si 80%+ sigue un patrón, documentarlo
4. Ser prescriptivo: "Usar X" no "A veces se usa Y"
5. Notar desviaciones: "Legacy code usa Y, código nuevo debe usar X"
6. Mantener bajo ~150 líneas total
