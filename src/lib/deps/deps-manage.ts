import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

/**
 * Display outdated dependencies in a clean, readable format,
 * including their location and who depends on them.
 */
export async function showOutdatedPackages() {
  try {
    const { stdout } = await execPromise("npm outdated --long --json", {
      cwd: process.cwd(),
    });

    const data = stdout.trim();
    if (!data) {
      console.log("✅ All dependencies are up to date.\n");
      return;
    }

    const outdated = JSON.parse(data);
    const entries = Object.entries(outdated);

    if (entries.length === 0) {
      console.log("✅ All dependencies are up to date.\n");
      return;
    }

    console.log("📦 Outdated dependencies:\n");

    for (const [pkg, info] of entries as [
      string,
      {
        current: string;
        wanted: string;
        latest: string;
        location?: string;
        "depended by"?: string;
        type?: string;
      }
    ][]) {
      console.log(`• ${pkg}`);
      console.log(`    • Current:   ${info.current}`);
      console.log(`    • Wanted:    ${info.wanted}`);
      console.log(`    • Latest:    ${info.latest}`);
      if (info.location) console.log(`    • Location:  ${info.location}`);
      if (info["depended by"])
        console.log(`    • Depended by: ${info["depended by"]}`);
      if (info.type) console.log(`    • Type:      ${info.type}`);
      console.log(""); // blank line for spacing
    }
  } catch (err: any) {
    // Handle non-zero exit code but valid stdout
    if (err.stdout) {
      try {
        const outdated = JSON.parse(err.stdout);
        const entries = Object.entries(outdated);
        if (entries.length === 0) {
          console.log("✅ All dependencies are up to date.\n");
          return;
        }

        console.log("📦 Outdated dependencies:\n");

        for (const [pkg, info] of entries as [
          string,
          {
            current: string;
            wanted: string;
            latest: string;
            location?: string;
            "depended by"?: string;
            type?: string;
          }
        ][]) {
          console.log(`• ${pkg}`);
          console.log(`    • Current:   ${info.current}`);
          console.log(`    • Wanted:    ${info.wanted}`);
          console.log(`    • Latest:    ${info.latest}`);
          if (info.location) console.log(`    • Location:  ${info.location}`);
          if (info["depended by"])
            console.log(`    • Depended by: ${info["depended by"]}`);
          if (info.type) console.log(`    • Type:      ${info.type}`);
          console.log("");
        }
        return;
      } catch {
        // Parsing failed—fall through to error
      }
    }

    console.error(
      "❌ Failed to get outdated packages:",
      err.stderr || err.message
    );
  }
}

/**
 * Upgrade dependencies by type: standard (npm update), minor, or major.
 * Supports dry-run mode to preview changes.
 */
export async function manageDependencies(
  upgradeType: "standard" | "minor" | "major",
  dryRun = false
) {
  const pkgPath = path.resolve(process.cwd(), "package.json");

  let pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  try {
    const pkgRaw = await fs.readFile(pkgPath, "utf8");
    pkg = JSON.parse(pkgRaw);
  } catch (err) {
    console.error("❌ Failed to read package.json at", pkgPath);
    return;
  }

  // Fetch outdated packages upfront
  let outdated: Record<
    string,
    {
      current: string;
      wanted: string;
      latest: string;
      location?: string;
      type?: string;
    }
  > = {};

  try {
    const { stdout } = await execPromise("npm outdated --json", {
      cwd: process.cwd(),
    });
    if (stdout.trim()) {
      outdated = JSON.parse(stdout);
    }
  } catch (err: any) {
    if (err.stdout) {
      try {
        const parsed = JSON.parse(err.stdout);
        outdated = Object.keys(parsed).length === 0 ? {} : parsed;
      } catch {
        console.error("❌ Failed to parse npm outdated output:", err.stdout);
        return;
      }
    } else {
      console.error(
        "❌ Failed to get outdated packages:",
        err.stderr || err.message
      );
      return;
    }
  }

  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  if (upgradeType === "standard") {
    // npm update respects semver ranges and upgrades to 'wanted'
    const updatable = Object.entries(outdated).filter(
      ([_, info]) => info.wanted !== info.current
    );

    if (dryRun) {
      if (updatable.length === 0) {
        console.log("✅ All dependencies are up to date. Nothing to update.");
        return;
      }

      console.log(
        "🧪 Dry-run: The following packages would be updated with `npm update`:\n"
      );
      for (const [pkg, info] of updatable) {
        console.log(`• ${pkg}: ${info.current} → ${info.wanted}`);
      }
      console.log("");
    } else {
      console.log("🔁 Running npm update...");
      await runCommand("npm update --save");
    }
    return;
  }

  // For minor and major upgrades: filter packages by semver difference
  const upgradesToApply: [string, string, string][] = []; // [pkg, current, latest]

  for (const [dep, currentVersion] of Object.entries(allDeps)) {
    const outdatedInfo = outdated[dep];
    if (!outdatedInfo) continue; // up to date or not listed

    const currentMajor = getMajor(currentVersion);
    const currentMinor = getMinor(currentVersion);
    const latestVersion = outdatedInfo.latest;
    const latestMajor = getMajor(latestVersion);
    const latestMinor = getMinor(latestVersion);

    const isMinor = latestMajor === currentMajor && latestMinor > currentMinor;
    const isMajor = latestMajor > currentMajor;

    if (
      (upgradeType === "minor" && isMinor) ||
      (upgradeType === "major" && isMajor)
    ) {
      upgradesToApply.push([dep, currentVersion, latestVersion]);
    }
  }

  if (dryRun) {
    if (upgradesToApply.length === 0) {
      console.log(
        `✅ All dependencies are up to date for ${upgradeType} upgrades.`
      );
      return;
    }
    console.log(
      `🧪 Dry-run: The following packages would be upgraded (${upgradeType}):\n`
    );
    for (const [dep, current, latest] of upgradesToApply) {
      console.log(`• ${dep}: ${current} → ${latest}`);
    }
    console.log("");
  } else {
    for (const [dep, , latest] of upgradesToApply) {
      console.log(`⬆️  Upgrading ${dep} to version ${latest}...`);
      await runCommand(`npm install ${dep}@${latest} --save-exact`);
    }
    console.log("\n✅ Dependency upgrades complete.\n");
  }
}

/**
 * Parse major version number from semver string.
 */
function getMajor(version: string): number {
  return parseInt(version.replace(/^[^\d]*/, "").split(".")[0] || "0", 10);
}

/**
 * Parse minor version number from semver string.
 */
function getMinor(version: string): number {
  return parseInt(version.replace(/^[^\d]*/, "").split(".")[1] || "0", 10);
}

/**
 * Get the latest published version of a package.
 */
async function getLatestVersion(pkgName: string): Promise<string | null> {
  try {
    const { stdout } = await execPromise(`npm view ${pkgName} version`, {
      cwd: process.cwd(),
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Run a command in the CWD and stream output to console.
 */
async function runCommand(cmd: string) {
  console.log(`> ${cmd}`);
  const { stdout, stderr } = await execPromise(cmd, {
    cwd: process.cwd(),
  });

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}
