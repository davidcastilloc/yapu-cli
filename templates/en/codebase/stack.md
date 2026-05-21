# Tech Stack Template

Template for `.planning/codebase/STACK.md` — technological foundation of the project.

**Purpose:** Document which technologies this codebase runs. Focused on "what executes when you run the code."

---

## Template

```markdown
# Tech Stack

**Analysis Date:** [YYYY-MM-DD]

## Languages

**Primary:**
- [Language] [Version] - [Where it is used: e.g., "all application code"]

**Secondary:**
- [Language] [Version] - [Where it is used: e.g., "build scripts, tooling"]

## Runtime

**Environment:**
- [Runtime] [Version] - [e.g., "Node.js 20.x"]
- [Additional requirements if any]

**Package Manager:**
- [Manager] [Version] - [e.g., "npm 10.x"]
- Lockfile: [e.g., "package-lock.json present"]

## Frameworks

**Core:**
- [Framework] [Version] - [Purpose: e.g., "web server", "UI framework"]

**Testing:**
- [Framework] [Version] - [e.g., "Jest for unit tests"]

**Build/Dev:**
- [Tool] [Version] - [e.g., "Vite for bundling"]

## Key Dependencies

[Only include critical dependencies to understand the stack — limit to the 5-10 most important ones]

**Critical:**
- [Package] [Version] - [Why it matters: e.g., "authentication", "database access"]

**Infrastructure:**
- [Package] [Version] - [e.g., "Express for HTTP routing"]

## Configuration

**Environment:**
- [How it is configured: e.g., ".env files", "environment variables"]
- [Key configs: e.g., "DATABASE_URL, API_KEY required"]

**Build:**
- [Config files: e.g., "vite.config.ts, tsconfig.json"]

## Platform Requirements

**Development:**
- [OS requirements or "any platform"]
- [Additional tooling: e.g., "Docker for local DB"]

**Production:**
- [Deployment target: e.g., "Vercel", "AWS Lambda", "Docker container"]
- [Version requirements]

---

*Stack analysis: [date]*
*Update after major dependency changes*
```

## Usage Guide

**What to include:**
- Languages and versions
- Runtime requirements (Node, Bun, Deno, browser)
- Package manager and lockfile
- Framework choices
- Critical dependencies (limit to the 5-10 most important ones)
- Build tooling and platform/deployment requirements

**What NOT to include:**
- File structure → that goes in STRUCTURE.md
- Architectural patterns → that goes in ARCHITECTURE.md
- Every single dependency in package.json (only critical ones)

**How to fill out this template:**
1. Review package.json for dependencies
2. Note runtime version from .nvmrc or package.json engines
3. Include only dependencies that affect understanding
4. Specify versions only when the version matters (breaking changes, compatibility)
