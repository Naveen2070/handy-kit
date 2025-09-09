import { displayOutdatedPackages, fetchOutdated, getMajor, getMinor, readPackageJson, runCommand, } from "../utils/deps/index.js";
/* --------------------------- Public Main Methods --------------------------- */
/**
 * Show outdated dependencies.
 */
export async function showOutdatedPackages() {
    const outdated = await fetchOutdated();
    displayOutdatedPackages(outdated);
}
/**
 * Manage dependency versions.
 * @param upgradeType - The upgrade type to perform.
 * @param dryRun - If true, it will only show what would be updated.
 */
export async function manageDependencies(upgradeType, dryRun = false) {
    // Read the package.json
    const pkg = await readPackageJson();
    if (!pkg)
        return;
    // Get the outdated dependencies
    const outdated = await fetchOutdated();
    // Get all the dependencies
    const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
    };
    // Handle the upgrade type
    if (upgradeType === "standard") {
        // Handle standard upgrade
        await handleStandardUpgrade(outdated, dryRun);
        return;
    }
    // Handle minor or major upgrade
    await handleSemanticUpgrade(upgradeType, allDeps, outdated, dryRun);
}
/* ------------------------- Upgrade Type Handlers -------------------------- */
/**
 * Handles the standard upgrade type.
 * @param outdated - The outdated dependencies.
 * @param dryRun - If true, it will only show what would be updated.
 */
async function handleStandardUpgrade(outdated, dryRun) {
    const updatable = Object.entries(outdated).filter(([_, info]) => info.wanted !== info.current);
    if (dryRun) {
        // Check if there are any updatable dependencies
        if (updatable.length === 0) {
            console.log("✅ All dependencies are up to date. Nothing to update.");
            return;
        }
        // Print the dry-run message
        console.log("🧪 Dry-run: The following packages would be updated:\n");
        for (const [pkg, info] of updatable) {
            console.log(`• ${pkg}: ${info.current} → ${info.wanted}`);
        }
        console.log("");
    }
    else {
        // Run npm update to update the dependencies
        console.log("🔁 Running npm update...");
        await runCommand("npm update --save");
    }
}
/**
 * Handles minor or major upgrades.
 * @param upgradeType - The type of upgrade to apply: either "minor" or "major".
 * @param allDeps - The list of all dependencies.
 * @param outdated - The outdated dependencies.
 * @param dryRun - If true, it will only show what would be updated.
 */
async function handleSemanticUpgrade(upgradeType, allDeps, outdated, dryRun) {
    const upgradesToApply = [];
    // Loop through all dependencies and find the ones that need to be upgraded
    for (const [dep, currentVersion] of Object.entries(allDeps)) {
        const outdatedInfo = outdated[dep];
        if (!outdatedInfo)
            continue;
        const currentMajor = getMajor(currentVersion);
        const currentMinor = getMinor(currentVersion);
        const latestMajor = getMajor(outdatedInfo.latest);
        const latestMinor = getMinor(outdatedInfo.latest);
        const isMinor = latestMajor === currentMajor && latestMinor > currentMinor;
        const isMajor = latestMajor > currentMajor;
        // If the dependency needs to be upgraded, add it to the list
        if ((upgradeType === "minor" && isMinor) ||
            (upgradeType === "major" && isMajor)) {
            upgradesToApply.push([dep, currentVersion, outdatedInfo.latest]);
        }
    }
    // If dryRun is true, print the list of upgrades that would be applied
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
    }
    else {
        // If dryRun is false, apply the upgrades
        for (const [dep, , latest] of upgradesToApply) {
            console.log(`⬆️  Upgrading ${dep} to ${latest}...`);
            await runCommand(`npm install ${dep}@${latest} --save-exact`);
        }
        console.log("\n✅ Dependency upgrades complete.\n");
    }
}
//# sourceMappingURL=deps-manage.js.map