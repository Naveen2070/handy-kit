import { printTemplate } from "../utils/index.js";
import { scaffoldDir } from "./scaffold-dir.js";
export const scaffoldCommands = {
    name: "scaffold",
    description: "Scaffold commands",
    subcommands: [
        {
            name: "help",
            description: "Show help for scaffold commands",
            usage: "scaffold help",
            run: async () => {
                printTemplate("help.scaffold");
                process.exit(0);
            },
        },
        {
            name: "dir",
            description: "Create a directory structure",
            usage: "scaffold dir [--entry <folder>] [--template <name>] [--schema <path>]",
            run: async (_args, flags) => {
                console.log(flags);
                let entry = flags["entry"] || flags["e"];
                let templateName = flags["template"] || flags["t"];
                const customFile = flags["schema"] || flags["s"];
                const help = flags["help"] || flags["h"];
                if (help) {
                    printTemplate("help.scaffold-dir");
                    process.exit(0);
                }
                await scaffoldDir({ entry, templateName, customFile });
            },
        },
    ],
};
//# sourceMappingURL=index.js.map