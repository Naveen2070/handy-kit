import * as fs from "fs";
import * as path from "path";
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
export function getAllFiles(dir, extList = EXTENSIONS, fileList = []) {
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
//# sourceMappingURL=scanner.js.map