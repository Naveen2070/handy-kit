import { exec } from "child_process";
import util from "util";
import type { DependencyInfo } from "../../types/utils.js";

const execPromise = util.promisify(exec);

/* ----------------------- Outdated Package Fetching ------------------------ */
export async function fetchOutdated(): Promise<Record<string, DependencyInfo>> {
  try {
    const { stdout } = await execPromise("npm outdated --json", {
      cwd: process.cwd(),
    });
    return stdout.trim() ? JSON.parse(stdout) : {};
  } catch (err: any) {
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        console.error("❌ Failed to parse npm outdated output:", err.stdout);
      }
    } else {
      console.error(
        "❌ Failed to get outdated packages:",
        err.stderr || err.message
      );
    }
    return {};
  }
}

/* -------------------------- Display Outdated List -------------------------- */
export function displayOutdatedPackages(
  outdated: Record<string, DependencyInfo>
) {
  const entries = Object.entries(outdated);
  if (entries.length === 0) {
    console.log("✅ All dependencies are up to date.\n");
    return;
  }

  console.log("📦 Outdated dependencies:\n");
  for (const [pkg, info] of entries) {
    console.log(`• ${pkg}`);
    console.log(`    • Current:     ${info.current}`);
    console.log(`    • Wanted:      ${info.wanted}`);
    console.log(`    • Latest:      ${info.latest}`);
    if (info.location) console.log(`    • Location:    ${info.location}`);
    if (info["depended by"])
      console.log(`    • Depended by: ${info["depended by"]}`);
    if (info.type) console.log(`    • Type:        ${info.type}`);
    console.log("");
  }
}
