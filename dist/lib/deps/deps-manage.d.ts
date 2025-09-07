/**
 * Display outdated dependencies in a clean, readable format,
 * including their location and who depends on them.
 */
export declare function showOutdatedPackages(): Promise<void>;
/**
 * Upgrade dependencies by type: standard (npm update), minor, or major.
 * Supports dry-run mode to preview changes.
 */
export declare function manageDependencies(upgradeType: "standard" | "minor" | "major", dryRun?: boolean): Promise<void>;
//# sourceMappingURL=deps-manage.d.ts.map