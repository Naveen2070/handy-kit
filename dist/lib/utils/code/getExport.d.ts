import * as ts from "typescript";
/**
 * Given a TS source file, returns a map of export names to line numbers.
 *
 * Does not include re-exports.
 *
 * @param sourceFile The TS source file to get exports from
 * @returns A map of export names to line numbers
 */
export declare function getExportsTS(sourceFile: ts.SourceFile): Map<string, number>;
/**
 * Given a Babel AST, returns a map of export names to line numbers.
 *
 * Includes default exports, named exports, and re-exports.
 *
 * @param ast The Babel AST to get exports from
 * @returns A map of export names to line numbers
 */
export declare function getExportsBabel(ast: any): Map<string, number>;
//# sourceMappingURL=getExport.d.ts.map