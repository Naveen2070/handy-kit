/**
 * Scans all files in a given directory (recursively) and checks for unused
 * exports.
 *
 * @param rootDir The directory to scan.
 */
export declare function findUnusedExports(rootDir: string): void;
/**
 * Scans all files in a given directory (recursively) and checks for unused
 * files, i.e. files that are not imported by any other file.
 *
 * @param rootDir The directory to scan.
 */
export declare function findUnusedFiles(rootDir: string): void;
//# sourceMappingURL=code-unused.d.ts.map