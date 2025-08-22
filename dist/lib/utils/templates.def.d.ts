export declare const TEMPLATES: {
    readonly help: {
        readonly main: "Usage: handy-kit <group> <command> [options]\n\nGroups:\n  license     Manage open-source licenses\n  git         Git utilities\n  scaffold    Scaffold repeatable structures\n\nCommands:\n  handy-kit license gen <type> --author \"Name\"   Generate an open-source license (Supported: MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense)\n  handy-kit git standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <path>]\n  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]\n  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]";
        readonly license: "Manage open-source licenses\n\nSubcommands:\n  gen <type> --author \"Name\"   Generate an open-source license\n  credits --output <file>      Generate a credits file with all used libraries and their licenses\n\nExamples:\n  handy-kit license gen MIT --author \"Alice\"\n  handy-kit license gen Apache-2.0 --author \"Bob\"\n  handy-kit license credits --output \"credits.md\"\n\nSupported licenses:\n  MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense";
        readonly "license-gen": "Generate an open-source license\n\nUsage:\n  handy-kit license gen <type> --author \"Name\"\n\nSupported licenses:\n  MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense\n\nOptions:\n  --author <name>   The author of the project\n  --output <file>   The path to write the license file to\n  --force           Overwrite the output file if it already exists\n    ";
        readonly "license-credits": "Generate a credits file with all used libraries and their licenses\n\nUsage:\n  handy-kit license credits --output <file>\n\nOptions:\n  --output <file>   The path to write the credits file to (default: \"credits.md\")\n    ";
        readonly git: "Git utilities\n\nSubcommands:\n  standup [options]   Show git commits from the last n days/weeks/months/years\n  stats [options]    Show git status from the last n days/weeks/months\n\nUsage:\n  handy-kit git standup --days <n>\n  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]\n  ";
        readonly "git-standup": "Show git commits from the last n days/weeks/months/years\n\nUsage:\n  handy-kit git standup --days <n>\n\nOptions:\n  --days <n>      Number of days to look back\n  --weeks <n>     Number of weeks to look back\n  --months <n>    Number of months to look back\n  --years <n>     Number of years to look back\n  --author <name> Filter commits by author\n  --branch <name> Filter commits by branch\n  --export <path> Export commits to a file\n    ";
        readonly "git-stats": "Show git stats from the last n days/weeks/months\n\nUsage:\n  handy-kit git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]\n\nOptions:\n  --since <date>   Filter commits by date\n  --author <name>  Filter commits by author\n  --daily          Show commits for the last day\n  --weekly         Show commits for the last week\n  --monthly        Show commits for the last month\n  --metric <commits|added|deleted>  Show graph for commits, added lines or deleted lines\n  --export <format>  Export commits to a file(supported: md, json, txt)\n    ";
        readonly scaffold: "Scaffold repeatable structures\n\nSubcommands:\n  dir [--entry <folder>] [--template <name>] [--schema <path>]   Create a directory structure\n\nUsage:\n  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]";
        readonly "scaffold-dir": "Create a directory structure\n\nUsage:\n  handy-kit scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]\n\nOptions:\n  --entry <folder>   The folder to create the directory structure in (default: \".\")\n  --template <name>  The name of the template to use (default: \"default\")\n  --schema <path>      The path to write the directory structure to (default: \"scaffold\")\n    ";
    };
    readonly errors: {
        readonly unknownCommand: "❌ Unknown command: '{{command}}'\n\nUsage: handy-kit <group> <command> [options] (Use 'handy-kit <group> help' for more information)";
        readonly unknownGroup: "❌ Unknown group: '{{group}}'\n\nAvailable groups:\n  license, git (Use 'handy-kit help' for more information)";
        readonly missingLicenseArgs: "❌ Missing required arguments for 'license gen': <type> --author <name>";
        readonly unsupportedLicense: "❌ License type '{{type}}' not supported.\nSupported types: MIT, Apache-2.0, BSD-3-Clause, GPL-3.0, MPL-2.0, Unlicense";
        readonly missingGitArgs: "❌ Missing required arguments for 'git standup'. Use --days, --weeks, --months, or --years";
        readonly invalidDays: "❌ Invalid argument: --days/--weeks/--months/--years must be a positive integer";
        readonly noCommits: "ℹ️ No commits found in the given time range";
        readonly notAGitRepo: "❌ Not a git repository or unable to fetch logs.";
        readonly unknownError: "❌ An error occurred: {{error}}";
    };
    readonly success: {
        readonly licenseGen: "✅ License '{{type}}' successfully generated by {{author}}.\n License saved to '{{outputPath}}'";
        readonly gitStandup: "✅ Showing git commits for the given time range.";
        readonly licenseCreated: "✅ License file {{type}} created successfully by {{author}} at {{outputPath}}";
        readonly licenseReplaced: "♻️ License file replaced successfully at {{outputPath}}";
        readonly gitStandupNoCommits: "ℹ️ No commits found in the given time range.";
        readonly gitStats: "✅ Showing git stats since {{since}}.";
    };
};
export type Templates = typeof TEMPLATES;
//# sourceMappingURL=templates.def.d.ts.map