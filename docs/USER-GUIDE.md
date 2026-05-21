# User Guide - YapuCli

This guide will walk you through the steps to install, configure, and interact with the **YapuCli** framework in your development projects using the **Antigravity CLI**.

---

## 1. Installation and Setup

Yapu is packaged to be installed globally or locally via `npm`.

### Global Installation (Recommended)
```bash
npm install -g yapu-cli
```

Once installed, the `yapu` command will be available globally in your terminal.

---

## 2. Initializing a Project with Yapu

To prepare your current repository to work under the strict context engineering of Yapu, execute the `init` command at the root of your project:

```bash
yapu init
```

### What does `yapu init` do?
This command creates the framework's infrastructure in your current working directory:
1. **Static Memory Scaffolding**:
   - `PROJECT.md`: Initial file to document your vision, technology stack, and architectural mandaments.
   - `ROADMAP.md`: Structure to organize your development into discrete, isolated phases.
   - `STATE.md`: Short-term memory state template for the agent to register its tasks for the current cycle.
2. **Execution Directive Injection**:
   - Creates the `.agents/skills/` directory and subdirectories.
   - Dynamically loads and deploys all the meta-prompting workflow files (`yapu-*.md`), references, contexts, and codebase templates.

> [!IMPORTANT]
> **Data Protection**: `yapu init` is designed with safety in mind. If files with the same names already exist in your current directory, the CLI will print a warning and skip them to avoid overwriting your previous data or configurations.

---

## 3. Daily Workflow with Yapu

The development cycle with Yapu consists of three simple steps that guarantee your context remains clean:

### Step 1: Configure Vision and Roadmap
1. Fill in the sections of `PROJECT.md` with your stack and rules.
2. Define your sequential development phases in `ROADMAP.md`.

### Step 2: Activate a Phase in `STATE.md`
When you are ready to develop a phase, open `STATE.md` and configure:
- **ACTIVE PHASE**: Indicate the number and name of the phase from the roadmap.
- **Tasks of the Current Phase**: Write a list of detailed tasks with `[ ]` (uncompleted).

### Step 3: Launch Antigravity CLI
Start your Antigravity CLI session. The agent will automatically detect the system directives in `.agents/skills/yapu-execute.md` and the static memory files in the root:
1. The agent will read `STATE.md` to extract the first pending task.
2. It will develop the changes respecting the rules defined in `PROJECT.md`.
3. It will verify the changes locally by running tests.
4. It will mark the task as completed `[x]` and log the progress in `STATE.md`.
5. Upon phase completion, clear the temporary history in `STATE.md` and activate the next phase of `ROADMAP.md` using `yapu archive` to keep the context free of clutter.
