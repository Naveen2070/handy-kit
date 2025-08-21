import * as fs from "fs/promises";
import * as path from "path";

/**
 * Creates a folder structure from a template.
 * The template is a JSON object, where each key is a folder name, and the value is either
 * another JSON object (representing a subfolder) or a string (representing a file).
 * @param template The template to create the folder structure from.
 * @param entryPath The path where the folder structure will be created.
 */
export async function createFoldersFromTemplate(
  template: Record<string, any>,
  entryPath: string
) {
  /**
   * Recursively creates a folder structure from a template.
   * @param obj The current part of the template that we are creating.
   * @param basePath The base path of the folder structure.
   */
  async function createRecursively(obj: Record<string, any>, basePath: string) {
    for (const key of Object.keys(obj)) {
      const folderPath = path.join(basePath, key);
      // Create the folder
      await fs.mkdir(folderPath, { recursive: true });
      // If the value is an object, then we have a subfolder
      if (typeof obj[key] === "object") {
        // Recursively create the subfolder
        await createRecursively(obj[key], folderPath);
      }
    }
  }

  // Start creating the folder structure
  await createRecursively(template, entryPath);
}
