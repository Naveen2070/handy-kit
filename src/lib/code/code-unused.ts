import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parse as babelParse } from "@babel/parser";

import {
  getAllFiles,
  getExportsBabel,
  getExportsTS,
  getImportsBabel,
  getImportsTS,
  resolveImportPath,
} from "../utils/code/index.js";

import { EXTENSIONS } from "../utils/code/scanner.js";

// Global caches
const fileContentCache = new Map<string, string>();
const astCache = new Map<string, ts.SourceFile | any>();
const exportMap = new Map<string, Map<string, number>>();
const usageMap = new Map<string, Set<string>>();

/**
 * Scans a list of files and extracts information about exports and imports.
 *
 * @param allFiles List of files to scan
 */
function scanFiles(allFiles: string[]) {
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
    } catch (err) {
      console.error(`❌ Failed to read file: ${file}`, err);
      continue;
    }

    try {
      if (ext === ".ts" || ext === ".tsx") {
        const tsAst = ts.createSourceFile(
          file,
          code,
          ts.ScriptTarget.Latest,
          true
        );
        astCache.set(file, tsAst);
      } else {
        const ast = babelParse(code, {
          sourceType: "module",
          plugins: ["jsx", "classProperties", "dynamicImport", "typescript"],
        });
        astCache.set(file, ast);
      }
    } catch (err) {
      console.error(`❌ Failed to parse AST for ${file}`, err);
    }
  }

  // Step 2: Extract Exports
  for (const [file, ast] of astCache.entries()) {
    const ext = path.extname(file);
    let exports: Map<string, number> = new Map();

    try {
      if (ext === ".ts" || ext === ".tsx") {
        exports = getExportsTS(ast as ts.SourceFile);
      } else {
        exports = getExportsBabel(ast);
      }
    } catch (err) {
      console.error(`❌ Failed to extract exports from ${file}`, err);
    }

    if (exports.size > 0) {
      exportMap.set(file, exports);
    }
  }

  // Step 3: Extract Imports AND Re-exports
  for (const [file, ast] of astCache.entries()) {
    const ext = path.extname(file);
    let imports: {
      importedNames: string[];
      moduleSpecifier: string;
      isReExport?: boolean;
    }[] = [];

    try {
      if (ext === ".ts" || ext === ".tsx") {
        imports = getImportsTS(ast as ts.SourceFile);
      } else {
        imports = getImportsBabel(ast);
      }
    } catch (err) {
      console.error(`❌ Failed to extract imports from ${file}`, err);
    }

    for (const imp of imports) {
      if (
        !imp.moduleSpecifier.startsWith(".") &&
        !imp.moduleSpecifier.startsWith("/")
      ) {
        continue; // skip node_modules
      }

      const resolved = resolveImportPath(imp.moduleSpecifier, file);
      if (!resolved) continue;

      const usedSet = usageMap.get(resolved) || new Set<string>();

      if (imp.importedNames.length === 0) {
        usedSet.add("*"); // Side-effect import
      } else {
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
export function findUnusedExports(rootDir: string): void {
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
      EXTENSIONS.includes(ext)
    );
  });

  // Scan all files and build a map of exported names to line numbers
  scanFiles(allFiles);

  let hasUnused = false;
  let unusedCount = 0;

  // Iterate over all files and their exported names
  for (const [file, exportedMap] of exportMap.entries()) {
    // Get the set of used export names from the usage map
    const used = usageMap.get(file) || new Set<string>();

    // If the file has a wildcard export or a wildcard import, skip it
    if (exportedMap.has("*") || used.has("*")) continue;

    // Find all unused exports by filtering out the used ones
    const unused = [...exportedMap.entries()].filter(
      ([name]) => !used.has(name)
    );

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
  } else {
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
export function findUnusedFiles(rootDir: string): void {
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

  // Populate usageMap
  scanFiles(allFiles);

  const importedFiles = new Set<string>(usageMap.keys());
  const unusedFiles: string[] = [];

  // ✅ Include entry points like index.ts as used
  const entryPoints = allFiles.filter(
    (file) => path.basename(file) === "index.ts"
  );
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
  } else {
    console.log("✅ No unused files found.");
  }
}
