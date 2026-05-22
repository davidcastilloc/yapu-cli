<p align="center">
  <strong>🇻🇪 <a href="CONTRIBUTING.es.md">Leer en Español</a></strong>
</p>

# Contribution Guide — YapuCli 🪺

Thank you for your interest in contributing to YapuCli! This document outlines how you can collaborate with the project.

---

## 🚀 Quick Start

```bash
# 1. Fork the repository
gh repo fork davidcastilloc/yapu-cli --clone

# 2. Install development dependencies
cd yapu-cli
npm install

# 3. Create a branch for your changes
git checkout -b feat/my-new-feature

# 4. Make your changes and verify
npm run test
npm run lint

# 5. Commit and push
git add -A
git commit -m "feat: description of the change"
git push origin feat/my-new-feature

# 6. Open a Pull Request on GitHub
gh pr create
```

---

## 📋 Types of Contributions

### 🐛 Reporting Bugs
- Use the [Bug Report](https://github.com/davidcastilloc/yapu-cli/issues/new?template=bug_report.md) template.
- Include reproduction steps, expected vs. actual behavior, and details about your environment (Node.js, OS).

### 💡 Proposing Features
- Use the [Feature Request](https://github.com/davidcastilloc/yapu-cli/issues/new?template=feature_request.md) template.
- Describe the problem it solves and your proposed solution.

### 📝 Improving Documentation
- Typos, clarifications, additional examples — all are welcome.
- Documentation resides in `docs/`, `README.md`, and templates in `templates/`.

### 🔧 Contributing Code
- New CLI commands, enhancements to the `lib/artifacts.js` bridge module, or new workflows.

---

## 🏗️ Project Structure

```
yapu-cli/
├── bin/cli.js              # Main CLI entry point (22 commands)
├── lib/
│   ├── artifacts.js        # Bridge module with the Antigravity brain
│   ├── board.js            # Web Command Center (C2) server
│   ├── dashboard.js        # Zero-dependency TUI dashboard
│   ├── i18n.js             # Bilingual internationalization system
│   └── providers.js        # Multi-provider AI agent support
├── index.js                # Package entry point
├── templates/              # Templates deployed by yapu init
│   ├── yapu-*.md           # 41 workflows with Pre/Post-Sync
│   ├── yapu-*-schema.md    # 11 artifact schemas
│   ├── references/         # 25 reference files
│   ├── contexts/           # 3 operational contexts
│   └── codebase/           # 5 analysis templates
├── tests/cli.test.js       # Integration tests (29 tests)
├── docs/                   # Documentation
│   ├── COMMANDS.md          # CLI commands reference guide
│   ├── ARCHITECTURE.md      # Framework architecture document
│   └── USER-GUIDE.md        # User guide
└── .github/                # GitHub configuration
```

---

## ✅ Pull Request Requirements

### Before submitting your PR:

1. **All tests must pass**: `npm run test` → 0 failures
2. **Clean linter**: `npm run lint` → 0 errors
3. **No forbidden terms**: Do not use the words `tether`, `GSD`, or `get-shit-done`.
4. **Updated documentation**: If you add a command or workflow, please document it.
5. **No production dependencies**: YapuCli has **zero dependencies** — utilizing only `node:fs` and `node:path`. Let's keep it that way.

### Commit message convention:

```
feat: new feature
fix: bug fix
docs: documentation changes
refactor: code refactoring without behavior changes
test: adding or modifying tests
chore: maintenance tasks
```

Examples:
```
feat: add yapu health command for workspace validation
fix: resolve STATE.md parsing when no active phase is set
docs: document yapu brain log in COMMANDS.md
test: add test case for syncBrainToPlanning with empty brain
```

---

## 🔀 Workflow

```
  Your Fork                      Main Repository
  ─────────                      ───────────────
  
  1. Fork ──────────────────────► davidcastilloc/yapu-cli
  2. Clone to your machine
  3. Create branch feat/xxx
  4. Develop + tests + lint
  5. Push to your fork
  6. Open PR ───────────────────► Review by maintainer
  7. Feedback / Approval
  8. Merge ◄───────────────────── Your code is now in main!
```

---

## 🧪 How to Run Tests

```bash
# Run integration tests
npm run test

# Run static linter
npm run lint

# Test a specific command locally
node bin/cli.js init
node bin/cli.js status
node bin/cli.js brain list --path /path/to/brain
```

---

## 🦋 Releases & Versioning

This project uses **Changesets** to manage versioning and package publishing.

### 1. Documenting your changes
If you are submitting a PR that includes a user-facing change (bugfix, feature, chore), you MUST add a changeset file:
```bash
npm run changeset
```
This interactive prompt will ask:
- Which package is affected (select `@davidsd/yapu-cli`).
- The bump type: **major** (breaking changes), **minor** (new features), or **patch** (bugfixes).
- A short summary of the changes (this summary will be added directly to `CHANGELOG.md`).

Commit the generated `.changeset/*.md` file along with your PR.

### 2. Automated Releases
Once a PR is merged into `main`:
- A GitHub Actions workflow automatically checks for new changeset files.
- If changesets exist, it creates or updates a **"Version Packages" Pull Request**.
- When that PR is merged by a maintainer:
  1. It automatically bumps the version in `package.json` and updates `CHANGELOG.md`.
  2. It publishes the new version to **NPM**.
  3. It creates a corresponding GitHub Release.

---

## 📐 Style Guides

- **JavaScript**: ES Modules (`import`/`export`), single quotes, no semicolons.
- **Markdown**: Use Spanish for in-project reference documentation (e.g. `docs/`).
- **Emojis**: Always use 🪺 for Yapu branding instead of ⚓.
- **Workflows**: If you create a new workflow template, make sure it includes the standard `§ Pre-Sync` and `§ Post-Sync` blocks.

---

## 🪺 Areas Needing Help

| Area | Description | Difficulty |
|------|-------------|------------|
| Unit tests for `lib/` modules | Dedicated unit tests for lib modules (not just CLI-level integration tests) | 🟢 Low |
| Translations | Documentation and workflows in English | 🟢 Low |
| New Workflows | Custom agent workflow templates for specific use-cases | 🟡 Medium |

---

## 💬 Contact

- **Issues**: [github.com/davidcastilloc/yapu-cli/issues](https://github.com/davidcastilloc/yapu-cli/issues)
- **Email**: vikruzdavid@gmail.com
- **Author**: David Castillo ([@davidcastilloc](https://github.com/davidcastilloc))

---

## 📜 License

By contributing to YapuCli, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
