<div class="hero-container">
  <img src="https://raw.githubusercontent.com/davidcastilloc/yapu-cli/main/yapu-banner.png" class="hero-logo" alt="YapuCli">
  <h1 class="hero-title">YapuCli 🪺</h1>
  <p class="hero-subtitle">Context engineering and deterministic static memory framework for autonomous agents and vibe coders.</p>
  
  <div class="lang-switcher in-hero">
    <button class="lang-btn btn-es" onclick="window.setLanguage('es')">ES 🇻🇪</button>
    <button class="lang-btn btn-en" onclick="window.setLanguage('en')">EN 🇺🇸</button>
  </div>
</div>

<p align="center">
  <strong>Zero external dependencies</strong> — Built natively using <code>node:fs</code> and <code>node:path</code>.
</p>

## 🚀 Quick Start (60-Second Onboarding)

### 1. Installation & Foundation
Go into your project directory and run the Yapu initializer:

```bash
npx @davidsd/yapu-cli init
```

*This scaffolds the core static memory files (`PROJECT.md`, `ROADMAP.md`, `STATE.md`) along with the `.planning/` directory.*

### 2. Align Your AI
Open your AI chat interface (Cursor, Cline, Windsurf, etc.) and kick off the session with this exact prompt:

> **Initial Prompt:** "Read the `PROJECT.md`, `ROADMAP.md`, and `STATE.md` files to understand our application's rules, the general roadmap, and today's active tasks. Please grab the first pending task from `STATE.md` and let's start writing some code!"

### 3. Real-Time Dashboard
As your AI assistant codes and checks off tasks (`[x]`), you can open a secondary terminal to run the interactive dashboard:

```bash
npx @davidsd/yapu-cli dash
```

*Enjoy a beautiful, zero-dependency TUI dashboard showing week's worth of progress in real time!*

<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 45px 0;">

## 🏛️ Explore the Colony (Detailed Documentation)

<div class="cards-grid">
  <a href="#/TUTORIAL.md" class="card-item">
    <div class="card-icon">🐣</div>
    <h3 class="card-title">My First Day (Tutorial)</h3>
    <p class="card-desc">Super simple, step-by-step illustrated guide to learn programming using Yapu and your AI assistant.</p>
  </a>

  <a href="#/ARCHITECTURE.md" class="card-item">
    <div class="card-icon">🏛️</div>
    <h3 class="card-title">Memory Architecture</h3>
    <p class="card-desc">Discover the Memory Triad (PROJECT, ROADMAP, STATE) and how it synchronizes your AI's ephemeral brain.</p>
  </a>
  
  <a href="#/COMMANDS.md" class="card-item">
    <div class="card-icon">🛠️</div>
    <h3 class="card-title">Commands & CLI</h3>
    <p class="card-desc">Deep-dive into the 10 essential CLI commands (init, status, dash, gc, rescue, and more).</p>
  </a>
  
  <a href="#/WORKFLOW.md" class="card-item">
    <div class="card-icon">💡</div>
    <h3 class="card-title">Vibe Coder Workflow</h3>
    <p class="card-desc">Step-by-step integration guide for working frictionlessly with Cursor, Cline, and Windsurf.</p>
  </a>
  
  <a href="#/USER-GUIDE.md" class="card-item">
    <div class="card-icon">📖</div>
    <h3 class="card-title">User Guide</h3>
    <p class="card-desc">Advanced configuration, CI/CD pipeline integration, and deploying the Yapu Guard hooks.</p>
  </a>
  
  <a href="#/LLM_INSTALLER.md" class="card-item">
    <div class="card-icon">🤖</div>
    <h3 class="card-title">LLM Installer</h3>
    <p class="card-desc">Feed this prompt to your AI assistant so it assimilates all Yapu rules 100% autonomously.</p>
  </a>
</div>
