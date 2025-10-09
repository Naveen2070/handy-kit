export declare const EXTENSIONS: string[];
/**
 * Get all files with the specified extensions in the given directory recursively.
 * @param {string} dir - The directory to search in
 * @param {string[]} extList - The list of file extensions to include
 * @param {string[]} fileList - The list to store the discovered files
 * @returns {string[]} The list of discovered files
 */
export declare function getAllFiles(dir: string, extList?: string[], fileList?: string[]): string[];
/**
 * Scans a list of files and extracts information about exports and imports.
 *
 * @param allFiles List of files to scan
 */
export declare function scanFiles(allFiles: string[], fileContentCache: Map<string, string>, astCache: Map<string, any>, exportMap: Map<string, Map<string, number>>, usageMap: Map<string, Set<string>>): void;
//# sourceMappingURL=scanner.d.ts.map