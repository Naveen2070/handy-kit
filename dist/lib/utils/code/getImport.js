import * as fs from "fs";
import * as path from "path";
import * as traverse from "@babel/traverse";
import * as ts from "typescript";
import { EXTENSIONS } from "./scanner.js";
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
export function getImportsBabel(ast) {
    const imports = [];
    traverse.default.default(ast, {
        /**
         * Called for each `import` statement.
         * @param {object} path
         */
        ImportDeclaration(path) {
            const { node } = path;
            const importedNames = [];
            // Go through each import specifier
            node.specifiers.forEach((spec) => {
                if (spec.type === "ImportDefaultSpecifier")
                    importedNames.push("default");
                else if (spec.type === "ImportSpecifier")
                    importedNames.push(spec.imported.name);
                else if (spec.type === "ImportNamespaceSpecifier")
                    importedNames.push("*");
            });
            // Add the imported names and module specifier to the array
            imports.push({ importedNames, moduleSpecifier: node.source.value });
        },
        /**
         * Called for each `require` function call.
         * @param {object} path
         */
        CallExpression(path) {
            const { node } = path;
            // Check if the function call is a `require` call
            if (node.callee.type === "Identifier" &&
                node.callee.name === "require" &&
                node.arguments.length === 1 &&
                node.arguments[0].type === "StringLiteral") {
                // Add the imported names and module specifier to the array
                imports.push({
                    importedNames: ["*"],
                    moduleSpecifier: node.arguments[0].value,
                });
            }
        },
    });
    return imports;
}
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
export function getImportsTS(sourceFile) {
    const imports = [];
    sourceFile.forEachChild((node) => {
        // import statements
        if (ts.isImportDeclaration(node)) {
            const importedNames = [];
            const moduleSpecifier = node.moduleSpecifier.text;
            // default imports
            if (node.importClause && node.importClause.name) {
                importedNames.push("default");
            }
            // named imports
            if (node.importClause && node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach((elem) => {
                        importedNames.push(elem.name.text);
                    });
                }
                else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    importedNames.push("*");
                }
            }
            imports.push({ importedNames, moduleSpecifier });
        }
        // require('module')
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((decl) => {
                if (decl.initializer &&
                    ts.isCallExpression(decl.initializer) &&
                    decl.initializer.expression.getText() === "require" &&
                    decl.initializer.arguments.length === 1 &&
                    ts.isStringLiteral(decl.initializer.arguments[0])) {
                    imports.push({
                        importedNames: ["*"],
                        moduleSpecifier: decl.initializer.arguments[0].text,
                    });
                }
            });
        }
    });
    return imports;
}
// ----------------------------
// Import Path Resolver
// ----------------------------
/**
 * Resolve a module path relative to the importer file.
 *
 * @param {string} importPath The path to resolve.
 * @param {string} importerFile The path to the file that is doing the importing.
 * @returns {string|null} The resolved path, or null if the path cannot be resolved.
 */
export function resolveImportPath(importPath, importerFile) {
    const baseDir = path.dirname(importerFile);
    // If the path has an extension, look for an exact match first.
    if (path.extname(importPath)) {
        let fullPath = path.resolve(baseDir, importPath);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
        // If that doesn't exist, try adding extensions to the path.
        for (const ext of EXTENSIONS) {
            const altPath = fullPath.replace(path.extname(fullPath), ext);
            if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
                return altPath;
            }
        }
    }
    else {
        // If the path doesn't have an extension, look for a file with any of the
        // known extensions.
        for (const ext of EXTENSIONS) {
            const filePathWithExt = path.resolve(baseDir, importPath + ext);
            if (fs.existsSync(filePathWithExt) &&
                fs.statSync(filePathWithExt).isFile()) {
                return filePathWithExt;
            }
            const indexFile = path.join(baseDir, importPath, "index" + ext);
            if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
                return indexFile;
            }
        }
    }
    return null;
}
//# sourceMappingURL=getImport.js.map