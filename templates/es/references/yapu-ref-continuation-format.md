# Formato de Continuación

Formato estándar para presentar next steps después de completar un comando o workflow.

---

## Estructura Base

```
---

## ▶ Next Up

**{identificador}: {nombre}** — {descripción de una línea}

`/clear` then:

`{comando para copy-paste}`

---

**También disponible:**
- `{opción alternativa 1}` — descripción
- `{opción alternativa 2}` — descripción

---
```

## Reglas de Formato

1. **Siempre mostrar qué es** — nombre + descripción, nunca solo un comando
2. **Extraer contexto de fuente** — ROADMAP.md para fases, PLAN.md `<objective>` para planes
3. **Comando en inline code** — backticks, fácil de copy-paste
4. **`/clear` primero** — siempre mostrar `/clear` antes del comando
5. **"También disponible" no "Otras opciones"** — suena más app-like
6. **Separadores visuales** — `---` arriba y abajo para destacar

---

## Variantes

### Ejecutar Siguiente Plan

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry

`/clear` then:

`yapu:execute-phase 2`

---

**También disponible:**
- Revisar plan antes de ejecutar
- Listar suposiciones de la fase

---
```

### Último Plan de la Fase

Agregar nota de que es el último plan y qué sigue:

```
---

## ▶ Next Up

**02-03: Refresh Token Rotation** — Add /api/auth/refresh with sliding expiry
<sub>Plan final en Fase 2</sub>

`/clear` then:

`yapu:execute-phase 2`

---

**Después de completar:**
- Transición Fase 2 → Fase 3
- Siguiente: **Fase 3: Core Features** — User dashboard and settings

---
```

### Planificar una Fase

```
---

## ▶ Next Up

**Fase 2: Authentication** — JWT login flow with refresh tokens

`/clear` then:

`yapu:plan-phase 2`

---

**También disponible:**
- `yapu:discuss-phase 2` — recopilar contexto primero
- Revisar roadmap

---
```

### Fase Completa, Siguiente Lista

```
---

## ✓ Fase 2 Completa

3/3 planes ejecutados

## ▶ Next Up

**Fase 3: Core Features** — User dashboard, settings, y data export

`/clear` then:

`yapu:plan-phase 3`

---

**También disponible:**
- `yapu:discuss-phase 3` — recopilar contexto primero
- Revisar lo que Fase 2 construyó

---
```

### Milestone Completo

```
---

## 🎉 Milestone v1.0 Completo

Las 4 fases enviadas

## ▶ Next Up

**Iniciar v1.1** — questioning → research → requirements → roadmap

`/clear` then:

`yapu:new-milestone`

---
```

---

## Anti-patterns

### ✗ Solo comando (sin contexto)
```
## Para Continuar
Run `/clear`, then paste:
yapu:execute-phase 2
```
El usuario no sabe qué es 02-03.

### ✗ Fenced code blocks para comandos
```
```
yapu:plan-phase 3
```
```
Los fenced blocks dentro de templates crean ambigüedad de nesting. Usar inline backticks.

### ✗ Lenguaje "Otras opciones"
```
Otras opciones:
- Revisar roadmap
```
Suena como afterthought. Usar "También disponible:" en su lugar.
