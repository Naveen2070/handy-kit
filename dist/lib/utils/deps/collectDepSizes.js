import path from "path";
import { createRequire } from "module";
import { getFolderSize } from "./fileUtils.js";
const require = createRequire(import.meta.url);
/**
 * Recursively calculate the size of a dependency and all its sub dependencies.
 * @param modulePath - The path to the dependency
 * @param cache - A cache to store the results in
 * @param depth - The current recursion depth. Defaults to 0
 * @param maxDepth - The maximum recursion depth. Defaults to 2
 */
export async function collectDepSizes(modulePath, cache, depth = 0, maxDepth = 2) {
    if (cache.has(modulePath)) {
        return cache.get(modulePath);
    }
    // Stop recursion if maxDepth reached
    if (depth > maxDepth) {
        const size = await getFolderSize(modulePath);
        const result = { size, deps: {} };
        cache.set(modulePath, result);
        return result;
    }
    const size = await getFolderSize(modulePath);
    const deps = {};
    const result = { size, deps };
    cache.set(modulePath, result); // Cache early to avoid cycles
    // Try to read the package.json of the dependency
    const pkgPath = path.join(modulePath, "package.json");
    try {
        const pkgRaw = await (await import("fs/promises")).readFile(pkgPath, "utf8");
        const pkg = JSON.parse(pkgRaw);
        const subDeps = Object.keys(pkg.dependencies || {});
        // Iterate over the dependencies of the dependency
        for (const dep of subDeps) {
            let depPath = "";
            try {
                // Try to resolve the dependency
                depPath = path.dirname(require.resolve(`${dep}/package.json`, { paths: [process.cwd()] }));
            }
            catch {
                // If resolution fails, try a fallback path
                const fallback = path.join(modulePath, "node_modules", dep);
                try {
                    const stat = await (await import("fs/promises")).stat(fallback);
                    if (stat.isDirectory()) {
                        depPath = fallback;
                    }
                }
                catch {
                    depPath = "";
                }
            }
            if (depPath) {
                // Recursively calculate the size of the dependency
                deps[dep] = await collectDepSizes(depPath, cache, depth + 1, maxDepth);
            }
            else {
                // If the dependency can't be found, set its size to 0
                deps[dep] = { size: 0, deps: {} };
            }
        }
    }
    catch {
        // If there is no or an invalid package.json, skip the dependency
    }
    return result;
}
//# sourceMappingURL=collectDepSizes.js.map