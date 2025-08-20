#!/usr/bin/env node

import { gitStandup } from "../lib/git-standup.js";
import { licenseGen } from "../lib/license-gen.js";
import type { Command, GitStandupOptions } from "../lib/types/utils.js";
import { parseArgs } from "../lib/utils/args.js";
import { printTemplate } from "../lib/utils/templates.js";

// -------------------- COMMANDS --------------------
// List of commands and their descriptions and usages
const commands: Command[] = [
  {
    name: "license-gen",
    description: "Generate an open-source license",
    usage: "license-gen <type> --author <name> [--output <file>] [--force]",
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
    name: "git-standup",
    description: "Show git commits with filters",
    usage:
      "git-standup [--days <n>] [--weeks <n>] [--months <n>] [--years <n>] [--author <name>] [--branch <branch>] [--export <path>]",
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
        printTemplate("errors.missingDaysArg");
        process.exit(1);
      }

      // Parse supported args
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
];

// -------------------- CLI START --------------------
// Handle command line arguments
const args = process.argv.slice(2);
if (args.length === 0 || ["-h", "--help"].includes(args[0]!)) {
  printTemplate("help.main", { commands });
  process.exit(0);
}

// Parse command
const [commandName, ...rest] = args;
const command = commands.find((c) => c.name === commandName);

// Handle unknown command
if (!command) {
  printTemplate("errors.unknownCommand", {
    command: commandName as string,
    commands,
  });
  process.exit(1);
}

// Run command
const { positional, flags } = parseArgs(rest);
command.run(positional, flags);
