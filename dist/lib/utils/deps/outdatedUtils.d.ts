import type { DependencyInfo } from "../../types/utils.js";
/**
 * Fetch outdated dependencies using npm.
 * @returns An object of outdated dependencies with their current and latest versions.
 */
export declare function fetchOutdated(): Promise<Record<string, DependencyInfo>>;
/**
 * Display a list of outdated dependencies.
 * @param outdated - An object of outdated dependencies with their current and latest versions.
 */
export declare function displayOutdatedPackages(outdated: Record<string, DependencyInfo>): void;
//# sourceMappingURL=outdatedUtils.d.ts.map