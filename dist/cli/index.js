#!/usr/bin/env node
import pkg from "../../package.json" with { type: "json" };
import { parseArgs, printHelp, printTemplate } from "../lib/utils/common/index.js";
import { GitCommands } from "../lib/git/index.js";
import { LicenseCommands } from "../lib/license/index.js";
import { scaffoldCommands } from "../lib/scaffold/index.js";
import { DepsCommands } from "../lib/deps/index.js";
import { CodeCommands } from "../lib/code/index.js";
// -------------------- COMMANDS --------------------
// initialize commands and command groups and add them to the commandGroups array
const commandGroups = [];
// add commands
commandGroups.push(LicenseCommands);
commandGroups.push(GitCommands);
commandGroups.push(scaffoldCommands);
commandGroups.push(DepsCommands);
commandGroups.push(CodeCommands);
// -------------------- CLI START --------------------
// Handle command line arguments
const args = process.argv.slice(2);
const [groupName, subName, ...rest] = args;
const group = commandGroups.find((g) => g.name === groupName);
if (groupName === "help") {
    printHelp();
    process.exit(0);
}
if (groupName === "--version" || groupName === "-v") {
    console.log(`Version: ${pkg.version}`);
    process.exit(1);
}
if (!group) {
    printTemplate("errors.unknownGroup", {
        group: groupName,
        groups: commandGroups,
    });
    process.exit(1);
}
const command = group.subcommands.find((c) => c.name === subName);
if (!command) {
    printTemplate("errors.unknownCommand", {
        group: groupName,
        command: subName,
        subcommands: group.subcommands,
    });
    process.exit(1);
}
// -------------------- CLI END --------------------
// Run command
const { positional, flags } = parseArgs(rest);
command.run(positional, flags);
//# sourceMappingURL=index.js.map