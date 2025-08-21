import type { CommandGroup } from "../types/utils.js";
import { printTemplate } from "../utils/index.js";
import { generateCredits } from "./license-credits.js";
import { licenseGen } from "./license-gen.js";

export const LicenseCommands: CommandGroup = {
  name: "license",
  description: "License related commands",
  subcommands: [
    {
      name: "help",
      description: "Show help for license commands",
      usage: "license help",
      run: () => {
        printTemplate("help.license");
        process.exit(0);
      },
    },
    {
      name: "gen",
      description: "Generate an open-source license",
      usage: "license gen <type> --author <name> [--output <file>] [--force]",
      run: (args, flags) => {
        const type = args[0];
        const author = flags["author"] || flags["a"];
        const output = flags["output"] || flags["o"];
        const yes = (flags["force"] || flags["f"]) === "true";
        const help = flags["help"] || flags["h"];

        if (help) {
          printTemplate("help.license-gen");
          process.exit(0);
        }
        if (!type || !author) {
          printTemplate("errors.missingLicenseArgs");
          process.exit(1);
        }
        licenseGen(type, author, output ?? "LICENSE", yes);
      },
    },
    {
      name: "credits",
      description:
        "Generate a credits file with all used libraries and their licenses",
      usage: "license credits --output <file>",
      run: async (_, flags) => {
        const output = flags["output"] || flags["o"] || "CREDITS.md";
        const help = flags["help"] || flags["h"];

        if (help) {
          printTemplate("help.license-credits");
          process.exit(0);
        }
        await generateCredits(output);
      },
    },
  ],
};
