/**
 * Recursively calculate the size of a dependency and all its sub dependencies.
 * @param modulePath - The path to the dependency
 * @param cache - A cache to store the results in
 * @param depth - The current recursion depth. Defaults to 0
 * @param maxDepth - The maximum recursion depth. Defaults to 2
 */
export declare function collectDepSizes(modulePath: string, cache: Map<string, {
    size: number;
    deps: Record<string, any>;
}>, depth?: number, maxDepth?: number): Promise<{
    size: number;
    deps: Record<string, any>;
}>;
//# sourceMappingURL=collectDepSizes.d.ts.map