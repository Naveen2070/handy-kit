import type { CommandGroup } from "../types/utils.js";
import { printTemplate } from "../utils/common/templates.js";
import { getDepsSize } from "./deps-size.js";

export const DepsCommands: CommandGroup = {
  name: "deps",
  description: "Dependency related commands",
  subcommands: [
    {
      name: "help",
      description: "Show help for dependency commands",
      usage: "deps help",
      run: () => {
        printTemplate("help.deps");
        process.exit(0);
      },
    },
    {
      name: "size",
      description: "Show dependency sizes",
      usage: "deps size",
      run: async (_, flags) => {
        const help = flags["help"] || flags["h"];

        if (help) {
          printTemplate("help.deps-size");
          process.exit(0);
        }
        await getDepsSize(flags as any);
      },
    },
  ],
};
