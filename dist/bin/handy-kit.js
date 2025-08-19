import { gitStandup } from "../lib/git-standup.js";
import { licenseGen } from "../lib/license-gen.js";
import { parseArgs } from "../lib/utils/args.js";
import { printTemplate } from "../lib/utils/templates.js";
const commands = [
    {
        name: "license-gen",
        description: "Generate an open-source license",
        usage: "license-gen <type> --author <name>",
        run: (args, flags) => {
            const type = args[0];
            const author = flags["author"];
            if (!type || !author) {
                printTemplate("errors.missingLicenseArgs");
                process.exit(1);
            }
            console.log(licenseGen(type, author));
        },
    },
    {
        name: "git-standup",
        description: "Show git commits from last n days",
        usage: "git-standup --days <n>",
        run: (_, flags) => {
            const days = parseInt(flags["days"] || "0", 10);
            if (!days || days < 1) {
                printTemplate("errors.invalidDays");
                process.exit(1);
            }
            gitStandup(days);
        },
    },
];
// -------------------- CLI START --------------------
const args = process.argv.slice(2);
if (args.length === 0 || ["-h", "--help"].includes(args[0])) {
    printTemplate("help.main", { commands });
    process.exit(0);
}
const [commandName, ...rest] = args;
const command = commands.find((c) => c.name === commandName);
if (!command) {
    printTemplate("errors.unknownCommand", {
        command: commandName,
        commands,
    });
    process.exit(1);
}
const { positional, flags } = parseArgs(rest);
command.run(positional, flags);
//# sourceMappingURL=handy-kit.js.map