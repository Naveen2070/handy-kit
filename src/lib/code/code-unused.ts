import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { parse as babelParse } from "@babel/parser";
import traverse from "@babel/traverse";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

// ----------------------------
// File Scanning
// ----------------------------

function getAllFiles(
  dir: string,
  extList = EXTENSIONS,
  fileList: string[] = []
): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      getAllFiles(fullPath, extList, fileList);
    } else if (extList.includes(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

// ----------------------------
// Parsing and AST Traversal
// ----------------------------

// TypeScript export detection
function getExportsTS(sourceFile: ts.SourceFile): Set<string> {
  const exports = new Set<string>();

  function visit(node: ts.Node) {
    // Named exports: export function/class/const/let/var/type/interface
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node)) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      if (ts.isVariableStatement(node)) {
        // multiple variables can be declared in one statement
        node.declarationList.declarations.forEach((decl) => {
          if (ts.isIdentifier(decl.name)) exports.add(decl.name.text);
        });
      } else if ("name" in node && node.name && ts.isIdentifier(node.name)) {
        exports.add(node.name.text);
      }
    }

    // Export assignment (default export)
    if (ts.isExportAssignment(node)) {
      exports.add("default");
    }

    // Export specifiers (export { foo, bar as baz })
    if (ts.isExportDeclaration(node) && node.exportClause) {
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((elem) => {
          exports.add(elem.name.text);
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

// TypeScript import detection
function getImportsTS(
  sourceFile: ts.SourceFile
): { importedNames: string[]; moduleSpecifier: string }[] {
  const imports: { importedNames: string[]; moduleSpecifier: string }[] = [];

  sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node)) {
      const importedNames: string[] = [];
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

      if (node.importClause) {
        if (node.importClause.name) {
          importedNames.push("default");
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach((elem) => {
              importedNames.push(elem.name.text);
            });
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            importedNames.push("*");
          }
        }
      }

      imports.push({ importedNames, moduleSpecifier });
    }

    // require('module')
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((decl) => {
        if (
          decl.initializer &&
          ts.isCallExpression(decl.initializer) &&
          decl.initializer.expression.getText() === "require" &&
          decl.initializer.arguments.length === 1 &&
          ts.isStringLiteral(decl.initializer.arguments[0]!)
        ) {
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

// Babel export detection
function getExportsBabel(ast: any): Set<string> {
  const exports = new Set<string>();

  traverse(ast, {
    ExportNamedDeclaration(path: any) {
      const { node } = path;
      if (node.declaration) {
        if (node.declaration.id && node.declaration.id.name) {
          exports.add(node.declaration.id.name);
        } else if (node.declaration.declarations) {
          node.declaration.declarations.forEach((decl: any) => {
            if (decl.id && decl.id.name) exports.add(decl.id.name);
          });
        }
      }
      if (node.specifiers) {
        node.specifiers.forEach((spec: any) => {
          exports.add(spec.exported.name);
        });
      }
    },
    ExportDefaultDeclaration() {
      exports.add("default");
    },
    ExportAllDeclaration() {
      exports.add("*"); // star exports (re-export all)
    },
  });

  return exports;
}

// Babel import detection
function getImportsBabel(
  ast: any
): { importedNames: string[]; moduleSpecifier: string }[] {
  const imports: { importedNames: string[]; moduleSpecifier: string }[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      const { node } = path;
      const importedNames: string[] = [];

      node.specifiers.forEach((spec: any) => {
        if (spec.type === "ImportDefaultSpecifier")
          importedNames.push("default");
        else if (spec.type === "ImportSpecifier")
          importedNames.push(spec.imported.name);
        else if (spec.type === "ImportNamespaceSpecifier")
          importedNames.push("*");
      });

      imports.push({ importedNames, moduleSpecifier: node.source.value });
    },
    CallExpression(path: any) {
      const { node } = path;
      if (
        node.callee.type === "Identifier" &&
        node.callee.name === "require" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "StringLiteral"
      ) {
        imports.push({
          importedNames: ["*"],
          moduleSpecifier: node.arguments[0].value,
        });
      }
    },
  });

  return imports;
}

// ----------------------------
// Import Path Resolver (similar to your original)
// ----------------------------

function resolveImportPath(
  importPath: string,
  importerFile: string
): string | null {
  const baseDir = path.dirname(importerFile);
  let fullPath = path.resolve(baseDir, importPath);

  if (path.extname(fullPath)) {
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
    for (const ext of EXTENSIONS) {
      const altPath = fullPath.replace(path.extname(fullPath), ext);
      if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
        return altPath;
      }
    }
  } else {
    for (const ext of EXTENSIONS) {
      const filePathWithExt = fullPath + ext;
      if (
        fs.existsSync(filePathWithExt) &&
        fs.statSync(filePathWithExt).isFile()
      ) {
        return filePathWithExt;
      }
      const indexFile = path.join(fullPath, "index" + ext);
      if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
        return indexFile;
      }
    }
  }

  return null;
}

// ----------------------------
// Main Logic
// ----------------------------

export function findUnusedExports(rootDir: string): void {
  const absRoot = path.resolve(process.cwd(), rootDir);
  const allFiles = getAllFiles(absRoot);

  const exportMap = new Map<string, Set<string>>();
  const usageMap = new Map<string, Set<string>>();

  // Step 1: Parse files and gather exports
  for (const file of allFiles) {
    const code = fs.readFileSync(file, "utf8");
    const ext = path.extname(file);

    let exports: Set<string>;

    try {
      if (ext === ".ts" || ext === ".tsx") {
        const sourceFile = ts.createSourceFile(
          file,
          code,
          ts.ScriptTarget.Latest,
          true
        );
        exports = getExportsTS(sourceFile);
      } else if (ext === ".js" || ext === ".jsx") {
        const ast = babelParse(code, {
          sourceType: "module",
          plugins: ["jsx", "classProperties", "dynamicImport"],
        });
        exports = getExportsBabel(ast);
      } else {
        exports = new Set();
      }
    } catch (err) {
      console.error(`Failed to parse exports in ${file}:`, err);
      exports = new Set();
    }

    if (exports.size > 0) {
      exportMap.set(file, exports);
    }
  }

  // Step 2: Parse files again to gather imports and record usage
  for (const file of allFiles) {
    const code = fs.readFileSync(file, "utf8");
    const ext = path.extname(file);

    let imports: { importedNames: string[]; moduleSpecifier: string }[] = [];

    try {
      if (ext === ".ts" || ext === ".tsx") {
        const sourceFile = ts.createSourceFile(
          file,
          code,
          ts.ScriptTarget.Latest,
          true
        );
        imports = getImportsTS(sourceFile);
      } else if (ext === ".js" || ext === ".jsx") {
        const ast = babelParse(code, {
          sourceType: "module",
          plugins: ["jsx", "classProperties", "dynamicImport"],
        });
        imports = getImportsBabel(ast);
      }
    } catch (err) {
      console.error(`Failed to parse imports in ${file}:`, err);
      imports = [];
    }

    for (const imp of imports) {
      if (
        !imp.moduleSpecifier.startsWith(".") &&
        !imp.moduleSpecifier.startsWith("/")
      ) {
        // Ignore external modules (node_modules)
        continue;
      }
      const resolved = resolveImportPath(imp.moduleSpecifier, file);
      if (!resolved || !exportMap.has(resolved)) continue;

      const usedSet = usageMap.get(resolved) || new Set<string>();
      imp.importedNames.forEach((name) => usedSet.add(name));
      usageMap.set(resolved, usedSet);
    }
  }

  // Step 3: Compare exports vs usage
  let hasUnused = false;

  for (const [file, exported] of exportMap.entries()) {
    const used = usageMap.get(file) || new Set<string>();

    // Special case: if "*" export exists, assume everything used (re-exports)
    if (exported.has("*")) continue;

    // If used contains "*", treat all as used
    if (used.has("*")) continue;

    const unused = [...exported].filter((name) => !used.has(name));

    if (unused.length > 0) {
      hasUnused = true;
      console.log(`\n🔍 ${file}`);
      unused.forEach((name) => console.log(`  ✖ Unused export: '${name}'`));
    }
  }

  if (!hasUnused) {
    console.log("✅ No unused exports found!");
  }
}
