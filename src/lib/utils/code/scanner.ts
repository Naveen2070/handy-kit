import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parse as babelParse } from "@babel/parser";
import { getExportsBabel, getExportsTS } from "./getExport.js";
import {
  getImportsBabel,
  getImportsTS,
  resolveImportPath,
} from "./getImport.js";

export const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

// ----------------------------
// File Scanning
// ----------------------------

/**
 * Get all files with the specified extensions in the given directory recursively.
 * @param {string} dir - The directory to search in
 * @param {string[]} extList - The list of file extensions to include
 * @param {string[]} fileList - The list to store the discovered files
 * @returns {string[]} The list of discovered files
 */
export function getAllFiles(
  dir: string,
  extList: string[] = EXTENSIONS,
  fileList: string[] = []
): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // If the entry is a directory, search it recursively
    if (entry.isDirectory()) {
      getAllFiles(fullPath, extList, fileList);
    }

    // If the entry is a file and its extension is in the list, add it to the result list
    else if (extList.includes(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Scans a list of files and extracts information about exports and imports.
 *
 * @param allFiles List of files to scan
 */
export function scanFiles(
  allFiles: string[],
  fileContentCache: Map<string, string>,
  astCache: Map<string, any>,
  exportMap: Map<string, Map<string, number>>,
  usageMap: Map<string, Set<string>>
) {
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
