/**
 * Show outdated dependencies.
 */
export declare function showOutdatedPackages(): Promise<void>;
/**
 * Manage dependency versions.
 * @param upgradeType - The upgrade type to perform.
 * @param dryRun - If true, it will only show what would be updated.
 */
export declare function manageDependencies(upgradeType: "standard" | "minor" | "major", dryRun?: boolean): Promise<void>;
//# sourceMappingURL=deps-manage.d.ts.map