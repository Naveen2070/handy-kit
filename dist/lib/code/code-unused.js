import * as path from "path";
import * as ts from "typescript";
import { getAllFiles, scanFiles } from "../utils/code/index.js";
import { EXTENSIONS } from "../utils/code/scanner.js";
// Global caches
const fileContentCache = new Map();
const astCache = new Map();
const exportMap = new Map();
const usageMap = new Map();
/**
 * Scans all files in a given directory (recursively) and checks for unused
 * exports.
 *
 * @param rootDir The directory to scan.
 */
export function findUnusedExports(rootDir) {
    const absRoot = path.resolve(process.cwd(), rootDir);
    const allFiles = getAllFiles(absRoot).filter((file) => {
        const ext = path.extname(file);
        const base = path.basename(file);
        return (
        // Filter out declaration files
        !file.endsWith(".d.ts") &&
            // Filter out test files
            !base.match(/\.test\.(ts|tsx|js|jsx)$/) &&
            // Only consider files with supported extensions
            EXTENSIONS.includes(ext));
    });
    // Scan all files and build a map of exported names to line numbers
    scanFiles(allFiles, fileContentCache, astCache, exportMap, usageMap);
    let hasUnused = false;
    let unusedCount = 0;
    // Iterate over all files and their exported names
    for (const [file, exportedMap] of exportMap.entries()) {
        // Get the set of used export names from the usage map
        const used = usageMap.get(file) || new Set();
        // If the file has a wildcard export or a wildcard import, skip it
        if (exportedMap.has("*") || used.has("*"))
            continue;
        // Find all unused exports by filtering out the used ones
        const unused = [...exportedMap.entries()].filter(([name]) => !used.has(name));
        // If there are unused exports, log them
        if (unused.length > 0) {
            hasUnused = true;
            unusedCount += unused.length;
            console.log(`\n🔍 ${path.relative(absRoot, file)}`);
            console.log(`   ↪ ${file}`);
            unused.forEach(([name, line]) => {
                console.log(`  ✖ Unused export: '${name}'  (Line ${line})`);
            });
        }
    }
    // Summarize the results
    console.log("\n===============================");
    console.log(`📂 Scanned ${allFiles.length} files`);
    if (hasUnused) {
        console.log(`⚠️  Found ${unusedCount} unused exports`);
    }
    else {
        console.log("✅ No unused exports found!");
    }
    console.log("===============================\n");
}
/**
 * Scans all files in a given directory (recursively) and checks for unused
 * files, i.e. files that are not imported by any other file.
 *
 * @param rootDir The directory to scan.
 */
export function findUnusedFiles(rootDir) {
    const absRoot = path.resolve(process.cwd(), rootDir);
    const allFiles = getAllFiles(absRoot).filter((file) => {
        const ext = path.extname(file);
        const base = path.basename(file);
        return (!file.endsWith(".d.ts") &&
            !base.match(/\.test\.(ts|tsx|js|jsx)$/) &&
            EXTENSIONS.includes(ext));
    });
    // Populate usageMap
    scanFiles(allFiles, fileContentCache, astCache, exportMap, usageMap);
    const importedFiles = new Set(usageMap.keys());
    const unusedFiles = [];
    // ✅ Include entry points like index.ts as used
    const entryPoints = allFiles.filter((file) => path.basename(file) === "index.ts");
    entryPoints.forEach((file) => importedFiles.add(file));
    // Detect unused files
    for (const file of allFiles) {
        if (!importedFiles.has(file)) {
            unusedFiles.push(file);
        }
    }
    // Report results
    if (unusedFiles.length > 0) {
        console.log("\n🚫 Unused Files Detected:");
        unusedFiles.forEach((file) => {
            console.log(`  - ${path.relative(absRoot, file)}\n    ↪ ${file}`);
        });
    }
    else {
        console.log("✅ No unused files found.");
    }
}
//# sourceMappingURL=code-unused.js.map