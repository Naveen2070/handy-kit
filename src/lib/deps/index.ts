import type { CommandGroup, DepsSizeFlag } from "../types/utils.js";
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
      usage:
        "deps size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]",
      run: async (_, flags) => {
        const help = flags["help"] || flags["h"];

        if (help) {
          printTemplate("help.deps-size");
          process.exit(0);
        }

        const verbose = !!((flags["verbose"] || flags["v"]) === "true");
        const tree = !!((flags["tree"] || flags["t"]) === "true");
        const table = !!((flags["table"] || flags["T"]) === "true");
        const depth = parseInt(flags["depth"]! || flags["d"]!, 10) || 5;
        const concurrency =
          parseInt(flags["concurrency"]! || flags["c"]!, 10) || 10;
        const exportFormat = flags["export"] || flags["e"] || "";

        const DepsFlag: DepsSizeFlag = {
          verbose,
          tree,
          table,
          depth,
          concurrency,
          export: exportFormat,
        };

        await getDepsSize(DepsFlag);
      },
    },
  ],
};
