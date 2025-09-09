import fs from "fs/promises";
import path from "path";
import { getFolderSize } from "./fileUtils.js";

/**
 * Attempts to fix zero sizes in the dependency graph by manually
 * measuring the size of the folder in the node_modules directory.
 * This is a fallback for when the package size information is not
 * available in the package.json.
 *
 * @param results - The dependency graph to fix
 */
export async function fixZeroSizesWithFallback(
  results: Record<string, any>
): Promise<void> {
  const nodeModulesPath = path.resolve("node_modules");

  /**
   * Recursively fixes the size of a package and its sub-dependencies
   * if the size is 0.
   *
   * @param pkg - The package name
   * @param data - The package data
   */
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

      // Measure the size of the folder
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
