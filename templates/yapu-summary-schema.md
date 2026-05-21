# Schema: Resumen de Ejecución — Yapu

> Formato para `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
> Documentación post-ejecución con grafo de dependencias para ensamblaje automático de contexto.

## Plantilla

```markdown
---
phase: XX-name
plan: YY
subsystem: [categoría primaria: auth, payments, ui, api, database, infra, testing]
tags: [tech buscable: jwt, stripe, react, postgres, prisma]

# Grafo de dependencias
requires:
  - phase: [fase previa de la que depende]
    provides: [qué construyó esa fase que ésta usa]
provides:
  - [lista de qué construyó/entregó este plan]
affects: [fases o keywords que necesitarán este contexto]

# Tracking técnico
tech-stack:
  added: [librerías/herramientas agregadas]
  patterns: [patrones arquitectónicos/código establecidos]

key-files:
  created: [archivos importantes creados]
  modified: [archivos importantes modificados]

key-decisions:
  - "Decisión 1"
  - "Decisión 2"

patterns-established:
  - "Patrón 1: descripción"

requirements-completed: []  # REQUERIDO — REQ-IDs completados en este plan

# Métricas
duration: Xmin
completed: YYYY-MM-DD
---

# Fase [X]: [Nombre] — Resumen

**[One-liner sustantivo describiendo resultado — NO "fase completa" o "implementación terminada"]**

## Performance

- **Duración:** [tiempo] (ej: 23 min, 1h 15m)
- **Iniciado:** [ISO timestamp]
- **Completado:** [ISO timestamp]
- **Tasks:** [cantidad completadas]
- **Archivos modificados:** [cantidad]

## Accomplishments
- [Resultado más importante]
- [Segundo logro clave]
- [Tercero si aplica]

## Task Commits

Cada task fue committed atómicamente:

1. **Task 1: [nombre]** — `abc123f` (feat/fix/test/refactor)
2. **Task 2: [nombre]** — `def456g` (feat/fix/test/refactor)

**Plan metadata:** `lmn012o` (docs: complete plan)

## Archivos Creados/Modificados
- `path/to/file.ts` — Qué hace
- `path/to/another.ts` — Qué hace

## Decisiones Tomadas
[Decisiones clave con razonamiento breve, o "Ninguna — se siguió el plan tal cual"]

## Desviaciones del Plan

[Si no hubo: "Ninguna — plan ejecutado exactamente como fue escrito"]

[Si hubo desviaciones:]

### Auto-fixed Issues

**1. [Categoría] Descripción breve**
- **Encontrado durante:** Task [N] ([nombre])
- **Issue:** [Qué estaba mal]
- **Fix:** [Qué se hizo]
- **Archivos:** [paths]
- **Verificación:** [Cómo se verificó]

---
**Total desviaciones:** [N] auto-fixed
**Impacto en plan:** [Evaluación breve]

## Issues Encontrados
[Problemas y cómo se resolvieron, o "Ninguno"]

## Next Phase Readiness
[Qué está listo para la siguiente fase]
[Blockers o concerns]

---
*Fase: XX-name*
*Completado: [fecha]*
```

## Reglas del One-liner

El one-liner DEBE ser sustantivo:

| ✓ Bueno | ✗ Malo |
|---------|--------|
| "JWT auth con refresh rotation usando jose" | "Fase completa" |
| "Schema Prisma con User, Session y Product" | "Autenticación implementada" |
| "Dashboard con métricas real-time via SSE" | "Todas las tasks hechas" |

## Propósito del Frontmatter

- **Scanning rápido:** Primeras ~25 líneas, barato de escanear sin leer contenido completo
- **Grafo de dependencias:** `requires`/`provides`/`affects` crean links explícitos entre fases
- **Subsystem:** Categorización primaria para detectar fases relacionadas
- **Tags:** Keywords técnicos buscables para awareness del tech stack
