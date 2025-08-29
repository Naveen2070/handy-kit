import * as ts from "typescript";
/**
 * Given a Babel AST, returns a list of imports. Each import is an object
 * with two properties: `importedNames` (an array of strings) and
 * `moduleSpecifier` (a string).
 *
 * Includes default imports, named imports, and re-exports.
 *
 * @param ast The Babel AST to get imports from
 * @returns An array of imports
 */
export declare function getImportsBabel(ast: any): {
    importedNames: string[];
    moduleSpecifier: string;
}[];
/**
 * Given a TS source file, returns a list of imports. Each import is an object
 * with two properties: `importedNames` (an array of strings) and
 * `moduleSpecifier` (a string).
 *
 * Includes default imports, named imports, and re-exports.
 *
 * @param sourceFile The TS source file to get imports from
 * @returns An array of imports
 */
export declare function getImportsTS(sourceFile: ts.SourceFile): {
    importedNames: string[];
    moduleSpecifier: string;
}[];
/**
 * Resolve a module path relative to the importer file.
 *
 * @param {string} importPath The path to resolve.
 * @param {string} importerFile The path to the file that is doing the importing.
 * @returns {string|null} The resolved path, or null if the path cannot be resolved.
 */
export declare function resolveImportPath(importPath: string, importerFile: string): string | null;
//# sourceMappingURL=getImport.d.ts.map