import { findUnusedExports } from "./code-unused.js";
export const CodeCommands = {
    name: "code",
    description: "Code related commands",
    subcommands: [
        {
            name: "help",
            description: "Show help for code commands",
            usage: "code help",
            run: () => { },
        },
        {
            name: "unused",
            description: "Show unused code",
            usage: "code unused",
            run: (_, flags) => {
                findUnusedExports(flags.path || "src");
            },
        },
    ],
};
//# sourceMappingURL=index.js.map