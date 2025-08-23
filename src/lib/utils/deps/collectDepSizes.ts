import path from "path";
import { createRequire } from "module";
import { getFolderSize } from "./fileUtils.js";

const require = createRequire(import.meta.url);

export async function collectDepSizes(
  modulePath: string,
  cache: Map<string, { size: number; deps: Record<string, any> }>,
  depth = 0,
  maxDepth = 2
): Promise<{ size: number; deps: Record<string, any> }> {
  if (cache.has(modulePath)) {
    return cache.get(modulePath)!;
  }

  // Stop recursion if maxDepth reached
  if (depth > maxDepth) {
    const size = await getFolderSize(modulePath);
    const result = { size, deps: {} };
    cache.set(modulePath, result);
    return result;
  }

  const size = await getFolderSize(modulePath);
  const deps: Record<string, any> = {};
  const result = { size, deps };

  cache.set(modulePath, result); // Cache early to avoid cycles

  const pkgPath = path.join(modulePath, "package.json");
  try {
    const pkgRaw = await (
      await import("fs/promises")
    ).readFile(pkgPath, "utf8");
    const pkg = JSON.parse(pkgRaw);
    const subDeps = Object.keys(pkg.dependencies || {});

    for (const dep of subDeps) {
      let depPath = "";
      try {
        depPath = path.dirname(
          require.resolve(`${dep}/package.json`, { paths: [process.cwd()] })
        );
      } catch {
        // fallback path if resolution fails
        const fallback = path.join(modulePath, "node_modules", dep);
        try {
          const stat = await (await import("fs/promises")).stat(fallback);
          if (stat.isDirectory()) {
            depPath = fallback;
          }
        } catch {
          depPath = "";
        }
      }

      if (depPath) {
        deps[dep] = await collectDepSizes(depPath, cache, depth + 1, maxDepth);
      } else {
        deps[dep] = { size: 0, deps: {} };
      }
    }
  } catch {
    // skip if no or invalid package.json
  }

  return result;
}
