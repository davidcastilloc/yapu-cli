# YapuCli Architecture

**YapuCli** is a lightweight context-engineering and meta-prompting framework designed to boost the precision of **Antigravity CLI**. Its purpose is to strictly structure and delimit the operational memory exposed to autonomous Antigravity agents, preventing the phenomenon known as **context rot**.


> [!NOTE]
> The **Memory Triad** (PROJECT.md, STATE.md, ROADMAP.md) is the heart of YapuCli. These three files form the persistent memory that AIs use to maintain coherence across sessions.

---

## 1. The Problem: Context Rot

As a development session with autonomous AI agents progresses, the context window gets filled with redundant historical information: long chat transcripts, intermediate code listings, already resolved compilation errors, and old commands.

This excess data degrades the model's ability to recall key architectural decisions and business requirements, inducing bugs and technical drift.

---

## 2. The Solution: Static Memory Triad

Yapu solves context rot by enforcing a **static memory triad** in the project root. These three Markdown files act as an unvarying, constantly read contextual anchor for the agent:

```
┌─────────────────────────────────────────────────────────────┐
│                      WORKSPACE ROOT                         │
│                                                             │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│   │  PROJECT.md   │  │  ROADMAP.md   │  │   STATE.md    │   │
│   │               │  │               │  │               │   │
│   │ Architecture  │  │  Development  │  │ Active Task   │   │
│   │ & Mandaments  │  │    Phases     │  │   & Notes     │   │
│   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │
└───────────┼──────────────────┼──────────────────┼───────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
            ┌─────────────────────────────────────┐
            │   .antigravity/workflows/execute.md │
            │                                     │
            │          System Directive           │
            └─────────────────────────────────────┘
```

### I. PROJECT.md: The Vision and Untouchable Architecture
- **Purpose**: Contains the essential identity of the project (main technology stack, strict architectural rules, and code mandaments).
- **Scope**: Does not change during regular programming phases. It instructs the agent on the design boundaries it must never cross.

### II. ROADMAP.md: The Sequential Roadmap
- **Purpose**: Describes the project lifecycle broken down into isolated phases.
- **Scope**: Defines which phases have been completed `[x]` and what the next pending phase is. Antigravity is only allowed to focus on one single phase at a time.

### III. STATE.md: The Agent's Working Memory
- **Purpose**: Stores the short-term active execution state, detailing the list of specific tasks and temporary context notes (such as decisions made during debugging or commands to remember).
- **Scope**: Dynamically cleared when transitioning phases to eradicate unnecessary tokens from the agent's session.

---

## 3. Directive-Based Execution Flow

Instead of delegating orchestration to a complex planner, Yapu introduces a **System Directive** stored in `.antigravity/workflows/execute.md`.

When Antigravity CLI invokes an agent to complete code, it loads the `execute.md` workflow, which forces the agent to follow these strict rules:
1. **Absolute Focus**: Consult `STATE.md` to identify the task marked as pending `[ ]`. The agent is forbidden from working on tasks outside the active scope.
2. **Use of Native Skills**: Use Antigravity CLI tools (`fs_read`, `fs_write`, `shell_exec`, etc.) solely to resolve the selected task.
3. **Mandatory Self-Verification**: Run local tests and validate syntax/compilation before considering the implementation successful.
4. **Progress Logging**: Mark the task as completed `[x]` in `STATE.md` and update execution context notes if relevant discoveries arise.
