import fs from "fs/promises";
import { fetchOutdated } from "../utils/deps/index.js";
import { displayOutdatedPackages, getMajor } from "../utils/deps/index.js";

/**
 * Handle the "outdated" command.
 *
 * @param {string[]} _ - unused
 * @param {Record<string, string | boolean>} flags - command line flags
 * @returns {Promise<void>}
 */
export async function handleOutdatedDepsCommand(
  _: string[],
  flags: Record<string, string | boolean>
) {
  const help = flags["help"] || flags["h"];
  const json = flags["json"] || flags["j"];
  const majorOnly = flags["major-only"] || flags["m"];
  const exportPath = flags["export"] || flags["e"];

  if (help) {
    const { printTemplate } = await import("../utils/common/templates.js");
    printTemplate("help.deps-outdated");
    process.exit(0);
  }

  // Fetch the outdated packages
  let outdated = await fetchOutdated();

  // Filter the outdated packages to only include major updates
  if (majorOnly === "true" || majorOnly === true) {
    outdated = Object.fromEntries(
      Object.entries(outdated).filter(([_, info]) => {
        const currentMajor = getMajor(info.current);
        const latestMajor = getMajor(info.latest);
        return latestMajor > currentMajor;
      })
    );
  }

  // Create the JSON output
  const jsonOutput = JSON.stringify(outdated, null, 2);

  // Export the JSON output to the specified file
  if (json === "true" || json === true || exportPath) {
    if (exportPath) {
      try {
        await fs.writeFile(exportPath.toString(), jsonOutput);
        console.log(`✅ Exported outdated dependencies to ${exportPath}`);
      } catch (err) {
        console.error(`❌ Failed to export JSON to ${exportPath}:`, err);
      }
    }

    // Print the JSON output
    if (json === "true" || json === true) {
      console.log(jsonOutput);
    }
  } else {
    console.log("\n📦 Checking for outdated packages...\n");
    // Display the outdated packages
    displayOutdatedPackages(outdated);
  }
}
