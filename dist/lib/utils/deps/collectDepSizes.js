import path from "path";
import { createRequire } from "module";
import { getFolderSize } from "./fileUtils.js";
const require = createRequire(import.meta.url);
// Recursively collect size and subdependencies with cache
export async function collectDepSizes(modulePath, cache) {
    if (cache.has(modulePath)) {
        return cache.get(modulePath);
    }
    const size = await getFolderSize(modulePath);
    const deps = {};
    const result = { size, deps };
    cache.set(modulePath, result); // Cache early to avoid cycles
    const pkgPath = path.join(modulePath, "package.json");
    try {
        const pkgRaw = await (await import("fs/promises")).readFile(pkgPath, "utf8");
        const pkg = JSON.parse(pkgRaw);
        const subDeps = Object.keys(pkg.dependencies || {});
        for (const dep of subDeps) {
            let depPath = "";
            try {
                depPath = path.dirname(require.resolve(`${dep}/package.json`, { paths: [process.cwd()] }));
            }
            catch {
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
                deps[dep] = await collectDepSizes(depPath, cache);
            }
            else {
                deps[dep] = { size: 0, deps: {} };
            }
        }
    }
    catch {
        // skip invalid/missing package.json
    }
    return result;
}
//# sourceMappingURL=collectDepSizes.js.map