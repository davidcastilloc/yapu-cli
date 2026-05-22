# Arquitectura de YapuCli

**YapuCli** es un framework ligero de ingeniería de contexto y meta-prompting diseñado para potenciar la precisión de **Antigravity CLI**. Su propósito es estructurar y delimitar de forma estricta la memoria operativa expuesta a los agentes autónomos de Antigravity para prevenir el fenómeno conocido como **degradación de contexto** (*context rot*).


> [!NOTE]
> La **Tríada de Memoria** (PROJECT.md, STATE.md, ROADMAP.md) es el corazón de YapuCli. Estos tres archivos forman la memoria persistente que las IAs usan para mantener coherencia entre sesiones.

---

## 1. El Problema: Degradación de Contexto (Context Rot)

A medida que una sesión de desarrollo con agentes de IA autónomos progresa, la ventana de contexto se llena de información histórica redundante: transcripciones de chats largos, listados de código intermedios, errores de compilación ya resueltos y comandos antiguos. 

Este exceso de datos degrada la capacidad del modelo para recordar las decisiones clave de arquitectura y los requisitos del negocio, induciendo a errores y desvíos técnicos.

---

## 2. La Solución: Tríada de Memoria Estática

Yapu resuelve la degradación de contexto mediante la imposición de una **tríada de memoria estática** en la raíz del proyecto. Estos tres archivos Markdown actúan como un ancla contextual invariable y de lectura constante para el agente:

```
┌─────────────────────────────────────────────────────────────┐
│                      WORKSPACE ROOT                         │
│                                                             │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│   │  PROJECT.md   │  │  ROADMAP.md   │  │   STATE.md    │   │
│   │               │  │               │  │               │   │
│   │ Arquitectura  │  │   Fases de    │  │ Tarea Activa  │   │
│   │ y Mandamientos│  │  Desarrollo   │  │   y Notas     │   │
│   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
└───────────┼──────────────────┼──────────────────┼───────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
            ┌─────────────────────────────────────┐
            │   .antigravity/workflows/execute.md │
            │                                     │
            │        Directiva de Sistema         │
            └─────────────────────────────────────┘
```

### I. PROJECT.md: La Visión y Arquitectura Intocable
- **Propósito**: Contiene la identidad esencial del proyecto (stack tecnológico principal, reglas estrictas de arquitectura y mandamientos del código).
- **Alcance**: No cambia durante las fases regulares de programación. Le indica al agente los límites de diseño que jamás debe cruzar.

### II. ROADMAP.md: El Mapa de Ruta Secuencial
- **Propósito**: Describe el ciclo de vida del proyecto desglosado en fases aisladas.
- **Alcance**: Define qué fases han sido completadas `[x]` y cuál es la siguiente fase pendiente. Antigravity solo tiene permitido concentrarse en una sola fase a la vez.

### III. STATE.md: La Memoria de Trabajo del Agente
- **Propósito**: Almacena a corto plazo el estado activo de la ejecución, detallando la lista de tareas específicas y notas temporales de contexto (como decisiones tomadas durante el debugging o comandos a recordar).
- **Alcance**: Limpiado dinámicamente al transicionar de fase para erradicar tokens innecesarios de la sesión del agente.

---

## 3. Flujo de Ejecución Basado en Directivas

En lugar de delegar la orquestación a un planificador complejo, Yapu introduce una **Directiva de Sistema** almacenada en `.antigravity/workflows/execute.md`.

Cuando Antigravity CLI invoca un agente para completar código, este carga el workflow `execute.md`, el cual fuerza al agente a seguir estas reglas estrictas:
1. **Foco Absoluto**: Consultar `STATE.md` para identificar la tarea marcada como pendiente `[ ]`. El agente tiene prohibido trabajar en tareas fuera del scope activo.
2. **Uso de Skills Nativas**: Utilizar las herramientas de Antigravity CLI (`fs_read`, `fs_write`, `shell_exec`, etc.) únicamente para resolver la tarea seleccionada.
3. **Autoverificación Obligatoria**: Correr tests locales y validar sintaxis/compilación antes de dar por buena la implementación.
4. **Registro de Progreso**: Marcar la tarea con `[x]` en `STATE.md` y actualizar las notas de contexto de ejecución si surgen descubrimientos relevantes.
