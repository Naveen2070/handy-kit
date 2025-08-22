# handy-kit

A modular CLI tool for developers to manage licenses, Git standups, and scaffold repeatable project structures.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Command Groups](#command-groups)
  - [License](#license)
    - [Generate License](#generate-license)
    - [Generate Credits](#generate-credits)
  - [Git](#git)
    - [Git Standup](#git-standup)
  - [Scaffold](#scaffold)
    - [Create Directory Structure](#create-directory-structure)
- [Help & Templates](#help--templates)
- [Contributing](#contributing)
- [License](#license-info)

---

## Installation

Install globally via npm:

```bash
npm install -g @handykit/cli
```

Verify installation:

```bash
handy-kit --version # v0.4.0
or
handy-kit -v # v0.4.0
```
---

## Getting Started

All commands follow the structure:

```bash
handy-kit <group> <command> [options]
```

Available groups: `license`, `git`, `scaffold`.

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
