<div class="hero-container">
  <img src="https://raw.githubusercontent.com/davidcastilloc/yapu-cli/main/yapu-banner.png" class="hero-logo" alt="YapuCli">
  <h1 class="hero-title">YapuCli 🪺</h1>
  <p class="hero-subtitle">Framework de ingeniería de contexto y memoria estática determinista para agentes autónomos y vibe coders.</p>
  
  <div class="lang-switcher in-hero">
    <button class="lang-btn btn-es" onclick="window.setLanguage('es')">ES 🇻🇪</button>
    <button class="lang-btn btn-en" onclick="window.setLanguage('en')">EN 🇺🇸</button>
  </div>
</div>

<p align="center">
  <strong>Zero dependencias externas</strong> — Construido nativamente con <code>node:fs</code> y <code>node:path</code>.
</p>

<div class="cards-grid">
  <a href="#/TUTORIAL.es.md" class="card-item">
    <div class="card-icon">🐣</div>
    <h3 class="card-title">Mi Primer Día (Tutorial)</h3>
    <p class="card-desc">Guía ilustrada y súper sencilla paso a paso para aprender a programar usando Yapu y tu asistente IA.</p>
  </a>

  <a href="#/ARCHITECTURE.es.md" class="card-item">
    <div class="card-icon">🏛️</div>
    <h3 class="card-title">Arquitectura de Memoria</h3>
    <p class="card-desc">Conoce la Tríada de Memoria (PROJECT, ROADMAP, STATE) y cómo sincroniza el cerebro efímero de tu IA.</p>
  </a>
  
  <a href="#/COMMANDS.es.md" class="card-item">
    <div class="card-icon">🛠️</div>
    <h3 class="card-title">Comandos y CLI</h3>
    <p class="card-desc">Detalle completo de los 10 comandos esenciales (init, status, dash, gc, rescue, y más).</p>
  </a>
  
  <a href="#/WORKFLOW.es.md" class="card-item">
    <div class="card-icon">💡</div>
    <h3 class="card-title">Flujo Vibe Coders</h3>
    <p class="card-desc">Guía práctica para programar con asistencia de IA de manera súper fluida en Cursor, Cline y Windsurf.</p>
  </a>
  
  <a href="#/USER-GUIDE.es.md" class="card-item">
    <div class="card-icon">📖</div>
    <h3 class="card-title">Guía de Usuario</h3>
    <p class="card-desc">Configuración avanzada, integración con pipelines de CI/CD y despliegue del avispero con Yapu Guard.</p>
  </a>
  
  <a href="#/LLM_INSTALLER.es.md" class="card-item">
    <div class="card-icon">🤖</div>
    <h3 class="card-title">Instalador para IAs</h3>
    <p class="card-desc">Carga este prompt en tu IA para que asimile todas las reglas de Yapu de forma 100% automatizada.</p>
  </a>
</div>

<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 40px 0;">

## 🚀 Inicio Rápido (Onboarding en 60 Segundos)

### 1. Instalación y Fundación
Entra en la carpeta de tu proyecto y ejecuta el inicializador de Yapu:

```bash
npx @davidsd/yapu-cli init
```

*Esto creará en tu raíz los archivos esenciales de memoria estática (`PROJECT.md`, `ROADMAP.md`, `STATE.md`) y la carpeta `.planning/`.*

### 2. Alinear a tu IA
Abre tu chat de IA (Cursor, Cline, Windsurf, etc.) e inícialo con este prompt exacto:

> **Prompt inicial:** "Lee los archivos `PROJECT.md`, `ROADMAP.md` y `STATE.md` para entender las reglas de nuestra aplicación, el plan general y en qué tarea estamos trabajando hoy. ¡Por favor, toma la primera tarea pendiente de `STATE.md` y desarrollemos el código!"

### 3. Monitoreo en Tiempo Real
Mientras tu IA escribe y tacha tareas en vivo (`[x]`), puedes abrir una segunda terminal y correr el monitor interactivo:

```bash
npx @davidsd/yapu-cli dash
```

*¡Verás una interfaz TUI ultra-rápida y fluida estilo Matrix actualizándose con tu progreso en tiempo real!*
