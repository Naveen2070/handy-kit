import path from "path";
import { execSync } from "child_process";

import { getAllFiles, scanFiles } from "../utils/code/index.js";
import { EXTENSIONS } from "../utils/code/scanner.js";
import type ts from "typescript";
import { colorize } from "../utils/common/index.js";

// Global caches
const fileContentCache = new Map<string, string>();
const astCache = new Map<string, ts.SourceFile | any>();
const exportMap = new Map<string, Map<string, number>>();
const usageMap = new Map<string, Set<string>>();

/**
 * Get the number of Git commits for a file.
 *
 * @param {string} filePath The path to the file.
 * @returns {number} The number of commits.
 */
function getGitCommitCount(filePath: string): number {
  try {
    // Get the commit history for the file in one line each.
    const result = execSync(`git log --pretty=oneline -- "${filePath}"`, {
      encoding: "utf8",
    });
    // Split the result into individual commits and filter out empty lines.
    const commits = result.split("\n").filter(Boolean);
    // Return the number of commits.
    return commits.length;
  } catch {
    // If there's an error, return 0.
    return 0;
  }
}

/**
 * Build a graph of importers to imported files.
 *
 * The graph is a Map where each key is an importer (a file that imports another file) and
 * the value is a Set of imported files (files that are imported by the importer).
 *
 * We invert the usageMap (which maps imported files to their importers) so that we can
 * efficiently traverse the graph from importer to imported files.
 *
 * @param {string[]} allFiles The list of all files in the project.
 * @param {Map<string, Set<string>>} usageMap The map of imported files to their importers.
 * @returns {Map<string, Set<string>>} The graph of importers to imported files.
 */
function buildImportGraph(
  allFiles: string[],
  usageMap: Map<string, Set<string>>
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  // Initialize nodes
  allFiles.forEach((file) => graph.set(file, new Set()));

  // For each importedFile and its importers, add edges importer -> importedFile
  for (const [importedFile, importers] of usageMap.entries()) {
    for (const importer of importers) {
      if (!graph.has(importer)) graph.set(importer, new Set());
      graph.get(importer)!.add(importedFile);
    }
  }

  return graph;
}

/**
 * Compute dependency depth (distance from root files).
 *
 * Dependency depth is the distance from root files. Root files are files with no importers
 * (no incoming edges). We use BFS to traverse the graph from roots, and the depth increases
 * by 1 each step. Files unreachable from roots get depth = -1.
 *
 * @param {Map<string, Set<string>>} graph The graph of importers to imported files.
 * @returns {Map<string, number>} The map of files to their dependency depth.
 */
function computeDependencyDepth(
  graph: Map<string, Set<string>>
): Map<string, number> {
  const depthMap = new Map<string, number>();
  const visited = new Set<string>();

  // Build reverse graph: importedFile -> Set<importers>
  const reverseGraph = new Map<string, Set<string>>();
  for (const [file, imports] of graph.entries()) {
    for (const imported of imports) {
      if (!reverseGraph.has(imported)) reverseGraph.set(imported, new Set());
      reverseGraph.get(imported)!.add(file);
    }
  }

  // Roots = files with no importers
  const roots = [...graph.keys()].filter((file) => !reverseGraph.has(file));

  const queue: Array<{ file: string; depth: number }> = roots.map((file) => ({
    file,
    depth: 0,
  }));

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);
    depthMap.set(file, depth);

    const imports = graph.get(file);
    if (!imports) continue;

    for (const imported of imports) {
      if (!visited.has(imported)) {
        queue.push({ file: imported, depth: depth + 1 });
      }
    }
  }

  // Unreachable files get depth -1
  for (const file of graph.keys()) {
    if (!depthMap.has(file)) depthMap.set(file, -1);
  }

  return depthMap;
}

/**
 * Finds hot paths in a codebase based on import count and commit count.
 *
 * Hot paths are files that are highly dependent on by other files in the codebase.
 * The hotness score of a file is computed by summing the weighted import count and commit count.
 * The import count is the number of files that import the file, while the commit count is the number
 * of commits that have changed the file. The depth of a file is also taken into account when
 * computing the hotness score.
 *
 * @param {string} rootDir The directory to scan for hot paths.
 * @param {Object} [options] Optional options to control the output.
 * @property {number} [options.top] The top N files to show. If not specified, shows the top 20 files.
 * @property {boolean} [options.all] Whether to show all files or only the top N. If not specified, shows only the top N files.
 * @property {number} [options.importWeight] The weight to give to imports when computing the hotness score. Defaults to 0.7.
 * @property {number} [options.commitWeight] The weight to give to commits when computing the hotness score. Defaults to 0.3.
 */
export function findHotPaths(
  rootDir: string,
  options?: {
    /**
     * The top N files to show. If not specified, shows the top 20 files.
     */
    top?: number;
    /**
     * Whether to show all files or only the top N. If not specified, shows only the top N files.
     */
    all?: boolean;
    /**
     * The weight to give to imports when computing the hotness score. Defaults to 0.7.
     */
    importWeight?: number;
    /**
     * The weight to give to commits when computing the hotness score. Defaults to 0.3.
     */
    commitWeight?: number;
  }
): void {
  const absRoot = path.resolve(process.cwd(), rootDir);

  const allFiles = getAllFiles(absRoot).filter((file) => {
    const ext = path.extname(file);
    const base = path.basename(file);
    return (
      !file.endsWith(".d.ts") &&
      !base.match(/\.test\.(ts|tsx|js|jsx)$/) &&
      EXTENSIONS.includes(ext)
    );
  });

  // Scan files and build the import graph
  scanFiles(allFiles, fileContentCache, astCache, exportMap, usageMap);

  const importCountMap = new Map<string, number>();

  // Build the import count map
  for (const [targetFile, importSet] of usageMap.entries()) {
    importCountMap.set(targetFile, importSet.size);
  }

  // Compute dependency depth
  const graph = buildImportGraph(allFiles, usageMap);
  const depthMap = computeDependencyDepth(graph);

  // Set default weights
  const importWeight = options?.importWeight ?? 0.7;
  const commitWeight = options?.commitWeight ?? 0.3;

  // Compute file stats
  const fileStats = Array.from(importCountMap.entries()).map(
    ([file, count]) => {
      const content = fileContentCache.get(file) || "";
      const loc = content.split("\n").length;
      const commitCount = getGitCommitCount(file);
      const depth = depthMap.get(file) ?? -1;
      const hotnessScore = count * importWeight + commitCount * commitWeight;

      return { file, count, commitCount, loc, depth, hotnessScore };
    }
  );

  // Sort and filter file stats
  const sortedStats = fileStats.sort((a, b) => b.hotnessScore - a.hotnessScore);
  const topN = options?.all
    ? sortedStats
    : sortedStats.slice(0, options?.top ?? 20);

  // Print the results
  if (topN.length === 0) {
    console.log(
      colorize("✅ No hot paths detected (no imports found).", "green")
    );
    return;
  }

  console.log(
    colorize(
      "\n🔥 Top Hot Paths (by score: imports + commits + depth):\n",
      "magenta"
    )
  );

  topN.forEach(
    ({ file, count, commitCount, loc, depth, hotnessScore }, idx) => {
      const fileRel = path.relative(absRoot, file);

      const countStr = colorize(`imported by ${count}`, "yellow");
      const commitStr = colorize(`${commitCount} commits`, "blue");
      const locStr = colorize(`${loc} LOC`, "cyan");
      const depthStr =
        depth === -1
          ? colorize("depth: unknown", "red")
          : colorize(`depth: ${depth}`, "magenta");
      const scoreStr = colorize(`score: ${hotnessScore.toFixed(2)}`, "bold");

      console.log(`${colorize(`${idx + 1}.`, "bold")} ${fileRel}`);
      console.log(
        `   ↪ ${countStr}, ${commitStr}, ${locStr}, ${depthStr}, ${scoreStr}`
      );
    }
  );

  if (!options?.all) {
    console.log(
      `\n💡 Showing top ${topN.length}. Use ${colorize(
        "--all / -a",
        "blue"
      )} to list all.\n`
    );
  }
}
