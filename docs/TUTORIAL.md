# 🐣 My First Day with YapuCli — A Beginner's Tutorial

Welcome to the world of AI-assisted software development! If you are taking your first steps in programming, it's very common to feel overwhelmed by how many things you need to remember: the language, the database, how to connect everything, and what task comes next.

This is where **YapuCli 🪺** comes in!

---

## 🧠 The Simple Analogy: What is YapuCli?

Imagine you are building a toy Lego house with a super-fast robotic assistant (the AI, such as ChatGPT, Cursor, or Cline). Your assistant can place blocks at the speed of light, but it has **short-term memory loss**: every 15 minutes, it forgets which block colors you wanted to use or what part of the house it was building.

To prevent wasting time repeating yourselves, you and your assistant use a **physical notebook**:
1. **The Golden Rules (`PROJECT.md`)**: "We only use blue and yellow blocks, and windows go on the second floor."
2. **The Blueprint (`ROADMAP.md`)**: "Phase 1: The foundation. Phase 2: The walls. Phase 3: The roof."
3. **Today's Task (`STATE.md`)**: "Today we are placing the 4 corner columns."

**YapuCli** is the tool that creates and organizes this "physical notebook" on your computer, so your AI assistant works flawlessly and you never feel lost.

---

## 🚀 Step 1: Installation (Preparing Your Workspace)

To use YapuCli, you need [Node.js](https://nodejs.org/) installed on your computer.

<!-- tabs:start -->
#### **npx (no install needed)**

You don't need to install anything permanently. You can run Yapu directly using `npx`, which is like borrowing the tool from the internet every time you use it:

```termynal
$ npx @davidsd/yapu-cli init
🪺 Initializing YapuCli...
--
✅ .planning/ directory scaffolded.
✅ STATE.md initialized.
✅ ROADMAP.md initialized.
🪺 Deploying complete arsenal of fibers...
🔥 10 workflows loaded in .agents/skills/
```

#### **Global install**

If you prefer to install it globally on your system to use the direct `yapu` command:

```termynal
$ npm install -g @davidsd/yapu-cli
added 1 package in 3s
--
$ yapu init
🪺 Initializing YapuCli...
--
✅ .planning/ directory scaffolded.
✅ STATE.md initialized.
✅ ROADMAP.md initialized.
🪺 Deploying complete arsenal of fibers...
🔥 10 workflows loaded in .agents/skills/
```

<!-- tabs:end -->

---

## 🪺 Step 2: Creating the Nest (Initializing a Project)

1. Open your terminal or console.
2. Create a new folder for your project and enter it:
   ```termynal
   $ mkdir my-first-project
   $ cd my-first-project
   ```
3. Run the Yapu initialization command:
   ```termynal
   $ npx @davidsd/yapu-cli init
   🪺 Initializing YapuCli...
   --
   ✅ .planning/ directory scaffolded.
   ✅ STATE.md initialized.
   ✅ ROADMAP.md initialized.
   🪺 Deploying complete arsenal of fibers...
   🔥 10 workflows loaded in .agents/skills/
   ```

**Magic!** You will see three main files appear in your folder (`PROJECT.md`, `ROADMAP.md`, `STATE.md`) along with a folder called `.planning/` where Yapu stores technical memory.

---

## 🏛️ Step 3: Define Your Vision in `PROJECT.md`

Open the `PROJECT.md` file in your code editor (like VS Code or Cursor). You will see it's a template. Your first job is to fill it with the "rules of the game."

**Example for a beginner:**
* **Stack**: HTML, vanilla CSS, and basic JavaScript.
* **Rules**: 
  * "I want my website design to be dark and modern."
  * "Use CSS variables for colors so they are easy to change."
  * "Write comments in Spanish/English explaining what each function does."

> [!TIP]
> By writing this, your AI assistant will know exactly how to write code without you having to remind it in every single prompt.

---

## 🗺️ Step 4: Draw Your Roadmap in `ROADMAP.md`

Programming is much easier when you divide a big problem into small parts (the *Divide and Conquer* principle). Open `ROADMAP.md` and create your development phases.

**Example of a Roadmap for a simple to-do list app:**
```markdown
- [ ] Phase 1: Design the basic HTML structure and dark styling.
- [ ] Phase 2: Add JavaScript to allow entering tasks and listing them on the screen.
- [ ] Phase 3: Add a button to delete completed tasks.
```

---

## 🌅 Step 5: Your Daily Routine (Day-to-Day with Yapu)

Here is the secret to starting your day like a professional programmer using Artificial Intelligence.

<!-- tabs:start -->
#### **☕ Morning: The Kickoff**

When you turn on your computer and open your code editor:
* Open your terminal and check your status:
  ```termynal
  $ npx @davidsd/yapu-cli status
  🪺 YapuCli Status
  --
  📋 Active Phase: Phase 1
  ✅ Completed: 2/5 tasks
  ⏳ Pending: 3 tasks
  ```
  This gives you a quick snapshot in the terminal of what you are doing and what phase you are in.
* Open `STATE.md`. This is your plan for the day. Configure your active phase and add the specific tasks for today.
  ```markdown
  # Project State - Phase 1
  - [ ] Create index.html file.
  - [ ] Create style.css file with dark background.
  - [ ] Add the text input form.
  ```

#### **🤖 During the Day: Coding with Your AI**

When you open your chat with the AI (Cursor, Cline, or whatever you use), give it this initial prompt:

> [!NOTE]
> *"Hi. Let's start coding. Read `PROJECT.md`, `ROADMAP.md`, and `STATE.md` to understand our app's rules, the general plan, and which task we are working on today. Please take the first pending task from `STATE.md` and let's write some code!"*

The AI will read your directives and start coding. As the AI completes the code:
1. It will ask for your permission to save or modify files.
2. Once you verify that the code works, the AI **will check off the task** in `STATE.md` by changing `[ ]` to `[x]`.
3. You will see the change in real-time.

> [!TIP]
> If you want to monitor everything in real-time in a super cool way, open another terminal and run:

```termynal
$ npx @davidsd/yapu-cli dash
🪺 YapuCli Dashboard v1.0
--
Loading neural activity...
```

You'll see a hacker-style dashboard interface that updates itself as the AI checks off tasks!

> [!TIP]
> Want something even more powerful? Launch the **Command Center** in your browser:

```termynal
$ npx @davidsd/yapu-cli board
🪺 Command Center launching...
--
🌐 Open http://localhost:3333 in your browser
```

This opens a premium web dashboard where you can see tasks, neural activity from your AI, and even run yapu commands with a single click — all from your browser!

#### **🌌 Night: Save Your Progress (The Handoff)**

When you decide it's time to rest or call it a day, you need to leave a **bookmark** in your development book so that the next day (or if you share your code with another developer) you know exactly where you left off.

Run in your terminal:

```termynal
$ npx @davidsd/yapu-cli handoff
🪺 Generating handoff report...
--
✅ .continue-here.md generated.
📋 3 tasks completed today.
📝 2 files modified.
```

Yapu will generate a file called `.continue-here.md` that summarizes exactly:
* What you accomplished today.
* Which files were modified.
* What task was left half-done or should be the first to be resumed tomorrow.

> [!NOTE]
> The next day, just tell your AI: *"Read `.continue-here.md` and let's continue,"* and you'll slide back into the zone instantly.

<!-- tabs:end -->

---

## 💡 Golden Tips for Beginners

> [!TIP]
> **One thing at a time**: Never try to program Phase 1 and Phase 3 together. Follow the strict order of your `ROADMAP.md`.

> [!TIP]
> **Test early and often**: Every time the AI writes a function or a block of code, test it in your browser. Don't let the AI write 100 lines of code without verifying that the first 10 work.

> [!WARNING]
> **Keep the notebook updated**: Always keep `STATE.md` and `PROJECT.md` up to date. If you decide to change a color or a rule in your project, modify it in `PROJECT.md` so the AI doesn't keep using the old rule.

That's it! With this routine, programming with Artificial Intelligence will no longer feel chaotic. YapuCli keeps you in total control of your project. Happy coding! 🪺
