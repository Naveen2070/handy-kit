import { printTemplate } from "../utils/common/templates.js";
import { findUnusedExports, findUnusedFiles } from "./code-unused.js";
export const CodeCommands = {
    name: "code",
    description: "Code related commands",
    subcommands: [
        {
            name: "help",
            description: "Show help for code commands",
            usage: "code help",
            run: () => {
                printTemplate("help.code");
                process.exit(0);
            },
        },
        {
            name: "unused",
            description: "Show unused code",
            usage: "code unused [--path | -p] [--exports | -e] [--files | -f] [--help | -h]",
            run: (_, flags) => {
                const path = flags.path || "src";
                const help = flags["help"] || flags["h"];
                const getUnUsedImports = flags["files"] || flags["f"];
                const getUnUsedExports = flags["exports"] || flags["e"];
                if (help) {
                    printTemplate("help.code-unused");
                    process.exit(0);
                }
                if (getUnUsedImports)
                    findUnusedFiles(path);
                if (getUnUsedExports)
                    findUnusedExports(path);
            },
        },
    ],
};
//# sourceMappingURL=index.js.map