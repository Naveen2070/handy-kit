#!/usr/bin/env node
import { licenseGen } from "../lib/license-gen.js";
import { gitStandup } from "../lib/git-standup.js";
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log(`
Usage: handy-kit <command> [options]

Commands:
  license-gen <type> --author "Name"   Generate an open-source license
  git-standup --days <n>              Show git commits from last n days
  `);
    process.exit(0);
}
const [command, ...rest] = args;
switch (command) {
    case "license-gen": {
        if (rest.length < 2) {
            console.error("❌ Missing required arguments: <type> --author <name>");
            process.exit(1);
        }
        const type = rest[0];
        const authorIndex = rest.indexOf("--author");
        if (authorIndex === -1) {
            console.error("❌ Missing required argument: --author <name>");
            process.exit(1);
        }
        const author = rest[authorIndex + 1];
        console.log(licenseGen(type, author));
        break;
    }
    case "git-standup": {
        const daysIndex = rest.indexOf("--days");
        if (daysIndex === -1) {
            console.error("❌ Missing required argument: --days <n>");
            process.exit(1);
        }
        const days = parseInt(rest[daysIndex + 1], 10);
        if (isNaN(days) || days < 1) {
            console.error("❌ Invalid argument: --days <n> must be a positive integer");
            process.exit(1);
        }
        gitStandup(days);
        break;
    }
    default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
}
//# sourceMappingURL=handy-kit.js.map