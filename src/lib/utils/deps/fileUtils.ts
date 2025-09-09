import fs from "fs/promises";
import path from "path";

/**
 * Recursively calculates the size of a folder.
 *
 * @param folderPath - The path of the folder to calculate the size of.
 * @returns The size of the folder in bytes.
 */
export async function getFolderSize(folderPath: string): Promise<number> {
  try {
    // Get all entries in the folder
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    // Calculate the size of each entry
    const sizes = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(folderPath, entry.name);

        // If the entry is a directory, calculate its size recursively
        if (entry.isDirectory()) return getFolderSize(fullPath);
        else {
          // If the entry is a file, get its size
          const stat = await fs.stat(fullPath);
          return stat.size;
        }
      })
    );

    // Sum up the sizes of all entries
    return sizes.reduce((a, b) => a + b, 0);
  } catch {
    // If there was an error, return 0
    return 0;
  }
}

/**
 * Reads the `package.json` file and returns its dependencies.
 * @returns An object with `dependencies` and `devDependencies` properties.
 */
export async function getDependencies(): Promise<{
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}> {
  const pkgPath = path.resolve("package.json");
  try {
    // Read the package.json file
    const content = await fs.readFile(pkgPath, "utf8");
    // Parse the content
    const pkg = JSON.parse(content);
    // Return the dependencies and devDependencies
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  } catch (error) {
    // If the file does not exist or is unreadable, log an error and exit
    console.error("❌ package.json not found or unreadable.", error);
    process.exit(1);
  }
}

/**
 * Formats bytes to a human-readable string.
 *
 * @param bytes - The number of bytes to be formatted.
 * @returns A string representing the number of bytes in a human-readable format.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`; // bytes
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`; // kilobytes
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`; // megabytes
}
