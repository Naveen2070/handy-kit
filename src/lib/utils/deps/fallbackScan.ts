import fs from "fs/promises";
import path from "path";
import { getFolderSize } from "./fileUtils.js";

export async function fixZeroSizesWithFallback(
  results: Record<string, any>
): Promise<void> {
  const nodeModulesPath = path.resolve("node_modules");

  async function fixEntry(pkg: string, data: any) {
    if (data.size === 0) {
      // Attempt to get folder path considering scoped packages
      let folderPath = path.join(nodeModulesPath, pkg);

      // If scoped package, folderPath is fine as is,
      // else fallback is node_modules/pkg

      // Double check folder exists to avoid errors
      try {
        const stat = await fs.stat(folderPath);
        if (!stat.isDirectory()) {
          folderPath = path.resolve("node_modules", pkg);
        }
      } catch {
        // folder doesn't exist, skip
        return;
      }

      data.size = await getFolderSize(folderPath);
    }

    // Recursively fix subdeps
    for (const [subPkg, subData] of Object.entries(data.deps)) {
      await fixEntry(subPkg, subData);
    }
  }

  // Fix sizes for all top-level deps/devDeps in results
  for (const [pkg, data] of Object.entries(results)) {
    await fixEntry(pkg, data);
  }
}
