import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parse as babelParse } from "@babel/parser";
import { getAllFiles, getExportsBabel, getExportsTS, getImportsBabel, getImportsTS, resolveImportPath, } from "../utils/code/index.js";
import { EXTENSIONS } from "../utils/code/scanner.js";
// Global caches
const fileContentCache = new Map();
const astCache = new Map();
const exportMap = new Map();
const usageMap = new Map();
/**
 * Scans a list of files and extracts information about exports and imports.
 *
 * @param allFiles List of files to scan
 */
function scanFiles(allFiles) {
    // Clear previous state
    fileContentCache.clear();
    astCache.clear();
    exportMap.clear();
    usageMap.clear();
    // Step 1: Parse files and store ASTs
    for (const file of allFiles) {
        const ext = path.extname(file);
        let code = "";
        try {
            code = fs.readFileSync(file, "utf8");
            fileContentCache.set(file, code);
        }
        catch (err) {
            console.error(`❌ Failed to read file: ${file}`, err);
            continue;
        }
        try {
            if (ext === ".ts" || ext === ".tsx") {
                const tsAst = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
                astCache.set(file, tsAst);
            }
            else {
                const ast = babelParse(code, {
                    sourceType: "module",
                    plugins: ["jsx", "classProperties", "dynamicImport", "typescript"],
                });
                astCache.set(file, ast);
            }
        }
        catch (err) {
            console.error(`❌ Failed to parse AST for ${file}`, err);
        }
    }
    // Step 2: Extract Exports
    for (const [file, ast] of astCache.entries()) {
        const ext = path.extname(file);
        let exports = new Map();
        try {
            if (ext === ".ts" || ext === ".tsx") {
                exports = getExportsTS(ast);
            }
            else {
                exports = getExportsBabel(ast);
            }
        }
        catch (err) {
            console.error(`❌ Failed to extract exports from ${file}`, err);
        }
        if (exports.size > 0) {
            exportMap.set(file, exports);
        }
    }
    // Step 3: Extract Imports
    for (const [file, ast] of astCache.entries()) {
        const ext = path.extname(file);
        let imports = [];
        try {
            if (ext === ".ts" || ext === ".tsx") {
                imports = getImportsTS(ast);
            }
            else {
                imports = getImportsBabel(ast);
            }
        }
        catch (err) {
            console.error(`❌ Failed to extract imports from ${file}`, err);
        }
        for (const imp of imports) {
            if (!imp.moduleSpecifier.startsWith(".") &&
                !imp.moduleSpecifier.startsWith("/")) {
                continue; // skip node_modules
            }
            const resolved = resolveImportPath(imp.moduleSpecifier, file);
            if (!resolved)
                continue;
            const usedSet = usageMap.get(resolved) || new Set();
            if (imp.importedNames.length === 0) {
                usedSet.add("*"); // Side-effect import
            }
            else {
                imp.importedNames.forEach((name) => usedSet.add(name));
            }
            usageMap.set(resolved, usedSet);
        }
    }
}
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
    scanFiles(allFiles);
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
        return (
        // Filter out declaration files
        !file.endsWith(".d.ts") &&
            // Filter out test files
            !base.match(/\.test\.(ts|tsx|js|jsx)$/) &&
            // Only consider files with supported extensions
            EXTENSIONS.includes(ext));
    });
    // Populate usageMap by scanning all files
    scanFiles(allFiles);
    // Find all the imported files
    const importedFiles = new Set(usageMap.keys());
    const unusedFiles = [];
    // Find all the unused files by iterating over all files and checking if they
    // are in the importedFiles set
    for (const file of allFiles) {
        if (!importedFiles.has(file)) {
            unusedFiles.push(file);
        }
    }
    // If there are unused files, log them
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