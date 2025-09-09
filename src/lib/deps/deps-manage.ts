import type { DependencyInfo } from "../types/utils.js";
import {
  displayOutdatedPackages,
  fetchOutdated,
  getMajor,
  getMinor,
  readPackageJson,
  runCommand,
} from "../utils/deps/index.js";

/* --------------------------- Public Main Methods --------------------------- */
export async function showOutdatedPackages() {
  const outdated = await fetchOutdated();
  displayOutdatedPackages(outdated);
}

export async function manageDependencies(
  upgradeType: "standard" | "minor" | "major",
  dryRun = false
) {
  const pkg = await readPackageJson();
  if (!pkg) return;

  const outdated = await fetchOutdated();
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };

  if (upgradeType === "standard") {
    await handleStandardUpgrade(outdated, dryRun);
    return;
  }

  await handleSemanticUpgrade(upgradeType, allDeps, outdated, dryRun);
}

/* ------------------------- Upgrade Type Handlers -------------------------- */
async function handleStandardUpgrade(
  outdated: Record<string, DependencyInfo>,
  dryRun: boolean
) {
  const updatable = Object.entries(outdated).filter(
    ([_, info]) => info.wanted !== info.current
  );

  if (dryRun) {
    if (updatable.length === 0) {
      console.log("✅ All dependencies are up to date. Nothing to update.");
      return;
    }
    console.log("🧪 Dry-run: The following packages would be updated:\n");
    for (const [pkg, info] of updatable) {
      console.log(`• ${pkg}: ${info.current} → ${info.wanted}`);
    }
    console.log("");
  } else {
    console.log("🔁 Running npm update...");
    await runCommand("npm update --save");
  }
}

async function handleSemanticUpgrade(
  upgradeType: "minor" | "major",
  allDeps: Record<string, string>,
  outdated: Record<string, DependencyInfo>,
  dryRun: boolean
) {
  const upgradesToApply: [string, string, string][] = [];

  for (const [dep, currentVersion] of Object.entries(allDeps)) {
    const outdatedInfo = outdated[dep];
    if (!outdatedInfo) continue;

    const currentMajor = getMajor(currentVersion);
    const currentMinor = getMinor(currentVersion);
    const latestMajor = getMajor(outdatedInfo.latest);
    const latestMinor = getMinor(outdatedInfo.latest);

    const isMinor = latestMajor === currentMajor && latestMinor > currentMinor;
    const isMajor = latestMajor > currentMajor;

    if (
      (upgradeType === "minor" && isMinor) ||
      (upgradeType === "major" && isMajor)
    ) {
      upgradesToApply.push([dep, currentVersion, outdatedInfo.latest]);
    }
  }

  if (dryRun) {
    if (upgradesToApply.length === 0) {
      console.log(`✅ No ${upgradeType} upgrades available.`);
      return;
    }
    console.log(`🧪 Dry-run: Packages to upgrade (${upgradeType}):\n`);
    for (const [dep, current, latest] of upgradesToApply) {
      console.log(`• ${dep}: ${current} → ${latest}`);
    }
    console.log("");
  } else {
    for (const [dep, , latest] of upgradesToApply) {
      console.log(`⬆️  Upgrading ${dep} to ${latest}...`);
      await runCommand(`npm install ${dep}@${latest} --save-exact`);
    }
    console.log("\n✅ Dependency upgrades complete.\n");
  }
}
