# Conceptos MVP: Vertical Slices, Walking Skeleton y SPIDR

Referencia unificada para planificación MVP: cómo estructurar features como slices verticales, cuándo usar walking skeleton, y cómo dividir historias grandes con SPIDR.

---

## Vertical Slices

Un **vertical slice** atraviesa todas las capas del stack (UI → API → DB) para entregar un comportamiento end-to-end funcional. Contraste con horizontal slicing (Fase 1: schema, Fase 2: API, Fase 3: UI) que no produce valor usable hasta el final.

### Principio fundamental

Cada fase entrega algo que un usuario puede usar o verificar. No "la base de datos está lista" sino "un usuario puede registrarse".

### Reglas de ordenamiento

1. **Happy path primero** — demuestra que el slice funciona
2. **Edge cases después** — error handling, validaciones complejas
3. **Optimizaciones al final** — caching, performance, polish

### Formato de User Story

```
As a [user role], I want to [capability], so that [benefit].
```

Regex de validación: `/^As a .+, I want to .+, so that .+\.$/`

Cada fase MVP debe tener una user story que define su slice vertical.

---

## Walking Skeleton

Un **walking skeleton** es la primera fase de un proyecto MVP: la implementación mínima end-to-end que demuestra que el stack funciona junto.

### Cuándo se activa

- Fase 1 + proyecto nuevo + modo MVP + no hay SUMMARYs previos

### Qué incluye

- Scaffold del proyecto (framework, DB, config)
- UN flujo end-to-end completo (request → proceso → respuesta)
- Deployment mínimo (puede ser local)

### Qué NO incluye

- Features completos
- Error handling exhaustivo
- UI pulido
- Optimizaciones

### Propósito

Probar que las piezas se conectan antes de invertir en features. Si el skeleton no funciona, mejor saberlo con 1 día de trabajo que con 1 mes.

---

## SPIDR Story Splitting

Cuando una user story es demasiado grande para una sola fase, usar SPIDR para descomponerla en slices más pequeños.

### Cuándo dividir (señales de tamaño)

1. **Capacidades compuestas** — La story nombra 2+ acciones independientes unidas por "and" (ej: "registrarse **y** loguearse **y** resetear contraseña")
2. **Multi-actor** — La story nombra más de un rol de usuario (ej: "As a user or admin...")
3. **Longitud** — La story excede ~120 caracteres en una línea
4. **Capacidad vaga** — La capacidad es un sustantivo, no un par verbo-sustantivo (ej: "I want to use the dashboard")

Si ninguna señal aplica → omitir SPIDR y continuar.

### Los 5 Ejes SPIDR

Para cada eje, hacer UNA pregunta dirigida. Solo un eje se aplica por división.

#### Spike
> "¿Hay una incógnita que necesita investigación antes de implementar?"

Si sí: separar fase de investigación. El resto de la story se convierte en follow-up.

#### Paths
> "¿Este feature tiene un happy path y uno o más error/edge paths?"

Si sí: happy path en primera fase, edge paths en follow-ups.

#### Interfaces
> "¿Este feature necesita funcionar en más de una interfaz (web, mobile, API, CLI)?"

Si sí: dividir por interfaz. Web primero si es user-facing; API primero si es integration-driven.

#### Data
> "¿Este feature toca múltiples scopes de datos (un usuario vs. muchos, single team vs. multi-tenant)?"

Si sí: dividir por scope. Scope más pequeño primero, luego expandir.

#### Rules
> "¿Este feature tiene múltiples reglas de negocio que se pueden agregar incrementalmente?"

Si sí: dividir por complejidad de reglas. Reglas mínimas viables primero.

### Anti-patterns de splitting

- **Dividir por capa técnica.** "Fase 1: schema. Fase 2: API. Fase 3: UI." — Eso es horizontal. Rechazar.
- **Pre-dividir antes de mostrar la original.** Siempre mostrar la story al usuario primero.
- **Dividir más de un eje a la vez.** SPIDR es un eje por división. Si necesita dos ejes, hacer el primero y re-evaluar.

---

## Interacciones Clave

- **MVP_MODE es todo-o-nada por fase.** Una fase es MVP o estándar. No hay fases mixed-mode.
- **TDD_MODE es independiente de MVP_MODE.** Solo la intersección (ambos true) activa el MVP+TDD Gate.
- El **walking skeleton** y el **PRD** pueden coexistir en Fase 1 — el PRD informa qué debe probar el skeleton.
