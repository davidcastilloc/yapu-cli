# Schema: Requirements — Yapu

> Formato para `.planning/REQUIREMENTS.md`
> Requirements chequeables que definen "done" con REQ-IDs y tabla de trazabilidad.

## Plantilla

```markdown
# Requirements: [Nombre del Proyecto]

**Definidos:** [fecha]
**Core Value:** [de PROJECT.md]

## v1 Requirements

Requirements para release inicial. Cada uno mapea a fases del roadmap.

### [Categoría 1]

- [ ] **[CAT]-01**: [Descripción del requirement — user-centric, testable, atómica]
- [ ] **[CAT]-02**: [Descripción del requirement]
- [ ] **[CAT]-03**: [Descripción del requirement]

### [Categoría 2]

- [ ] **[CAT]-01**: [Descripción del requirement]
- [ ] **[CAT]-02**: [Descripción del requirement]

### [Categoría 3]

- [ ] **[CAT]-01**: [Descripción del requirement]
- [ ] **[CAT]-02**: [Descripción del requirement]

## v2 Requirements

Diferidos a release futuro. Tracked pero no en el roadmap actual.

### [Categoría]

- **[CAT]-01**: [Descripción]
- **[CAT]-02**: [Descripción]

## Out of Scope

Explícitamente excluidos. Documentados para prevenir scope creep.

| Feature | Razón |
|---------|-------|
| [Feature] | [Por qué excluido] |
| [Feature] | [Por qué excluido] |

## Traceability

Qué fases cubren qué requirements. Actualizado durante creación del roadmap.

| Requirement | Fase | Status |
|-------------|------|--------|
| [CAT]-01 | Fase 1 | Pending |
| [CAT]-02 | Fase 1 | Pending |
| [CAT]-03 | Fase 2 | Pending |

**Coverage:**
- v1 requirements: [X] total
- Mapped a fases: [Y]
- Unmapped: [Z] ⚠️

---
*Requirements definidos: [fecha]*
*Última actualización: [fecha] después de [trigger]*
```

## Formato de REQ-ID

- **Patrón:** `[CATEGORÍA]-[NÚMERO]` (AUTH-01, CONTENT-02, SOCIAL-03)
- **Descripción:** User-centric, testable, atómica
- **Checkbox:** Solo para v1 (v2 no son actionable aún)

## Categorías Típicas

AUTH, CONTENT, SOCIAL, PROFILE, NOTIF, MODR, PAYMENT, ADMIN, INFRA

## Status Values

| Status | Significado |
|--------|------------|
| Pending | No iniciado |
| In Progress | Fase activa |
| Complete | Requirement verificado |
| Blocked | Esperando factor externo |

## Evolución

**Después de cada fase completa:**
1. Marcar requirements cubiertos como Complete
2. Actualizar status de trazabilidad
3. Notar requirements que cambiaron scope

**Después de actualizar roadmap:**
1. Verificar que todos los v1 requirements siguen mapped
2. Agregar nuevos requirements si scope se expandió
3. Mover a v2/out of scope si se descoped

**v1 → v2:** Mover si se difiere. **v2 → v1:** Requiere actualización del roadmap.
