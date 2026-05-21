# Auditoría de Fuentes del Plan

Referencia para el agente planificador — reglas de cobertura multi-fuente y límites de autoridad.

---

## Formato de Auditoría de Cobertura

Antes de finalizar planes, producir una **auditoría de fuentes** cubriendo los 4 tipos de artefactos:

```
SOURCE    | ID      | Feature/Requirement          | Plan  | Status    | Notes
--------- | ------- | ---------------------------- | ----- | --------- | ------
GOAL      | —       | {meta de fase desde ROADMAP}  | 01-03 | COVERED   |
REQ       | REQ-14  | OAuth login con Google + GH  | 02    | COVERED   |
REQ       | REQ-22  | Email verification flow      | 03    | COVERED   |
RESEARCH  | —       | Rate limiting en auth routes  | 01    | COVERED   |
RESEARCH  | —       | Refresh token rotation       | NONE  | ⚠ MISSING | Sin plan que lo cubra
CONTEXT   | D-01    | Usar jose library para JWT   | 02    | COVERED   |
CONTEXT   | D-04    | 15min access / 7day refresh  | 02    | COVERED   |
```

## Los 4 Tipos de Fuente

1. **GOAL** — El campo `goal:` de ROADMAP.md para esta fase. Condición principal de éxito.
2. **REQ** — Cada REQ-ID en `phase_req_ids`. Cruzar con REQUIREMENTS.md para descripciones.
3. **RESEARCH** — Enfoques técnicos, restricciones descubiertas y features identificados en RESEARCH.md. Excluir ítems marcados "out of scope" o "future work".
4. **CONTEXT** — Cada decisión D-XX de la sección `<decisions>` de CONTEXT.md.

## Qué NO es un Gap

No marcar como MISSING:
- Ítems en `## Deferred Ideas` de CONTEXT.md — el desarrollador eligió diferirlos
- Ítems de otra fase vía `phase_req_ids` — no asignados a esta fase
- Ítems en RESEARCH.md marcados explícitamente como "out of scope" o "future work"

## Manejo de Ítems MISSING

Si CUALQUIER fila es `⚠ MISSING`, NO finalizar el plan silenciosamente. Retornar al orquestador:

```
## ⚠ Auditoría de Fuentes: Ítems Sin Plan

Los siguientes ítems de artefactos fuente no tienen plan correspondiente:

1. **{SOURCE}: {descripción del ítem}** (de {archivo}, sección "{sección}")
   - {por qué se identificó como requerido}

   Opciones:
   A) Agregar un plan para cubrir este ítem
   B) Dividir fase: mover a sub-fase
   C) Diferir explícitamente: agregar al backlog con confirmación del desarrollador

   → Esperando decisión del desarrollador antes de finalizar plan set.
```

Si TODAS las filas son COVERED → retornar `## PLANNING COMPLETE` como normal.

---

## Límites de Autoridad del Planificador

Las únicas razones legítimas para dividir o escalar un feature son **restricciones**, no juicios de dificultad:

**Válido (restricciones):**
- ✓ "Este task toca 9 archivos y consumiría ~45% de contexto — dividir en dos tasks"
- ✓ "No hay API key ni endpoint definido en ningún artefacto — necesita input del desarrollador"
- ✓ "Este feature depende del auth system construido en Fase 03, que aún no está completo"

**Inválido (juicios de dificultad):**
- ✗ "Esto es complejo y difícil de implementar correctamente"
- ✗ "Integrar con servicio externo podría tomar mucho tiempo"
- ✗ "Este es un feature desafiante que sería mejor dejar para una fase futura"

**Regla:** Si un feature no tiene ninguna de las tres restricciones legítimas (costo de contexto, información faltante, conflicto de dependencia), se planifica. Punto.
