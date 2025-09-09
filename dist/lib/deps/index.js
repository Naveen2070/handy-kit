import { askUser } from "../utils/common/index.js";
import { printTemplate } from "../utils/common/templates.js";
import { manageDependencies, showOutdatedPackages } from "./deps-manage.js";
import { handleOutdatedDepsCommand } from "./deps-outdated.js";
import { getDepsSize } from "./deps-size.js";
export const DepsCommands = {
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
            usage: "deps size [--verbose | -v] [--tree | -t] [--table | -t] [--depth | -d] [--concurrency | -c] [--export | -e]",
            run: async (_, flags) => {
                const help = flags["help"] || flags["h"];
                if (help) {
                    printTemplate("help.deps-size");
                    process.exit(0);
                }
                const verbose = !!((flags["verbose"] || flags["v"]) === "true");
                const tree = !!((flags["tree"] || flags["t"]) === "true");
                const table = !!((flags["table"] || flags["T"]) === "true");
                const depth = parseInt(flags["depth"] || flags["d"], 10) || 5;
                const concurrency = parseInt(flags["concurrency"] || flags["c"], 10) || 10;
                const exportFormat = flags["export"] || flags["e"] || "";
                const DepsFlag = {
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
        {
            name: "manage",
            description: "Manage dependency versions",
            usage: "deps manage [--standard | --upgrade | --minor | --major] [--dry-run]",
            run: async (_, flags) => {
                const dryRun = !!(flags["dry-run"] || flags["d"]);
                const help = flags["help"] || flags["h"];
                // Detect upgrade type flags (only one should be used ideally)
                const isStandard = !!flags["standard"] || !!flags["upgrade"];
                const isMinor = !!flags["minor"];
                const isMajor = !!flags["major"];
                if (help) {
                    printTemplate("help.deps-manage");
                    process.exit(0);
                }
                console.log("\n📦 Checking for outdated packages...\n");
                await showOutdatedPackages();
                // Determine upgradeType from flags if present
                let upgradeType = null;
                if (isStandard)
                    upgradeType = "standard";
                else if (isMinor)
                    upgradeType = "minor";
                else if (isMajor)
                    upgradeType = "major";
                if (upgradeType) {
                    // Non-interactive run with selected upgradeType from flags
                    await manageDependencies(upgradeType, dryRun);
                }
                else {
                    // Interactive selection fallback
                    const selection = await askUser(`\nChoose upgrade type:
          1. Standard (npm update)
          2. Minor (safe semver upgrades)
          3. Major (breaking upgrades)
          4. Cancel
          Enter your choice [1-4]: `);
                    switch (selection.trim()) {
                        case "1":
                        case "standard":
                            upgradeType = "standard";
                            break;
                        case "2":
                        case "minor":
                            upgradeType = "minor";
                            break;
                        case "3":
                        case "major":
                            upgradeType = "major";
                            break;
                        default:
                            console.log("❌ Upgrade cancelled.");
                            return;
                    }
                    await manageDependencies(upgradeType, dryRun);
                }
            },
        },
        {
            name: "outdated",
            description: "List outdated dependencies with available updates",
            usage: "deps outdated [--json | -j] [--major-only | -m] [--export <file>] [--help | -h]",
            run: async (_, flags) => {
                await handleOutdatedDepsCommand(_, flags);
            },
        },
    ],
};
//# sourceMappingURL=index.js.map