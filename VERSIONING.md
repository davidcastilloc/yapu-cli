# Versioning and Release Strategy - YapuCli

YapuCli follows the [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/) specifications.

## Version Format

Each version of the framework is defined under the `MAJOR.MINOR.PATCH` nomenclature:

- **MAJOR**: Incompatible changes with previous versions (e.g., disruptive changes to the required structure of the context or the static memory triad `PROJECT.md`, `ROADMAP.md`, `STATE.md`).
- **MINOR**: Backward-compatible features added (e.g., new optional templates for system directives, or improvements to the `yapu init` CLI injector).
- **PATCH**: Backward-compatible bug fixes (e.g., minor format adjustments to Markdown templates, or minor Node.js bug fixes in `bin/cli.js`).

## Main Branches and Development Cycle

The development of Yapu is structured around the following Git branches:

- **main**: Represents the current stable production state. All code in `main` must pass the integration tests.
- **feature/* / bugfix/* / chore/**: Temporary branches used to add features, fix bugs, or perform maintenance work, respectively. They are merged into `main` once tested and approved.

## Publication on the Package Registry (npm)

The official distribution is published in the `npm` package registry under the name `@davidsd/yapu-cli`:

```bash
# Recommended stable installation
npm install -g @davidsd/yapu-cli
```
