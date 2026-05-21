# Schema: Seguridad por Fase — Yapu

> Formato para `.planning/phases/XX-name/{phase_num}-SECURITY.md`
> Registro de amenazas STRIDE per-phase con trust boundaries y audit trail.

## Plantilla

```markdown
---
phase: {N}
slug: {phase-slug}
status: draft | verified
threats_open: 0
asvs_level: 1
created: {fecha}
---

# Fase {N} — Security

> Contrato de seguridad per-phase: registro de amenazas, riesgos aceptados, y audit trail.

---

## Trust Boundaries

| Boundary | Descripción | Data Crossing |
|----------|-------------|---------------|
| {boundary} | {descripción} | {tipo de dato / sensibilidad} |

---

## Threat Register

| Threat ID | Categoría | Componente | Disposición | Mitigación | Status |
|-----------|-----------|-----------|-------------|------------|--------|
| T-{N}-01 | {categoría STRIDE} | {componente} | {mitigate / accept / transfer} | {control o referencia} | open |

*Status: open · closed*
*Disposición: mitigate (implementación requerida) · accept (riesgo documentado) · transfer (tercero)*

**Categorías STRIDE:**
- **S**poofing — Suplantación de identidad
- **T**ampering — Manipulación de datos
- **R**epudiation — Negación de acciones
- **I**nformation Disclosure — Fuga de información
- **D**enial of Service — Denegación de servicio
- **E**levation of Privilege — Escalación de privilegios

---

## Accepted Risks Log

| Risk ID | Threat Ref | Razonamiento | Aceptado Por | Fecha |
|---------|------------|-------------|--------------|-------|

*Riesgos aceptados no resurgen en futuras auditorías.*
*Si no hay: "Sin riesgos aceptados."*

---

## Security Audit Trail

| Fecha Auditoría | Threats Total | Closed | Open | Run By |
|----------------|---------------|--------|------|--------|
| {YYYY-MM-DD} | {N} | {N} | {N} | {nombre / agente} |

---

## Sign-Off

- [ ] Todas las amenazas tienen disposición (mitigate / accept / transfer)
- [ ] Riesgos aceptados documentados en Accepted Risks Log
- [ ] `threats_open: 0` confirmado
- [ ] `status: verified` seteado en frontmatter

**Aprobación:** {pending / verified YYYY-MM-DD}
```

## Niveles ASVS

| Level | Propósito | Cuándo Usar |
|-------|----------|-------------|
| 1 | Oportunista — controles básicos | MVP, proyectos internos |
| 2 | Estándar — mayoría de aplicaciones | Producción con datos de usuario |
| 3 | Avanzado — alta seguridad | Fintech, salud, gobierno |
