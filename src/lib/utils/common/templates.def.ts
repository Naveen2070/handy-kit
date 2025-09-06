export const TEMPLATES = {
  help: {
    main: `Usage: handy-kit <group> <command> [options]

Groups:
  license     Manage open-source licenses
  git         Git utilities
  scaffold    Scaffold repeatable structures
  deps        Dependency related commands
  code        Code analysis related commands

Commands:
  handy-kit license gen <type> --author "Name"   Generate an open-source license (Supported: MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense)
  handy-kit git standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <path>]
  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]
  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]
  handy-kit deps size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]
  handy-kit deps manage [--standard | --upgrade | --minor | --major] [--dry-run]
  handy-kit code unused [--path | -p] [--exports | -e] [--files | -f] [--help | -h]
  `,

    license: `Manage open-source licenses

Subcommands:
  gen <type> --author "Name"   Generate an open-source license
  credits --output <file>      Generate a credits file with all used libraries and their licenses

Examples:
  handy-kit license gen MIT --author "Alice"
  handy-kit license gen Apache-2.0 --author "Bob"
  handy-kit license credits --output "credits.md"

Supported licenses:
  MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense`,

    "license-gen": `Generate an open-source license

Usage:
  handy-kit license gen <type> --author "Name"

Supported licenses:
  MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense

Options:
  --author <name>   The author of the project
  --output <file>   The path to write the license file to
  --force           Overwrite the output file if it already exists
    `,

    "license-credits": `Generate a credits file with all used libraries and their licenses

Usage:
  handy-kit license credits --output <file>

Options:
  --output <file>   The path to write the credits file to (default: "credits.md")
    `,

    git: `Git utilities

Subcommands:
  standup [options]   Show git commits from the last n days/weeks/months/years
  stats [options]    Show git status from the last n days/weeks/months

Usage:
  handy-kit git standup --days <n>
  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]
  `,

    "git-standup": `Show git commits from the last n days/weeks/months/years

Usage:
  handy-kit git standup --days <n>

Options:
  --days <n>      Number of days to look back
  --weeks <n>     Number of weeks to look back
  --months <n>    Number of months to look back
  --years <n>     Number of years to look back
  --author <name> Filter commits by author
  --branch <name> Filter commits by branch
  --export <path> Export commits to a file
    `,

    "git-stats": `Show git stats from the last n days/weeks/months

Usage:
  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]

Options:
  --since <date>   Filter commits by date
  --author <name>  Filter commits by author
  --daily          Show commits for the last day
  --weekly         Show commits for the last week
  --monthly        Show commits for the last month
  --metric <commits|added|deleted>  Show graph for commits, added lines or deleted lines
  --export <format>  Export commits to a file(supported: md, json, txt)
    `,

    scaffold: `Scaffold repeatable structures

Subcommands:
  dir [--entry <folder>] [--template <name>] [--schema <path>]   Create a directory structure

Usage:
  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]`,

    "scaffold-dir": `Create a directory structure

Usage:
  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]

Options:
  --entry <folder>   The folder to create the directory structure in (default: ".")
  --template <name>  The name of the template to use (default: "default")
  --schema <path>      The path to write the directory structure to (default: "scaffold")
    `,
    deps: `Dependency related commands

Subcommands:
  size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]   Show dependency sizes
  manage [--standard | --upgrade | --minor | --major] [--dry-run]   Manage dependency versions

Usage:
  handy-kit deps size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]
  handy-kit deps manage [--standard | --upgrade | --minor | --major] [--dry-run]
  `,
    "deps-size": `Show dependency sizes

Usage:
  handy-kit deps size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]

Options:
  --verbose | -v   Show all dependencies
  --tree | -t      Show dependency tree
  --table | -t     Show dependency table
  --depth | -d     search depth level (default: 3)
  --concurrency | -c     concurrent file reads (default: 10)
  --export | -e     Export dependency sizes to a file
    `,

    "deps-manage": `Manage dependency versions

Usage:
  handy-kit deps manage [--standard | --upgrade | --minor | --major] [--dry-run]

Options:
  --standard | --upgrade | --minor | --major   Manage dependency versions
  --dry-run   Preview changes without making them
    `,

    code: `Code related commands

Subcommands:
  unused [--path | -p] [--exports | -e] [--files | -f] [--help | -h]  Show unused exports and files

Usage:
  handy-kit code unused [--path | -p] [--exports | -e] [--files | -f] [--help | -h]
  `,
    "code-unused": `Show unused exports and files

Usage:
  handy-kit code unused [--path | -p] [--exports | -e] [--files | -f] [--help | -h]

Options:
  --path | -p     The path to search for unused exports and files
  --export | -e   Export unused exports and files to a file
  --files | -f    Show unused files
  --help | -h     Show this help message
    `,
  },

  errors: {
    unknownCommand: `❌ Unknown command: '{{command}}'

Usage: handy-kit <group> <command> [options] (Use 'handy-kit <group> help' for more information)`,
    unknownGroup: `❌ Unknown group: '{{group}}'

Available groups:
  license, git (Use 'handy-kit help' for more information)`,
    missingLicenseArgs:
      "❌ Missing required arguments for 'license gen': <type> --author <name>",
    unsupportedLicense:
      "❌ License type '{{type}}' not supported.\nSupported types: MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense",
    missingGitArgs:
      "❌ Missing required arguments for 'git standup'. Use --days, --weeks, --months, or --years",
    invalidDays:
      "❌ Invalid argument: --days/--weeks/--months/--years must be a positive integer",
    noCommits: "ℹ️ No commits found in the given time range",
    notAGitRepo: "❌ Not a git repository or unable to fetch logs.",
    unknownError: "❌ An error occurred: {{error}}",
  },

  success: {
    licenseGen:
      "✅ License '{{type}}' successfully generated by {{author}}.\n License saved to '{{outputPath}}'",
    gitStandup: "✅ Showing git commits for the given time range.",
    licenseCreated:
      "✅ License file {{type}} created successfully by {{author}} at {{outputPath}}",
    licenseReplaced: "♻️ License file replaced successfully at {{outputPath}}",
    gitStandupNoCommits: "ℹ️ No commits found in the given time range.",
    gitStats: "✅ Showing git stats since {{since}}.",
  },
} as const;

export type Templates = typeof TEMPLATES;
