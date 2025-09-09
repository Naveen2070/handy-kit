import { exec } from "child_process";
import util from "util";
import type { DependencyInfo } from "../../types/utils.js";

const execPromise = util.promisify(exec);

/* ----------------------- Outdated Package Fetching ------------------------ */
/**
 * Fetch outdated dependencies using npm.
 * @returns An object of outdated dependencies with their current and latest versions.
 */
export async function fetchOutdated(): Promise<Record<string, DependencyInfo>> {
  // Use npm outdated to get outdated dependencies
  try {
    const { stdout } = await execPromise("npm outdated --json", {
      cwd: process.cwd(),
    });
    return stdout.trim() ? JSON.parse(stdout) : {};
  } catch (err: any) {
    // If the command fails, try to parse the output
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        // If the output is not valid JSON, log an error
        console.error("❌ Failed to parse npm outdated output:", err.stdout);
      }
    } else {
      // If there is no output, log the error
      console.error(
        "❌ Failed to get outdated packages:",
        err.stderr || err.message
      );
    }
    return {};
  }
}

/* -------------------------- Display Outdated List -------------------------- */
/**
 * Display a list of outdated dependencies.
 * @param outdated - An object of outdated dependencies with their current and latest versions.
 */
export function displayOutdatedPackages(
  outdated: Record<string, DependencyInfo>
): void {
  const entries = Object.entries(outdated);
  if (entries.length === 0) {
    console.log("✅ All dependencies are up to date.\n");
    return;
  }

  // Print the list of outdated dependencies
  console.log("📦 Outdated dependencies:\n");
  for (const [pkg, info] of entries) {
    console.log(`• ${pkg}`);
    console.log(`    • Current:     ${info.current}`); // current version
    console.log(`    • Wanted:      ${info.wanted}`); // version specified in package.json
    console.log(`    • Latest:      ${info.latest}`); // latest version available
    if (info.location) console.log(`    • Location:    ${info.location}`); // location of the dependency in the project
    if (info["depended by"])
      console.log(`    • Depended by: ${info["depended by"]}`); // packages that depend on this package
    if (info.type) console.log(`    • Type:        ${info.type}`); // type of the dependency (e.g. devDependency, optionalDependency)
    console.log("");
  }
}
