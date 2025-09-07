# handy-kit

A modular CLI tool for developers — manage licenses, analyze Git activity, inspect dependencies, find unused code, and scaffold repeatable project structures.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Command Groups](#command-groups)
  - [License](#license)
  - [Git](#git)
    - [Git Standup](#git-standup)
    - [Git Stats](#git-stats)
  - [Scaffold](#scaffold)
    - [Create Directory Structure](#create-directory-structure)
  - [Deps](#deps)
    - [Dependency Size](#dependency-size)
    - [Dependency Management](#dependency-management)
  - [Code](#code)
    - [Unused Exports & Files](#unused-exports--files)

---

## Installation

Install globally via npm:

```bash
npm install -g @handykit/cli
```

Verify installation:

```bash
handy-kit --version # v0.4.3
or
handy-kit -v # v0.4.3
```

---

## Getting Started

All commands follow the structure:

```bash
handy-kit <group> <command> [options]
```

Available groups: `license`, `git`, `scaffold`, `deps`, `code`.

Use `handy-kit <group> help` to see group-specific commands and usage.

---

## Command Groups

### License

Manage open-source licenses for your project.

#### Generate License

```bash
handy-kit license gen <type> --author "<name>" [--output <file>] [--force]
```

**Supported licenses:**

- MIT
- Apache-2.0
- BSD-3-Clause
- GPL-3.0
- MPL-2.0
- Unlicense

**Options:**

- `--author` / `-a` : Author name (required)
- `--output` / `-o` : Path to output license file (default: `LICENSE`)
- `--force` / `-f` : Overwrite existing file without prompt

**Example:**

```bash
handy-kit license gen MIT --author "Alice"
handy-kit license gen Apache-2.0 --author "Bob" --output LICENSE.txt
handy-kit license gen MIT --author "Charlie" --force
```

#### Generate Credits

Generates a `CREDITS.md` file with all dependencies and their licenses.

```bash
handy-kit license credits --output <file>
```

**Options:**

- `--output` / `-o` : Path to output credits file (default: `CREDITS.md`)

**Example:**

```bash
handy-kit license credits --output credits.md
```

---

### Git

Utilities to visualize Git activity.

#### Git Standup

Show commits in the last N days/weeks/months/years.

```bash
handy-kit git standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <file>]
```

**Options:**

- `--days` : Number of days to look back
- `--weeks` : Number of weeks to look back
- `--months` : Number of months to look back
- `--years` : Number of years to look back
- `--author` / `-a` : Filter by commit author
- `--branch` / `-b` : Filter by branch (comma-separated for multiple)
- `--export` / `-o` : Export report to file

**Example:**

```bash
handy-kit git standup --days 7
handy-kit git standup --weeks 2 --author "Alice"
handy-kit git standup --months 1 --branch main,develop --export report.md
```

#### Git Stats

Show commit stats grouped daily, weekly, or monthly, with optional charts.

```bash
handy-kit git stats [--since <date>] [--author <name>] [--daily|--weekly|--monthly] [--metric <commits|added|deleted>] [--export <format>]
```

**Options:**

- `--since` / `-s` : Filter commits by date
- `--author` / `-a` : Filter by commit author
- `--daily` : Show commits by daily summary
- `--weekly` : Show commits by weekly summary
- `--monthly` : Show commits by monthly summary
- `--metric` / `-m` : Show graph for commits, added lines, or deleted lines
- `--export` / `-o` : Export report to file

**Example:**

```bash
handy-kit git stats --since "2023-01-01"
handy-kit git stats --author "Alice" --daily --metric commits
handy-kit git stats --since "2023-01-01" --export report.md
```

---

### Scaffold

Create repeatable directory structures for projects.

#### Create Directory Structure

```bash
handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]
```

**Options:**

- `--entry` / `-e` : Base folder to create the structure (default: `src`)
- `--template` / `-t` : Template name (default: `react-default`)
- `--schema` / `-s` : Path to a custom JSON template

**Example:**

```bash
handy-kit scaffold dir --template react-default
handy-kit scaffold dir --entry app --template react-default
handy-kit scaffold dir --schema ./custom-template.json
```

The CLI will preview the folder structure and ask for confirmation before creation.

**schema definition:**

```json
{
  "folder_name": {
    "subfolder_name": {
      "files": {
        "file_name": {
          "type": "file_type",
          "content": "file_content"
        },
        "paths": ["file_path"]
      }
    }
  }
}
```

**note**: `content` is optional, to create a file or copy a file from a path always specify it inside the `files` object.

---

### Deps

Analyze project dependencies.

#### Dependency Size

Calculate size of dependencies in `node_modules` and nested dependencies.

```bash
handy-kit deps size [--verbose | -v] [--tree | -t] [--table | -T] [--depth <n>] [--concurrency <n>] [--export <md|json|txt>]
```

**Options:**

- `--verbose` / `-v` : Show nested dependencies with their sizes
- `--tree` / `-t` : Display in tree view
- `--table` / `-T` : Display as a table
- `--depth` / `-d` : Maximum depth of dependency tree (default: 3)
- `--concurrency` / `-c` : Maximum number of concurrent file reads (default: 10)
- `--export` / `-o` : Export report to file (supported formats: `md`, `json`, `txt` and default: `md`)

**Example:**

```bash
handy-kit deps size --verbose
handy-kit deps size --tree --depth 5
handy-kit deps size --table --export report.md
handy-kit deps size --verbose --export report.json
```

#### Dependency Management

Manage dependency versions.

```bash
handy-kit deps manage [--standard | --upgrade | --minor | --major] [--dry-run]
```

**Options:**

- `--upgrade | --standard` : Upgrade all dependencies to their latest versions
- `--minor` : Upgrade all dependencies to their latest minor versions
- `--major` : Upgrade all dependencies to their latest major versions

**Example:**

```bash
handy-kit deps manage --standard
handy-kit deps manage --minor --dry-run
```

---

### Code

Analyze project source code.

#### Unused Exports & Files

Find unused exports and files in your codebase.

```bash
handy-kit code unused [--path <dir>] [--exports] [--files] [--help]
```

**Options:**

- `--path` / `-p` : Path to analyze (default: `{cwd}/src`)
- `--exports` / `-e` : Show unused exports
- `--files` / `-f` : Show unused files
- `--help` / `-h` : Show this help message

**Example:**

```bash
handy-kit code unused --exports
handy-kit code unused --files
handy-kit code unused --path app --exports
handy-kit code unused --exports --files
```

---

## Help & Templates

Print the main help:

```bash
handy-kit help
```

Print group-specific help:

```bash
handy-kit <group> help
```

All error and success messages are template-based and can be extended via the `assets/templates` folder.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a pull request

---

## License Info

`handy-kit` itself is licensed under MIT.

Generated licenses and credits can be freely applied to your projects.

---

## Acknowledgements

- Inspired by the need for a simple, modular CLI tool
- Built with Node.js, modern ES modules, and readline for interactivity

---

## Roadmap

### ✅ Delivered in Latest Version

- **Interactive scaffold mode** — guided prompts to build directory structures interactively instead of only from templates.
- **Comprehensive testing** — initial test coverage across all commands and subcommands.
- **New `deps manage` command** — upgrade all dependencies with `--upgrade`, `--minor`, or `--major`.

### 🚀 Upcoming Features

- **Output formatting templates** — customizable layouts for `deps tree`, `deps table`, and Git charts.
- **Richer code quality checks** — extend `code` group with detection for unused imports, circular dependencies, and complexity reports.
- **Interactive reports** — rich TUI (terminal UI) dashboards for Git stats, dependency sizes, and code analysis.
- **Dependency management enhancements** — extend `deps manage` with selective upgrades (per dependency), safe rollback, and lockfile sync.
- **Performance profiling tools** — commands to analyze bundle size, build time, and runtime hotspots.
- **Project health reports** — a single command to combine git stats, dependency insights, and code quality checks into a summary dashboard.
- **Library quality improvements** — ongoing enhancements to performance, stability, and developer experience.

---
