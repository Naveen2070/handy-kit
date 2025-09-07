import type { CommandGroup, GitStandupOptions } from "../types/utils.js";
import { printTemplate } from "../utils/common/index.js";
import { gitStandup } from "./git-standup.js";
import { gitStats } from "./git-stats.js";

export const GitCommands: CommandGroup = {
  name: "git",
  description: "Git utilities",
  subcommands: [
    {
      name: "help",
      description: "Show help for git commands",
      usage: "git help",
      run: () => {
        printTemplate("help.git");
        process.exit(0);
      },
    },
    {
      name: "standup",
      description: "Show git commits with filters",
      usage:
        "git standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <path>]",
      run: (_, flags) => {
        const help = flags["help"] || flags["h"];
        if (help) {
          printTemplate("help.git-standup");
          process.exit(0);
        }

        if (
          !flags["days"] &&
          !flags["weeks"] &&
          !flags["months"] &&
          !flags["years"]
        ) {
          printTemplate("errors.missingGitArgs");
          process.exit(1);
        }

        const days = parseInt(flags["days"] || "0", 10);
        const weeks = parseInt(flags["weeks"] || "0", 10);
        const months = parseInt(flags["months"] || "0", 10);
        const years = parseInt(flags["years"] || "0", 10);
        const author = flags["author"] || flags["a"];
        const branch = flags["branch"] || flags["b"];
        let exportPath = flags["export"] || flags["o"];

        if (days < 0 || weeks < 0 || months < 0 || years < 0) {
          printTemplate("errors.invalidDays");
          process.exit(1);
        }

        gitStandup({
          days,
          weeks,
          months,
          years,
          author,
          branch,
          exportPath,
        } as GitStandupOptions);
      },
    },
    {
      name: "stats",
      description: "Show git status",
      usage:
        "git stats [--since <date>] [--author <name>] [--daily|weekly|monthly] [--metric <commits|added|deleted>] [--export <md|json|txt>]",
      run: (_, flags) => {
        const help = flags["help"] || flags["h"];
        if (help || Object.keys(flags).length === 0) {
          printTemplate("help.git-stats");
          process.exit(0);
        }

        gitStats(flags);
      },
    },
  ],
};
