/**
 * Attempts to fix zero sizes in the dependency graph by manually
 * measuring the size of the folder in the node_modules directory.
 * This is a fallback for when the package size information is not
 * available in the package.json.
 *
 * @param results - The dependency graph to fix
 */
export declare function fixZeroSizesWithFallback(results: Record<string, any>): Promise<void>;
//# sourceMappingURL=fallbackScan.d.ts.map