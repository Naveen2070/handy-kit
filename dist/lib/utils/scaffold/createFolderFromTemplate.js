import * as fs from "fs/promises";
import * as path from "path";
/**
 * Creates a folder structure from a schema.
 * - Supports nested folders.
 * - Creates files with content.
 * - Copies files from given source paths if "paths" is defined inside "files".
 *
 * @param template The template schema for the folder structure.
 * @param entryPath The root directory where the structure should be created.
 */
export async function createFoldersFromTemplate(template, entryPath) {
    /**
     * Recursively creates a folder structure from the given template object.
     * If the property name is "files", it is handled as a special case:
     * - If the value is an array, it is assumed to be a list of file paths to copy.
     * - If the value is an object, it is assumed to be a mapping from file names to objects.
     *   The object should have a "content" property, which is the content of the file.
     *   If the object has a "type" property, it is used as the file extension.
     * If the property name is "paths", it is handled as a special case:
     *   The value is assumed to be an array of file paths to create empty files.
     * Otherwise, the property is assumed to be a folder, and the function is called recursively.
     * @param obj The template object.
     * @param basePath The base path to create the folder structure in.
     */
    async function createRecursively(obj, basePath) {
        for (const key of Object.keys(obj)) {
            if (key === "files") {
                const files = obj[key];
                // 🔁 Handle special 'paths' entry (copy files)
                if (Array.isArray(files.paths)) {
                    for (const srcPath of files.paths) {
                        const fileName = path.basename(srcPath);
                        const destPath = path.join(basePath, fileName);
                        await fs.mkdir(path.dirname(destPath), { recursive: true });
                        await fs.copyFile(srcPath, destPath);
                        console.log(`📄 Copied file: ${destPath}`);
                    }
                }
                // 🔁 Handle normal file definitions
                for (const fileName of Object.keys(files)) {
                    if (fileName === "paths")
                        continue;
                    const file = files[fileName];
                    let content = "";
                    let ext = "";
                    if (typeof file === "string") {
                        content = file;
                        ext = "";
                    }
                    else if (typeof file === "object") {
                        content = file.content ?? "";
                        ext = file.type ? `.${file.type}` : "";
                    }
                    const fullFileName = `${fileName}${ext}`;
                    const destPath = path.join(basePath, fullFileName);
                    await fs.mkdir(path.dirname(destPath), { recursive: true });
                    await fs.writeFile(destPath, content, "utf8");
                    console.log(`📄 Created file: ${destPath}`);
                }
            }
            else if (key === "paths") {
                // Create empty files
                const paths = obj[key];
                for (const relPath of paths) {
                    const fullPath = path.join(entryPath, relPath);
                    await fs.mkdir(path.dirname(fullPath), { recursive: true });
                    await fs.writeFile(fullPath, "", "utf8");
                    console.log(`📄 Created empty file: ${fullPath}`);
                }
            }
            else {
                // It's a folder
                const folderPath = path.join(basePath, key);
                await fs.mkdir(folderPath, { recursive: true });
                console.log(`📁 Created folder: ${folderPath}`);
                await createRecursively(obj[key], folderPath);
            }
        }
    }
    await createRecursively(template, entryPath);
}
//# sourceMappingURL=createFolderFromTemplate.js.map