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
