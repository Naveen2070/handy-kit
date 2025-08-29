import * as ts from "typescript";
import * as traverse from "@babel/traverse";
// ----------------------------
// Parsing and AST Traversal
// ----------------------------
/**
 * Given a TS source file, returns a map of export names to line numbers.
 *
 * Does not include re-exports.
 *
 * @param sourceFile The TS source file to get exports from
 * @returns A map of export names to line numbers
 */
export function getExportsTS(sourceFile) {
    const exports = new Map();
    /**
     * Recursively visits all nodes in the source file and adds any
     * top-level exports to the exports map.
     *
     * @param node The current node to visit
     */
    function visit(node) {
        // Add a top-level export if the node is a declaration with an
        // export modifier
        if ((ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node) ||
            ts.isVariableStatement(node) ||
            ts.isTypeAliasDeclaration(node) ||
            ts.isInterfaceDeclaration(node)) &&
            node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            if (ts.isVariableStatement(node)) {
                // If the node is a variable statement, add each variable to the
                // exports map
                node.declarationList.declarations.forEach((decl) => {
                    if (ts.isIdentifier(decl.name)) {
                        const { line } = sourceFile.getLineAndCharacterOfPosition(decl.name.getStart());
                        exports.set(decl.name.text, line + 1); // line number is 0-based
                    }
                });
            }
            else if ("name" in node && node.name && ts.isIdentifier(node.name)) {
                // If the node has a name and is an identifier, add it to the
                // exports map
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
                exports.set(node.name.text, line + 1); // line number is 0-based
            }
        }
        // Add a default export if the node is an export assignment
        if (ts.isExportAssignment(node)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            exports.set("default", line + 1); // line number is 0-based
        }
        // Add any named exports if the node is an export declaration
        if (ts.isExportDeclaration(node) && node.exportClause) {
            if (ts.isNamedExports(node.exportClause)) {
                node.exportClause.elements.forEach((elem) => {
                    const { line } = sourceFile.getLineAndCharacterOfPosition(elem.name.getStart());
                    exports.set(elem.name.text, line + 1); // line number is 0-based
                });
            }
        }
        // Recursively visit all children of the current node
        ts.forEachChild(node, visit);
    }
    // Start the traversal at the source file
    visit(sourceFile);
    return exports;
}
/**
 * Given a Babel AST, returns a map of export names to line numbers.
 *
 * Includes default exports, named exports, and re-exports.
 *
 * @param ast The Babel AST to get exports from
 * @returns A map of export names to line numbers
 */
export function getExportsBabel(ast) {
    const exports = new Map();
    traverse.default.default(ast, {
        // ExportNamedDeclaration is a named export, e.g. `export { foo } from "bar"`
        ExportNamedDeclaration(path) {
            const { node } = path;
            const line = node.loc?.start.line ?? 0;
            if (node.declaration) {
                if (node.declaration.id && node.declaration.id.name) {
                    // If the export is a declaration with an identifier, add it
                    // to the exports map
                    exports.set(node.declaration.id.name, line);
                }
                else if (node.declaration.declarations) {
                    // If the export is a declaration with multiple declarations,
                    // add each declaration to the exports map
                    node.declaration.declarations.forEach((decl) => {
                        if (decl.id && decl.id.name) {
                            exports.set(decl.id.name, line);
                        }
                    });
                }
            }
            if (node.specifiers) {
                // Add any named exports to the exports map
                node.specifiers.forEach((spec) => {
                    exports.set(spec.exported.name, spec.loc?.start.line ?? line);
                });
            }
        },
        // ExportDefaultDeclaration is a default export, e.g. `export default foo`
        ExportDefaultDeclaration(path) {
            exports.set("default", path.node.loc?.start.line ?? 0);
        },
        // ExportAllDeclaration is a re-export, e.g. `export * from "bar"`
        ExportAllDeclaration(path) {
            exports.set("*", path.node.loc?.start.line ?? 0);
        },
    });
    return exports;
}
//# sourceMappingURL=getExport.js.map