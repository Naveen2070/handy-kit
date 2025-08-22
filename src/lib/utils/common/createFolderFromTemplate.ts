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
export async function createFoldersFromTemplate(
  template: Record<string, any>,
  entryPath: string
) {
  /**
   * Recursively creates a folder structure from a given schema.
   * - Supports nested folders.
   * - Creates files with content.
   * - Copies files from given source paths if "paths" is defined inside "files".
   *
   * @param obj The schema for the folder structure (a subset of the original `template`).
   * @param basePath The root directory where the structure should be created.
   */
  async function createRecursively(obj: Record<string, any>, basePath: string) {
    for (const key of Object.keys(obj)) {
      if (key === "files") {
        const files = obj[key];

        // ✅ Handle special 'paths' entry inside files (copy files from given paths)
        if (Array.isArray(files.paths)) {
          for (const srcPath of files.paths) {
            const fileName = path.basename(srcPath);
            const destPath = path.join(basePath, fileName);

            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(srcPath, destPath);
          }
        }

        // ✅ Handle actual file entries (skip 'paths' key)
        for (const fileName of Object.keys(files)) {
          if (fileName === "paths") continue; // skip paths key

          const file = files[fileName];

          // Create file with content
          if (file.content) {
            const ext = file.type ? `.${file.type}` : "";
            const destPath = path.join(basePath, `${fileName}${ext}`);
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, file.content, "utf8");
          }
        }
      } else if (key === "paths") {
        // (Optional) support for top-level "paths" key — creating empty files
        const paths: string[] = obj[key];
        for (const filePath of paths) {
          const fullPath = path.join(entryPath, filePath);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, "", "utf8");
        }
      } else {
        // It's a folder — create it and recurse
        const folderPath = path.join(basePath, key);
        await fs.mkdir(folderPath, { recursive: true });
        await createRecursively(obj[key], folderPath);
      }
    }
  }

  await createRecursively(template, entryPath);
}
