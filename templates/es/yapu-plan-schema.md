# Schema: Plan de Fase — Yapu

> Formato de salida para `.planning/phases/XX-name/{phase}-{plan}-PLAN.md`
> Plan ejecutable optimizado para ejecución secuencial o paralela.

## Plantilla

```markdown
---
phase: XX-name
plan: NN
type: execute              # execute | tdd
wave: N                    # Wave de ejecución (1, 2, 3...). Pre-computado en planning.
depends_on: []             # Plan IDs requeridos (ej: ["01-01"])
files_modified: []         # Archivos que este plan modifica
autonomous: true           # false si tiene checkpoints que requieren interacción
requirements: []           # REQUERIDO — REQ-IDs del ROADMAP. NO puede estar vacío.
user_setup: []             # Setup humano que Yapu no puede automatizar

# Verificación goal-backward (derivada en planning, verificada post-ejecución)
must_haves:
  truths: []               # Comportamientos observables que deben ser verdaderos
  artifacts: []            # Archivos que deben existir con implementación real
  key_links: []            # Conexiones críticas entre artefactos
---

<objective>
[Qué logra este plan]

Propósito: [Por qué importa para el proyecto]
Output: [Qué artefactos se crearán]
</objective>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Solo referenciar SUMMARYs previos si genuinamente se necesitan:
# - Este plan usa tipos/exports de un plan previo
# - Un plan previo tomó una decisión que afecta este plan

[Archivos fuente relevantes:]
@src/path/to/relevant.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: [Nombre orientado a acción]</name>
  <files>path/to/file.ext, another/file.ext</files>
  <read_first>path/to/reference.ext</read_first>
  <action>[Implementación específica — qué hacer, cómo hacerlo, qué evitar y POR QUÉ.
  Incluir valores CONCRETOS: identificadores exactos, parámetros, outputs esperados.]</action>
  <verify>[Comando o check que prueba que funcionó]</verify>
  <acceptance_criteria>
    - [Condición verificable: "file.ext contiene 'string exacto'"]
    - [Condición medible: "output.ext usa 'valor-esperado', NO 'valor-incorrecto'"]
  </acceptance_criteria>
  <done>[Criterio de aceptación medible]</done>
</task>

<task type="tdd">
  <name>Task 2: [Nombre con TDD]</name>
  <files>path/to/file.ext, path/to/file.test.ext</files>
  <test_first>Escribir test que falla → implementar → test pasa</test_first>
  <action>[Implementación con ciclo red-green-refactor]</action>
  <verify>[Test suite pasa]</verify>
  <done>[Tests verdes + criterio funcional]</done>
</task>

<task type="checkpoint:decision" gate="blocking">
  <decision>[Qué necesita decidirse]</decision>
  <context>[Por qué importa esta decisión]</context>
  <options>
    <option id="option-a"><name>[Nombre]</name><pros>[Beneficios]</pros><cons>[Tradeoffs]</cons></option>
    <option id="option-b"><name>[Nombre]</name><pros>[Beneficios]</pros><cons>[Tradeoffs]</cons></option>
  </options>
  <resume-signal>Seleccionar: option-a o option-b</resume-signal>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Qué construyó Yapu] — servidor corriendo en [URL]</what-built>
  <how-to-verify>Visitar [URL] y verificar: [checks visuales, NO comandos CLI]</how-to-verify>
  <resume-signal>Escribir "aprobado" o describir issues</resume-signal>
</task>

</tasks>

<verification>
Antes de declarar el plan completo:
- [ ] [Comando de test específico]
- [ ] [Build/type check pasa]
- [ ] [Verificación de comportamiento]
</verification>

<success_criteria>
- Todas las tasks completadas
- Todas las verificaciones pasan
- Sin errores o warnings introducidos
- [Criterio específico del plan]
</success_criteria>

<output>
Después de completar, crear `.planning/phases/XX-name/{phase}-{plan}-SUMMARY.md`
</output>
```

## Campos del Frontmatter

| Campo | Requerido | Propósito |
|-------|-----------|-----------|
| `phase` | Sí | Identificador de fase (ej: `01-foundation`) |
| `plan` | Sí | Número de plan dentro de la fase |
| `type` | Sí | `execute` estándar o `tdd` para planes TDD |
| `wave` | Sí | Número de wave — pre-computado en planning |
| `depends_on` | Sí | Array de plan IDs requeridos |
| `files_modified` | Sí | Archivos que toca este plan |
| `autonomous` | Sí | `true` sin checkpoints, `false` con checkpoints |
| `requirements` | Sí | **DEBE** listar REQ-IDs del ROADMAP |
| `must_haves` | Sí | Criterios de verificación goal-backward |

## Tipos de Task

| Tipo | Uso |
|------|-----|
| `auto` | Ejecución autónoma sin intervención humana |
| `tdd` | Ciclo red-green-refactor con test-first |
| `checkpoint:decision` | Requiere decisión del usuario (gate blocking) |
| `checkpoint:human-verify` | Requiere verificación visual del usuario |
