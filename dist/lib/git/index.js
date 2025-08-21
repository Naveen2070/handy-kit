import { printTemplate } from "../utils/index.js";
import { gitStandup } from "./git-standup.js";
export const GitCommands = {
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
            usage: "git standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <path>]",
            run: (_, flags) => {
                const help = flags["help"] || flags["h"];
                if (help) {
                    printTemplate("help.git-standup");
                    process.exit(0);
                }
                if (!flags["days"] &&
                    !flags["weeks"] &&
                    !flags["months"] &&
                    !flags["years"]) {
                    printTemplate("errors.missingDaysArg");
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
                });
            },
        },
    ],
};
//# sourceMappingURL=index.js.map