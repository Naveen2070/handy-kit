# Changelog

## v0.4.3 (2025-08-21)

### ✨ New Features

- **Deps Group**

  - Added `deps size` command to analyze package sizes in `node_modules`.
  - Supports:

    - `--verbose` (show nested dependencies with sizes).
    - `--tree` (tree-like output).
    - `--table` (tabular output).
    - `--depth` (limit nested depth).
    - `--concurrency` (control parallel file reads).
    - `--export` (output in `json`, `txt`, or `md`).

- **Code Group**

  - Added `code unused` command to detect unused exports and unused files in a project.

### 🛠 Improvements

- **Git Stats**

  - Added `--metric` option (`commits`, `added`, `deleted`) for chart rendering.
  - Normalized bar lengths for better readability.

- Extended **templates system** to prepare for future support of formatting beyond errors/success (deps/tree/git outputs coming next).
- Documentation improvements:

  - Added **Roadmap** section with planned features.
  - Expanded examples across groups.
  - Clearer schema definition for scaffold templates.

### 🐛 Fixes

- Fixed minor inconsistencies in option aliases (`-o`, `-a`, etc.).
- Improved help messages for `scaffold` and `git` commands.

---

## v0.4.4 (2025-09-07)

### ✨ New Features

- **Deps Group**

  - Added `deps manage` command to handle dependency version upgrades with support for standard, minor, and major updates.
  - Implemented interactive upgrade type selection for a smoother user experience.
  - Added dry-run preview functionality to review changes before applying them.

### 🛠 Improvements

- Improved CLI error messaging for missing Git arguments, making issues easier to diagnose.
- Updated project dependencies to their latest versions.
- Enhanced help documentation for the new `deps manage` command.

### 🧪 Tests

- Added tests for Git CLI functionalities and the new dependency management features.
- Integrated Vitest configuration for improved testing workflows.

---
