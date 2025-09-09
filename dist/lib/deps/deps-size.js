import { limitConcurrency } from "../utils/common/index.js";
import { collectDepSizes, exportResults, fixZeroSizesWithFallback, getDependencies, renderDeps, } from "../utils/deps/index.js";
import path from "path";
/**
 * Get dependency sizes
 * @param flags - CLI flags
 */
export async function getDepsSize(flags) {
    // Get all dependencies and devDependencies
    const { dependencies, devDependencies } = await getDependencies();
    // Initialize results
    const results = {
        dependencies: {},
        devDependencies: {},
    };
    // Initialize cache to memoize results
    const cache = new Map();
    // Set max depth and concurrency
    const maxDepth = flags.depth;
    const maxConcurrency = flags.concurrency;
    // Create tasks to get size of dependencies
    const depTasks = Object.keys(dependencies).map((dep) => async () => {
        // Get path to dependency
        const depPath = path.resolve("node_modules", dep);
        // Get size and deps of dependency
        const res = await collectDepSizes(depPath, cache, 0, maxDepth);
        // Store result in results object
        results.dependencies[dep] = res;
    });
    // Create tasks to get size of devDependencies
    const devDepTasks = Object.keys(devDependencies).map((dep) => async () => {
        // Get path to devDependency
        const depPath = path.resolve("node_modules", dep);
        // Get size and deps of devDependency
        const res = await collectDepSizes(depPath, cache, 0, maxDepth);
        // Store result in results object
        results.devDependencies[dep] = res;
    });
    // Run with concurrency limit
    await limitConcurrency([...depTasks, ...devDepTasks], maxConcurrency);
    // Fix zero sizes with fallback values
    await fixZeroSizesWithFallback(results.dependencies);
    await fixZeroSizesWithFallback(results.devDependencies);
    // Render results to console
    renderDeps(results, flags);
    // Export results to file if requested
    if (flags.export) {
        await exportResults(results, flags.export);
    }
}
//# sourceMappingURL=deps-size.js.map